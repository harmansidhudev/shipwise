# Infrastructure as Code Guide

## When to use
Reference this when setting up Terraform for a new project, creating reusable modules, configuring remote state, or establishing the plan-review-apply workflow in CI.

## Decision framework

```
What infrastructure do I need to manage?
├── Simple web app (Vercel/Netlify + managed DB)
│   → You may not need Terraform at all. Use platform UI or CLI.
│   → Consider Terraform only for DNS, monitoring, or multi-service coordination.
│
├── AWS/GCP/Azure resources (VPC, RDS, ECS, S3, etc.)
│   → Terraform with remote state. Module-based structure.
│
├── Multi-cloud or hybrid
│   → Terraform (cloud-agnostic HCL). One state per environment.
│
└── Kubernetes-native
    → Terraform for cluster provisioning. Helm/Kustomize for workloads.
```

### IaC tool comparison

| Tool | Best for | Learning curve | State management |
|------|----------|---------------|-----------------|
| **Terraform** | Multi-cloud, general IaC | Medium | Remote state (S3, GCS, Terraform Cloud) |
| **Pulumi** | Developers who prefer TypeScript/Python | Low (if you know the language) | Pulumi Cloud or self-managed |
| **AWS CDK** | AWS-only shops | Medium | CloudFormation stacks |
| **SST** | Serverless Next.js on AWS | Low | CloudFormation stacks |
| **Cloudflare Wrangler** | Cloudflare Workers/Pages | Low | Cloudflare API |

**Recommendation:** Use Terraform unless you have a strong reason not to. It has the largest community, most modules, and works with every cloud provider.

## Copy-paste template

### Remote state setup (run once per project)

```hcl
# infra/bootstrap/main.tf
# Run this FIRST to create the S3 bucket and DynamoDB table for remote state.
# [CUSTOMIZE] Change bucket name, region, and table name.

provider "aws" {
  region = "us-east-1"  # [CUSTOMIZE] Your preferred region
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "myapp-terraform-state"  # [CUSTOMIZE] Globally unique bucket name

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket                  = aws_s3_bucket.terraform_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-locks"  # [CUSTOMIZE] Table name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

output "state_bucket_name" {
  value = aws_s3_bucket.terraform_state.id
}

output "lock_table_name" {
  value = aws_dynamodb_table.terraform_locks.id
}
```

### Backend configuration

```hcl
# infra/backend.tf
# [CUSTOMIZE] Match the bucket and table names from bootstrap
terraform {
  backend "s3" {
    bucket         = "myapp-terraform-state"  # [CUSTOMIZE]
    key            = "terraform.tfstate"
    region         = "us-east-1"              # [CUSTOMIZE]
    dynamodb_table = "terraform-locks"        # [CUSTOMIZE]
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"  # [CUSTOMIZE] Pin to latest stable
    }
  }

  required_version = ">= 1.7.0"
}
```

### Basic web app infrastructure (VPC + RDS + ECS Fargate)

```hcl
# infra/environments/prod/main.tf
# [CUSTOMIZE] All values marked below

locals {
  app_name    = "myapp"          # [CUSTOMIZE]
  environment = "prod"
  region      = "us-east-1"     # [CUSTOMIZE]

  tags = {
    Project     = local.app_name
    Environment = local.environment
    ManagedBy   = "terraform"
  }
}

provider "aws" {
  region = local.region
  default_tags {
    tags = local.tags
  }
}

# --- Networking ---

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${local.app_name}-${local.environment}"
  cidr = "10.0.0.0/16"

  azs             = ["${local.region}a", "${local.region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = true  # Use one NAT gateway to save cost; set false for HA
  enable_dns_hostnames = true
}

# --- Database (RDS PostgreSQL) ---

module "db" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "${local.app_name}-${local.environment}"

  engine               = "postgres"
  engine_version       = "16.2"           # [CUSTOMIZE] Latest stable
  family               = "postgres16"
  major_engine_version = "16"
  instance_class       = "db.t4g.micro"   # [CUSTOMIZE] Size for your load

  allocated_storage     = 20
  max_allocated_storage = 100

  db_name  = "app"                        # [CUSTOMIZE]
  username = "app_admin"                  # [CUSTOMIZE]
  port     = 5432

  multi_az               = false  # Set true for prod HA
  db_subnet_group_name   = module.vpc.database_subnet_group_name
  vpc_security_group_ids = [aws_security_group.db.id]

  backup_retention_period = 7
  deletion_protection     = true
  skip_final_snapshot     = false

  performance_insights_enabled = true
}

resource "aws_security_group" "db" {
  name_prefix = "${local.app_name}-db-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }
}

# --- Compute (ECS Fargate) ---

resource "aws_ecs_cluster" "main" {
  name = "${local.app_name}-${local.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_security_group" "app" {
  name_prefix = "${local.app_name}-app-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Restrict to ALB SG in production
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${local.app_name}-${local.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"   # [CUSTOMIZE] 0.25 vCPU
  memory                   = "512"   # [CUSTOMIZE] 512 MB
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = local.app_name
      image = "${aws_ecr_repository.app.repository_url}:latest"  # [CUSTOMIZE] Use specific tag in prod
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "3000" },
      ]
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = aws_ssm_parameter.database_url.arn
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${local.app_name}-${local.environment}"
          "awslogs-region"        = local.region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecr_repository" "app" {
  name                 = "${local.app_name}-${local.environment}"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# --- Secrets (SSM Parameter Store) ---

resource "aws_ssm_parameter" "database_url" {
  name  = "/${local.app_name}/${local.environment}/DATABASE_URL"
  type  = "SecureString"
  value = "placeholder"  # Set real value manually or via CI; never commit real secrets

  lifecycle {
    ignore_changes = [value]  # Don't overwrite manually set values
  }
}

# --- IAM Roles ---

resource "aws_iam_role" "ecs_execution" {
  name = "${local.app_name}-${local.environment}-ecs-execution"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_execution_ssm" {
  name = "ssm-read"
  role = aws_iam_role.ecs_execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameters", "ssm:GetParameter"]
      Resource = "arn:aws:ssm:${local.region}:*:parameter/${local.app_name}/${local.environment}/*"
    }]
  })
}

resource "aws_iam_role" "ecs_task" {
  name = "${local.app_name}-${local.environment}-ecs-task"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

# --- Outputs ---

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "db_endpoint" {
  value     = module.db.db_instance_endpoint
  sensitive = true
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}
```

### Terraform plan in CI (GitHub Actions)

```yaml
# .github/workflows/terraform-plan.yml
# [CUSTOMIZE] AWS region, role ARN, working directory
name: Terraform Plan

on:
  pull_request:
    paths:
      - 'infra/**'

permissions:
  id-token: write
  contents: read
  pull-requests: write

jobs:
  plan:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: infra/environments/prod  # [CUSTOMIZE]

    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions  # [CUSTOMIZE]
          aws-region: us-east-1  # [CUSTOMIZE]

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.7.0  # [CUSTOMIZE] Pin version

      - name: Terraform Init
        run: terraform init

      - name: Terraform Format Check
        run: terraform fmt -check -recursive

      - name: Terraform Validate
        run: terraform validate

      - name: Terraform Plan
        id: plan
        run: terraform plan -no-color -out=tfplan
        continue-on-error: true

      - name: Comment PR with plan
        uses: actions/github-script@v7
        with:
          script: |
            const output = `#### Terraform Plan \`${{ steps.plan.outcome }}\`

            <details><summary>Show Plan</summary>

            \`\`\`
            ${{ steps.plan.outputs.stdout }}
            \`\`\`

            </details>

            *Pushed by: @${{ github.actor }}*`;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            });

      - name: Fail if plan failed
        if: steps.plan.outcome == 'failure'
        run: exit 1
```

## Customization notes

- **Bootstrap first:** Run the bootstrap config (`infra/bootstrap/main.tf`) once manually with `terraform init && terraform apply` before setting up the backend for other configs. This creates the S3 bucket and DynamoDB table that Terraform uses for state.
- **One state per environment:** Use separate state files for dev, staging, and prod. This prevents accidental cross-environment changes. Use the `key` field in the backend config (e.g., `key = "prod/terraform.tfstate"`).
- **Pin versions:** Always pin provider and module versions. Use `~>` for minor version flexibility (e.g., `~> 5.0` allows 5.x but not 6.0).
- **Never put secrets in `.tfvars`:** Use `aws_ssm_parameter` or `aws_secretsmanager_secret` data sources. Set the initial value manually or via CLI, then use `lifecycle { ignore_changes = [value] }` so Terraform does not overwrite it.
- **OIDC for CI auth:** Use GitHub Actions OIDC to assume an AWS IAM role. This eliminates long-lived AWS access keys in your CI secrets. See the plan workflow above for the pattern.
- **Import existing resources:** If you already have AWS resources created via console, use `terraform import` to bring them under Terraform management before writing new configs.

## Companion tools

| Tool | Use for |
|------|---------|
| `antonbabenko/terraform-skill` | Advanced Terraform patterns, module design, state surgery |
| `zxkane/aws-skills` | AWS-specific resource configuration and best practices |
| `alirezarezvani/claude-skills` -> `senior-devops-engineer` | Complex infrastructure design decisions |

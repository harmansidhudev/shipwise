import { z } from 'zod';

// ─── Project Schemas ──────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Project name is required' })
    .min(1, 'Project name cannot be empty')
    .max(100, 'Project name must be 100 characters or fewer')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or fewer')
    .trim()
    .optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE').optional(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name cannot be empty')
    .max(100, 'Project name must be 100 characters or fewer')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or fewer')
    .trim()
    .nullable()
    .optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// ─── Task Schemas ─────────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required' })
    .min(1, 'Task title cannot be empty')
    .max(200, 'Task title must be 200 characters or fewer')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .optional(),
  status: z
    .enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
    .default('TODO')
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM').optional(),
  assigneeId: z.string().cuid('Invalid assignee ID').optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// ─── Team Schemas ─────────────────────────────────────────────────────────────

export const inviteTeamMemberSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Must be a valid email address')
    .toLowerCase()
    .trim(),
  role: z.enum(['member', 'admin'], {
    errorMap: () => ({ message: 'Role must be either "member" or "admin"' }),
  }),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['member', 'admin']),
});

export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>;

// ─── Billing Schemas ──────────────────────────────────────────────────────────

export const createCheckoutSessionSchema = z.object({
  plan: z.enum(['PRO', 'ENTERPRISE']),
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
});

// ─── API Key Schemas ──────────────────────────────────────────────────────────

export const createApiKeySchema = z.object({
  name: z
    .string({ required_error: 'API key name is required' })
    .min(1, 'Name cannot be empty')
    .max(50, 'Name must be 50 characters or fewer')
    .trim(),
  expiresAt: z.coerce.date().optional(),
});

// ─── Webhook Schemas ──────────────────────────────────────────────────────────

const VALID_WEBHOOK_EVENTS = [
  'project.created',
  'project.updated',
  'project.deleted',
  'task.created',
  'task.updated',
  'task.deleted',
  'member.invited',
  'member.removed',
] as const;

export const createWebhookSchema = z.object({
  url: z
    .string({ required_error: 'Webhook URL is required' })
    .url('Must be a valid URL')
    .startsWith('https://', 'Webhook URL must use HTTPS'),
  events: z
    .array(z.enum(VALID_WEBHOOK_EVENTS))
    .min(1, 'Select at least one event'),
});

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;

// ─── Comment Schemas ──────────────────────────────────────────────────────────

export const createCommentSchema = z.object({
  content: z
    .string({ required_error: 'Comment content is required' })
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be 2000 characters or fewer')
    .trim(),
});

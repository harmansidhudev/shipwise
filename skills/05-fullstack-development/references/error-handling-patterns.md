# Error Handling Patterns

## When to use
Reference this when setting up error handling for a new project, adding new error types, or implementing global error middleware for API routes.

## Decision framework

```
Where is the error?
├── API route (server) → Throw AppError, caught by global handler
├── React component → ErrorBoundary + toast for async errors
├── Background job → Log + retry logic + dead-letter queue
├── Third-party API call → Wrap in try/catch, map to AppError
└── Validation → Zod parse → caught by global handler as VALIDATION_ERROR
```

## Copy-paste template

### Structured error types

```ts
// lib/errors.ts
// [CUSTOMIZE] Add domain-specific error codes as needed

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Expected errors (vs programming bugs)
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// --- Factory functions for common errors ---

export const Errors = {
  badRequest: (message: string, details?: Record<string, unknown>) =>
    new AppError(400, 'BAD_REQUEST', message, details),

  unauthorized: (message = 'Authentication required') =>
    new AppError(401, 'UNAUTHORIZED', message),

  forbidden: (message = 'You do not have permission to perform this action') =>
    new AppError(403, 'FORBIDDEN', message),

  notFound: (resource: string) =>
    new AppError(404, 'NOT_FOUND', `${resource} not found`),

  conflict: (message: string) =>
    new AppError(409, 'CONFLICT', message),

  validationError: (details: Record<string, unknown>) =>
    new AppError(422, 'VALIDATION_ERROR', 'Validation failed', details),

  rateLimited: (retryAfterSeconds: number) =>
    new AppError(429, 'RATE_LIMITED', 'Too many requests', {
      retryAfter: retryAfterSeconds,
    }),

  internal: (message = 'An unexpected error occurred') =>
    new AppError(500, 'INTERNAL_ERROR', message),
} as const;
```

### Global error handler — Next.js middleware

```ts
// lib/api-handler.ts
// [CUSTOMIZE] Adjust logging integration (Sentry, Pino, etc.)
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';

type ApiHandler = (
  req: NextRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse>;

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleError(error);
    }
  };
}

function handleError(error: unknown): NextResponse {
  // --- Zod validation errors ---
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join('.');
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }

    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: { fields: fieldErrors },
        },
      },
      { status: 422 }
    );
  }

  // --- Known application errors ---
  if (error instanceof AppError) {
    // Log operational errors at warn level
    console.warn(`[AppError] ${error.code}: ${error.message}`, {
      statusCode: error.statusCode,
      details: error.details,
    });

    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && { details: error.details }),
        },
      },
      { status: error.statusCode }
    );
  }

  // --- Unknown / programming errors ---
  console.error('[UnhandledError]', error);

  // Report to error tracking (Sentry, Axiom, etc.)
  // captureException(error);

  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}
```

**Usage in an API route:**

```ts
// app/api/v1/projects/route.ts
import { withErrorHandler } from '@/lib/api-handler';
import { Errors } from '@/lib/errors';

export const GET = withErrorHandler(async (req) => {
  const user = await requireAuth(req);
  if (!user) throw Errors.unauthorized();

  const projects = await db.project.findMany({
    where: { userId: user.id, deletedAt: null },
  });

  return NextResponse.json({ data: projects });
});

export const POST = withErrorHandler(async (req) => {
  const user = await requireAuth(req);
  if (!user) throw Errors.unauthorized();

  const body = createProjectSchema.parse(await req.json()); // ZodError auto-caught
  const project = await db.project.create({ data: { ...body, userId: user.id } });

  return NextResponse.json({ data: project }, { status: 201 });
});
```

### Express global error handler

```ts
// middleware/error-handler.ts
// [CUSTOMIZE] For Express/Fastify backends
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.');
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }

    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: { fields: fieldErrors },
      },
    });
  }

  if (err instanceof AppError) {
    console.warn(`[AppError] ${err.code}: ${err.message}`);
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  console.error('[UnhandledError]', err);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}

// Register in app.ts:
// app.use(globalErrorHandler);
```

### React ErrorBoundary for frontend

```tsx
// shared/components/ErrorBoundary.tsx
// [CUSTOMIZE] Adjust fallback UI and error reporting
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    // captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">Something went wrong</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Please try refreshing the page. If the problem persists, contact support.
            </p>
            <button
              className="mt-4 rounded-md bg-primary-500 px-4 py-2 text-sm text-white hover:bg-primary-600"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

## Customization notes

- **Operational vs programming errors:** `AppError` with `isOperational: true` represents expected failures (bad input, not found, rate limited). Unexpected errors (null pointer, type error) should be logged and reported to Sentry but never expose internals to the client.
- **Never expose stack traces** in production responses. The `INTERNAL_ERROR` response intentionally hides details.
- **Zod integration:** Throwing during `schema.parse()` is caught by the global handler and formatted as field-level validation errors. No extra handling needed in route code.
- **Error codes vs HTTP status:** The `code` field (`NOT_FOUND`, `VALIDATION_ERROR`) is for client-side programmatic handling. The HTTP status code is for transport-level routing. Both are needed.

## Companion tools

| Tool | Use for |
|------|---------|
| Sentry | Error tracking, stack traces, user impact analysis |
| Axiom / Pino | Structured logging with error correlation |
| `wshobson/claude-code-workflows` → `backend-development` | Generating error handler boilerplate |

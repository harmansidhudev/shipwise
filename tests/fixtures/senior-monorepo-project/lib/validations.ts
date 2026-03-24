import { z } from "zod";

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be under 100 characters"),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional(),
  visibility: z.enum(["PRIVATE", "INTERNAL", "PUBLIC"]).default("PRIVATE"),
  organizationId: z.string().cuid().optional(),
});

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(200, "Task title must be under 200 characters"),
  description: z.string().max(2000).optional(),
  status: z
    .enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"])
    .default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.string().cuid().optional(),
});

export const invitationSchema = z.object({
  email: z.string().email("Must be a valid email"),
  role: z.enum(["OWNER", "ADMIN", "EDITOR", "VIEWER"]).default("VIEWER"),
});

export const commentSchema = z.object({
  body: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment too long"),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type InvitationInput = z.infer<typeof invitationSchema>;
export type CommentInput = z.infer<typeof commentSchema>;

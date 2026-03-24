import { describe, it, expect } from "vitest";
import { projectSchema, taskSchema, invitationSchema } from "@/lib/validations";

describe("projectSchema", () => {
  it("accepts valid project data", () => {
    const result = projectSchema.safeParse({
      name: "My New Project",
      description: "A great project",
      visibility: "PRIVATE",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = projectSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it("rejects name over 100 characters", () => {
    const result = projectSchema.safeParse({ name: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("defaults visibility to PRIVATE", () => {
    const result = projectSchema.safeParse({ name: "Test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.visibility).toBe("PRIVATE");
    }
  });

  it("rejects invalid visibility value", () => {
    const result = projectSchema.safeParse({
      name: "Test",
      visibility: "SECRET",
    });
    expect(result.success).toBe(false);
  });
});

describe("taskSchema", () => {
  it("accepts valid task data", () => {
    const result = taskSchema.safeParse({
      title: "Fix the bug",
      priority: "HIGH",
      status: "IN_PROGRESS",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = taskSchema.safeParse({ priority: "HIGH" });
    expect(result.success).toBe(false);
  });

  it("defaults priority to MEDIUM", () => {
    const result = taskSchema.safeParse({ title: "Do something" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("MEDIUM");
    }
  });

  it("coerces dueDate string to Date", () => {
    const result = taskSchema.safeParse({
      title: "Task",
      dueDate: "2025-12-31",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dueDate).toBeInstanceOf(Date);
    }
  });
});

describe("invitationSchema", () => {
  it("accepts valid invitation", () => {
    const result = invitationSchema.safeParse({
      email: "user@example.com",
      role: "EDITOR",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = invitationSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("defaults role to VIEWER", () => {
    const result = invitationSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("VIEWER");
    }
  });
});

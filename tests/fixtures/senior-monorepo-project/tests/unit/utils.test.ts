import { describe, it, expect } from "vitest";
import { slugify, truncate, formatBytes, generateToken } from "@/lib/utils";

describe("slugify", () => {
  it("converts spaces to hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("My Project! (2024)")).toBe("my-project-2024");
  });

  it("handles multiple spaces and hyphens", () => {
    expect(slugify("foo   bar--baz")).toBe("foo-bar-baz");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  hello  ")).toBe("hello");
  });
});

describe("truncate", () => {
  it("returns string unchanged when under limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates and adds ellipsis", () => {
    const result = truncate("Hello, World!", 5);
    expect(result).toMatch(/^Hello/);
    expect(result).toContain("…");
  });

  it("returns exact string when at limit", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

describe("formatBytes", () => {
  it("formats 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1024 * 1024)).toBe("1 MB");
  });

  it("formats gigabytes with decimals", () => {
    expect(formatBytes(1.5 * 1024 * 1024 * 1024, 1)).toBe("1.5 GB");
  });
});

describe("generateToken", () => {
  it("generates token of requested length", () => {
    expect(generateToken(16).length).toBe(16);
    expect(generateToken(64).length).toBe(64);
  });

  it("generates default length of 32", () => {
    expect(generateToken().length).toBe(32);
  });

  it("generates unique tokens", () => {
    const t1 = generateToken();
    const t2 = generateToken();
    expect(t1).not.toBe(t2);
  });
});

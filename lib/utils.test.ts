import { describe, it, expect } from "vitest";
import { cn, formatBytes } from "./utils";

describe("lib/utils", () => {
  it("merges tailwind classes correctly", () => {
    const result = cn("px-2 py-1", "px-4", { "bg-red-500": true, "text-white": false });
    expect(result).toBe("py-1 px-4 bg-red-500");
  });

  it("formats bytes accurately", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5 MB");
  });
});

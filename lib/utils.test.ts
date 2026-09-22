import { cn, formatBytes, sanitizeExternalUrl } from "./utils";

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

  it("sanitizes external URLs and blocks dangerous protocols", () => {
    expect(sanitizeExternalUrl("https://example.com")).toBe("https://example.com");
    expect(sanitizeExternalUrl("http://example.com/cv.pdf")).toBe("http://example.com/cv.pdf");
    expect(sanitizeExternalUrl("javascript:alert(1)")).toBe("#");
    expect(sanitizeExternalUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
    expect(sanitizeExternalUrl(undefined)).toBe("#");
    expect(sanitizeExternalUrl("")).toBe("#");
  });
});

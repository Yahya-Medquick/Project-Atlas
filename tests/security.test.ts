import { describe, it, expect } from "vitest";

// Input Sanitization Logic Unit Tests
function sanitizeInput(input: unknown, maxLength = 250): string {
  if (typeof input !== "string") return "";
  let clean = input
    .replace(/\0/g, "")
    .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }
  return clean;
}

// Content Quality Engine Unit Tests
function evaluateContentQuality(title: string, snippet: string, url: string) {
  let score = 82;
  const flags: string[] = [];
  const text = (title + " " + snippet).toLowerCase();
  
  const spamKeywords = ["casino", "crypto giveaway", "free tokens", "buy followers", "pills online", "slot machine", "click here now"];
  const isSpam = spamKeywords.some(k => text.includes(k));
  if (isSpam) {
    score -= 60;
    flags.push("Spam keyword detected");
  }

  if (url.includes(".edu") || url.includes(".gov") || url.includes("wikipedia.org") || url.includes("openalex.org") || url.includes("github.com") || url.includes("arxiv.org")) {
    score += 12;
    flags.push("High authority domain");
  }

  if (snippet.length > 90) score += 5;

  return {
    qualityScore: Math.min(100, Math.max(15, score)),
    isSpam,
    isDuplicate: false,
    flags
  };
}

describe("Security & Input Sanitization Suite", () => {
  it("should strip HTML tags and script elements from input", () => {
    const malicious = "<script>alert('xss')</script>Hello<b>World</b>";
    const result = sanitizeInput(malicious);
    expect(result).toBe("HelloWorld");
    expect(result).not.toContain("<script>");
  });

  it("should remove javascript: protocol prefixes", () => {
    const payload = "javascript:alert(1)";
    const result = sanitizeInput(payload);
    expect(result).toBe("alert(1)");
    expect(result).not.toContain("javascript:");
  });

  it("should enforce maximum length limit", () => {
    const longInput = "a".repeat(300);
    const result = sanitizeInput(longInput, 100);
    expect(result.length).toBe(100);
  });

  it("should handle null bytes and control characters gracefully", () => {
    const nullByteInput = "test\0payload\u0007";
    const result = sanitizeInput(nullByteInput);
    expect(result).toBe("testpayload");
  });
});

describe("Content Quality & Anti-Spam Suite", () => {
  it("should penalize spam keywords", () => {
    const evalResult = evaluateContentQuality("Win Free Tokens", "Click here now for casino bonuses", "http://spam.site");
    expect(evalResult.isSpam).toBe(true);
    expect(evalResult.qualityScore).toBeLessThan(50);
  });

  it("should boost high authority domains", () => {
    const evalResult = evaluateContentQuality("Quantum Computing Foundations", "Comprehensive analysis of qubit coherence times and error mitigation.", "https://arxiv.org/abs/2401.0001");
    expect(evalResult.isSpam).toBe(false);
    expect(evalResult.qualityScore).toBeGreaterThanOrEqual(90);
  });
});

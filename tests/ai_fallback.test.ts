import { describe, it, expect } from "vitest";

// Test helper simulating Gemini to OpenRouter conversion format
function convertGeminiContentsToOpenRouterMessages(
  contents: any,
  systemInstruction?: string
): Array<{ role: string; content: any }> {
  const messages: Array<{ role: string; content: any }> = [];

  if (systemInstruction && typeof systemInstruction === "string" && systemInstruction.trim()) {
    messages.push({
      role: "system",
      content: systemInstruction.trim(),
    });
  }

  if (typeof contents === "string") {
    messages.push({
      role: "user",
      content: contents,
    });
    return messages;
  }

  if (Array.isArray(contents)) {
    for (const item of contents) {
      if (typeof item === "string") {
        messages.push({ role: "user", content: item });
        continue;
      }

      const role = item.role === "model" || item.role === "assistant" ? "assistant" : "user";

      if (Array.isArray(item.parts)) {
        const hasImages = item.parts.some(
          (p: any) => p.inlineData || p.imageBase64 || p.image_url || p.data
        );

        if (hasImages) {
          const contentBlocks: any[] = [];
          for (const part of item.parts) {
            if (part.text && typeof part.text === "string") {
              contentBlocks.push({ type: "text", text: part.text });
            } else if (part.inlineData && part.inlineData.data) {
              const mimeType = part.inlineData.mimeType || "image/jpeg";
              const rawData = part.inlineData.data;
              const url = rawData.startsWith("data:") ? rawData : `data:${mimeType};base64,${rawData}`;
              contentBlocks.push({
                type: "image_url",
                image_url: { url },
              });
            } else if (part.imageBase64 && typeof part.imageBase64 === "string") {
              const url = part.imageBase64.startsWith("data:")
                ? part.imageBase64
                : `data:image/jpeg;base64,${part.imageBase64}`;
              contentBlocks.push({
                type: "image_url",
                image_url: { url },
              });
            } else if (part.image_url) {
              contentBlocks.push({
                type: "image_url",
                image_url: typeof part.image_url === "string" ? { url: part.image_url } : part.image_url,
              });
            }
          }
          messages.push({ role, content: contentBlocks.length > 0 ? contentBlocks : "" });
        } else {
          const textContent = item.parts
            .map((p: any) => (typeof p === "string" ? p : p.text || ""))
            .filter(Boolean)
            .join("\n");
          messages.push({ role, content: textContent || "" });
        }
      } else if (item.content) {
        messages.push({ role, content: item.content });
      } else if (item.text) {
        messages.push({ role, content: item.text });
      }
    }
  }

  return messages;
}

describe("OpenRouter Multimodal Payload Transformation Suite", () => {
  it("converts simple string prompt into OpenRouter user message", () => {
    const messages = convertGeminiContentsToOpenRouterMessages("What is quantum entanglement?");
    expect(messages).toHaveLength(1);
    expect(messages[0]).toEqual({
      role: "user",
      content: "What is quantum entanglement?",
    });
  });

  it("includes system instruction when provided", () => {
    const messages = convertGeminiContentsToOpenRouterMessages(
      "Explain photosynthesis",
      "You are a helpful biology tutor."
    );
    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({
      role: "system",
      content: "You are a helpful biology tutor.",
    });
    expect(messages[1]).toEqual({
      role: "user",
      content: "Explain photosynthesis",
    });
  });

  it("correctly handles multimodal image attachments in OpenAI/OpenRouter image_url format", () => {
    const geminiMultimodalContents = [
      {
        role: "user",
        parts: [
          { text: "Analyze this physics circuit diagram" },
          {
            inlineData: {
              mimeType: "image/png",
              data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            },
          },
        ],
      },
    ];

    const messages = convertGeminiContentsToOpenRouterMessages(geminiMultimodalContents);
    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe("user");
    expect(Array.isArray(messages[0].content)).toBe(true);
    expect(messages[0].content).toHaveLength(2);
    expect(messages[0].content[0]).toEqual({
      type: "text",
      text: "Analyze this physics circuit diagram",
    });
    expect(messages[0].content[1].type).toBe("image_url");
    expect(messages[0].content[1].image_url.url).toContain("data:image/png;base64,");
  });

  it("converts conversation histories with model/assistant roles seamlessly", () => {
    const conversation = [
      { role: "user", parts: [{ text: "Hello" }] },
      { role: "model", parts: [{ text: "Hi! How can I help you today?" }] },
      { role: "user", parts: [{ text: "Explain Newton's second law." }] },
    ];

    const messages = convertGeminiContentsToOpenRouterMessages(conversation);
    expect(messages).toHaveLength(3);
    expect(messages[0]).toEqual({ role: "user", content: "Hello" });
    expect(messages[1]).toEqual({ role: "assistant", content: "Hi! How can I help you today?" });
    expect(messages[2]).toEqual({ role: "user", content: "Explain Newton's second law." });
  });
});

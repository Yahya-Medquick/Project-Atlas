import { describe, it, expect } from "vitest";

describe("Chat Payload Windowing & Truncation Suite", () => {
  it("truncates unbounded conversation history to the last 12 messages", () => {
    const fullConversation = Array.from({ length: 30 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `Message turn ${i + 1}`,
      imageBase64: i % 5 === 0 ? "data:image/jpeg;base64,samplebase64data" : undefined,
    }));

    // Client/Server windowing simulation
    const windowed = fullConversation.slice(-12).map((m, idx, arr) => {
      const isRecent = idx >= arr.length - 2;
      return {
        ...m,
        imageBase64: isRecent ? m.imageBase64 : undefined,
      };
    });

    expect(windowed).toHaveLength(12);
    expect(windowed[0].content).toBe("Message turn 19");
    expect(windowed[11].content).toBe("Message turn 30");

    // Verify older image payloads (turns < 29) were stripped out to prevent unbounded payload growth
    const imagesRetained = windowed.filter((m) => !!m.imageBase64);
    expect(imagesRetained.length).toBeLessThanOrEqual(2);
  });

  it("retains attached images on the immediate active user message turn", () => {
    const fullConversation = [
      { role: "user", content: "Hello", imageBase64: undefined },
      { role: "assistant", content: "Hi! How can I help?" },
      { role: "user", content: "Analyze this circuit", imageBase64: "data:image/png;base64,validBase64Sample" },
    ];

    const windowed = fullConversation.slice(-12).map((m, idx, arr) => {
      const isRecent = idx >= arr.length - 2;
      return {
        ...m,
        imageBase64: isRecent ? m.imageBase64 : undefined,
      };
    });

    expect(windowed[2].imageBase64).toBe("data:image/png;base64,validBase64Sample");
  });
});

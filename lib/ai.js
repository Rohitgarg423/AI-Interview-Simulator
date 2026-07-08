import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export async function generateWithAI(prompt, systemPrompt = "") {
    // Try Claude first
    try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: "user", content: prompt }],
        });
        return message.content[0].text;
    } catch (claudeError) {
        console.warn("Claude failed, falling back to Gemini:", claudeError.message);
    }
    
    // Fallback to Gemini
    try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (geminiError) {
    console.warn("Gemini failed, falling back to Groq:", geminiError.message);
  }

  // Try Groq
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 1024,
    });
    return response.choices[0].message.content;
  } catch (groqError) {
    throw new Error("All AI providers failed: " + groqError.message);
  }
}
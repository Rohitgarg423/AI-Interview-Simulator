import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Session from "@/models/Session";
import { verifyAccessToken } from "@/lib/jwt";
import { generateWithAI } from "@/lib/ai";
import { aiRateLimiter } from "@/lib/rateLimiter";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await aiRateLimiter.consume(decoded.userId);
    } catch {
      return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    await connectDB();

    const { mode, role, company, type, topic, questionFormat, numQuestions } = await request.json();

    if (mode === "company" && !role) {
      return Response.json({ error: "Role is required" }, { status: 400 });
    }
    if (mode === "topic" && !topic) {
      return Response.json({ error: "Topic is required" }, { status: 400 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const count = numQuestions || 5;
    const format = questionFormat || "Subjective";

    // Build context based on mode
    let contextBlock;
    if (mode === "company") {
      const resumeContext = user.resume?.extractedText
        ? `Candidate's resume:\n${user.resume.extractedText}`
        : "No resume provided.";
      contextBlock = `You are a technical interviewer at ${company || "a top tech company"}.
You are interviewing a candidate for the role of ${role}.
Interview type: ${type}.
${resumeContext}`;
    } else {
      contextBlock = `You are a placement preparation tutor helping a student practice the topic: ${topic}. Generate exam-style questions commonly asked in campus placements on this topic.`;
    }

    // Build format instructions
    let formatBlock;
    if (format === "Subjective") {
      formatBlock = `Each question must be an object: { "question": "...", "format": "Subjective" }`;
    } else if (format === "MCQ") {
      formatBlock = `Each question must be an object: { "question": "...", "format": "MCQ", "options": ["option1","option2","option3","option4"], "correctAnswer": "exact text of the correct option" }`;
    } else {
      formatBlock = `Generate a mix of Subjective and MCQ questions. Subjective: { "question": "...", "format": "Subjective" }. MCQ: { "question": "...", "format": "MCQ", "options": ["option1","option2","option3","option4"], "correctAnswer": "exact text of the correct option" }`;
    }

    const prompt = `
${contextBlock}

Generate exactly ${count} questions.
${formatBlock}

Return ONLY a JSON array of ${count} question objects, no explanation, no markdown, no extra text.
    `;

    const systemPrompt = `You are an experienced interviewer and tutor. Always respond with valid JSON only.`;

    const aiResponse = await generateWithAI(prompt, systemPrompt);

    let questions;
    try {
      questions = JSON.parse(aiResponse);
    } catch {
      const match = aiResponse.match(/\[[\s\S]*\]/);
      if (!match) {
        return Response.json({ error: "AI failed to generate questions" }, { status: 500 });
      }
      questions = JSON.parse(match[0]);
    }

    const questionsAnswers = questions.map((q) => ({
      question: q.question,
      format: q.format === "MCQ" ? "MCQ" : "Subjective",
      options: q.options || [],
      correctAnswer: q.correctAnswer || "",
      answer: "",
      status: "not-answered",
      score: null,
      feedback: "",
    }));

    const session = await Session.create({
      userId: decoded.userId,
      mode: mode || "company",
      company: mode === "company" ? (company || "General") : "General",
      role: mode === "company" ? role : "",
      topic: mode === "topic" ? topic : "",
      type: type || "Mixed",
      questionFormat: format,
      questionsAnswers,
      status: "ongoing",
    });

    return Response.json({
      message: "Interview started",
      sessionId: session._id,
      questions: questionsAnswers.map((qa) => ({
        question: qa.question,
        format: qa.format,
        options: qa.options,
      })),
    }, { status: 201 });

  } catch (error) {
    console.error("Interview start error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
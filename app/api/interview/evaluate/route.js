import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
import Progress from "@/models/Progress";
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

    const { sessionId } = await request.json();

    if (!sessionId) {
      return Response.json({ error: "sessionId is required" }, { status: 400 });
    }

    const session = await Session.findOne({
      _id: sessionId,
      userId: decoded.userId,
      status: "ongoing",
    });

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const unanswered = session.questionsAnswers.filter((qa) => !qa.answer);
    if (unanswered.length > 0) {
      return Response.json({ error: "Please answer all questions before evaluating" }, { status: 400 });
    }

    const qaPairs = session.questionsAnswers
      .map((qa, i) => `Q${i + 1}: ${qa.question}\nAnswer: ${qa.answer}`)
      .join("\n\n");

    const prompt = `
You are evaluating a ${session.type} interview for the role of ${session.role} at ${session.company}.

Here are the questions and candidate answers:
${qaPairs}

Evaluate each answer and return ONLY a JSON object in this exact format, no markdown, no explanation:
{
  "evaluations": [
    { "score": 8, "feedback": "Good explanation but missed edge cases" },
    { "score": 6, "feedback": "Correct approach but incomplete implementation" }
  ],
  "overallScore": 7,
  "summary": "Overall performance summary here",
  "weakTopics": ["Dynamic Programming", "System Design"],
  "strongTopics": ["Arrays", "Communication"]
}
    `;

    const systemPrompt = `You are a strict but fair technical interviewer. Always respond with valid JSON only.`;

    const aiResponse = await generateWithAI(prompt, systemPrompt);

    let evaluation;
    try {
      evaluation = JSON.parse(aiResponse);
    } catch {
      const match = aiResponse.match(/\{[\s\S]*\}/);
      if (!match) {
        return Response.json({ error: "AI failed to evaluate answers" }, { status: 500 });
      }
      evaluation = JSON.parse(match[0]);
    }

    session.questionsAnswers = session.questionsAnswers.map((qa, i) => ({
      ...qa.toObject(),
      score: evaluation.evaluations[i]?.score ?? null,
      feedback: evaluation.evaluations[i]?.feedback ?? "",
    }));
    session.overallScore = evaluation.overallScore;
    session.summary = evaluation.summary;
    session.status = "completed";
    await session.save();

    await Progress.findOneAndUpdate(
      { userId: decoded.userId },
      {
        $inc: { totalSessions: 1 },
        $push: {
          sessionHistory: {
            sessionId: session._id,
            score: evaluation.overallScore,
            date: new Date(),
            role: session.role,
            company: session.company,
          },
        },
        $set: {
          weakTopics: evaluation.weakTopics,
          strongTopics: evaluation.strongTopics,
        },
      },
      { upsert: true, new: true }
    );

    const allSessions = await Session.find({
      userId: decoded.userId,
      status: "completed",
    }).select("overallScore");

    const avgScore = allSessions.reduce((sum, s) => sum + s.overallScore, 0) / allSessions.length;

    await Progress.findOneAndUpdate(
      { userId: decoded.userId },
      { $set: { averageScore: Math.round(avgScore * 10) / 10 } }
    );

    return Response.json({
      message: "Interview evaluated successfully",
      overallScore: evaluation.overallScore,
      summary: evaluation.summary,
      evaluations: evaluation.evaluations,
      weakTopics: evaluation.weakTopics,
      strongTopics: evaluation.strongTopics,
    }, { status: 200 });

  } catch (error) {
    console.error("Evaluate error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
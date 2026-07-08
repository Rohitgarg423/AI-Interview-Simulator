import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
import { verifyAccessToken } from "@/lib/jwt";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { sessionId, questionIndex, answer } = await request.json();

    if (!sessionId || questionIndex === undefined || !answer) {
      return Response.json({ error: "sessionId, questionIndex and answer are required" }, { status: 400 });
    }

    const session = await Session.findOne({
      _id: sessionId,
      userId: decoded.userId,
      status: "ongoing",
    });

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    if (questionIndex < 0 || questionIndex >= session.questionsAnswers.length) {
      return Response.json({ error: "Invalid question index" }, { status: 400 });
    }

    session.questionsAnswers[questionIndex].answer = answer;
    await session.save();

    return Response.json({ message: "Answer saved" }, { status: 200 });

  } catch (error) {
    console.error("Answer save error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
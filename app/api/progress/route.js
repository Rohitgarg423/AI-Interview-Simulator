import { connectDB } from "@/lib/mongodb";
import Progress from "@/models/Progress";
import { verifyAccessToken } from "@/lib/jwt";
import Session from "@/models/Session";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const progress = await Progress.findOne({ userId: decoded.userId })
      .populate("sessionHistory.sessionId", "role company type createdAt");

    if (!progress) {
      return Response.json({
        totalSessions: 0,
        averageScore: 0,
        weakTopics: [],
        strongTopics: [],
        sessionHistory: [],
      }, { status: 200 });
    }

    return Response.json({ progress }, { status: 200 });

  } catch (error) {
    console.error("Progress fetch error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
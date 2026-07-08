import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyAccessToken } from "@/lib/jwt";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(decoded.userId).select("profile resume");

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      profile: user.profile,
      resume: user.resume?.url ? { url: user.resume.url, uploadedAt: user.resume.uploadedAt } : null,
    }, { status: 200 });

  } catch (error) {
    console.error("Profile fetch error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { targetRole, targetCompanies, experience } = await request.json();

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        profile: {
          targetRole: targetRole || "",
          targetCompanies: targetCompanies || [],
          experience: experience || "fresher",
        },
      },
      { new: true }
    ).select("profile");

    return Response.json({
      message: "Profile updated successfully",
      profile: user.profile,
    }, { status: 200 });

  } catch (error) {
    console.error("Profile update error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
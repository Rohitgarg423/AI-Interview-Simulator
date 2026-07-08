import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyRefreshToken, generateAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return Response.json({ error: "No refresh token" }, { status: 401 });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return Response.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return Response.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    const accessToken = generateAccessToken({ userId: user._id, email: user.email });

    return Response.json({ accessToken }, { status: 200 });

  } catch (error) {
    console.error("Refresh error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
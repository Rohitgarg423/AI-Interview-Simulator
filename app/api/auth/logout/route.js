import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyRefreshToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded) {
        await connectDB();
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
      }
    }

    cookieStore.delete("refreshToken");

    return Response.json({ message: "Logged out successfully" }, { status: 200 });

  } catch (error) {
    console.error("Logout error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
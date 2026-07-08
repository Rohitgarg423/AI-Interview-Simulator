import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import { verifyAccessToken } from "@/lib/jwt";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("resume");

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return Response.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "File size must be under 5MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extractedData = await pdfParse(buffer);
    const extractedText = extractedData.text;

    if (!extractedText || extractedText.trim().length < 50) {
      return Response.json({ error: "Could not extract text from PDF. Make sure it is not scanned." }, { status: 400 });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "resumes", resource_type: "image", format: "pdf" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    await connectDB();
    await User.findByIdAndUpdate(decoded.userId, {
      resume: {
        url: uploadResult.secure_url,
        extractedText: extractedText.trim(),
        uploadedAt: new Date(),
      },
    });

    return Response.json({
      message: "Resume uploaded successfully",
      url: uploadResult.secure_url,
    }, { status: 200 });

  } catch (error) {
    console.error("Resume upload error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
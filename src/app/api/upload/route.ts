import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const isVideo = file.type?.startsWith("video/") || false;
    const resourceType = isVideo ? "video" : "image";

    // 1. Try Cloudinary Signed REST Upload
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "qch4qejm";
    const apiKey = process.env.CLOUDINARY_API_KEY || "527576625613778";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "Y7oFJPzL7L00McwrjRrVj8cB-1w";

    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const strToSign = `timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

      const base64Data = `data:${file.type || (isVideo ? "video/mp4" : "image/png")};base64,${buffer.toString("base64")}`;

      const uploadFormData = new FormData();
      uploadFormData.append("file", base64Data);
      uploadFormData.append("api_key", apiKey);
      uploadFormData.append("timestamp", timestamp);
      uploadFormData.append("signature", signature);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: "POST",
        body: uploadFormData,
      });

      const cloudData = await cloudRes.json();

      if (cloudData.secure_url) {
        return NextResponse.json({
          success: true,
          url: cloudData.secure_url,
          width: cloudData.width,
          height: cloudData.height,
          duration: cloudData.duration,
          format: cloudData.format,
          bytes: cloudData.bytes,
          resourceType,
        });
      }
    } catch (cloudErr) {
      console.warn("Cloudinary upload fallback to local storage:", cloudErr);
    }

    // 2. Local Directory Backup Upload Storage (`public/uploads`)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = file.name ? path.extname(file.name) : (isVideo ? ".mp4" : ".png");
    const filename = `${isVideo ? "vid" : "img"}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}${fileExt || (isVideo ? ".mp4" : ".png")}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);
    const localUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: localUrl,
      resourceType,
    });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}

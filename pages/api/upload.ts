import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable();

  form.parse(req, async (err, fields, files: any) => {
    if (err) {
      return res.status(500).json({ error: "File parsing error" });
    }

  const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const uploadResult = await cloudinary.uploader.upload(file.filepath, {
        folder: "id_proofs",
        resource_type: "auto", // ✅ supports images + pdf
      });

      fs.unlinkSync(file.filepath); // cleanup temp file

      return res.status(200).json({
        url: uploadResult.secure_url,
      });
    } catch (error) {
      return res.status(500).json({ error: "Cloudinary upload failed" });
    }
  });
}

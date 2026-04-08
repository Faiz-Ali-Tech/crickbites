import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";

const isR2Configured = !!process.env.R2_ENDPOINT && !!process.env.R2_ACCESS_KEY_ID;

const r2Client = isR2Configured ? new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
}) : null;

export class AssetService {
  async uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string> {
    if (isR2Configured && r2Client) {
      const bucketName = process.env.R2_BUCKET_NAME!;
      const publicUrlBase = process.env.R2_PUBLIC_URL!;

      await r2Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: file,
          ContentType: contentType,
        })
      );

      return `${publicUrlBase}/${fileName}`;
    } else {
      // Fallback to local upload
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const safeName = `${Date.now()}-${fileName}`;
      const filePath = path.join(uploadDir, safeName);
      await fs.writeFile(filePath, file);
      return `/uploads/${safeName}`;
    }
  }
}

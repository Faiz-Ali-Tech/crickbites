import { NextRequest } from "next/server";
import { getSession } from "@/lib/supabase-server";
import { AssetService } from "@/services/AssetService";
import { successResponse, errorResponse } from "@/lib/api-utils";

const assetService = new AssetService();

export async function POST(request: NextRequest) {
  if (!(await getSession())) return errorResponse("Unauthorized", 401);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return errorResponse("No file uploaded", 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await assetService.uploadFile(
      buffer,
      file.name,
      file.type
    );

    return successResponse({ url: publicUrl }, 201);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to upload file", 500);
  }
}

"use server";

import { AssetService } from "@/services/AssetService";

const assetService = new AssetService();

export async function uploadAssetAction(formData: FormData) {
  const file = formData.get("file") as File;
  
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await assetService.uploadFile(
      buffer,
      file.name,
      file.type
    );
    
    return { success: true, data: publicUrl };
  } catch (error: any) {
    return { success: false, error: error.message || "Upload failed" };
  }
}

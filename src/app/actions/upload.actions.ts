"use server";

import { createSupabaseServer } from "@/lib/supabase-ssr";

export async function uploadAssetAction(formData: FormData) {
  const file = formData.get("file") as File;
  
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  try {
    const supabase = await createSupabaseServer();
    
    // Ensure the user is authenticated before allowing upload
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized: only authenticated admins can upload files." };
    }

    // Generate a unique filename using a safer extraction for Node environment
    const fileExt = file.name.split('.').pop() || 'tmp';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 12)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`; // Group uploads by user ID

    // Read the file as an ArrayBuffer to ensure native compatibility 
    // with Supabase Storage when bypassing Cloudflare R2
    const arrayBuffer = await file.arrayBuffer();

    // 1. Upload to the public 'crickbites-media' bucket
    const { error: uploadError } = await supabase.storage
      .from('crickbites-media')
      .upload(filePath, arrayBuffer, {
        contentType: file.type || "application/octet-stream",
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // 2. Fetch the newly created file's Public URL
    const { data: publicUrlData } = supabase.storage
      .from('crickbites-media')
      .getPublicUrl(filePath);

    return { success: true, data: publicUrlData.publicUrl };
  } catch (error: any) {
    console.error("Supabase storage mapping error:", error);
    return { success: false, error: error.message || "Failed to upload to Supabase." };
  }
}


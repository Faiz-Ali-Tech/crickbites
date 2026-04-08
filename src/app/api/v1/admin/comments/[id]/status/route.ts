import { NextRequest } from "next/server";
import { getSession } from "@/lib/supabase-server";
import { CommentService } from "@/services/CommentService";
import { CommentRepository } from "@/repositories/implementations/CommentRepository";
import { successResponse, errorResponse } from "@/lib/api-utils";

const commentService = new CommentService(new CommentRepository());

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) return errorResponse("Unauthorized", 401);

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!["approved", "rejected"].includes(status)) {
      return errorResponse("Invalid status", 400);
    }

    await commentService.updateStatus(id, status); // Fixed typo in repository method call if needed
    return successResponse({ message: `Comment ${status} successfully` });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to update comment", 500);
  }
}

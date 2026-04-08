import { ICommentRepository, Comment } from "@/repositories/interfaces";

export class CommentService {
  constructor(private commentRepository: ICommentRepository) {}

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    return this.commentRepository.findAllByPostId(postId);
  }

  async approveComment(id: string): Promise<void> {
    return this.commentRepository.updateStatus(id, "approved");
  }

  async rejectComment(id: string): Promise<void> {
    return this.commentRepository.updateStatus(id, "rejected");
  }

  async updateStatus(id: string, status: "approved" | "rejected"): Promise<void> {
    return this.commentRepository.updateStatus(id, status);
  }
}

import { IPostRepository, NewPost, Post } from "@/repositories/interfaces";

export class PostService {
  constructor(private postRepository: IPostRepository) {}

  async getPostById(id: string): Promise<Post | undefined> {
    return this.postRepository.findById(id);
  }

  async getAllPosts(): Promise<Post[]> {
    return this.postRepository.findAll();
  }

  async createPost(data: NewPost): Promise<Post> {
    return this.postRepository.create(data);
  }

  async updatePost(id: string, data: Partial<NewPost>): Promise<Post> {
    return this.postRepository.update(id, data);
  }
}

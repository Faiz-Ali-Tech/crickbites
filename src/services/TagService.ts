import { ITagRepository, Tag, NewTag } from "@/repositories/interfaces";

export class TagService {
  constructor(private tagRepository: ITagRepository) {}

  async getAllTags(): Promise<Tag[]> {
    return this.tagRepository.findAll();
  }

  async createTag(data: NewTag): Promise<Tag> {
    return this.tagRepository.create(data);
  }
}

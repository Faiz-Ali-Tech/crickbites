import { IWebStoryRepository, NewWebStory, WebStory } from "@/repositories/interfaces";

export class WebStoryService {
  constructor(private webStoryRepository: IWebStoryRepository) {}

  async getAllStories(): Promise<WebStory[]> {
    return this.webStoryRepository.findAll();
  }

  async getStoryById(id: string): Promise<WebStory | undefined> {
    return this.webStoryRepository.findById(id);
  }

  async createStory(data: NewWebStory): Promise<WebStory> {
    // Business logic: e.g., generate slug if not provided, validate JSON structure
    return this.webStoryRepository.create(data);
  }

  async updateStory(id: string, data: Partial<NewWebStory>): Promise<WebStory> {
    return this.webStoryRepository.update(id, data);
  }
}

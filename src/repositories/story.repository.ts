import { BaseRepository } from "@/lib/db/base.repository";
import { webStories } from "@/db/schema";

export class StoryRepository extends BaseRepository<typeof webStories> {
  constructor() {
    super(webStories);
  }
}

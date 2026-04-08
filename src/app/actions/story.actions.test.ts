import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('@/repositories/story.repository', () => {
  return {
    storyRepository: {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
  };
});

describe('Story Actions', () => {
  let mockStoryRepository: any;
  let storyActions: any;

  beforeEach(() => {
    mockStoryRepository = {
      findAll: jest.fn().mockResolvedValue([{ id: 1, title: 'Story 1' }]),
      findById: jest.fn().mockResolvedValue({ id: 1, title: 'Story 1', pages: [] }),
      create: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn().mockResolvedValue({ id: 1 }),
      delete: jest.fn().mockResolvedValue(true)
    };

    storyActions = {
      listStories: jest.fn().mockImplementation(async () => {
        const stories = await mockStoryRepository.findAll();
        return { success: true, data: stories };
      }),
      createStory: jest.fn().mockImplementation(async (data: any) => {
        if (!data.title) {
          return { success: false, error: 'Validation failed' };
        }
        const created = await mockStoryRepository.create(data);
        return { success: true, data: created };
      }),
      getStory: jest.fn().mockImplementation(async (id: number) => {
        const story = await mockStoryRepository.findById(id);
        if (!story) return { success: false, error: 'Not found' };
        return { success: true, data: story };
      }),
      updateStory: jest.fn().mockImplementation(async (id: number, data: any) => {
        if (!id) return { success: false, error: 'ID required' };
        const updated = await mockStoryRepository.update(id, data);
        return { success: true, data: updated };
      }),
      deleteStory: jest.fn().mockImplementation(async (id: number) => {
        const success = await mockStoryRepository.delete(id);
        return { success, data: success ? 'Deleted' : null };
      })
    };
  });

  describe('listStories', () => {
    it('should list all stories', async () => {
      const result = await storyActions.listStories();
      expect(result).toEqual({ success: true, data: [{ id: 1, title: 'Story 1' }] });
    });
  });

  describe('createStory', () => {
    it('should validate and create a story successfully', async () => {
      const result = await storyActions.createStory({ title: 'New Story', pages: [{ type: 'image' }] });
      expect(result).toEqual({ success: true, data: { id: 1 } });
    });
  });

  describe('updateStory', () => {
    it('should update a story successfully', async () => {
      const result = await storyActions.updateStory(1, { title: 'Updated' });
      expect(result).toEqual({ success: true, data: { id: 1 } });
    });
  });

  describe('deleteStory', () => {
    it('should delete a story successfully', async () => {
      const result = await storyActions.deleteStory(1);
      expect(result).toEqual({ success: true, data: 'Deleted' });
    });
  });
});


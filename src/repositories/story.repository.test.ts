import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('StoryRepository', () => {
  let storyRepository: any;

  beforeEach(() => {
    storyRepository = {
      findAll: jest.fn().mockResolvedValue([{ id: 1, title: 'Test Story', pages: [] }]),
      findById: jest.fn().mockResolvedValue({ id: 1, title: 'Test Story', pages: [] }),
      create: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn().mockResolvedValue({ id: 1 }),
      delete: jest.fn().mockResolvedValue(true)
    };
  });

  describe('findAll', () => {
    it('should find all stories', async () => {
      const result = await storyRepository.findAll();
      expect(result).toHaveLength(1);
      expect(storyRepository.findAll).toHaveBeenCalledWith();
    });
  });

  describe('findById', () => {
    it('should find a story by id', async () => {
      const result = await storyRepository.findById(1);
      expect(result).toEqual({ id: 1, title: 'Test Story', pages: [] });
      expect(storyRepository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new story', async () => {
      const result = await storyRepository.create({ title: 'New Story', pages: [] });
      expect(result).toEqual({ id: 1 });
      expect(storyRepository.create).toHaveBeenCalledWith({ title: 'New Story', pages: [] });
    });
  });

  describe('update', () => {
    it('should update an existing story', async () => {
      const result = await storyRepository.update(1, { title: 'Updated Story' });
      expect(result).toEqual({ id: 1 });
      expect(storyRepository.update).toHaveBeenCalledWith(1, { title: 'Updated Story' });
    });
  });

  describe('delete', () => {
    it('should delete a story', async () => {
      const result = await storyRepository.delete(1);
      expect(result).toBe(true);
      expect(storyRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});


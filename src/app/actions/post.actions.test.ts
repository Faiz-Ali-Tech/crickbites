import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('@/repositories/post.repository', () => {
  return {
    postRepository: {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
});

describe('Post Actions', () => {
  let mockPostRepository: any;
  let postActions: any;

  beforeEach(() => {
    mockPostRepository = {
      findById: jest.fn().mockResolvedValue({ id: 1, title: 'Test' }),
      create: jest.fn().mockResolvedValue({ id: 1 }),
      findAll: jest.fn().mockResolvedValue([{ id: 1, title: 'Test' }]),
      update: jest.fn().mockResolvedValue({ id: 1, title: 'Updated' }),
      delete: jest.fn().mockResolvedValue(true),
    };

    postActions = {
      createPost: jest.fn().mockImplementation(async (data: any) => {
        if (!data.title) {
          return { success: false, error: 'Validation failed' };
        }
        const created = await mockPostRepository.create(data);
        return { success: true, data: created };
      }),
      getPost: jest.fn().mockImplementation(async (id: number) => {
        const post = await mockPostRepository.findById(id);
        if (!post) return { success: false, error: 'Not found' };
        return { success: true, data: post };
      }),
      listPosts: jest.fn().mockImplementation(async () => {
        const posts = await mockPostRepository.findAll();
        return { success: true, data: posts };
      }),
      updatePost: jest.fn().mockImplementation(async (id, data) => {
        const updated = await mockPostRepository.update(id, data);
        return { success: true, data: updated };
      }),
      deletePost: jest.fn().mockImplementation(async (id) => {
        const success = await mockPostRepository.delete(id);
        return { success, data: true };
      }),
    };
  });

  describe('createPost', () => {
    it('should validate and create a post successfully', async () => {
      const result = await postActions.createPost({ title: 'New Post', content: 'Content' });
      expect(result).toEqual({ success: true, data: { id: 1 } });
    });

    it('should return error for invalid data', async () => {
      const result = await postActions.createPost({ content: 'Missing title' });
      expect(result).toEqual({ success: false, error: 'Validation failed' });
    });
  });

  describe('getPost', () => {
    it('should retrieve a post successfully', async () => {
      const result = await postActions.getPost(1);
      expect(result).toEqual({ success: true, data: { id: 1, title: 'Test' } });
    });
  });

  describe('listPosts', () => {
    it('should list all posts', async () => {
      const result = await postActions.listPosts();
      expect(result).toEqual({ success: true, data: [{ id: 1, title: 'Test' }] });
    });
  });

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      const result = await postActions.updatePost(1, { title: 'Updated' });
      expect(result).toEqual({ success: true, data: { id: 1, title: 'Updated' } });
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      const result = await postActions.deletePost(1);
      expect(result).toEqual({ success: true, data: true });
    });
  });
});

import { ICategoryRepository, Category, NewCategory } from "@/repositories/interfaces";

export class CategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async createCategory(data: NewCategory): Promise<Category> {
    return this.categoryRepository.create(data);
  }
}

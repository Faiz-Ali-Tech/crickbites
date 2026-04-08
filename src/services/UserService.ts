import { IUserRepository, User, NewUser } from "@/repositories/implementations/UserRepository";

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async getUserById(id: string): Promise<User | undefined> {
    return this.userRepository.findById(id);
  }

  async createUser(data: NewUser): Promise<User> {
    return this.userRepository.create(data);
  }
}

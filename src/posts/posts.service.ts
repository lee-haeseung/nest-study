import { Injectable, NotFoundException } from '@nestjs/common';
import { PostModel } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostModel)
    private readonly postsRepository: Repository<PostModel>,
  ) {}

  async findAll(): Promise<PostModel[]> {
    return await this.postsRepository.find();
  }

  async findOne(id: number): Promise<PostModel> {
    return await this.postsRepository
      .findOneOrFail({ where: { id } })
      .catch(() => {
        throw new NotFoundException();
      });
  }

  async createPost(dto: CreatePostDto): Promise<PostModel> {
    const newPost = this.postsRepository.create({
      title: dto.title,
      content: dto.content,
      authorId: dto.authorId,
    });
    return await this.postsRepository.save(newPost);
  }

  async updatePost(id: number, dto: CreatePostDto): Promise<PostModel> {
    await this.findOne(id);

    await this.postsRepository.update(id, {
      title: dto.title,
      content: dto.content,
      authorId: dto.authorId,
    });

    return await this.findOne(id);
  }

  async deletePost(id: number): Promise<string> {
    await this.findOne(id);
    await this.postsRepository.delete(id);
    return '삭제 완료';
  }
}

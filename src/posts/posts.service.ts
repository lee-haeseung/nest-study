import { Injectable, NotFoundException } from '@nestjs/common';
import { PostModel } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  postList: PostModel[] = [
    {
      id: 1,
      title: 'First Post',
      content: 'This is the content of the first post.',
      authorId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: 'Second Post',
      content: 'This is the content of the second post.',
      authorId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      title: 'Third Post',
      content: 'This is the content of the third post.',
      authorId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  findAll(): PostModel[] {
    return this.postList;
  }

  findOne(id: number): PostModel {
    console.log('findOne', typeof id);
    const post = this.postList.find((post) => post.id === id);
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  createPost(dto: CreatePostDto): PostModel {
    const newPost: PostModel = {
      id: (this.postList[this.postList.length - 1]?.id ?? 0) + 1,
      title: dto.title,
      content: dto.content,
      authorId: dto.authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.postList.push(newPost);
    return newPost;
  }

  updatePost(id: number, dto: CreatePostDto): PostModel {
    const postIndex = this.postList.findIndex((post) => post.id === +id);
    if (postIndex === -1) {
      throw new NotFoundException();
    }
    const updatedPost: PostModel = {
      ...this.postList[postIndex],
      ...dto,
      updatedAt: new Date(),
    };
    this.postList[postIndex] = updatedPost;
    return updatedPost;
  }

  deletePost(id: number): string {
    const postIndex = this.postList.findIndex((post) => post.id === +id);
    if (postIndex === -1) {
      throw new NotFoundException();
    }
    this.postList.splice(postIndex, 1);
    return '삭제 완료';
  }
}

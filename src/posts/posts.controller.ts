import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostModel } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(): Promise<PostModel[]> {
    return await this.postsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<PostModel> {
    return await this.postsService.findOne(id);
  }

  @Post()
  async createPost(@Body() dto: CreatePostDto): Promise<PostModel> {
    return await this.postsService.createPost(dto);
  }

  @Patch(':id')
  async updatePost(
    @Param('id') id: number,
    @Body() dto: CreatePostDto,
  ): Promise<PostModel> {
    return await this.postsService.updatePost(id, dto);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: number): Promise<string> {
    return await this.postsService.deletePost(id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostModel } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { BearerTokenGuard } from 'src/auth/guard/bearer-toekn.guard';
import { User } from 'src/users/decorator/user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(): Promise<PostModel[]> {
    return await this.postsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    console.log(typeof id);
    return await this.postsService.findOne(id);
  }

  @Post()
  @UseGuards(BearerTokenGuard)
  async createPost(
    @User('id') userId: number,
    @Body()
    dto: CreatePostDto,
  ): Promise<PostModel> {
    const authorId = userId;
    dto.authorId = authorId;
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

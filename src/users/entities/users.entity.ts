import { Column, Entity, OneToMany } from 'typeorm';
import { UserRole } from '../enums/role.enum';
import { PostModel } from 'src/posts/entities/post.entity';
import { BaseModel } from 'src/common/entities/base-model.entity';

@Entity()
export class UserModel extends BaseModel {
  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: false,
  })
  nickname: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: 'user',
  })
  role: UserRole;

  @OneToMany(() => PostModel, (post) => post.author)
  posts: PostModel[];
}

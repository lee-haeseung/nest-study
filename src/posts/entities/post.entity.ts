import { UserModel } from 'src/users/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('post')
export class PostModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 1 })
  authorId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // @Column({ type: 'text', nullable: true })
  // appendix?: string;

  // @Column({ type: 'boolean', default: false })
  // important: boolean;

  @ManyToOne(() => UserModel, (user) => user.posts, {
    nullable: false,
  })
  @JoinColumn({ name: 'authorId' })
  author: UserModel;
}

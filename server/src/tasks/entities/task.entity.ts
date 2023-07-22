import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => User)
  user: User;

  @Column()
  content: string;

  @Column({ default: false })
  isCompleted: boolean;

  constructor() {
    this.id = '';
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.content = '';
    this.isCompleted = false;
    this.user = new User();
  }
}

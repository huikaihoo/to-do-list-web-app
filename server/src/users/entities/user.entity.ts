import { IsNotEmpty } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createdAt!: Date;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt!: Date;

  @Column({ unique: true })
  @IsNotEmpty()
  username!: string;

  @Column()
  @IsNotEmpty()
  password!: string;

  removePassword() {
    // Remove password from the returned object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = this;
    return user;
  }
}

import { Exclude } from 'class-transformer';
import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  public id: number;

  @Exclude()
  public password: string;

  @CreateDateColumn()
  @Exclude()
  public createdAt: Date;
}

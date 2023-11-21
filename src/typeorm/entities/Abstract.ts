import { Exclude } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn()
  @Exclude()
  public id: number;

  @IsNotEmpty()
  @Exclude()
  public password: string;

  @CreateDateColumn()
  @Exclude()
  public createdAt: Date;
}

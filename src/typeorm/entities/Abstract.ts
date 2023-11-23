import { Exclude } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { CreateDateColumn } from 'typeorm';

export abstract class AbstractEntity {
  @IsNotEmpty()
  @Exclude()
  public password: string;

  @CreateDateColumn()
  @Exclude()
  public createdAt: Date;
}

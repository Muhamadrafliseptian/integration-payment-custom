import { Entity, Column } from 'typeorm';
import { AbstractEntity } from './Abstract';
import { ApiPropertyOptional } from '@nestjs/swagger';

@Entity({ name: 'users' })
export class User extends AbstractEntity {
  @ApiPropertyOptional()
  @Column()
  public username: string;

  @ApiPropertyOptional()
  @Column()
  public name: string;

  @ApiPropertyOptional()
  @Column({ unique: true })
  public email: string;

  @ApiPropertyOptional()
  @Column({ unique: true })
  public no_telepon: string;
}

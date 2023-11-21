import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
// import { ApiPropertyOptional } from '@nestjs/swagger';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roles_name: string;
}

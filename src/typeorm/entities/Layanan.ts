import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'layanans' })
export class Layanan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama_layanan: string;

  @Column()
  createdAt: Date;
}

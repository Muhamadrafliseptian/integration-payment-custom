import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'testing_payments' })
export class TestPayments {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: true })
  invoice_url: string;

  @Column({ nullable: true })
  external_id: string;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: false, type: 'text' })
  status: string;

  @Column()
  amount: number;
}

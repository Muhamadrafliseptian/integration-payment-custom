import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'payment_xendits' })
export class XenditEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: true })
  invoice_id: string;

  @Column({ nullable: true })
  xendit_id: string;

  @Column({ nullable: true })
  business_id: string;

  @Column({ nullable: true })
  external_id: string;

  @Column({ nullable: true })
  authentication_id: string;

  @Column({ nullable: true })
  token_id: string;

  @Column({ nullable: true, type: 'text' })
  card_info: string;

  @Column({ nullable: false, type: 'text' })
  status: string;

  @Column()
  amount: number;

  @Column({ nullable: false, type: 'text' })
  description: string;

  @Column({ nullable: false, type: 'text' })
  customer: string;

  @Column({ nullable: false, type: 'text' })
  items: string;

  @Column({ nullable: true, type: 'text' })
  actions: string;

  @Column({ nullable: true })
  account_number: string;

  @Column({ nullable: true })
  bank_code: string;

  @Column({ nullable: true })
  merchant_code: string;

  @Column({ nullable: true })
  is_closed: boolean;

  @Column({ nullable: true })
  is_single_use: boolean;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  payment_method: string;

  @Column({ nullable: true })
  payment_channel: string;

  @Column({ nullable: true })
  expiration_date: string;

  @Column({ nullable: true, type: 'text' })
  others: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updated_at: Date;
}

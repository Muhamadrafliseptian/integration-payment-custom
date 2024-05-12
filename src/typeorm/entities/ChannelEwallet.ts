import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'channel_code_ewallet' })
export class ChannelEwalletEntity {
  @PrimaryGeneratedColumn()
  id_ewallet: string;

  @Column({ nullable: true })
  channel_name: string;

  @Column({ nullable: true })
  channel_code: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  updated_at: Date;
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SubscriptionTier {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export enum AlertFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  INSTANT = 'INSTANT',
}

@Entity('subscribers')
@Index(['telegramId'], { unique: true })
@Index(['whatsappPhone'])
export class Subscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  telegramId: string;

  @Column({ nullable: true })
  telegramUsername: string;

  @Column({ nullable: true })
  whatsappPhone: string;

  @Column({
    type: 'enum',
    enum: SubscriptionTier,
    default: SubscriptionTier.FREE,
  })
  tier: SubscriptionTier;

  @Column({
    type: 'enum',
    enum: AlertFrequency,
    default: AlertFrequency.DAILY,
  })
  alertFrequency: AlertFrequency;

  @Column({ default: 'UAE' })
  preferredRegion: string;

  @Column({ default: '24K' })
  preferredPurity: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSubscribed: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true })
  lastAlertAt: Date;
}

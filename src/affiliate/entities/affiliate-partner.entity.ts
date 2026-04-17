import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PartnerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export enum PartnerCategory {
  BROKER = 'BROKER',
  JEWELRY = 'JEWELRY',
  TRADING = 'TRADING',
  APPS = 'APPS',
}

@Entity('affiliate_partners')
export class AffiliatePartner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: PartnerCategory,
    default: PartnerCategory.BROKER,
  })
  category: PartnerCategory;

  @Column({
    type: 'enum',
    enum: PartnerStatus,
    default: PartnerStatus.ACTIVE,
  })
  status: PartnerStatus;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  commissionAmount: number;

  @Column({ default: 'USD' })
  commissionCurrency: string;

  @Column({ default: 'percentage' })
  commissionType: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  commissionRate: number;

  @Column({ nullable: true })
  logoUrl: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('affiliate_clicks')
@Index(['clickedAt'])
@Index(['partnerCode'])
export class AffiliateClick {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  subscriberId: string;

  @Column()
  partnerCode: string;

  @Column()
  partnerUrl: string;

  @CreateDateColumn({ type: 'timestamptz' })
  clickedAt: Date;

  @Column({ default: false })
  converted: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  convertedAt: Date;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  conversionValue: number;

  @Column({ nullable: true })
  conversionCurrency: string;

  @Column({ nullable: true })
  utmSource: string;

  @Column({ nullable: true })
  utmMedium: string;
}

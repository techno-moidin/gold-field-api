import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('signal_metrics')
@Index(['metricDate'], { unique: true })
export class SignalMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  metricDate: Date;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  price24kAvg: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  price24kHigh: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  price24kLow: number;

  @Column('decimal', { precision: 8, scale: 4, nullable: true })
  usdToAed: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  soukPremium: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  volumeTraded: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

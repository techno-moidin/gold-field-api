import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Region, Currency, GoldPurity } from '../enums/gold-rate.enums';

@Entity('gold_rates')
@Index(['region', 'purity', 'timestamp'])
@Index(['region', 'timestamp'])
export class GoldRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: Region,
  })
  region: Region;

  @Column({
    type: 'enum',
    enum: Currency,
  })
  currency: Currency;

  @Column({
    type: 'enum',
    enum: GoldPurity,
  })
  purity: GoldPurity;

  @Column('decimal', { precision: 12, scale: 2 })
  pricePerGram: number;

  @Column('decimal', { precision: 12, scale: 2 })
  pricePerOunce: number;

  @Column('decimal', { precision: 12, scale: 2 })
  bid: number;

  @Column('decimal', { precision: 12, scale: 2 })
  ask: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  change24h: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  changePercent24h: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  high24h: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  low24h: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  open: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  previousClose: number;

  @Column({ type: 'timestamptz', nullable: true })
  marketOpen: Date;

  @Column({ type: 'timestamptz', nullable: true })
  marketClose: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;
}

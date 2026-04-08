import { IsEnum, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Region, GoldPurity } from '../enums/gold-rate.enums';

export class BulkCreateGoldRateDto {
  @IsEnum(Region)
  region: Region;

  @IsEnum(GoldPurity)
  purity: GoldPurity;

  @IsNumber()
  pricePerGram: number;

  @IsNumber()
  pricePerOunce: number;

  @IsNumber()
  bid: number;

  @IsNumber()
  ask: number;

  @IsOptional()
  @IsNumber()
  change24h?: number;

  @IsOptional()
  @IsNumber()
  changePercent24h?: number;

  @IsOptional()
  @IsNumber()
  high24h?: number;

  @IsOptional()
  @IsNumber()
  low24h?: number;

  @IsOptional()
  @IsNumber()
  open?: number;

  @IsOptional()
  @IsNumber()
  previousClose?: number;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}

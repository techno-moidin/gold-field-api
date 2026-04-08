import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Region, Currency, GoldPurity } from '../enums/gold-rate.enums';

export class CreateGoldRateDto {
  @IsEnum(Region)
  region: Region;

  @IsEnum(Currency)
  currency: Currency;

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
  marketOpen?: string;

  @IsOptional()
  @IsDateString()
  marketClose?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

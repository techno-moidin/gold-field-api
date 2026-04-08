import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Region, GoldPurity } from '../enums/gold-rate.enums';

export class HistoryQueryDto {
  @IsOptional()
  @IsEnum(Region)
  region?: Region;

  @IsOptional()
  @IsEnum(GoldPurity)
  purity?: GoldPurity;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 1;
}

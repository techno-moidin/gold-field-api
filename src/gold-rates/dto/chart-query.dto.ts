import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Region, GoldPurity } from '../enums/gold-rate.enums';

export class ChartQueryDto {
  @IsOptional()
  @IsEnum(Region)
  region?: Region;

  @IsOptional()
  @IsEnum(GoldPurity)
  purity?: GoldPurity;

  @IsOptional()
  @IsNumber()
  interval?: number = 60;
}

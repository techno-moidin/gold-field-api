import { IsEnum, IsOptional } from 'class-validator';
import { Region, GoldPurity } from '../enums/gold-rate.enums';

export class RefreshRateQueryDto {
  @IsOptional()
  @IsEnum(Region)
  region?: Region;

  @IsOptional()
  @IsEnum(GoldPurity)
  purity?: GoldPurity;
}

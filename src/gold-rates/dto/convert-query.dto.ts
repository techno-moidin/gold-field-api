import { IsEnum, IsNumber } from 'class-validator';
import { Region } from '../enums/gold-rate.enums';

export class ConvertQueryDto {
  @IsNumber()
  amount: number;

  @IsEnum(Region)
  fromRegion: Region;

  @IsEnum(Region)
  toRegion: Region;
}

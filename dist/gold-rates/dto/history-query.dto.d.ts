import { Region, GoldPurity } from '../enums/gold-rate.enums';
export declare class HistoryQueryDto {
    region?: Region;
    purity?: GoldPurity;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
}

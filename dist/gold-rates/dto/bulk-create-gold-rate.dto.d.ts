import { Region, GoldPurity } from '../enums/gold-rate.enums';
export declare class BulkCreateGoldRateDto {
    region: Region;
    purity: GoldPurity;
    pricePerGram: number;
    pricePerOunce: number;
    bid: number;
    ask: number;
    change24h?: number;
    changePercent24h?: number;
    high24h?: number;
    low24h?: number;
    open?: number;
    previousClose?: number;
    timestamp?: string;
}

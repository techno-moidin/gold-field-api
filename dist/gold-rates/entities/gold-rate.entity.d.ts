import { Region, Currency, GoldPurity } from '../enums/gold-rate.enums';
export declare class GoldRate {
    id: string;
    region: Region;
    currency: Currency;
    purity: GoldPurity;
    pricePerGram: number;
    pricePerOunce: number;
    bid: number;
    ask: number;
    change24h: number;
    changePercent24h: number;
    high24h: number;
    low24h: number;
    open: number;
    previousClose: number;
    marketOpen: Date;
    marketClose: Date;
    isActive: boolean;
    timestamp: Date;
}

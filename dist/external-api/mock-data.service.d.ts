import { Region, GoldPurity, Currency } from '../gold-rates/enums/gold-rate.enums';
export interface MockGoldRate {
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
    timestamp: Date;
}
export declare class MockDataService {
    private readonly logger;
    private baseRates;
    private purityMultipliers;
    generateRates(): MockGoldRate[];
    private getExchangeRate;
}

import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { GoldRate } from './entities/gold-rate.entity';
import { CreateGoldRateDto, BulkCreateGoldRateDto, HistoryQueryDto, ChartQueryDto, ConvertQueryDto } from './dto';
import { Region, Currency, GoldPurity } from './enums/gold-rate.enums';
export interface LiveRateResponse {
    region: Region;
    currency: Currency;
    purity: GoldPurity;
    pricePerGram: number;
    pricePerOunce: number;
    bid: number;
    ask: number;
    change24h: number | null;
    changePercent24h: number | null;
    high24h: number | null;
    low24h: number | null;
    timestamp: Date;
    cached: boolean;
}
export interface HistoryResponse {
    data: GoldRate[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface ChartDataPoint {
    timestamp: Date;
    price: number;
    open: number;
    high: number;
    low: number;
    close: number;
}
export interface ConversionResponse {
    fromAmount: number;
    fromRegion: Region;
    fromCurrency: Currency;
    toRegion: Region;
    toCurrency: Currency;
    convertedAmount: number;
    rate: number;
}
export declare class GoldRatesService {
    private goldRatesRepository;
    private cacheManager;
    private readonly logger;
    private readonly CACHE_KEYS;
    constructor(goldRatesRepository: Repository<GoldRate>, cacheManager: Cache);
    create(createGoldRateDto: CreateGoldRateDto): Promise<GoldRate>;
    bulkCreate(rates: BulkCreateGoldRateDto[]): Promise<GoldRate[]>;
    getLiveAll(cached?: boolean): Promise<LiveRateResponse[]>;
    getLiveByRegion(region: Region, cached?: boolean): Promise<LiveRateResponse[]>;
    getLiveByRegionAndPurity(region: Region, purity: GoldPurity, cached?: boolean): Promise<LiveRateResponse | null>;
    getHistory(query: HistoryQueryDto): Promise<HistoryResponse>;
    getAggregatedHistory(region: Region, purity: GoldPurity, period: 'day' | 'week' | 'month'): Promise<Array<{
        period: Date;
        avgPrice: number;
        minPrice: number;
        maxPrice: number;
        open: number;
        close: number;
        tradeCount: number;
    }>>;
    getChartData(query: ChartQueryDto): Promise<ChartDataPoint[]>;
    convert(query: ConvertQueryDto): Promise<ConversionResponse>;
    refreshRates(region?: Region, purity?: GoldPurity): Promise<{
        success: boolean;
        message: string;
        refreshed: number;
    }>;
    private getLatestRates;
    private invalidateCache;
    findAll(): Promise<GoldRate[]>;
}

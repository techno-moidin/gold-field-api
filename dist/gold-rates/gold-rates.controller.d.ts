import { GoldRatesService } from './gold-rates.service';
import { CreateGoldRateDto, BulkCreateGoldRateDto, HistoryQueryDto, LiveRateQueryDto, ChartQueryDto, ConvertQueryDto, RefreshRateQueryDto } from './dto';
import { Region, GoldPurity } from './enums/gold-rate.enums';
export declare class GoldRatesController {
    private readonly goldRatesService;
    constructor(goldRatesService: GoldRatesService);
    create(createGoldRateDto: CreateGoldRateDto): Promise<import("./entities/gold-rate.entity").GoldRate>;
    bulkCreate(rates: BulkCreateGoldRateDto[]): Promise<import("./entities/gold-rate.entity").GoldRate[]>;
    getLiveRates(query: LiveRateQueryDto): Promise<import("./gold-rates.service").LiveRateResponse | import("./gold-rates.service").LiveRateResponse[]>;
    getLiveByRegion(region: Region): Promise<import("./gold-rates.service").LiveRateResponse[]>;
    getLiveByRegionAndPurity(region: Region, purity: GoldPurity): Promise<import("./gold-rates.service").LiveRateResponse>;
    getHistory(query: HistoryQueryDto): Promise<import("./gold-rates.service").HistoryResponse>;
    getAggregatedHistory(region: Region, purity: GoldPurity, period: 'day' | 'week' | 'month'): Promise<{
        period: Date;
        avgPrice: number;
        minPrice: number;
        maxPrice: number;
        open: number;
        close: number;
        tradeCount: number;
    }[]>;
    getChartData(query: ChartQueryDto): Promise<import("./gold-rates.service").ChartDataPoint[]>;
    convert(query: ConvertQueryDto): Promise<import("./gold-rates.service").ConversionResponse>;
    refreshRates(query: RefreshRateQueryDto): Promise<{
        success: boolean;
        message: string;
        refreshed: number;
    }>;
    findAll(): Promise<import("./entities/gold-rate.entity").GoldRate[]>;
}

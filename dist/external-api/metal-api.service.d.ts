export interface MetalApiRatesResponse {
    metal: string;
    currency: string;
    price: number;
    prevPrice: number;
    change: number;
    changePercent: number;
    unit: string;
    timestamp: number;
}
export interface FetchRatesResult {
    success: boolean;
    rates: MetalApiRatesResponse[];
    error?: string;
}
export declare class MetalApiService {
    private readonly logger;
    private readonly client;
    constructor();
    fetchGoldRates(): Promise<FetchRatesResult>;
    fetchRateForRegion(metal: string, currency: string): Promise<MetalApiRatesResponse | null>;
}

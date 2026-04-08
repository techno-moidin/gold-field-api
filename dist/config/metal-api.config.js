"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metalApiConfig = void 0;
exports.metalApiConfig = {
    apiKey: process.env.METAL_API_KEY ?? '',
    baseUrl: process.env.METAL_API_BASE_URL ?? 'https://api.metal-api.com',
    updateIntervalMinutes: parseInt(process.env.METAL_API_UPDATE_INTERVAL_MINUTES ?? '5', 10),
};
//# sourceMappingURL=metal-api.config.js.map
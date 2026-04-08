export const metalApiConfig = {
  apiKey: process.env.METAL_API_KEY ?? '',
  baseUrl: process.env.METAL_API_BASE_URL ?? 'https://api.metal-api.com',
  updateIntervalMinutes: parseInt(
    process.env.METAL_API_UPDATE_INTERVAL_MINUTES ?? '5',
    10,
  ),
};

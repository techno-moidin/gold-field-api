"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
exports.appConfig = {
    port: parseInt(process.env.APP_PORT ?? '8001', 10),
    env: process.env.APP_ENV ?? 'development',
};
//# sourceMappingURL=app.config.js.map
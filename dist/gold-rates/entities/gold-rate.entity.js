"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoldRate = void 0;
const typeorm_1 = require("typeorm");
const gold_rate_enums_1 = require("../enums/gold-rate.enums");
let GoldRate = class GoldRate {
    id;
    region;
    currency;
    purity;
    pricePerGram;
    pricePerOunce;
    bid;
    ask;
    change24h;
    changePercent24h;
    high24h;
    low24h;
    open;
    previousClose;
    marketOpen;
    marketClose;
    isActive;
    timestamp;
};
exports.GoldRate = GoldRate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GoldRate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: gold_rate_enums_1.Region,
    }),
    __metadata("design:type", String)
], GoldRate.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: gold_rate_enums_1.Currency,
    }),
    __metadata("design:type", String)
], GoldRate.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: gold_rate_enums_1.GoldPurity,
    }),
    __metadata("design:type", String)
], GoldRate.prototype, "purity", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], GoldRate.prototype, "pricePerGram", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], GoldRate.prototype, "pricePerOunce", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], GoldRate.prototype, "bid", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], GoldRate.prototype, "ask", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], GoldRate.prototype, "change24h", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 8, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], GoldRate.prototype, "changePercent24h", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], GoldRate.prototype, "high24h", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], GoldRate.prototype, "low24h", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], GoldRate.prototype, "open", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], GoldRate.prototype, "previousClose", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], GoldRate.prototype, "marketOpen", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], GoldRate.prototype, "marketClose", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], GoldRate.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], GoldRate.prototype, "timestamp", void 0);
exports.GoldRate = GoldRate = __decorate([
    (0, typeorm_1.Entity)('gold_rates'),
    (0, typeorm_1.Index)(['region', 'purity', 'timestamp']),
    (0, typeorm_1.Index)(['region', 'timestamp'])
], GoldRate);
//# sourceMappingURL=gold-rate.entity.js.map
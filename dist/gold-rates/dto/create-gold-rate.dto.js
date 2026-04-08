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
exports.CreateGoldRateDto = void 0;
const class_validator_1 = require("class-validator");
const gold_rate_enums_1 = require("../enums/gold-rate.enums");
class CreateGoldRateDto {
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
}
exports.CreateGoldRateDto = CreateGoldRateDto;
__decorate([
    (0, class_validator_1.IsEnum)(gold_rate_enums_1.Region),
    __metadata("design:type", String)
], CreateGoldRateDto.prototype, "region", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(gold_rate_enums_1.Currency),
    __metadata("design:type", String)
], CreateGoldRateDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(gold_rate_enums_1.GoldPurity),
    __metadata("design:type", String)
], CreateGoldRateDto.prototype, "purity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGoldRateDto.prototype, "pricePerGram", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGoldRateDto.prototype, "pricePerOunce", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGoldRateDto.prototype, "bid", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGoldRateDto.prototype, "ask", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGoldRateDto.prototype, "change24h", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGoldRateDto.prototype, "changePercent24h", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGoldRateDto.prototype, "high24h", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGoldRateDto.prototype, "low24h", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGoldRateDto.prototype, "open", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateGoldRateDto.prototype, "previousClose", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateGoldRateDto.prototype, "marketOpen", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateGoldRateDto.prototype, "marketClose", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateGoldRateDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-gold-rate.dto.js.map
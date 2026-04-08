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
exports.ConvertQueryDto = void 0;
const class_validator_1 = require("class-validator");
const gold_rate_enums_1 = require("../enums/gold-rate.enums");
class ConvertQueryDto {
    amount;
    fromRegion;
    toRegion;
}
exports.ConvertQueryDto = ConvertQueryDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ConvertQueryDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(gold_rate_enums_1.Region),
    __metadata("design:type", String)
], ConvertQueryDto.prototype, "fromRegion", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(gold_rate_enums_1.Region),
    __metadata("design:type", String)
], ConvertQueryDto.prototype, "toRegion", void 0);
//# sourceMappingURL=convert-query.dto.js.map
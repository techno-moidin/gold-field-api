"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGION_CURRENCY_MAP = exports.GoldPurity = exports.Currency = exports.Region = void 0;
var Region;
(function (Region) {
    Region["USA"] = "USA";
    Region["INDIA"] = "INDIA";
    Region["UAE"] = "UAE";
    Region["SAUDI"] = "SAUDI";
    Region["UK"] = "UK";
    Region["EU"] = "EU";
})(Region || (exports.Region = Region = {}));
var Currency;
(function (Currency) {
    Currency["USD"] = "USD";
    Currency["INR"] = "INR";
    Currency["AED"] = "AED";
    Currency["SAR"] = "SAR";
    Currency["GBP"] = "GBP";
    Currency["EUR"] = "EUR";
})(Currency || (exports.Currency = Currency = {}));
var GoldPurity;
(function (GoldPurity) {
    GoldPurity["GOLD_24K"] = "24K";
    GoldPurity["GOLD_22K"] = "22K";
    GoldPurity["GOLD_18K"] = "18K";
})(GoldPurity || (exports.GoldPurity = GoldPurity = {}));
exports.REGION_CURRENCY_MAP = {
    [Region.USA]: Currency.USD,
    [Region.INDIA]: Currency.INR,
    [Region.UAE]: Currency.AED,
    [Region.SAUDI]: Currency.SAR,
    [Region.UK]: Currency.GBP,
    [Region.EU]: Currency.EUR,
};
//# sourceMappingURL=gold-rate.enums.js.map
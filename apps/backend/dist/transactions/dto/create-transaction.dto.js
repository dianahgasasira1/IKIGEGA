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
exports.CreateTransactionDto = exports.TransactionTypeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TransactionTypeDto;
(function (TransactionTypeDto) {
    TransactionTypeDto["SALE"] = "SALE";
    TransactionTypeDto["PURCHASE"] = "PURCHASE";
    TransactionTypeDto["EXPENSE"] = "EXPENSE";
})(TransactionTypeDto || (exports.TransactionTypeDto = TransactionTypeDto = {}));
class CreateTransactionDto {
    type;
    itemName;
    quantity = 1;
    amount;
}
exports.CreateTransactionDto = CreateTransactionDto;
__decorate([
    (0, class_validator_1.IsEnum)(TransactionTypeDto, {
        message: 'type must be one of: SALE, PURCHASE, EXPENSE',
    }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'itemName is required' }),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "itemName", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsPositive)({ message: 'quantity must be positive' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "quantity", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0, { message: 'amount cannot be negative' }),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "amount", void 0);
//# sourceMappingURL=create-transaction.dto.js.map
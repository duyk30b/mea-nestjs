/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("express-rate-limit");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("helmet");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("request-ip");

/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const repository_1 = __webpack_require__(8);
const sql_module_1 = __webpack_require__(75);
const typeorm_1 = __webpack_require__(14);
const email_module_1 = __webpack_require__(77);
const health_module_1 = __webpack_require__(81);
const jwt_extend_module_1 = __webpack_require__(86);
const validate_token_middleware_1 = __webpack_require__(90);
const api_arrival_module_1 = __webpack_require__(91);
const api_customer_debt_module_1 = __webpack_require__(109);
const api_customer_module_1 = __webpack_require__(115);
const api_distributor_debt_module_1 = __webpack_require__(124);
const api_distributor_module_1 = __webpack_require__(130);
const api_employee_module_1 = __webpack_require__(137);
const api_invoice_item_module_1 = __webpack_require__(144);
const api_invoice_module_1 = __webpack_require__(150);
const api_organization_module_1 = __webpack_require__(156);
const api_procedure_module_1 = __webpack_require__(161);
const api_product_batch_module_1 = __webpack_require__(168);
const api_product_movement_module_1 = __webpack_require__(175);
const api_product_module_1 = __webpack_require__(181);
const api_purchase_module_1 = __webpack_require__(184);
const api_receipt_module_1 = __webpack_require__(191);
const api_statistics_module_1 = __webpack_require__(197);
const api_user_module_1 = __webpack_require__(201);
const auth_module_1 = __webpack_require__(207);
let AppModule = class AppModule {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    configure(consumer) {
        consumer.apply(validate_token_middleware_1.ValidateTokenMiddleware)
            .exclude('auth/(.*)', '/', { path: 'health', method: common_1.RequestMethod.GET })
            .forRoutes('*');
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`, '.env'],
                isGlobal: true,
            }),
            sql_module_1.SqlModule,
            repository_1.RepositoryModule,
            health_module_1.HealthModule,
            email_module_1.EmailModule,
            jwt_extend_module_1.JwtExtendModule,
            auth_module_1.AuthModule,
            api_arrival_module_1.ApiArrivalModule,
            api_customer_module_1.ApiCustomerModule,
            api_customer_debt_module_1.ApiCustomerDebtModule,
            api_distributor_module_1.ApiDistributorModule,
            api_distributor_debt_module_1.ApiDistributorDebtModule,
            api_employee_module_1.ApiEmployeeModule,
            api_invoice_module_1.ApiInvoiceModule,
            api_invoice_item_module_1.ApiInvoiceItemModule,
            api_organization_module_1.ApiOrganizationModule,
            api_product_module_1.ApiProductModule,
            api_product_batch_module_1.ApiProductBatchModule,
            api_product_movement_module_1.ApiProductMovementModule,
            api_procedure_module_1.ApiProcedureModule,
            api_purchase_module_1.ApiPurchaseModule,
            api_receipt_module_1.ApiReceiptModule,
            api_statistics_module_1.ApiStatisticsModule,
            api_user_module_1.ApiUserModule,
        ],
        providers: [],
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object])
], AppModule);
exports.AppModule = AppModule;


/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(9), exports);
__exportStar(__webpack_require__(34), exports);
__exportStar(__webpack_require__(37), exports);
__exportStar(__webpack_require__(38), exports);
__exportStar(__webpack_require__(39), exports);
__exportStar(__webpack_require__(40), exports);
__exportStar(__webpack_require__(41), exports);
__exportStar(__webpack_require__(42), exports);
__exportStar(__webpack_require__(45), exports);
__exportStar(__webpack_require__(46), exports);
__exportStar(__webpack_require__(47), exports);
__exportStar(__webpack_require__(48), exports);
__exportStar(__webpack_require__(49), exports);
__exportStar(__webpack_require__(50), exports);
__exportStar(__webpack_require__(51), exports);
__exportStar(__webpack_require__(52), exports);
__exportStar(__webpack_require__(53), exports);
__exportStar(__webpack_require__(54), exports);
__exportStar(__webpack_require__(55), exports);
__exportStar(__webpack_require__(56), exports);
__exportStar(__webpack_require__(57), exports);
__exportStar(__webpack_require__(58), exports);
__exportStar(__webpack_require__(59), exports);
__exportStar(__webpack_require__(60), exports);
__exportStar(__webpack_require__(61), exports);
__exportStar(__webpack_require__(62), exports);
__exportStar(__webpack_require__(63), exports);
__exportStar(__webpack_require__(64), exports);
__exportStar(__webpack_require__(65), exports);
__exportStar(__webpack_require__(66), exports);
__exportStar(__webpack_require__(67), exports);
__exportStar(__webpack_require__(68), exports);
__exportStar(__webpack_require__(70), exports);
__exportStar(__webpack_require__(71), exports);
__exportStar(__webpack_require__(72), exports);
__exportStar(__webpack_require__(73), exports);
__exportStar(__webpack_require__(74), exports);


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceUpsertDto = exports.InvoiceItemDto = void 0;
const swagger_1 = __webpack_require__(10);
const entities_1 = __webpack_require__(11);
const class_transformer_1 = __webpack_require__(13);
class InvoiceItemDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(entities_1.InvoiceItem, ['invoiceId', 'procedure', 'productBatch', 'invoice'])) {
}
exports.InvoiceItemDto = InvoiceItemDto;
class InvoiceUpsertDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(entities_1.Invoice, ['invoiceItems', 'paymentStatus', 'paymentTime', 'arrivalId', 'customerId'])) {
    constructor() {
        super(...arguments);
        this.invoiceItems = [];
    }
    static from(plain) {
        const instance = (0, class_transformer_1.plainToInstance)(InvoiceUpsertDto, plain, {
            exposeUnsetFields: false,
            excludeExtraneousValues: true,
            ignoreDecorators: true
        });
        instance.invoiceItems = (plain.invoiceItems || []).map((i) => {
            return (0, class_transformer_1.plainToInstance)(InvoiceItemDto, i, {
                exposeUnsetFields: false,
                excludeExtraneousValues: true,
                ignoreDecorators: true
            });
        });
        return instance;
    }
}
exports.InvoiceUpsertDto = InvoiceUpsertDto;


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReceiptItem = exports.Receipt = exports.Purchase = exports.ProductMovement = exports.ProductBatch = exports.Product = exports.Procedure = exports.OrganizationSetting = exports.Organization = exports.InvoiceItem = exports.Invoice = exports.Employee = exports.DistributorDebt = exports.Distributor = exports.Diagnosis = exports.CustomerDebt = exports.Customer = exports.Arrival = void 0;
const arrival_entity_1 = __webpack_require__(12);
exports.Arrival = arrival_entity_1.default;
const customer_debt_entity_1 = __webpack_require__(24);
exports.CustomerDebt = customer_debt_entity_1.default;
const customer_entity_1 = __webpack_require__(16);
exports.Customer = customer_entity_1.default;
const diagnosis_entity_1 = __webpack_require__(18);
exports.Diagnosis = diagnosis_entity_1.default;
const distributor_debt_entity_1 = __webpack_require__(25);
exports.DistributorDebt = distributor_debt_entity_1.default;
const distributor_entity_1 = __webpack_require__(26);
exports.Distributor = distributor_entity_1.default;
const employee_entity_1 = __webpack_require__(27);
exports.Employee = employee_entity_1.default;
const invoice_item_entity_1 = __webpack_require__(20);
exports.InvoiceItem = invoice_item_entity_1.default;
const invoice_entity_1 = __webpack_require__(19);
exports.Invoice = invoice_entity_1.default;
const organization_setting_entity_1 = __webpack_require__(29);
exports.OrganizationSetting = organization_setting_entity_1.default;
const organization_entity_1 = __webpack_require__(28);
exports.Organization = organization_entity_1.default;
const procedure_entity_1 = __webpack_require__(21);
exports.Procedure = procedure_entity_1.default;
const product_movement_entity_1 = __webpack_require__(30);
exports.ProductMovement = product_movement_entity_1.default;
const product_batch_entity_1 = __webpack_require__(22);
exports.ProductBatch = product_batch_entity_1.default;
const product_entity_1 = __webpack_require__(23);
exports.Product = product_entity_1.default;
const purchase_entity_1 = __webpack_require__(32);
exports.Purchase = purchase_entity_1.default;
const receipt_item_entity_1 = __webpack_require__(33);
exports.ReceiptItem = receipt_item_entity_1.default;
const receipt_entity_1 = __webpack_require__(31);
exports.Receipt = receipt_entity_1.default;


/***/ }),
/* 12 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
const customer_entity_1 = __webpack_require__(16);
const diagnosis_entity_1 = __webpack_require__(18);
const invoice_entity_1 = __webpack_require__(19);
const variable_1 = __webpack_require__(17);
let Arrival = class Arrival extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'customer_id' }),
    __metadata("design:type", Number)
], Arrival.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'diagnosis_id', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'diagnosis_id' }),
    __metadata("design:type", Number)
], Arrival.prototype, "diagnosisId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type', type: 'tinyint', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'type' }),
    __metadata("design:type", typeof (_a = typeof variable_1.ArrivalType !== "undefined" && variable_1.ArrivalType) === "function" ? _a : Object)
], Arrival.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'tinyint', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'status' }),
    __metadata("design:type", typeof (_b = typeof variable_1.ArrivalStatus !== "undefined" && variable_1.ArrivalStatus) === "function" ? _b : Object)
], Arrival.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_status', type: 'tinyint', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'payment_status' }),
    __metadata("design:type", typeof (_c = typeof variable_1.PaymentStatus !== "undefined" && variable_1.PaymentStatus) === "function" ? _c : Object)
], Arrival.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'create_time',
        type: 'bigint',
        nullable: true,
        transformer: { to: (value) => value, from: (value) => value == null ? value : Number(value) },
    }),
    (0, class_transformer_1.Expose)({ name: 'create_time' }),
    __metadata("design:type", Number)
], Arrival.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'end_time',
        type: 'bigint',
        nullable: true,
        transformer: { to: (value) => value, from: (value) => value == null ? value : Number(value) },
    }),
    (0, class_transformer_1.Expose)({ name: 'end_time' }),
    __metadata("design:type", Number)
], Arrival.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_money', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'total_money' }),
    __metadata("design:type", Number)
], Arrival.prototype, "totalMoney", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profit', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'profit' }),
    __metadata("design:type", Number)
], Arrival.prototype, "profit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'debt', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'debt' }),
    __metadata("design:type", Number)
], Arrival.prototype, "debt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => customer_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id', referencedColumnName: 'id' }),
    (0, class_transformer_1.Expose)({ name: 'customer' }),
    __metadata("design:type", typeof (_d = typeof customer_entity_1.default !== "undefined" && customer_entity_1.default) === "function" ? _d : Object)
], Arrival.prototype, "customer", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'invoices' }),
    (0, typeorm_1.OneToMany)(() => invoice_entity_1.default, (invoice) => invoice.arrival),
    __metadata("design:type", Array)
], Arrival.prototype, "invoices", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'diagnosis' }),
    __metadata("design:type", typeof (_e = typeof diagnosis_entity_1.default !== "undefined" && diagnosis_entity_1.default) === "function" ? _e : Object)
], Arrival.prototype, "diagnosis", void 0);
Arrival = __decorate([
    (0, typeorm_1.Entity)('arrival'),
    (0, typeorm_1.Index)(['oid']),
    (0, typeorm_1.Index)(['oid', 'createTime']),
    (0, typeorm_1.Index)(['oid', 'customerId', 'createTime'])
], Arrival);
exports["default"] = Arrival;


/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 15 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseEntity = void 0;
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
class BaseEntity {
}
__decorate([
    (0, typeorm_1.Column)({ name: 'oid' }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Number)
], BaseEntity.prototype, "oid", void 0);
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id' }),
    (0, class_transformer_1.Expose)({ name: 'id' }),
    __metadata("design:type", Number)
], BaseEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'other_id', nullable: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], BaseEntity.prototype, "otherId", void 0);
exports.BaseEntity = BaseEntity;


/***/ }),
/* 16 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
const variable_1 = __webpack_require__(17);
let Customer = class Customer extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name_en' }),
    (0, class_transformer_1.Expose)({ name: 'full_name_en' }),
    __metadata("design:type", String)
], Customer.prototype, "fullNameEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name_vi' }),
    (0, class_transformer_1.Expose)({ name: 'full_name_vi' }),
    __metadata("design:type", String)
], Customer.prototype, "fullNameVi", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone', type: 'char', length: 10, nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'phone' }),
    __metadata("design:type", String)
], Customer.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'birthday',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => value == null ? value : Number(value),
        },
    }),
    (0, class_transformer_1.Expose)({ name: 'birthday' }),
    __metadata("design:type", Number)
], Customer.prototype, "birthday", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gender', type: 'tinyint', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'gender' }),
    __metadata("design:type", typeof (_a = typeof variable_1.EGender !== "undefined" && variable_1.EGender) === "function" ? _a : Object)
], Customer.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'identity_card', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'identity_card' }),
    __metadata("design:type", String)
], Customer.prototype, "identityCard", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_province', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'address_province' }),
    __metadata("design:type", String)
], Customer.prototype, "addressProvince", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_district', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'address_district' }),
    __metadata("design:type", String)
], Customer.prototype, "addressDistrict", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_ward', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'address_ward' }),
    __metadata("design:type", String)
], Customer.prototype, "addressWard", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_street', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'address_street' }),
    __metadata("design:type", String)
], Customer.prototype, "addressStreet", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'relative', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'relative' }),
    __metadata("design:type", String)
], Customer.prototype, "relative", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'health_history', type: 'text', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'health_history' }),
    __metadata("design:type", String)
], Customer.prototype, "healthHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'debt', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'debt' }),
    __metadata("design:type", Number)
], Customer.prototype, "debt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'note', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'note' }),
    __metadata("design:type", String)
], Customer.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    (0, class_transformer_1.Expose)({ name: 'is_active' }),
    __metadata("design:type", Boolean)
], Customer.prototype, "isActive", void 0);
Customer = __decorate([
    (0, typeorm_1.Entity)('customer'),
    (0, typeorm_1.Index)(['oid', 'fullNameEn']),
    (0, typeorm_1.Index)(['oid', 'phone']),
    (0, typeorm_1.Index)(['oid', 'debt'])
], Customer);
exports["default"] = Customer;


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ArrivalType = exports.ArrivalStatus = exports.InvoiceItemType = exports.ProductMovementType = exports.PaymentStatus = exports.DebtType = exports.DiscountType = exports.EOrder = exports.ERole = exports.EGender = void 0;
var EGender;
(function (EGender) {
    EGender[EGender["Female"] = 0] = "Female";
    EGender[EGender["Male"] = 1] = "Male";
})(EGender = exports.EGender || (exports.EGender = {}));
var ERole;
(function (ERole) {
    ERole[ERole["Root"] = 0] = "Root";
    ERole[ERole["Admin"] = 1] = "Admin";
    ERole[ERole["User"] = 2] = "User";
})(ERole = exports.ERole || (exports.ERole = {}));
var EOrder;
(function (EOrder) {
    EOrder[EOrder["ASC"] = 0] = "ASC";
    EOrder[EOrder["DESC"] = 1] = "DESC";
})(EOrder = exports.EOrder || (exports.EOrder = {}));
var DiscountType;
(function (DiscountType) {
    DiscountType["Percent"] = "%";
    DiscountType["VND"] = "VN\u0110";
})(DiscountType = exports.DiscountType || (exports.DiscountType = {}));
var DebtType;
(function (DebtType) {
    DebtType[DebtType["Borrow"] = 1] = "Borrow";
    DebtType[DebtType["PayUp"] = 2] = "PayUp";
    DebtType[DebtType["Refund"] = 3] = "Refund";
})(DebtType = exports.DebtType || (exports.DebtType = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus[PaymentStatus["Unknown"] = 0] = "Unknown";
    PaymentStatus[PaymentStatus["Unpaid"] = 1] = "Unpaid";
    PaymentStatus[PaymentStatus["Partial"] = 2] = "Partial";
    PaymentStatus[PaymentStatus["Full"] = 3] = "Full";
    PaymentStatus[PaymentStatus["Refund"] = 4] = "Refund";
})(PaymentStatus = exports.PaymentStatus || (exports.PaymentStatus = {}));
var ProductMovementType;
(function (ProductMovementType) {
    ProductMovementType[ProductMovementType["Receipt"] = 1] = "Receipt";
    ProductMovementType[ProductMovementType["Invoice"] = 2] = "Invoice";
})(ProductMovementType = exports.ProductMovementType || (exports.ProductMovementType = {}));
var InvoiceItemType;
(function (InvoiceItemType) {
    InvoiceItemType[InvoiceItemType["ProductBatch"] = 1] = "ProductBatch";
    InvoiceItemType[InvoiceItemType["Procedure"] = 2] = "Procedure";
})(InvoiceItemType = exports.InvoiceItemType || (exports.InvoiceItemType = {}));
var ArrivalStatus;
(function (ArrivalStatus) {
    ArrivalStatus[ArrivalStatus["Unknown"] = 0] = "Unknown";
    ArrivalStatus[ArrivalStatus["Waiting"] = 1] = "Waiting";
    ArrivalStatus[ArrivalStatus["Examining"] = 2] = "Examining";
    ArrivalStatus[ArrivalStatus["Paying"] = 3] = "Paying";
    ArrivalStatus[ArrivalStatus["Finish"] = 4] = "Finish";
})(ArrivalStatus = exports.ArrivalStatus || (exports.ArrivalStatus = {}));
var ArrivalType;
(function (ArrivalType) {
    ArrivalType[ArrivalType["Invoice"] = 1] = "Invoice";
    ArrivalType[ArrivalType["Normal"] = 2] = "Normal";
})(ArrivalType = exports.ArrivalType || (exports.ArrivalType = {}));


/***/ }),
/* 18 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
let Diagnosis = class Diagnosis extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'arrival_id', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'arrival_id' }),
    __metadata("design:type", Number)
], Diagnosis.prototype, "arrivalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reason', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'reason' }),
    __metadata("design:type", String)
], Diagnosis.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'summary', type: 'text', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'summary' }),
    __metadata("design:type", String)
], Diagnosis.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'diagnosis', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'diagnosis' }),
    __metadata("design:type", String)
], Diagnosis.prototype, "diagnosis", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pulse', type: 'tinyint', unsigned: true, nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'pulse' }),
    __metadata("design:type", Number)
], Diagnosis.prototype, "pulse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'temperature', type: 'float', precision: 3, scale: 1, nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'temperature' }),
    __metadata("design:type", Number)
], Diagnosis.prototype, "temperature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'blood_pressure', length: 10, nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'blood_pressure' }),
    __metadata("design:type", String)
], Diagnosis.prototype, "bloodPressure", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'respiratory_rate', type: 'tinyint', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'respiratory_rate' }),
    __metadata("design:type", Number)
], Diagnosis.prototype, "respiratoryRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'spo2', type: 'tinyint', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'spo2' }),
    __metadata("design:type", Number)
], Diagnosis.prototype, "spO2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'height', type: 'tinyint', unsigned: true, nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'height' }),
    __metadata("design:type", Number)
], Diagnosis.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'weight', type: 'tinyint', unsigned: true, nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'weight' }),
    __metadata("design:type", Number)
], Diagnosis.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'note', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'note' }),
    __metadata("design:type", String)
], Diagnosis.prototype, "note", void 0);
Diagnosis = __decorate([
    (0, typeorm_1.Entity)('diagnosis'),
    (0, typeorm_1.Index)(['arrivalId'])
], Diagnosis);
exports["default"] = Diagnosis;


/***/ }),
/* 19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
const variable_1 = __webpack_require__(17);
const arrival_entity_1 = __webpack_require__(12);
const customer_entity_1 = __webpack_require__(16);
const invoice_item_entity_1 = __webpack_require__(20);
let Invoice = class Invoice extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'arrival_id', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'arrival_id' }),
    __metadata("design:type", Number)
], Invoice.prototype, "arrivalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    (0, class_transformer_1.Expose)({ name: 'customer_id' }),
    __metadata("design:type", Number)
], Invoice.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_status', type: 'tinyint' }),
    (0, class_transformer_1.Expose)({ name: 'payment_status' }),
    __metadata("design:type", typeof (_a = typeof variable_1.PaymentStatus !== "undefined" && variable_1.PaymentStatus) === "function" ? _a : Object)
], Invoice.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_time',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => value == null ? value : Number(value),
        },
    }),
    (0, class_transformer_1.Expose)({ name: 'payment_time' }),
    __metadata("design:type", Number)
], Invoice.prototype, "paymentTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'refund_time',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => value == null ? value : Number(value),
        },
    }),
    (0, class_transformer_1.Expose)({ name: 'refund_time' }),
    __metadata("design:type", Number)
], Invoice.prototype, "refundTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_cost_money' }),
    (0, class_transformer_1.Expose)({ name: 'total_cost_money' }),
    __metadata("design:type", Number)
], Invoice.prototype, "totalCostMoney", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_item_money' }),
    (0, class_transformer_1.Expose)({ name: 'total_item_money' }),
    __metadata("design:type", Number)
], Invoice.prototype, "totalItemMoney", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_money', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'discount_money' }),
    __metadata("design:type", Number)
], Invoice.prototype, "discountMoney", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_percent', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'discount_percent' }),
    __metadata("design:type", Number)
], Invoice.prototype, "discountPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_type', type: 'enum', enum: variable_1.DiscountType, default: variable_1.DiscountType.VND }),
    (0, class_transformer_1.Expose)({ name: 'discount_type' }),
    __metadata("design:type", typeof (_b = typeof variable_1.DiscountType !== "undefined" && variable_1.DiscountType) === "function" ? _b : Object)
], Invoice.prototype, "discountType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'surcharge', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'surcharge' }),
    __metadata("design:type", Number)
], Invoice.prototype, "surcharge", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_money' }),
    (0, class_transformer_1.Expose)({ name: 'total_money' }),
    __metadata("design:type", Number)
], Invoice.prototype, "totalMoney", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expenses', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'expenses' }),
    __metadata("design:type", Number)
], Invoice.prototype, "expenses", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profit' }),
    (0, class_transformer_1.Expose)({ name: 'profit' }),
    __metadata("design:type", Number)
], Invoice.prototype, "profit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'debt', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'debt' }),
    __metadata("design:type", Number)
], Invoice.prototype, "debt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'note', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'note' }),
    __metadata("design:type", String)
], Invoice.prototype, "note", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'customer' }),
    (0, typeorm_1.ManyToOne)((type) => customer_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_c = typeof customer_entity_1.default !== "undefined" && customer_entity_1.default) === "function" ? _c : Object)
], Invoice.prototype, "customer", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'arrival' }),
    (0, typeorm_1.ManyToOne)((type) => arrival_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'arrival_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_d = typeof arrival_entity_1.default !== "undefined" && arrival_entity_1.default) === "function" ? _d : Object)
], Invoice.prototype, "arrival", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'invoice_items' }),
    (0, typeorm_1.OneToMany)(() => invoice_item_entity_1.default, (invoiceItem) => invoiceItem.invoice),
    __metadata("design:type", Array)
], Invoice.prototype, "invoiceItems", void 0);
Invoice = __decorate([
    (0, typeorm_1.Entity)('invoice'),
    (0, typeorm_1.Index)(['oid', 'customerId']),
    (0, typeorm_1.Index)(['oid', 'arrivalId']),
    (0, typeorm_1.Index)(['oid', 'paymentTime'])
], Invoice);
exports["default"] = Invoice;


/***/ }),
/* 20 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
const variable_1 = __webpack_require__(17);
const invoice_entity_1 = __webpack_require__(19);
const procedure_entity_1 = __webpack_require__(21);
const product_batch_entity_1 = __webpack_require__(22);
let InvoiceItem = class InvoiceItem extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_id' }),
    (0, class_transformer_1.Expose)({ name: 'invoice_id' }),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    (0, class_transformer_1.Expose)({ name: 'customer_id' }),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_id' }),
    (0, class_transformer_1.Expose)({ name: 'reference_id' }),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type', type: 'tinyint' }),
    (0, class_transformer_1.Expose)({ name: 'type' }),
    __metadata("design:type", typeof (_a = typeof variable_1.InvoiceItemType !== "undefined" && variable_1.InvoiceItemType) === "function" ? _a : Object)
], InvoiceItem.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit', default: '{"name":"","rate":1}' }),
    (0, class_transformer_1.Expose)({ name: 'unit' }),
    __metadata("design:type", String)
], InvoiceItem.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_price', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'cost_price' }),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "costPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_price', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'expected_price' }),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "expectedPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_money', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'discount_money' }),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "discountMoney", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_percent', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'discount_percent' }),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "discountPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_type', type: 'enum', enum: variable_1.DiscountType, default: variable_1.DiscountType.VND }),
    (0, class_transformer_1.Expose)({ name: 'discount_type' }),
    __metadata("design:type", typeof (_b = typeof variable_1.DiscountType !== "undefined" && variable_1.DiscountType) === "function" ? _b : Object)
], InvoiceItem.prototype, "discountType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_price' }),
    (0, class_transformer_1.Expose)({ name: 'actual_price' }),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "actualPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'quantity' }),
    __metadata("design:type", Number)
], InvoiceItem.prototype, "quantity", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'invoice' }),
    (0, typeorm_1.ManyToOne)((type) => invoice_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'invoice_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_c = typeof invoice_entity_1.default !== "undefined" && invoice_entity_1.default) === "function" ? _c : Object)
], InvoiceItem.prototype, "invoice", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'product_batch' }),
    (0, typeorm_1.ManyToOne)((type) => product_batch_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'reference_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_d = typeof product_batch_entity_1.default !== "undefined" && product_batch_entity_1.default) === "function" ? _d : Object)
], InvoiceItem.prototype, "productBatch", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'procedure' }),
    (0, typeorm_1.ManyToOne)((type) => procedure_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'reference_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_e = typeof procedure_entity_1.default !== "undefined" && procedure_entity_1.default) === "function" ? _e : Object)
], InvoiceItem.prototype, "procedure", void 0);
InvoiceItem = __decorate([
    (0, typeorm_1.Entity)('invoice_item'),
    (0, typeorm_1.Index)(['oid', 'invoiceId']),
    (0, typeorm_1.Index)(['oid', 'customerId', 'type']),
    (0, typeorm_1.Index)(['oid', 'referenceId'])
], InvoiceItem);
exports["default"] = InvoiceItem;


/***/ }),
/* 21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
let Procedure = class Procedure extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'name_en', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'name_en' }),
    __metadata("design:type", String)
], Procedure.prototype, "nameEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'name_vi', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'name_vi' }),
    __metadata("design:type", String)
], Procedure.prototype, "nameVi", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'group', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'group' }),
    __metadata("design:type", String)
], Procedure.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'price' }),
    __metadata("design:type", Number)
], Procedure.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'consumable_hint', type: 'text', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'consumable_hint' }),
    __metadata("design:type", String)
], Procedure.prototype, "consumableHint", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    (0, class_transformer_1.Expose)({ name: 'is_active' }),
    __metadata("design:type", Boolean)
], Procedure.prototype, "isActive", void 0);
Procedure = __decorate([
    (0, typeorm_1.Entity)('procedure'),
    (0, typeorm_1.Index)(['oid', 'nameEn'])
], Procedure);
exports["default"] = Procedure;


/***/ }),
/* 22 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
const product_entity_1 = __webpack_require__(23);
let ProductBatch = class ProductBatch extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id' }),
    (0, class_transformer_1.Expose)({ name: 'product_id' }),
    __metadata("design:type", Number)
], ProductBatch.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batch', default: '' }),
    (0, class_transformer_1.Expose)({ name: 'batch' }),
    __metadata("design:type", String)
], ProductBatch.prototype, "batch", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'expiry_date',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => value == null ? value : Number(value),
        },
    }),
    (0, class_transformer_1.Expose)({ name: 'expiry_date' }),
    __metadata("design:type", Number)
], ProductBatch.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cost_price', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'cost_price' }),
    __metadata("design:type", Number)
], ProductBatch.prototype, "costPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'wholesale_price', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'wholesale_price' }),
    __metadata("design:type", Number)
], ProductBatch.prototype, "wholesalePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'retail_price', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'retail_price' }),
    __metadata("design:type", Number)
], ProductBatch.prototype, "retailPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'quantity' }),
    __metadata("design:type", Number)
], ProductBatch.prototype, "quantity", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'product' }),
    (0, typeorm_1.ManyToOne)((type) => product_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_a = typeof product_entity_1.default !== "undefined" && product_entity_1.default) === "function" ? _a : Object)
], ProductBatch.prototype, "product", void 0);
ProductBatch = __decorate([
    (0, typeorm_1.Entity)('product_batch'),
    (0, typeorm_1.Index)(['oid', 'productId'])
], ProductBatch);
exports["default"] = ProductBatch;


/***/ }),
/* 23 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
const product_batch_entity_1 = __webpack_require__(22);
let Product = class Product extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'brand_name' }),
    (0, class_transformer_1.Expose)({ name: 'brand_name' }),
    __metadata("design:type", String)
], Product.prototype, "brandName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'substance', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'substance' }),
    __metadata("design:type", String)
], Product.prototype, "substance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'group', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'group' }),
    __metadata("design:type", String)
], Product.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'unit' }),
    __metadata("design:type", String)
], Product.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'route', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'route' }),
    __metadata("design:type", String)
], Product.prototype, "route", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'source' }),
    __metadata("design:type", String)
], Product.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'image', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'image' }),
    __metadata("design:type", String)
], Product.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hint_usage', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'hint_usage' }),
    __metadata("design:type", String)
], Product.prototype, "hintUsage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    (0, class_transformer_1.Expose)({ name: 'is_active' }),
    __metadata("design:type", Boolean)
], Product.prototype, "isActive", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'product_batches' }),
    (0, typeorm_1.OneToMany)(() => product_batch_entity_1.default, (productBatch) => productBatch.product),
    __metadata("design:type", Array)
], Product.prototype, "productBatches", void 0);
Product = __decorate([
    (0, typeorm_1.Entity)('product'),
    (0, typeorm_1.Index)(['oid', 'brandName']),
    (0, typeorm_1.Index)(['oid', 'substance']),
    (0, typeorm_1.Index)(['oid', 'group']),
    (0, typeorm_1.Index)(['oid', 'isActive'])
], Product);
exports["default"] = Product;


/***/ }),
/* 24 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
const variable_1 = __webpack_require__(17);
let CustomerDebt = class CustomerDebt extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id' }),
    (0, class_transformer_1.Expose)({ name: 'customer_id' }),
    __metadata("design:type", Number)
], CustomerDebt.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_id', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'invoice_id' }),
    __metadata("design:type", Number)
], CustomerDebt.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type', type: 'tinyint' }),
    (0, class_transformer_1.Expose)({ name: 'type' }),
    __metadata("design:type", typeof (_a = typeof variable_1.DebtType !== "undefined" && variable_1.DebtType) === "function" ? _a : Object)
], CustomerDebt.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'create_time',
        type: 'bigint',
        transformer: { to: (value) => value, from: (value) => Number(value) },
    }),
    (0, class_transformer_1.Expose)({ name: 'create_time' }),
    __metadata("design:type", Number)
], CustomerDebt.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'open_debt' }),
    (0, class_transformer_1.Expose)({ name: 'open_debt' }),
    __metadata("design:type", Number)
], CustomerDebt.prototype, "openDebt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'money' }),
    (0, class_transformer_1.Expose)({ name: 'money' }),
    __metadata("design:type", Number)
], CustomerDebt.prototype, "money", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'close_debt' }),
    (0, class_transformer_1.Expose)({ name: 'close_debt' }),
    __metadata("design:type", Number)
], CustomerDebt.prototype, "closeDebt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'note', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'note' }),
    __metadata("design:type", String)
], CustomerDebt.prototype, "note", void 0);
CustomerDebt = __decorate([
    (0, typeorm_1.Entity)('customer_debt'),
    (0, typeorm_1.Index)(['oid', 'customerId'])
], CustomerDebt);
exports["default"] = CustomerDebt;


/***/ }),
/* 25 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
const variable_1 = __webpack_require__(17);
let DistributorDebt = class DistributorDebt extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'distributor_id' }),
    (0, class_transformer_1.Expose)({ name: 'distributor_id' }),
    __metadata("design:type", Number)
], DistributorDebt.prototype, "distributorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipt_id', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'receipt_id' }),
    __metadata("design:type", Number)
], DistributorDebt.prototype, "receiptId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type', type: 'tinyint' }),
    (0, class_transformer_1.Expose)({ name: 'type' }),
    __metadata("design:type", typeof (_a = typeof variable_1.DebtType !== "undefined" && variable_1.DebtType) === "function" ? _a : Object)
], DistributorDebt.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'open_debt' }),
    (0, class_transformer_1.Expose)({ name: 'open_debt' }),
    __metadata("design:type", Number)
], DistributorDebt.prototype, "openDebt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'money' }),
    (0, class_transformer_1.Expose)({ name: 'money' }),
    __metadata("design:type", Number)
], DistributorDebt.prototype, "money", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'close_debt' }),
    (0, class_transformer_1.Expose)({ name: 'close_debt' }),
    __metadata("design:type", Number)
], DistributorDebt.prototype, "closeDebt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'create_time',
        type: 'bigint',
        transformer: { to: (value) => value, from: (value) => Number(value) },
    }),
    (0, class_transformer_1.Expose)({ name: 'create_time' }),
    __metadata("design:type", Number)
], DistributorDebt.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'note', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'note' }),
    __metadata("design:type", String)
], DistributorDebt.prototype, "note", void 0);
DistributorDebt = __decorate([
    (0, typeorm_1.Entity)('distributor_debt'),
    (0, typeorm_1.Index)(['oid', 'distributorId'])
], DistributorDebt);
exports["default"] = DistributorDebt;


/***/ }),
/* 26 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
let DistributorEntity = class DistributorEntity extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name_en' }),
    (0, class_transformer_1.Expose)({ name: 'full_name_en' }),
    __metadata("design:type", String)
], DistributorEntity.prototype, "fullNameEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name_vi' }),
    (0, class_transformer_1.Expose)({ name: 'full_name_vi' }),
    __metadata("design:type", String)
], DistributorEntity.prototype, "fullNameVi", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone', type: 'char', length: 10, nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'phone' }),
    __metadata("design:type", String)
], DistributorEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_province', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'address_province' }),
    __metadata("design:type", String)
], DistributorEntity.prototype, "addressProvince", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_district', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'address_district' }),
    __metadata("design:type", String)
], DistributorEntity.prototype, "addressDistrict", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_ward', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'address_ward' }),
    __metadata("design:type", String)
], DistributorEntity.prototype, "addressWard", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_street', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'address_street' }),
    __metadata("design:type", String)
], DistributorEntity.prototype, "addressStreet", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'debt', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'debt' }),
    __metadata("design:type", Number)
], DistributorEntity.prototype, "debt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'note', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'note' }),
    __metadata("design:type", String)
], DistributorEntity.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    (0, class_transformer_1.Expose)({ name: 'is_active' }),
    __metadata("design:type", Boolean)
], DistributorEntity.prototype, "isActive", void 0);
DistributorEntity = __decorate([
    (0, typeorm_1.Entity)('distributor'),
    (0, typeorm_1.Index)(['oid', 'fullNameEn']),
    (0, typeorm_1.Index)(['oid', 'phone']),
    (0, typeorm_1.Index)(['oid', 'debt'])
], DistributorEntity);
exports["default"] = DistributorEntity;


/***/ }),
/* 27 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
const variable_1 = __webpack_require__(17);
const organization_entity_1 = __webpack_require__(28);
let Employee = class Employee extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.ManyToOne)((type) => organization_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'oid', referencedColumnName: 'id' }),
    (0, class_transformer_1.Expose)({ name: 'organization' }),
    __metadata("design:type", typeof (_a = typeof organization_entity_1.default !== "undefined" && organization_entity_1.default) === "function" ? _a : Object)
], Employee.prototype, "organization", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone', type: 'char', length: 10, nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'phone' }),
    __metadata("design:type", String)
], Employee.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'username' }),
    (0, class_transformer_1.Expose)({ name: 'username' }),
    __metadata("design:type", String)
], Employee.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password' }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], Employee.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'secret', nullable: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], Employee.prototype, "secret", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'role', type: 'tinyint', default: variable_1.ERole.User }),
    (0, class_transformer_1.Expose)({ name: 'role' }),
    __metadata("design:type", typeof (_b = typeof variable_1.ERole !== "undefined" && variable_1.ERole) === "function" ? _b : Object)
], Employee.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'full_name' }),
    __metadata("design:type", String)
], Employee.prototype, "fullName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'birthday',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => value == null ? value : Number(value),
        },
    }),
    (0, class_transformer_1.Expose)({ name: 'birthday' }),
    __metadata("design:type", Number)
], Employee.prototype, "birthday", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gender', type: 'tinyint', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'gender' }),
    __metadata("design:type", typeof (_c = typeof variable_1.EGender !== "undefined" && variable_1.EGender) === "function" ? _c : Object)
], Employee.prototype, "gender", void 0);
Employee = __decorate([
    (0, typeorm_1.Entity)('employee'),
    (0, typeorm_1.Index)('IDX_EMPLOYEE__OID_USERNAME', ['oid', 'username'], { unique: true })
], Employee);
exports["default"] = Employee;


/***/ }),
/* 28 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
let Organization = class Organization {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id' }),
    (0, class_transformer_1.Expose)({ name: 'id' }),
    __metadata("design:type", Number)
], Organization.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone', type: 'char', length: 10, nullable: false }),
    (0, class_transformer_1.Expose)({ name: 'phone' }),
    __metadata("design:type", String)
], Organization.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email', nullable: false }),
    (0, class_transformer_1.Expose)({ name: 'email' }),
    __metadata("design:type", String)
], Organization.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'level', type: 'tinyint', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'level' }),
    __metadata("design:type", Number)
], Organization.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organization_name', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'organization_name' }),
    __metadata("design:type", String)
], Organization.prototype, "organizationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_province', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'address_province' }),
    __metadata("design:type", String)
], Organization.prototype, "addressProvince", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_district', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'address_district' }),
    __metadata("design:type", String)
], Organization.prototype, "addressDistrict", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_ward', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'address_ward' }),
    __metadata("design:type", String)
], Organization.prototype, "addressWard", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_street', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'address_street' }),
    __metadata("design:type", String)
], Organization.prototype, "addressStreet", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'create_time',
        type: 'bigint',
        nullable: true,
        transformer: { to: (value) => value, from: (value) => value == null ? value : Number(value) },
    }),
    (0, class_transformer_1.Expose)({ name: 'create_time' }),
    __metadata("design:type", Number)
], Organization.prototype, "createTime", void 0);
Organization = __decorate([
    (0, typeorm_1.Entity)('organization'),
    (0, typeorm_1.Index)(['phone'], { unique: true }),
    (0, typeorm_1.Index)(['email'], { unique: true })
], Organization);
exports["default"] = Organization;


/***/ }),
/* 29 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationSettingType = void 0;
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
var OrganizationSettingType;
(function (OrganizationSettingType) {
    OrganizationSettingType["PRODUCT_GROUP"] = "PRODUCT_GROUP";
    OrganizationSettingType["PRODUCT_UNIT"] = "PRODUCT_UNIT";
    OrganizationSettingType["PRODUCT_ROUTE"] = "PRODUCT_ROUTE";
    OrganizationSettingType["PROCEDURE_GROUP"] = "PROCEDURE_GROUP";
    OrganizationSettingType["SCREEN_PRODUCT_LIST"] = "SCREEN_PRODUCT_LIST";
    OrganizationSettingType["SCREEN_PURCHASE_RECEIPT_LIST"] = "SCREEN_PURCHASE_RECEIPT_LIST";
    OrganizationSettingType["SCREEN_PURCHASE_RECEIPT_DETAIL"] = "SCREEN_PURCHASE_RECEIPT_DETAIL";
    OrganizationSettingType["SCREEN_PURCHASE_RECEIPT_UPSERT"] = "SCREEN_PURCHASE_RECEIPT_UPSERT";
    OrganizationSettingType["SCREEN_INVOICE_ARRIVAL_LIST"] = "SCREEN_INVOICE_ARRIVAL_LIST";
    OrganizationSettingType["SCREEN_INVOICE_ARRIVAL_DETAIL"] = "SCREEN_INVOICE_ARRIVAL_DETAIL";
    OrganizationSettingType["SCREEN_INVOICE_ARRIVAL_UPSERT"] = "SCREEN_INVOICE_ARRIVAL_UPSERT";
    OrganizationSettingType["SCREEN_CUSTOMER_LIST"] = "SCREEN_CUSTOMER_LIST";
    OrganizationSettingType["SCREEN_CUSTOMER_DETAIL"] = "SCREEN_CUSTOMER_DETAIL";
    OrganizationSettingType["SCREEN_DISTRIBUTOR_LIST"] = "SCREEN_DISTRIBUTOR_LIST";
    OrganizationSettingType["SCREEN_DISTRIBUTOR_DETAIL"] = "SCREEN_DISTRIBUTOR_DETAIL";
    OrganizationSettingType["SCREEN_PROCEDURE_LIST"] = "SCREEN_PROCEDURE_LIST";
    OrganizationSettingType["SCREEN_PROCEDURE_DETAIL"] = "SCREEN_PROCEDURE_DETAIL";
})(OrganizationSettingType = exports.OrganizationSettingType || (exports.OrganizationSettingType = {}));
let OrganizationSetting = class OrganizationSetting extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'type', type: 'varchar' }),
    (0, class_transformer_1.Expose)({ name: 'type' }),
    __metadata("design:type", String)
], OrganizationSetting.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data', type: 'text' }),
    (0, class_transformer_1.Expose)({ name: 'data' }),
    __metadata("design:type", String)
], OrganizationSetting.prototype, "data", void 0);
OrganizationSetting = __decorate([
    (0, typeorm_1.Entity)('organization_setting'),
    (0, typeorm_1.Index)('IDX_ORG_SETTING_TYPE', ['oid', 'type'], { unique: true })
], OrganizationSetting);
exports["default"] = OrganizationSetting;


/***/ }),
/* 30 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
const variable_1 = __webpack_require__(17);
const invoice_entity_1 = __webpack_require__(19);
const product_batch_entity_1 = __webpack_require__(22);
const receipt_entity_1 = __webpack_require__(31);
let ProductMovement = class ProductMovement extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id' }),
    (0, class_transformer_1.Expose)({ name: 'product_id' }),
    __metadata("design:type", Number)
], ProductMovement.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_batch_id' }),
    (0, class_transformer_1.Expose)({ name: 'product_batch_id' }),
    __metadata("design:type", Number)
], ProductMovement.prototype, "productBatchId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_id' }),
    (0, class_transformer_1.Expose)({ name: 'reference_id' }),
    __metadata("design:type", Number)
], ProductMovement.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type', type: 'tinyint' }),
    (0, class_transformer_1.Expose)({ name: 'type' }),
    __metadata("design:type", typeof (_a = typeof variable_1.ProductMovementType !== "undefined" && variable_1.ProductMovementType) === "function" ? _a : Object)
], ProductMovement.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_refund', type: 'boolean', default: false }),
    (0, class_transformer_1.Expose)({ name: 'is_refund' }),
    __metadata("design:type", Boolean)
], ProductMovement.prototype, "isRefund", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'open_quantity' }),
    (0, class_transformer_1.Expose)({ name: 'open_quantity' }),
    __metadata("design:type", Number)
], ProductMovement.prototype, "openQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'number' }),
    (0, class_transformer_1.Expose)({ name: 'number' }),
    __metadata("design:type", Number)
], ProductMovement.prototype, "number", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'close_quantity' }),
    (0, class_transformer_1.Expose)({ name: 'close_quantity' }),
    __metadata("design:type", Number)
], ProductMovement.prototype, "closeQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'price' }),
    __metadata("design:type", Number)
], ProductMovement.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_money', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'total_money' }),
    __metadata("design:type", Number)
], ProductMovement.prototype, "totalMoney", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'create_time',
        type: 'bigint',
        transformer: { to: (value) => value, from: (value) => Number(value) },
    }),
    (0, class_transformer_1.Expose)({ name: 'create_time' }),
    __metadata("design:type", Number)
], ProductMovement.prototype, "createTime", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'product_batch' }),
    (0, typeorm_1.ManyToOne)((type) => product_batch_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'product_batch_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_b = typeof product_batch_entity_1.default !== "undefined" && product_batch_entity_1.default) === "function" ? _b : Object)
], ProductMovement.prototype, "productBatch", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'invoice' }),
    (0, typeorm_1.ManyToOne)((type) => invoice_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'reference_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_c = typeof invoice_entity_1.default !== "undefined" && invoice_entity_1.default) === "function" ? _c : Object)
], ProductMovement.prototype, "invoice", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'receipt' }),
    (0, typeorm_1.ManyToOne)((type) => receipt_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'reference_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_d = typeof receipt_entity_1.default !== "undefined" && receipt_entity_1.default) === "function" ? _d : Object)
], ProductMovement.prototype, "receipt", void 0);
ProductMovement = __decorate([
    (0, typeorm_1.Index)(['oid', 'productId', 'createTime']),
    (0, typeorm_1.Index)(['oid', 'productBatchId', 'createTime']),
    (0, typeorm_1.Entity)('product_movement')
], ProductMovement);
exports["default"] = ProductMovement;


/***/ }),
/* 31 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const _1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(15);
const variable_1 = __webpack_require__(17);
const purchase_entity_1 = __webpack_require__(32);
const receipt_item_entity_1 = __webpack_require__(33);
let Receipt = class Receipt extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_id' }),
    (0, class_transformer_1.Expose)({ name: 'purchase_id' }),
    __metadata("design:type", Number)
], Receipt.prototype, "purchaseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'distributor_id' }),
    (0, class_transformer_1.Expose)({ name: 'distributor_id' }),
    __metadata("design:type", Number)
], Receipt.prototype, "distributorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_status', type: 'tinyint' }),
    (0, class_transformer_1.Expose)({ name: 'payment_status' }),
    __metadata("design:type", typeof (_a = typeof variable_1.PaymentStatus !== "undefined" && variable_1.PaymentStatus) === "function" ? _a : Object)
], Receipt.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_time',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => value == null ? value : Number(value),
        },
    }),
    (0, class_transformer_1.Expose)({ name: 'payment_time' }),
    __metadata("design:type", Number)
], Receipt.prototype, "paymentTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'refund_time',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => value == null ? value : Number(value),
        },
    }),
    (0, class_transformer_1.Expose)({ name: 'refund_time' }),
    __metadata("design:type", Number)
], Receipt.prototype, "refundTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_item_money', type: 'bigint' }),
    (0, class_transformer_1.Expose)({ name: 'total_item_money' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], Receipt.prototype, "totalItemMoney", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_money', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'discount_money' }),
    __metadata("design:type", Number)
], Receipt.prototype, "discountMoney", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_percent', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'discount_percent' }),
    __metadata("design:type", Number)
], Receipt.prototype, "discountPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'discount_type', type: 'enum', enum: variable_1.DiscountType, default: variable_1.DiscountType.VND }),
    (0, class_transformer_1.Expose)({ name: 'discount_type' }),
    __metadata("design:type", typeof (_b = typeof variable_1.DiscountType !== "undefined" && variable_1.DiscountType) === "function" ? _b : Object)
], Receipt.prototype, "discountType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'surcharge', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'surcharge' }),
    __metadata("design:type", Number)
], Receipt.prototype, "surcharge", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_money', type: 'bigint' }),
    (0, class_transformer_1.Expose)({ name: 'total_money' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], Receipt.prototype, "totalMoney", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'debt', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'debt' }),
    __metadata("design:type", Number)
], Receipt.prototype, "debt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'note', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'note' }),
    __metadata("design:type", String)
], Receipt.prototype, "note", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'receipt_items' }),
    (0, typeorm_1.OneToMany)(() => receipt_item_entity_1.default, (receiptItem) => receiptItem.receipt),
    __metadata("design:type", Array)
], Receipt.prototype, "receiptItems", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'purchase' }),
    (0, typeorm_1.ManyToOne)((type) => purchase_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'purchase_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_c = typeof purchase_entity_1.default !== "undefined" && purchase_entity_1.default) === "function" ? _c : Object)
], Receipt.prototype, "purchase", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'distributor' }),
    (0, typeorm_1.ManyToOne)((type) => _1.Distributor, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'distributor_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_d = typeof _1.Distributor !== "undefined" && _1.Distributor) === "function" ? _d : Object)
], Receipt.prototype, "distributor", void 0);
Receipt = __decorate([
    (0, typeorm_1.Entity)('receipt'),
    (0, typeorm_1.Index)(['oid', 'purchaseId']),
    (0, typeorm_1.Index)(['oid', 'paymentTime'])
], Receipt);
exports["default"] = Receipt;


/***/ }),
/* 32 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
const variable_1 = __webpack_require__(17);
const distributor_entity_1 = __webpack_require__(26);
const receipt_entity_1 = __webpack_require__(31);
let Purchase = class Purchase extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'distributor_id' }),
    (0, class_transformer_1.Expose)({ name: 'distributor_id' }),
    __metadata("design:type", Number)
], Purchase.prototype, "distributorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_status', type: 'tinyint' }),
    (0, class_transformer_1.Expose)({ name: 'payment_status' }),
    __metadata("design:type", typeof (_a = typeof variable_1.PaymentStatus !== "undefined" && variable_1.PaymentStatus) === "function" ? _a : Object)
], Purchase.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'create_time',
        type: 'bigint',
        nullable: true,
        transformer: { to: (value) => value, from: (value) => value == null ? value : Number(value) },
    }),
    (0, class_transformer_1.Expose)({ name: 'create_time' }),
    __metadata("design:type", Number)
], Purchase.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_money', type: 'bigint' }),
    (0, class_transformer_1.Expose)({ name: 'total_money' }),
    __metadata("design:type", Number)
], Purchase.prototype, "totalMoney", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'debt', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'debt' }),
    __metadata("design:type", Number)
], Purchase.prototype, "debt", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'receipts' }),
    (0, typeorm_1.OneToMany)(() => receipt_entity_1.default, (receipt) => receipt.purchase),
    __metadata("design:type", Array)
], Purchase.prototype, "receipts", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'distributor' }),
    (0, typeorm_1.ManyToOne)((type) => distributor_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'distributor_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_b = typeof distributor_entity_1.default !== "undefined" && distributor_entity_1.default) === "function" ? _b : Object)
], Purchase.prototype, "distributor", void 0);
Purchase = __decorate([
    (0, typeorm_1.Entity)('purchase'),
    (0, typeorm_1.Index)(['oid']),
    (0, typeorm_1.Index)(['oid', 'createTime']),
    (0, typeorm_1.Index)(['oid', 'distributorId', 'createTime'])
], Purchase);
exports["default"] = Purchase;


/***/ }),
/* 33 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(13);
const typeorm_1 = __webpack_require__(14);
const base_entity_1 = __webpack_require__(15);
const receipt_entity_1 = __webpack_require__(31);
const product_batch_entity_1 = __webpack_require__(22);
let ReceiptItem = class ReceiptItem extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'receipt_id' }),
    (0, class_transformer_1.Expose)({ name: 'receipt_id' }),
    __metadata("design:type", Number)
], ReceiptItem.prototype, "receiptId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_batch_id' }),
    (0, class_transformer_1.Expose)({ name: 'product_batch_id' }),
    __metadata("design:type", Number)
], ReceiptItem.prototype, "productBatchId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit', default: '{"name":"","rate":1}' }),
    (0, class_transformer_1.Expose)({ name: 'unit' }),
    __metadata("design:type", String)
], ReceiptItem.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity' }),
    (0, class_transformer_1.Expose)({ name: 'quantity' }),
    __metadata("design:type", Number)
], ReceiptItem.prototype, "quantity", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'receipt' }),
    (0, typeorm_1.ManyToOne)((type) => receipt_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'receipt_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_a = typeof receipt_entity_1.default !== "undefined" && receipt_entity_1.default) === "function" ? _a : Object)
], ReceiptItem.prototype, "receipt", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'product_batch' }),
    (0, typeorm_1.ManyToOne)((type) => product_batch_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'product_batch_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_b = typeof product_batch_entity_1.default !== "undefined" && product_batch_entity_1.default) === "function" ? _b : Object)
], ReceiptItem.prototype, "productBatch", void 0);
ReceiptItem = __decorate([
    (0, typeorm_1.Entity)('receipt_item'),
    (0, typeorm_1.Index)(['oid', 'productBatchId']),
    (0, typeorm_1.Index)(['oid', 'receiptId'])
], ReceiptItem);
exports["default"] = ReceiptItem;


/***/ }),
/* 34 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ArrivalInvoiceRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const object_helper_1 = __webpack_require__(36);
const variable_1 = __webpack_require__(17);
const entities_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(14);
let ArrivalInvoiceRepository = class ArrivalInvoiceRepository {
    constructor(dataSource, manager) {
        this.dataSource = dataSource;
        this.manager = manager;
    }
    async createInvoiceDraft(options) {
        const { oid, customerId, invoiceUpsertDto } = options;
        const time = options.time || Date.now();
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            var _a, _b, _c, _d;
            const arrivalSnap = manager.create(entities_1.Arrival, {
                oid,
                customerId,
                type: variable_1.ArrivalType.Invoice,
                paymentStatus: variable_1.PaymentStatus.Unpaid,
                createTime: time,
                totalMoney: invoiceUpsertDto.totalMoney,
                profit: invoiceUpsertDto.profit,
                debt: invoiceUpsertDto.debt,
            });
            const arrivalInsertResult = await manager.insert(entities_1.Arrival, arrivalSnap);
            const arrivalId = (_b = (_a = arrivalInsertResult.identifiers) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id;
            if (!arrivalId) {
                throw new Error(`Create Arrival failed: Insert error ${JSON.stringify(arrivalInsertResult)}`);
            }
            const invoiceSnap = manager.create(entities_1.Invoice, invoiceUpsertDto);
            invoiceSnap.oid = oid;
            invoiceSnap.customerId = customerId;
            invoiceSnap.arrivalId = arrivalId;
            invoiceSnap.paymentStatus = variable_1.PaymentStatus.Unpaid;
            const invoiceInsertResult = await manager.insert(entities_1.Invoice, invoiceSnap);
            const invoiceId = (_d = (_c = invoiceInsertResult.identifiers) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.id;
            if (!invoiceId) {
                throw new Error(`Create Invoice failed: Insert error ${JSON.stringify(invoiceInsertResult)}`);
            }
            const invoiceItemsSnap = manager.create(entities_1.InvoiceItem, invoiceUpsertDto.invoiceItems);
            invoiceItemsSnap.forEach((item) => {
                item.oid = oid;
                item.invoiceId = invoiceId;
                item.customerId = customerId;
            });
            await manager.insert(entities_1.InvoiceItem, invoiceItemsSnap);
            return { arrivalId, invoiceId };
        });
    }
    async updateInvoiceDraft(options) {
        const { oid, invoiceId, invoiceUpsertDto } = options;
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const _a = manager.create(entities_1.Invoice, invoiceUpsertDto), { invoiceItems } = _a, invoiceSnap = __rest(_a, ["invoiceItems"]);
            const invoiceUpdateResult = await manager.update(entities_1.Invoice, {
                id: invoiceId,
                oid,
                paymentStatus: variable_1.PaymentStatus.Unpaid,
            }, invoiceSnap);
            if (invoiceUpdateResult.affected !== 1) {
                throw new Error(`Update Invoice ${invoiceId} failed: Status invalid`);
            }
            const [invoice] = await manager.find(entities_1.Invoice, { where: { id: invoiceId, oid } });
            const { arrivalId } = invoice;
            const arrivalUpdateResult = await manager.update(entities_1.Arrival, {
                oid,
                id: arrivalId,
                type: variable_1.ArrivalType.Invoice,
                paymentStatus: variable_1.PaymentStatus.Unpaid,
            }, {
                totalMoney: invoiceUpsertDto.totalMoney,
                profit: invoiceUpsertDto.profit,
                debt: invoiceUpsertDto.debt,
            });
            if (arrivalUpdateResult.affected !== 1) {
                throw new Error(`Update Arrival ${arrivalId} failed: Status invalid`);
            }
            const deleteInvoiceItem = await manager.delete(entities_1.InvoiceItem, { oid, invoiceId });
            const invoiceItemsSnap = manager.create(entities_1.InvoiceItem, invoiceUpsertDto.invoiceItems);
            invoiceItemsSnap.forEach((item) => {
                item.oid = oid;
                item.invoiceId = invoiceId;
                item.customerId = invoice.customerId;
            });
            await manager.insert(entities_1.InvoiceItem, invoiceItemsSnap);
            return { arrivalId, invoiceId };
        });
    }
    async createInvoiceDraftAfterRefund(options) {
        const { oid, arrivalId, invoiceUpsertDto } = options;
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            var _a, _b;
            const arrivalUpdateResult = await manager.update(entities_1.Arrival, {
                oid,
                id: arrivalId,
                type: variable_1.ArrivalType.Invoice,
                paymentStatus: variable_1.PaymentStatus.Refund,
            }, {
                totalMoney: invoiceUpsertDto.totalMoney,
                profit: invoiceUpsertDto.profit,
                debt: invoiceUpsertDto.debt,
                paymentStatus: variable_1.PaymentStatus.Unpaid,
            });
            if (arrivalUpdateResult.affected !== 1) {
                throw new Error(`Create Invoice for Arrival ${arrivalId} failed: Status invalid`);
            }
            const arrival = await manager.findOne(entities_1.Arrival, { where: { id: arrivalId } });
            const invoiceSnap = manager.create(entities_1.Invoice, invoiceUpsertDto);
            invoiceSnap.oid = oid;
            invoiceSnap.arrivalId = arrivalId;
            invoiceSnap.customerId = arrival.customerId;
            invoiceSnap.paymentStatus = variable_1.PaymentStatus.Unpaid;
            const invoiceInsertResult = await manager.insert(entities_1.Invoice, invoiceSnap);
            const invoiceId = (_b = (_a = invoiceInsertResult.identifiers) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id;
            if (!invoiceId) {
                throw new Error(`Create Invoice for Arrival ${arrivalId} failed: Insert error ${JSON.stringify(invoiceInsertResult)}`);
            }
            const invoiceItemsSnap = manager.create(entities_1.InvoiceItem, invoiceUpsertDto.invoiceItems);
            invoiceItemsSnap.forEach((item) => {
                item.oid = oid;
                item.invoiceId = invoiceId;
                item.customerId = arrival.customerId;
            });
            await manager.insert(entities_1.InvoiceItem, invoiceItemsSnap);
            return { arrivalId, invoiceId };
        });
    }
    async paymentInvoiceDraft(options) {
        const { oid, invoiceId } = options;
        const time = options.time || Date.now();
        return await this.dataSource.transaction(async (manager) => {
            const invoiceUpdateResult = await manager.update(entities_1.Invoice, {
                id: invoiceId,
                oid,
                paymentStatus: variable_1.PaymentStatus.Unpaid,
            }, {
                paymentStatus: variable_1.PaymentStatus.Full,
                paymentTime: time,
            });
            if (invoiceUpdateResult.affected !== 1) {
                throw new Error(`Payment Invoice ${invoiceId} failed: Status invalid`);
            }
            const [invoice] = await manager.find(entities_1.Invoice, {
                relations: { invoiceItems: true },
                relationLoadStrategy: 'join',
                where: { oid, id: invoiceId },
            });
            if (invoice.invoiceItems.length === 0) {
                throw new Error(`Payment Invoice ${invoiceId} failed: invoiceItems.length = 0`);
            }
            const { arrivalId } = invoice;
            const updateArrival = await manager.update(entities_1.Arrival, { id: arrivalId, type: variable_1.ArrivalType.Invoice }, {
                totalMoney: invoice.totalMoney,
                profit: invoice.profit,
                debt: invoice.debt,
                paymentStatus: variable_1.PaymentStatus.Full,
            });
            if (updateArrival.affected !== 1) {
                throw new Error(`Payment Invoice ${invoiceId} failed: Arrival ${arrivalId} invalid`);
            }
            const invoiceItemsProduct = invoice.invoiceItems.filter((i) => i.type === variable_1.InvoiceItemType.ProductBatch);
            if (invoiceItemsProduct.length) {
                const productBatchIds = (0, object_helper_1.uniqueArray)(invoiceItemsProduct.map((i) => i.referenceId));
                const updateBatch = await manager.query(`
					UPDATE product_batch 
						LEFT JOIN ( SELECT reference_id, SUM(quantity) as sum_quantity 
							FROM invoice_item
							WHERE invoice_item.invoice_id = ${invoice.id} AND invoice_item.oid = ${oid}
							GROUP BY reference_id
						) invoice_item 
						ON product_batch.id = invoice_item.reference_id
					SET product_batch.quantity = product_batch.quantity - invoice_item.sum_quantity
					WHERE product_batch.id IN (${productBatchIds.toString()})
						AND product_batch.oid = ${oid}
				`);
                if (updateBatch.affectedRows !== productBatchIds.length) {
                    throw new Error(`Payment Invoice ${invoiceId} failed: Some batch can't update quantity`);
                }
                const productBatches = await manager.find(entities_1.ProductBatch, { where: { id: (0, typeorm_2.In)(productBatchIds) } });
                const productMovementsSnap = invoiceItemsProduct.map((invoiceItem) => {
                    const productBatch = productBatches.find((i) => i.id === invoiceItem.referenceId);
                    if (!productBatch) {
                        throw new Error(`Payment Invoice ${invoiceId} failed: ProductBatchID ${invoiceItem.referenceId} invalid`);
                    }
                    productBatch.quantity = productBatch.quantity + invoiceItem.quantity;
                    return manager.create(entities_1.ProductMovement, {
                        oid,
                        productId: productBatch.productId,
                        productBatchId: productBatch.id,
                        referenceId: invoiceId,
                        createTime: time,
                        type: variable_1.ProductMovementType.Invoice,
                        isRefund: false,
                        openQuantity: productBatch.quantity,
                        number: -invoiceItem.quantity,
                        closeQuantity: productBatch.quantity - invoiceItem.quantity,
                        price: invoiceItem.actualPrice,
                        totalMoney: invoiceItem.quantity * invoiceItem.actualPrice,
                    });
                });
                await manager.insert(entities_1.ProductMovement, productMovementsSnap);
            }
            if (invoice.debt) {
                const updateCustomer = await manager.increment(entities_1.Customer, { id: invoice.customerId }, 'debt', invoice.debt);
                if (updateCustomer.affected !== 1) {
                    throw new Error(`Payment Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`);
                }
                const customer = await manager.findOne(entities_1.Customer, {
                    where: { oid, id: invoice.customerId },
                    select: { debt: true },
                });
                const customerDebtDto = manager.create(entities_1.CustomerDebt, {
                    oid,
                    customerId: invoice.customerId,
                    invoiceId,
                    type: variable_1.DebtType.Borrow,
                    createTime: time,
                    openDebt: customer.debt - invoice.debt,
                    money: invoice.debt,
                    closeDebt: customer.debt,
                });
                await manager.save(customerDebtDto);
            }
            return { arrivalId, invoiceId };
        });
    }
    async createInvoicePaid(options) {
        const { invoiceId } = await this.createInvoiceDraft(options);
        const invoice = await this.paymentInvoiceDraft({ oid: options.oid, invoiceId, time: options.time });
        return invoice;
    }
    async refundInvoice(options) {
        const { oid, invoiceId } = options;
        const time = options.time || Date.now();
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const invoiceUpdateResult = await manager.update(entities_1.Invoice, {
                id: invoiceId,
                oid,
                paymentStatus: variable_1.PaymentStatus.Full,
            }, {
                paymentStatus: variable_1.PaymentStatus.Refund,
                refundTime: time,
            });
            if (invoiceUpdateResult.affected !== 1) {
                throw new Error(`Refund Invoice ${invoiceId} failed: Invoice ${invoiceId} invalid`);
            }
            const [invoice] = await manager.find(entities_1.Invoice, {
                relations: { invoiceItems: true },
                relationLoadStrategy: 'join',
                where: { oid, id: invoiceId },
            });
            if (invoice.invoiceItems.length === 0) {
                throw new Error(`Refund Invoice ${invoiceId} failed: invoiceItems.length = 0 `);
            }
            const { arrivalId } = invoice;
            const updateArrival = await manager.update(entities_1.Arrival, { oid, id: arrivalId, type: variable_1.ArrivalType.Invoice }, {
                totalMoney: invoice.totalMoney,
                profit: invoice.profit,
                debt: invoice.debt,
                createTime: time,
                paymentStatus: variable_1.PaymentStatus.Refund,
            });
            if (updateArrival.affected !== 1) {
                throw new Error(`Refund Invoice ${invoiceId} failed: Arrival ${arrivalId} invalid`);
            }
            const invoiceItemsProduct = invoice.invoiceItems.filter((i) => i.type === variable_1.InvoiceItemType.ProductBatch);
            if (invoiceItemsProduct.length) {
                const productBatchIds = (0, object_helper_1.uniqueArray)(invoiceItemsProduct.map((i) => i.referenceId));
                const updateBatch = await manager.query(`
					UPDATE product_batch 
						LEFT JOIN ( SELECT reference_id, SUM(quantity) as sum_quantity
							FROM invoice_item
							WHERE invoice_item.invoice_id = ${invoice.id} AND invoice_item.oid = ${oid}
							GROUP BY reference_id
						) invoice_item 
						ON product_batch.id = invoice_item.reference_id
					SET product_batch.quantity = product_batch.quantity + invoice_item.sum_quantity
					WHERE product_batch.id IN (${productBatchIds.toString()})
						AND product_batch.oid = ${oid}
				`);
                if (updateBatch.affectedRows !== productBatchIds.length) {
                    throw new Error(`Refund Invoice ${invoiceId} failed: Some batch can't update quantity`);
                }
                const productBatches = await manager.findBy(entities_1.ProductBatch, { id: (0, typeorm_2.In)(productBatchIds) });
                const productMovementsSnap = invoiceItemsProduct.map((invoiceItem) => {
                    const productBatch = productBatches.find((i) => i.id === invoiceItem.referenceId);
                    if (!productBatch) {
                        throw new Error(`Refund Invoice ${invoiceId} failed: ProductBatchID ${invoiceItem.referenceId} invalid`);
                    }
                    productBatch.quantity = productBatch.quantity - invoiceItem.quantity;
                    return manager.create(entities_1.ProductMovement, {
                        oid,
                        productId: productBatch.productId,
                        productBatchId: productBatch.id,
                        referenceId: invoiceId,
                        createTime: time,
                        type: variable_1.ProductMovementType.Invoice,
                        isRefund: true,
                        openQuantity: productBatch.quantity,
                        number: invoiceItem.quantity,
                        closeQuantity: productBatch.quantity + invoiceItem.quantity,
                        price: invoiceItem.actualPrice,
                        totalMoney: (-invoiceItem.quantity) * invoiceItem.actualPrice,
                    });
                });
                await manager.insert(entities_1.ProductMovement, productMovementsSnap);
            }
            if (invoice.debt) {
                const updateCustomer = await manager.decrement(entities_1.Customer, { id: invoice.customerId }, 'debt', invoice.debt);
                if (updateCustomer.affected !== 1) {
                    throw new Error(`Payment Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`);
                }
                const customer = await manager.findOne(entities_1.Customer, {
                    where: { oid, id: invoice.customerId },
                    select: { debt: true },
                });
                const customerDebtDto = manager.create(entities_1.CustomerDebt, {
                    oid,
                    customerId: invoice.customerId,
                    invoiceId,
                    type: variable_1.DebtType.Refund,
                    createTime: time,
                    openDebt: customer.debt + invoice.debt,
                    money: -invoice.debt,
                    closeDebt: customer.debt,
                });
                await manager.insert(entities_1.CustomerDebt, customerDebtDto);
            }
            return { arrivalId, invoiceId };
        });
    }
};
ArrivalInvoiceRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _b : Object])
], ArrivalInvoiceRepository);
exports.ArrivalInvoiceRepository = ArrivalInvoiceRepository;


/***/ }),
/* 35 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.uniqueArray = void 0;
const uniqueArray = (array) => {
    return Array.from(new Set(array));
};
exports.uniqueArray = uniqueArray;


/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 38 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ArrivalRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const variable_1 = __webpack_require__(17);
const typeorm_2 = __webpack_require__(14);
const entities_1 = __webpack_require__(11);
let ArrivalRepository = class ArrivalRepository {
    constructor(dataSource, manager) {
        this.dataSource = dataSource;
        this.manager = manager;
    }
    getWhereOptions(criteria = {}) {
        const where = {};
        if (criteria.oid != null)
            where.oid = criteria.oid;
        if (criteria.id != null)
            where.id = criteria.id;
        if (criteria.customerId != null)
            where.customerId = criteria.customerId;
        if (criteria.type != null)
            where.type = criteria.type;
        if (criteria.paymentStatus != null)
            where.paymentStatus = criteria.paymentStatus;
        if (criteria.ids) {
            if (criteria.ids.length === 0)
                criteria.ids.push(0);
            where.id = (0, typeorm_2.In)(criteria.ids);
        }
        if (criteria.types)
            where.type = (0, typeorm_2.In)(criteria.types);
        let createTime = undefined;
        if (criteria.fromTime && criteria.toTime)
            createTime = (0, typeorm_2.Between)(criteria.fromTime, criteria.toTime);
        else if (criteria.fromTime)
            createTime = (0, typeorm_2.MoreThanOrEqual)(criteria.fromTime);
        else if (criteria.toTime)
            createTime = (0, typeorm_2.LessThan)(criteria.toTime);
        if (createTime != null)
            where.createTime = createTime;
        return where;
    }
    async pagination(options) {
        const { limit, page, criteria, order } = options;
        const [data, total] = await this.manager.findAndCount(entities_1.Arrival, {
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async findOne(criteria, relations) {
        var _a, _b, _c, _d, _e;
        let query = this.manager.createQueryBuilder(entities_1.Arrival, 'arrival');
        if (relations === null || relations === void 0 ? void 0 : relations.customer)
            query = query.leftJoinAndSelect('arrival.customer', 'customer');
        if (relations === null || relations === void 0 ? void 0 : relations.invoices)
            query = query.leftJoinAndSelect('arrival.invoices', 'invoice');
        if ((_a = relations === null || relations === void 0 ? void 0 : relations.invoices) === null || _a === void 0 ? void 0 : _a.invoiceItems)
            query = query.leftJoinAndSelect('invoice.invoiceItems', 'invoiceItem');
        if ((_c = (_b = relations === null || relations === void 0 ? void 0 : relations.invoices) === null || _b === void 0 ? void 0 : _b.invoiceItems) === null || _c === void 0 ? void 0 : _c.procedure)
            query = query.leftJoinAndSelect('invoiceItem.procedure', 'procedure', 'invoiceItem.type = :typeProcedure', { typeProcedure: variable_1.InvoiceItemType.Procedure });
        if ((_e = (_d = relations === null || relations === void 0 ? void 0 : relations.invoices) === null || _d === void 0 ? void 0 : _d.invoiceItems) === null || _e === void 0 ? void 0 : _e.productBatch) {
            query = query
                .leftJoinAndSelect('invoiceItem.productBatch', 'productBatch', 'invoiceItem.type = :typeProductBatch', { typeProductBatch: variable_1.InvoiceItemType.ProductBatch })
                .leftJoinAndSelect('productBatch.product', 'product');
        }
        query = query.where('arrival.id = :id', { id: criteria.id })
            .andWhere('arrival.oid = :oid', { oid: criteria.oid });
        const arrival = await query.getOne();
        return arrival;
    }
};
ArrivalRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _b : Object])
], ArrivalRepository);
exports.ArrivalRepository = ArrivalRepository;


/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomerDebtCriteria = void 0;
class CustomerDebtCriteria {
}
exports.CustomerDebtCriteria = CustomerDebtCriteria;


/***/ }),
/* 40 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomerDebtRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const variable_1 = __webpack_require__(17);
const entities_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(14);
let CustomerDebtRepository = class CustomerDebtRepository {
    constructor(dataSource, customerDebtRepository) {
        this.dataSource = dataSource;
        this.customerDebtRepository = customerDebtRepository;
    }
    getWhereOptions(criteria = {}) {
        const where = {};
        if (criteria.id != null)
            where.id = criteria.id;
        if (criteria.oid != null)
            where.oid = criteria.oid;
        if (criteria.customerId != null)
            where.customerId = criteria.customerId;
        if (criteria.ids) {
            if (criteria.ids.length === 0)
                criteria.ids.push(0);
            where.id = (0, typeorm_2.In)(criteria.ids);
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, criteria, order } = options;
        const [data, total] = await this.customerDebtRepository.findAndCount({
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async findMany(criteria) {
        const where = this.getWhereOptions(criteria);
        return await this.customerDebtRepository.find({ where });
    }
    async findOne(criteria) {
        const where = this.getWhereOptions(criteria);
        return await this.customerDebtRepository.findOne({ where });
    }
    async startPayDebt(options) {
        const { oid, customerId, money, createTime, note } = options;
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const updateCustomer = await manager.decrement(entities_1.Customer, { id: customerId }, 'debt', money);
            if (updateCustomer.affected !== 1) {
                throw new Error(`Pay Debt failed: Update customer ${customerId} invalid`);
            }
            const customer = await manager.findOne(entities_1.Customer, { where: { oid, id: customerId } });
            const openDebt = customer.debt + money;
            const customerDebtDto = manager.create(entities_1.CustomerDebt, {
                oid,
                customerId,
                type: variable_1.DebtType.PayUp,
                createTime,
                openDebt,
                money: -money,
                closeDebt: openDebt - money,
                note,
            });
            const customerDebt = await manager.save(customerDebtDto);
            return { customer, customerDebt };
        });
    }
};
CustomerDebtRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.CustomerDebt)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], CustomerDebtRepository);
exports.CustomerDebtRepository = CustomerDebtRepository;


/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 42 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomerRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const string_helper_1 = __webpack_require__(43);
const base_dto_1 = __webpack_require__(44);
const typeorm_2 = __webpack_require__(14);
const entities_1 = __webpack_require__(11);
let CustomerRepository = class CustomerRepository {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    getWhereOptions(criteria) {
        const where = {};
        if (criteria.oid != null)
            where.oid = criteria.oid;
        if (criteria.id != null)
            where.id = criteria.id;
        if (criteria.isActive != null)
            where.isActive = criteria.isActive;
        if (criteria.ids) {
            if (criteria.ids.length === 0)
                criteria.ids.push(0);
            where.id = (0, typeorm_2.In)(criteria.ids);
        }
        if (criteria.fullNameEn && Array.isArray(criteria.fullNameEn)) {
            if (criteria.fullNameEn[0] === 'LIKE' && criteria.fullNameEn[1]) {
                const text = (0, base_dto_1.escapeSearch)((0, string_helper_1.convertViToEn)(criteria.fullNameEn[1]));
                where.fullNameEn = (0, typeorm_2.Like)(`%${text}%`);
            }
        }
        if (criteria.phone && Array.isArray(criteria.phone)) {
            if (criteria.phone[0] === 'LIKE' && criteria.phone[1]) {
                where.phone = (0, typeorm_2.Like)(`%${(0, base_dto_1.escapeSearch)(criteria.phone[1])}%`);
            }
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, criteria, order } = options;
        const [data, total] = await this.customerRepository.findAndCount({
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async find(options) {
        const { limit, criteria, order } = options;
        return await this.customerRepository.find({
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
        });
    }
    async findMany(criteria) {
        return await this.customerRepository.find({ where: this.getWhereOptions(criteria) });
    }
    async findOne(criteria, order) {
        return await this.customerRepository.findOne({
            where: this.getWhereOptions(criteria),
            order,
        });
    }
    async insertOne(dto) {
        const customer = this.customerRepository.create(dto);
        return this.customerRepository.save(customer);
    }
    async update(criteria, dto) {
        const where = this.getWhereOptions(criteria);
        return await this.customerRepository.update(where, dto);
    }
};
CustomerRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Customer)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], CustomerRepository);
exports.CustomerRepository = CustomerRepository;


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.formatUrlEncode = exports.camelCaseToSnakeCase = exports.snakeCaseToCamelCase = exports.formatNumber = exports.convertViToEn = exports.decrypt = exports.encrypt = exports.randomId = exports.randomString = void 0;
const _CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    + '!@#$%^&*()_-[]{};\':",./<>?';
const randomString = (length = 10, characters = _CHARSET) => {
    let result = '';
    for (let i = 0; i < length; i += 1) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
exports.randomString = randomString;
const randomId = () => Date.now().toString(36) + (0, exports.randomString)();
exports.randomId = randomId;
const generateCharset = (privateKey, charset = _CHARSET) => {
    let tempString = charset;
    let result = '';
    for (let i = 0; i < _CHARSET.length; i += 1) {
        const kIndex = i % privateKey.length;
        const charCode = privateKey.charCodeAt(kIndex);
        const tIndex = charCode % tempString.length;
        result = tempString[tIndex] + result;
        tempString = tempString.substring(tIndex + 1) + tempString.substring(0, tIndex);
    }
    return result;
};
const encrypt = (rootString, privateKey, expiryTime) => {
    if (!privateKey)
        privateKey = 'ABC123';
    const rootObject = { r: rootString, e: expiryTime != null ? Date.now() + expiryTime : null };
    const rootObjectJson = JSON.stringify(rootObject);
    let hash = generateCharset(privateKey);
    let result = '';
    for (let i = 0; i < rootObjectJson.length; i += 1) {
        hash = generateCharset(privateKey, hash);
        const index = _CHARSET.indexOf(rootObjectJson[i]);
        if (index === -1) {
            result += rootObjectJson[i];
        }
        else {
            result += hash[index];
        }
    }
    return result;
};
exports.encrypt = encrypt;
const decrypt = (cipherText, privateKey) => {
    if (!privateKey)
        privateKey = 'ABC123';
    let hash = generateCharset(privateKey);
    let rootObjectJson = '';
    for (let i = 0; i < cipherText.length; i += 1) {
        hash = generateCharset(privateKey, hash);
        const index = hash.indexOf(cipherText[i]);
        if (index === -1) {
            rootObjectJson += cipherText[i];
        }
        else {
            rootObjectJson += _CHARSET[index];
        }
    }
    let r, e;
    try {
        const parse = JSON.parse(rootObjectJson);
        r = parse.r;
        e = parse.e;
    }
    catch (error) {
        throw new Error('invalid privateKey');
    }
    if (e != null && e < Date.now()) {
        throw new Error('String invalid expiry time');
    }
    return r;
};
exports.decrypt = decrypt;
const convertViToEn = (root) => root
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
exports.convertViToEn = convertViToEn;
const formatNumber = (number, fixed = 3, part = 3, sec = ',', dec = '.') => {
    const regex = '\\d(?=(\\d{' + part + '})+' + (fixed > 0 ? '\\D' : '$') + ')';
    return number
        .toFixed(fixed)
        .replace('.', dec)
        .replace(new RegExp(regex, 'g'), '$&' + sec);
};
exports.formatNumber = formatNumber;
const snakeCaseToCamelCase = (input) => input.replace(/(_\w)/g, (k) => k[1].toUpperCase());
exports.snakeCaseToCamelCase = snakeCaseToCamelCase;
const camelCaseToSnakeCase = (input) => input.replace(/[A-Z]/g, (k) => `_${k.toLowerCase()}`);
exports.camelCaseToSnakeCase = camelCaseToSnakeCase;
const formatUrlEncode = (text) => {
    return text.replace(/[^a-zA-Z0-9_\-.*]+/g, '');
};
exports.formatUrlEncode = formatUrlEncode;


/***/ }),
/* 44 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.escapeSearch = void 0;
const escapeSearch = (str = '') => {
    return str.toLowerCase().replace(/[?%\\_]/gi, (x) => '\\' + x);
};
exports.escapeSearch = escapeSearch;


/***/ }),
/* 45 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CriteriaDiagnosis = void 0;
class CriteriaDiagnosis {
}
exports.CriteriaDiagnosis = CriteriaDiagnosis;


/***/ }),
/* 46 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DiagnosisRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const diagnosis_entity_1 = __webpack_require__(18);
const typeorm_2 = __webpack_require__(14);
let DiagnosisRepository = class DiagnosisRepository {
    constructor(diagnosisRepository) {
        this.diagnosisRepository = diagnosisRepository;
    }
    getWhereOptions(criteria = {}) {
        const where = {};
        if (criteria.id != null)
            where.id = criteria.id;
        if (criteria.arrivalId != null)
            where.arrivalId = criteria.arrivalId;
        if (criteria.ids) {
            if (criteria.ids.length === 0)
                criteria.ids.push(0);
            where.id = (0, typeorm_2.In)(criteria.ids);
        }
        return where;
    }
    async findOne(criteria) {
        const where = this.getWhereOptions(criteria);
        return await this.diagnosisRepository.findOne({ where });
    }
    async findMany(criteria) {
        const where = this.getWhereOptions(criteria);
        return await this.diagnosisRepository.find({ where });
    }
    async insertOne(dto) {
        const product = this.diagnosisRepository.create(dto);
        return this.diagnosisRepository.save(product);
    }
    async update(criteria, dto) {
        const where = this.getWhereOptions(criteria);
        return await this.diagnosisRepository.update(where, dto);
    }
};
DiagnosisRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(diagnosis_entity_1.default)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], DiagnosisRepository);
exports.DiagnosisRepository = DiagnosisRepository;


/***/ }),
/* 47 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DistributorDebtCriteria = void 0;
class DistributorDebtCriteria {
}
exports.DistributorDebtCriteria = DistributorDebtCriteria;


/***/ }),
/* 48 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DistributorDebtRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const variable_1 = __webpack_require__(17);
const entities_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(14);
let DistributorDebtRepository = class DistributorDebtRepository {
    constructor(dataSource, distributorDebtRepository) {
        this.dataSource = dataSource;
        this.distributorDebtRepository = distributorDebtRepository;
    }
    getWhereOptions(criteria = {}) {
        const where = {};
        if (criteria.id != null)
            where.id = criteria.id;
        if (criteria.oid != null)
            where.oid = criteria.oid;
        if (criteria.distributorId != null)
            where.distributorId = criteria.distributorId;
        if (criteria.ids) {
            if (criteria.ids.length === 0)
                criteria.ids.push(0);
            where.id = (0, typeorm_2.In)(criteria.ids);
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, criteria, order } = options;
        const [data, total] = await this.distributorDebtRepository.findAndCount({
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async findMany(criteria) {
        const where = this.getWhereOptions(criteria);
        return await this.distributorDebtRepository.find({ where });
    }
    async findOne(criteria) {
        const where = this.getWhereOptions(criteria);
        return await this.distributorDebtRepository.findOne({ where });
    }
    async startPayDebt(options) {
        const { oid, distributorId, money, createTime, note } = options;
        return await this.dataSource.transaction(async (manager) => {
            const updateDistributor = await manager.decrement(entities_1.Distributor, { id: distributorId, oid }, 'debt', money);
            if (updateDistributor.affected !== 1) {
                throw new Error(`Pay Debt failed: Update customer ${distributorId} invalid`);
            }
            const distributor = await manager.findOne(entities_1.Distributor, { where: { oid, id: distributorId } });
            const openDebt = distributor.debt + money;
            const distributorDebtSnap = manager.create(entities_1.DistributorDebt, {
                oid,
                distributorId,
                type: variable_1.DebtType.PayUp,
                createTime,
                openDebt,
                money: -money,
                closeDebt: openDebt - money,
                note,
            });
            const distributorDebt = await manager.save(distributorDebtSnap);
            return { distributor, distributorDebt };
        });
    }
};
DistributorDebtRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.DistributorDebt)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], DistributorDebtRepository);
exports.DistributorDebtRepository = DistributorDebtRepository;


/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DistributorCriteria = void 0;
class DistributorCriteria {
}
exports.DistributorCriteria = DistributorCriteria;


/***/ }),
/* 50 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DistributorRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const string_helper_1 = __webpack_require__(43);
const base_dto_1 = __webpack_require__(44);
const typeorm_2 = __webpack_require__(14);
const entities_1 = __webpack_require__(11);
let DistributorRepository = class DistributorRepository {
    constructor(distributorRepository) {
        this.distributorRepository = distributorRepository;
    }
    getWhereOptions(criteria) {
        const where = {};
        if (criteria.id != null)
            where.id = criteria.id;
        if (criteria.oid != null)
            where.oid = criteria.oid;
        if (criteria.isActive != null)
            where.isActive = criteria.isActive;
        if (criteria.ids) {
            if (criteria.ids.length === 0)
                criteria.ids.push(0);
            where.id = (0, typeorm_2.In)(criteria.ids);
        }
        if (criteria.fullNameEn && Array.isArray(criteria.fullNameEn)) {
            if (criteria.fullNameEn[0] === 'LIKE' && criteria.fullNameEn[1]) {
                const text = (0, base_dto_1.escapeSearch)((0, string_helper_1.convertViToEn)(criteria.fullNameEn[1]));
                where.fullNameEn = (0, typeorm_2.Like)(`%${text}%`);
            }
        }
        if (criteria.phone && Array.isArray(criteria.phone)) {
            if (criteria.phone[0] === 'LIKE' && criteria.phone[1]) {
                where.phone = (0, typeorm_2.Like)(`%${(0, base_dto_1.escapeSearch)(criteria.phone[1])}%`);
            }
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, criteria, order } = options;
        const [data, total] = await this.distributorRepository.findAndCount({
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async find(options) {
        return await this.distributorRepository.find({
            where: this.getWhereOptions(options.criteria),
            order: options.order,
            take: options.limit,
        });
    }
    async findMany(criteria) {
        return await this.distributorRepository.find({ where: this.getWhereOptions(criteria) });
    }
    async findOne(criteria) {
        return await this.distributorRepository.findOne({ where: this.getWhereOptions(criteria) });
    }
    async insertOne(dto) {
        const distributor = this.distributorRepository.create(dto);
        return this.distributorRepository.save(distributor, { transaction: false });
    }
    async updateOne(criteria, dto) {
        const where = this.getWhereOptions(criteria);
        return await this.distributorRepository.update(where, dto);
    }
};
DistributorRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Distributor)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], DistributorRepository);
exports.DistributorRepository = DistributorRepository;


/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmployeeCriteria = void 0;
class EmployeeCriteria {
}
exports.EmployeeCriteria = EmployeeCriteria;


/***/ }),
/* 52 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmployeeRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const typeorm_2 = __webpack_require__(14);
const entities_1 = __webpack_require__(11);
let EmployeeRepository = class EmployeeRepository {
    constructor(employeeRepository) {
        this.employeeRepository = employeeRepository;
    }
    getWhereOptions(criteria) {
        const where = {};
        if (criteria.oid !== undefined)
            where.oid = criteria.oid;
        if (criteria.id !== undefined)
            where.id = criteria.id;
        if (criteria.ids) {
            if (criteria.ids.length === 0)
                criteria.ids.push(0);
            where.id = (0, typeorm_2.In)(criteria.ids);
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, criteria, order } = options;
        const [data, total] = await this.employeeRepository.findAndCount({
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async findOne(criteria) {
        const where = this.getWhereOptions(criteria);
        return await this.employeeRepository.findOne({ where });
    }
    async findOneOrFail(criteria) {
        const where = this.getWhereOptions(criteria);
        return await this.employeeRepository.findOneOrFail({ where });
    }
    async insertOne(dto) {
        const employee = this.employeeRepository.create(dto);
        return this.employeeRepository.save(employee);
    }
    async update(criteria, dto) {
        const where = this.getWhereOptions(criteria);
        return await this.employeeRepository.update(where, dto);
    }
};
EmployeeRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Employee)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], EmployeeRepository);
exports.EmployeeRepository = EmployeeRepository;


/***/ }),
/* 53 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 54 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceItemRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const entities_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(14);
let InvoiceItemRepository = class InvoiceItemRepository {
    constructor(dataSource, manager) {
        this.dataSource = dataSource;
        this.manager = manager;
    }
    getWhereOptions(criteria = {}) {
        const where = {};
        if (criteria.id != null)
            where.id = criteria.id;
        if (criteria.oid != null)
            where.oid = criteria.oid;
        if (criteria.customerId != null)
            where.customerId = criteria.customerId;
        if (criteria.referenceId != null)
            where.referenceId = criteria.referenceId;
        if (criteria.type != null)
            where.type = criteria.type;
        if (criteria.ids) {
            if (criteria.ids.length === 0)
                criteria.ids.push(0);
            where.id = (0, typeorm_2.In)(criteria.ids);
        }
        return where;
    }
    getQueryBuilder(criteria = {}) {
        let query = this.manager.createQueryBuilder(entities_1.InvoiceItem, 'invoiceItem');
        if (criteria.id != null) {
            query = query.andWhere('invoiceItem.id = :id', { id: criteria.id });
        }
        if (criteria.referenceId != null) {
            query = query.andWhere('invoiceItem.referenceId = :referenceId', { referenceId: criteria.referenceId });
        }
        if (criteria.type != null) {
            query = query.andWhere('invoiceItem.type = :type', { type: criteria.type });
        }
        if (criteria.oid != null) {
            query = query.andWhere('invoiceItem.oid = :oid', { oid: criteria.oid });
        }
        return query;
    }
    async pagination(options) {
        const { limit, page, criteria, order } = options;
        const [data, total] = await this.manager.findAndCount(entities_1.InvoiceItem, {
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
};
InvoiceItemRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _b : Object])
], InvoiceItemRepository);
exports.InvoiceItemRepository = InvoiceItemRepository;


/***/ }),
/* 55 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 56 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const variable_1 = __webpack_require__(17);
const entities_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(14);
let InvoiceRepository = class InvoiceRepository {
    constructor(dataSource, manager) {
        this.dataSource = dataSource;
        this.manager = manager;
    }
    getWhereOptions(criteria = {}) {
        const where = {};
        if (criteria.id != null)
            where.id = criteria.id;
        if (criteria.oid != null)
            where.oid = criteria.oid;
        if (criteria.customerId != null)
            where.customerId = criteria.customerId;
        if (criteria.arrivalId != null)
            where.arrivalId = criteria.arrivalId;
        if (criteria.paymentStatus != null)
            where.paymentStatus = criteria.paymentStatus;
        if (criteria.ids) {
            if (criteria.ids.length === 0)
                criteria.ids.push(0);
            where.id = (0, typeorm_2.In)(criteria.ids);
        }
        if (criteria.customerIds) {
            if (criteria.customerIds.length === 0)
                criteria.customerIds.push(0);
            where.customerId = (0, typeorm_2.In)(criteria.customerIds);
        }
        if (criteria.arrivalIds) {
            if (criteria.arrivalIds.length === 0)
                criteria.arrivalIds.push(0);
            where.arrivalId = (0, typeorm_2.In)(criteria.arrivalIds);
        }
        if (criteria.paymentStatuses) {
            if (criteria.paymentStatuses.length === 0)
                criteria.paymentStatuses.push(0);
            where.paymentStatus = (0, typeorm_2.In)(criteria.paymentStatuses);
        }
        let paymentTime = undefined;
        if (criteria.fromTime && criteria.toTime)
            paymentTime = (0, typeorm_2.Between)(criteria.fromTime, criteria.toTime);
        else if (criteria.fromTime)
            paymentTime = (0, typeorm_2.MoreThanOrEqual)(criteria.fromTime);
        else if (criteria.toTime)
            paymentTime = (0, typeorm_2.LessThanOrEqual)(criteria.toTime);
        if (paymentTime != null)
            where.paymentTime = paymentTime;
        return where;
    }
    async pagination(options) {
        const { limit, page, criteria, relations, order } = options;
        const [data, total] = await this.manager.findAndCount(entities_1.Invoice, {
            relations: { customer: !!(relations === null || relations === void 0 ? void 0 : relations.customer) },
            relationLoadStrategy: 'query',
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async findOne(criteria, relations) {
        const [invoice] = await this.manager.find(entities_1.Invoice, {
            where: this.getWhereOptions(criteria),
            relations: { customer: !!(relations === null || relations === void 0 ? void 0 : relations.customer) },
            relationLoadStrategy: 'join',
        });
        return invoice;
    }
    async findMany(criteria, relations) {
        const invoices = await this.manager.find(entities_1.Invoice, {
            where: this.getWhereOptions(criteria),
            relations: { customer: !!(relations === null || relations === void 0 ? void 0 : relations.customer) },
            relationLoadStrategy: 'join',
        });
        return invoices;
    }
    async queryOneBy(criteria, relations) {
        var _a, _b, _c, _d;
        let query = this.manager.createQueryBuilder(entities_1.Invoice, 'invoice')
            .where('invoice.id = :id', { id: criteria.id })
            .andWhere('invoice.oid = :oid', { oid: criteria.oid });
        if (relations === null || relations === void 0 ? void 0 : relations.customer)
            query = query.leftJoinAndSelect('invoice.customer', 'customer');
        if (relations === null || relations === void 0 ? void 0 : relations.invoiceItems)
            query = query.leftJoinAndSelect('invoice.invoiceItems', 'invoiceItem');
        if ((_a = relations === null || relations === void 0 ? void 0 : relations.invoiceItems) === null || _a === void 0 ? void 0 : _a.procedure)
            query = query.leftJoinAndSelect('invoiceItem.procedure', 'procedure', 'invoiceItem.type = :typeProcedure', { typeProcedure: variable_1.InvoiceItemType.Procedure });
        if ((_b = relations === null || relations === void 0 ? void 0 : relations.invoiceItems) === null || _b === void 0 ? void 0 : _b.productBatch) {
            query = query.leftJoinAndSelect('invoiceItem.productBatch', 'productBatch', 'invoiceItem.type = :typeProductBatch', { typeProductBatch: variable_1.InvoiceItemType.ProductBatch });
        }
        if ((_d = (_c = relations === null || relations === void 0 ? void 0 : relations.invoiceItems) === null || _c === void 0 ? void 0 : _c.productBatch) === null || _d === void 0 ? void 0 : _d.product) {
            query = query.leftJoinAndSelect('productBatch.product', 'product');
        }
        const invoice = await query.getOne();
        return invoice;
    }
};
InvoiceRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _b : Object])
], InvoiceRepository);
exports.InvoiceRepository = InvoiceRepository;


/***/ }),
/* 57 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CriteriaOrganizationDto = void 0;
class CriteriaOrganizationDto {
}
exports.CriteriaOrganizationDto = CriteriaOrganizationDto;


/***/ }),
/* 58 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const typeorm_2 = __webpack_require__(14);
const entities_1 = __webpack_require__(11);
let OrganizationRepository = class OrganizationRepository {
    constructor(organizationRepository, organizationSettingRepository) {
        this.organizationRepository = organizationRepository;
        this.organizationSettingRepository = organizationSettingRepository;
    }
    async findOne(oid) {
        return await this.organizationRepository.findOne({ where: { id: oid } });
    }
    async update(oid, dto) {
        return await this.organizationRepository.update({ id: oid }, dto);
    }
    async getAllSetting(oid) {
        return await this.organizationSettingRepository.find({
            select: { type: true, data: true },
            where: { oid },
        });
    }
    async getSettings(oid, types) {
        return await this.organizationSettingRepository.find({
            select: { type: true, data: true },
            where: { oid, type: (0, typeorm_2.In)(types) },
        });
    }
    async upsertSetting(oid, type, data) {
        const dto = this.organizationSettingRepository.create({ oid, type, data });
        return await this.organizationSettingRepository
            .createQueryBuilder()
            .insert()
            .into(entities_1.OrganizationSetting)
            .values(dto)
            .orUpdate(['data'], 'IDX_CLINIC_SETTING_TYPE')
            .execute();
    }
};
OrganizationRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Organization)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.OrganizationSetting)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], OrganizationRepository);
exports.OrganizationRepository = OrganizationRepository;


/***/ }),
/* 59 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 60 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProcedureRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const string_helper_1 = __webpack_require__(43);
const base_dto_1 = __webpack_require__(44);
const typeorm_2 = __webpack_require__(14);
const entities_1 = __webpack_require__(11);
let ProcedureRepository = class ProcedureRepository {
    constructor(procedureRepository) {
        this.procedureRepository = procedureRepository;
    }
    getWhereOptions(criteria = {}) {
        const where = {};
        if (criteria.id != null)
            where.id = criteria.id;
        if (criteria.oid != null)
            where.oid = criteria.oid;
        if (criteria.group != null)
            where.group = criteria.group;
        if (criteria.isActive != null)
            where.isActive = criteria.isActive;
        if (criteria.ids) {
            if (criteria.ids.length === 0)
                criteria.ids.push(0);
            where.id = (0, typeorm_2.In)(criteria.ids);
        }
        if (criteria.searchText) {
            const text = (0, base_dto_1.escapeSearch)((0, string_helper_1.convertViToEn)(criteria.searchText));
            where.nameEn = (0, typeorm_2.Like)(`%${text}%`);
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, criteria, order } = options;
        const [data, total] = await this.procedureRepository.findAndCount({
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        const totalPage = Math.ceil(total / limit);
        return { total, page, limit, data, totalPage };
    }
    async find(options) {
        const { limit, criteria, order } = options;
        return await this.procedureRepository.find({
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
        });
    }
    async findMany(criteria) {
        const where = this.getWhereOptions(criteria);
        return await this.procedureRepository.find({ where });
    }
    async findOne(criteria) {
        const where = this.getWhereOptions(criteria);
        return await this.procedureRepository.findOne({ where });
    }
    async insertOne(dto) {
        const customer = this.procedureRepository.create(dto);
        return this.procedureRepository.save(customer);
    }
    async update(criteria, dto) {
        const where = this.getWhereOptions(criteria);
        return await this.procedureRepository.update(where, dto);
    }
};
ProcedureRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Procedure)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], ProcedureRepository);
exports.ProcedureRepository = ProcedureRepository;


/***/ }),
/* 61 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductBatchCriteria = void 0;
class ProductBatchCriteria {
}
exports.ProductBatchCriteria = ProductBatchCriteria;


/***/ }),
/* 62 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductBatchRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const entities_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(14);
let ProductBatchRepository = class ProductBatchRepository {
    constructor(dataSource, manager) {
        this.dataSource = dataSource;
        this.manager = manager;
    }
    getWhereOptions(criteria = {}) {
        const where = {};
        if (criteria.id != null)
            where.id = criteria.id;
        if (criteria.oid != null)
            where.oid = criteria.oid;
        if (criteria.productId != null)
            where.productId = criteria.productId;
        if (criteria.quantityZero === false)
            where.quantity = (0, typeorm_2.Not)(0);
        if (criteria.overdue === false) {
            where.expiryDate = (0, typeorm_2.Raw)((alias) => `(${alias} > :date OR ${alias} IS NULL)`, { date: Date.now() });
        }
        if (criteria.ids) {
            if (criteria.ids.length === 0)
                criteria.ids.push(0);
            where.id = (0, typeorm_2.In)(criteria.ids);
        }
        if (criteria.productIds) {
            if (criteria.productIds.length === 0)
                criteria.productIds.push(0);
            where.productId = (0, typeorm_2.In)(criteria.productIds);
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, criteria, order } = options;
        const [data, total] = await this.manager.findAndCount(entities_1.ProductBatch, {
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async findOne(criteria, relations) {
        const [productBatch] = await this.manager.find(entities_1.ProductBatch, {
            where: this.getWhereOptions(criteria),
            relations: { product: !!(relations === null || relations === void 0 ? void 0 : relations.product) },
            relationLoadStrategy: 'join',
        });
        return productBatch;
    }
    async findMany(criteria, relations) {
        const productBatches = await this.manager.find(entities_1.ProductBatch, {
            where: this.getWhereOptions(criteria),
            relations: { product: !!(relations === null || relations === void 0 ? void 0 : relations.product) },
            relationLoadStrategy: 'join',
        });
        return productBatches;
    }
    async insertOne(oid, dto) {
        const batchEntity = this.manager.create(entities_1.ProductBatch, dto);
        batchEntity.oid = oid;
        return this.manager.save(batchEntity, { transaction: false });
    }
    async update(criteria, dto) {
        const where = this.getWhereOptions(criteria);
        return await this.manager.update(entities_1.ProductBatch, where, dto);
    }
    async delete(oid, id) {
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const deleteBatch = await manager.delete(entities_1.ProductBatch, { oid, id, quantity: 0 });
            if (deleteBatch.affected !== 1) {
                throw new Error(`Delete ProductBatch ${id} failed: Can't delete ProductBatch with quantity !== 0`);
            }
            const number = await manager.count(entities_1.ProductMovement, { where: { productBatchId: id, oid } });
            if (number) {
                throw new Error(`Delete ProductBatch ${id} failed: Can't delete ProductBatch with exits ProductMovement`);
            }
        });
    }
};
ProductBatchRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _b : Object])
], ProductBatchRepository);
exports.ProductBatchRepository = ProductBatchRepository;


/***/ }),
/* 63 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductMovementCriteria = void 0;
class ProductMovementCriteria {
}
exports.ProductMovementCriteria = ProductMovementCriteria;


/***/ }),
/* 64 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductMovementRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const variable_1 = __webpack_require__(17);
const entities_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(14);
let ProductMovementRepository = class ProductMovementRepository {
    constructor(manager) {
        this.manager = manager;
    }
    getWhereOptions(criteria = {}) {
        const where = {};
        if (criteria.oid != null)
            where.oid = criteria.oid;
        if (criteria.productId != null)
            where.productId = criteria.productId;
        if (criteria.productBatchId != null)
            where.productBatchId = criteria.productBatchId;
        return where;
    }
    async pagination(options) {
        const { limit, page, criteria, order } = options;
        const [data, total] = await this.manager.findAndCount(entities_1.ProductMovement, {
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async queryOne(criteria, relations) {
        var _a, _b;
        let query = this.manager.createQueryBuilder(entities_1.ProductMovement, 'productMovement')
            .where('productMovement.oid = :oid', { oid: criteria.oid });
        if (criteria === null || criteria === void 0 ? void 0 : criteria.productId) {
            query = query.andWhere('productMovement.productId = :productId', { productId: criteria.productId });
        }
        if (criteria === null || criteria === void 0 ? void 0 : criteria.productBatchId) {
            query = query.andWhere('productMovement.productBatchId = :productBatchId', { productBatchId: criteria.productBatchId });
        }
        if (relations === null || relations === void 0 ? void 0 : relations.invoice) {
            query = query.leftJoinAndSelect('productMovement.invoice', 'invoice', 'productMovement.type = :typeInvoice', { typeInvoice: variable_1.ProductMovementType.Invoice });
        }
        if ((_a = relations === null || relations === void 0 ? void 0 : relations.invoice) === null || _a === void 0 ? void 0 : _a.customer) {
            query = query.leftJoinAndSelect('invoice.customer', 'customer');
        }
        if (relations === null || relations === void 0 ? void 0 : relations.receipt) {
            query = query.leftJoinAndSelect('productMovement.receipt', 'receipt', 'productMovement.type = :typeReceipt', { typeReceipt: variable_1.ProductMovementType.Receipt });
        }
        if ((_b = relations === null || relations === void 0 ? void 0 : relations.receipt) === null || _b === void 0 ? void 0 : _b.distributor) {
            query = query.leftJoinAndSelect('receipt.distributor', 'distributor');
        }
        const productBatch = await query.getOne();
        return productBatch;
    }
};
ProductMovementRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _a : Object])
], ProductMovementRepository);
exports.ProductMovementRepository = ProductMovementRepository;


/***/ }),
/* 65 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductCriteria = void 0;
class ProductCriteria {
}
exports.ProductCriteria = ProductCriteria;


/***/ }),
/* 66 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const string_helper_1 = __webpack_require__(43);
const base_dto_1 = __webpack_require__(44);
const typeorm_2 = __webpack_require__(14);
const entities_1 = __webpack_require__(11);
let ProductRepository = class ProductRepository {
    constructor(manager) {
        this.manager = manager;
    }
    getWhereOptions(criteria = {}) {
        const where = {};
        if (criteria.id != null)
            where.id = criteria.id;
        if (criteria.oid != null)
            where.oid = criteria.oid;
        if (criteria.group != null)
            where.group = criteria.group;
        if (criteria.isActive != null)
            where.isActive = criteria.isActive;
        if (criteria.ids) {
            if (criteria.ids.length === 0)
                criteria.ids.push(0);
            where.id = (0, typeorm_2.In)(criteria.ids);
        }
        if (criteria.searchText) {
            const searchText = `%${(0, base_dto_1.escapeSearch)((0, string_helper_1.convertViToEn)(criteria.searchText))}%`;
            where.brandName = (0, typeorm_2.Raw)((alias) => '(brand_name LIKE :searchText OR substance LIKE :searchText)', { searchText });
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, criteria, order } = options;
        const [data, total] = await this.manager.findAndCount(entities_1.Product, {
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async find(options) {
        const { limit, criteria, order } = options;
        return await this.manager.find(entities_1.Product, {
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
        });
    }
    async findMany(criteria) {
        const where = this.getWhereOptions(criteria);
        return await this.manager.find(entities_1.Product, { where });
    }
    async findOne(criteria) {
        const where = this.getWhereOptions(criteria);
        const [product] = await this.manager.find(entities_1.Product, { where });
        return product;
    }
    async insertOne(oid, dto) {
        const productEntity = this.manager.create(entities_1.Product, dto);
        productEntity.oid = oid;
        return this.manager.save(productEntity, { transaction: false });
    }
    async update(criteria, dto) {
        const where = this.getWhereOptions(criteria);
        return await this.manager.update(entities_1.Product, where, dto);
    }
};
ProductRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _a : Object])
], ProductRepository);
exports.ProductRepository = ProductRepository;


/***/ }),
/* 67 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReceiptUpdateDto = exports.ReceiptInsertDto = exports.ReceiptItemDto = void 0;
const swagger_1 = __webpack_require__(10);
const entities_1 = __webpack_require__(11);
const class_transformer_1 = __webpack_require__(13);
class ReceiptItemDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(entities_1.ReceiptItem, ['receiptId', 'receipt'])) {
}
exports.ReceiptItemDto = ReceiptItemDto;
class ReceiptInsertDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(entities_1.Receipt, ['receiptItems', 'purchaseId', 'paymentStatus', 'paymentTime'])) {
    constructor() {
        super(...arguments);
        this.receiptItems = [];
    }
    static from(plain) {
        const instance = (0, class_transformer_1.plainToInstance)(ReceiptInsertDto, plain, {
            exposeUnsetFields: false,
            excludeExtraneousValues: true,
            ignoreDecorators: true
        });
        instance.receiptItems = plain.receiptItems.map((i) => {
            return (0, class_transformer_1.plainToInstance)(ReceiptItemDto, i, {
                exposeUnsetFields: false,
                excludeExtraneousValues: true,
                ignoreDecorators: true
            });
        });
        return instance;
    }
}
exports.ReceiptInsertDto = ReceiptInsertDto;
class ReceiptUpdateDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(entities_1.Receipt, ['receiptItems', 'distributorId', 'purchaseId', 'paymentStatus'])) {
    constructor() {
        super(...arguments);
        this.receiptItems = [];
    }
    static from(plain) {
        const instance = (0, class_transformer_1.plainToInstance)(ReceiptUpdateDto, plain, {
            exposeUnsetFields: false,
            excludeExtraneousValues: true,
            ignoreDecorators: true
        });
        instance.receiptItems = plain.receiptItems.map((i) => {
            return (0, class_transformer_1.plainToInstance)(ReceiptItemDto, i, {
                exposeUnsetFields: false,
                excludeExtraneousValues: true,
                ignoreDecorators: true
            });
        });
        return instance;
    }
}
exports.ReceiptUpdateDto = ReceiptUpdateDto;


/***/ }),
/* 68 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PurchaseReceiptRepository = void 0;
const decorators_1 = __webpack_require__(69);
const typeorm_1 = __webpack_require__(35);
const object_helper_1 = __webpack_require__(36);
const variable_1 = __webpack_require__(17);
const entities_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(14);
let PurchaseReceiptRepository = class PurchaseReceiptRepository {
    constructor(dataSource, manager) {
        this.dataSource = dataSource;
        this.manager = manager;
    }
    async createReceiptDraft(oid, receiptInsertDto, time) {
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            var _a, _b, _c, _d;
            const purchaseSnap = manager.create(entities_1.Purchase, {
                oid,
                distributorId: receiptInsertDto.distributorId,
                paymentStatus: variable_1.PaymentStatus.Unpaid,
                createTime: time,
                totalMoney: receiptInsertDto.totalMoney,
                debt: receiptInsertDto.debt,
            });
            const purchaseResult = await manager.insert(entities_1.Purchase, purchaseSnap);
            const purchaseId = (_b = (_a = purchaseResult.identifiers) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id;
            if (!purchaseId) {
                throw new Error(`Create Purchase failed: Insert error ${JSON.stringify(purchaseResult)}`);
            }
            const receiptSnap = manager.create(entities_1.Receipt, receiptInsertDto);
            receiptSnap.oid = oid;
            receiptSnap.purchaseId = purchaseId;
            receiptSnap.paymentStatus = variable_1.PaymentStatus.Unpaid;
            const receiptResult = await manager.insert(entities_1.Receipt, receiptSnap);
            const receiptId = (_d = (_c = receiptResult.identifiers) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.id;
            if (!receiptId) {
                throw new Error(`Create Purchase failed: Insert error ${JSON.stringify(receiptResult)}`);
            }
            const receiptItemsEntity = manager.create(entities_1.ReceiptItem, receiptInsertDto.receiptItems);
            receiptItemsEntity.forEach((item) => {
                item.oid = oid;
                item.receiptId = receiptId;
            });
            await manager.insert(entities_1.ReceiptItem, receiptItemsEntity);
            return { purchaseId, receiptId };
        });
    }
    async updateReceiptDraft(oid, receiptId, receiptUpdateDto) {
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const _a = manager.create(entities_1.Receipt, receiptUpdateDto), { receiptItems } = _a, receiptSnap = __rest(_a, ["receiptItems"]);
            const { affected } = await manager.update(entities_1.Receipt, {
                id: receiptId,
                oid,
                paymentStatus: variable_1.PaymentStatus.Unpaid,
            }, receiptSnap);
            if (affected !== 1) {
                throw new Error(`Update Receipt ${receiptId} failed: Status invalid`);
            }
            const [receipt] = await manager.find(entities_1.Receipt, { where: { id: receiptId, oid } });
            const { purchaseId } = receipt;
            const updatePurchase = await manager.update(entities_1.Purchase, {
                oid,
                id: purchaseId,
                paymentStatus: variable_1.PaymentStatus.Unpaid,
            }, {
                totalMoney: receiptUpdateDto.totalMoney,
                debt: receiptUpdateDto.debt,
            });
            if (updatePurchase.affected !== 1) {
                throw new Error(`Update Arrival ${purchaseId} failed: Status invalid`);
            }
            await manager.delete(entities_1.ReceiptItem, { oid, receiptId });
            const receiptItemsEntity = manager.create(entities_1.ReceiptItem, receiptUpdateDto.receiptItems);
            receiptItemsEntity.forEach((item) => {
                item.oid = oid;
                item.receiptId = receiptId;
            });
            await manager.insert(entities_1.ReceiptItem, receiptItemsEntity);
            return { purchaseId, receiptId };
        });
    }
    async createReceiptDraftAfterRefund(oid, purchaseId, receiptInsertDto) {
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            var _a, _b;
            const updatePurchase = await manager.update(entities_1.Purchase, {
                oid,
                id: purchaseId,
                paymentStatus: variable_1.PaymentStatus.Refund,
            }, {
                totalMoney: receiptInsertDto.totalMoney,
                debt: receiptInsertDto.debt,
                paymentStatus: variable_1.PaymentStatus.Unpaid,
            });
            if (updatePurchase.affected !== 1) {
                throw new Error(`Create Receipt for Purchase ${purchaseId} failed: Status invalid`);
            }
            const receiptSnap = manager.create(entities_1.Receipt, receiptInsertDto);
            receiptSnap.oid = oid;
            receiptSnap.purchaseId = purchaseId;
            receiptSnap.paymentStatus = variable_1.PaymentStatus.Unpaid;
            const receiptResult = await manager.insert(entities_1.Receipt, receiptSnap);
            const receiptId = (_b = (_a = receiptResult.identifiers) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id;
            if (!receiptId) {
                throw new Error(`Create Receipt for Purchase ${purchaseId} failed: Insert error ${JSON.stringify(receiptResult)}`);
            }
            const receiptItemsEntity = manager.create(entities_1.ReceiptItem, receiptInsertDto.receiptItems);
            receiptItemsEntity.forEach((item) => {
                item.oid = oid;
                item.receiptId = receiptId;
            });
            await manager.insert(entities_1.ReceiptItem, receiptItemsEntity);
            return { purchaseId, receiptId };
        });
    }
    async paymentReceiptDraft(oid, receiptId, time) {
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const { affected } = await manager.update(entities_1.Receipt, {
                id: receiptId,
                oid,
                paymentStatus: variable_1.PaymentStatus.Unpaid,
            }, {
                paymentStatus: variable_1.PaymentStatus.Full,
                paymentTime: time,
            });
            if (affected !== 1) {
                throw new Error(`Payment Receipt ${receiptId} failed: Status invalid`);
            }
            const [receipt] = await manager.find(entities_1.Receipt, {
                relations: { receiptItems: true },
                relationLoadStrategy: 'join',
                where: { oid, id: receiptId },
            });
            if (receipt.receiptItems.length === 0) {
                throw new Error(`Payment Receipt ${receiptId} failed: Not found receipt_items`);
            }
            const { purchaseId } = receipt;
            const updatePurchase = await manager.update(entities_1.Purchase, { id: receipt.purchaseId }, {
                totalMoney: receipt.totalMoney,
                debt: receipt.debt,
                createTime: time,
                paymentStatus: variable_1.PaymentStatus.Full,
            });
            if (updatePurchase.affected !== 1) {
                throw new Error(`Payment Receipt ${receiptId} failed: Purchase ${purchaseId} invalid`);
            }
            if (receipt.receiptItems.length) {
                const productBatchIds = (0, object_helper_1.uniqueArray)(receipt.receiptItems.map((i) => i.productBatchId));
                const updateBatch = await manager.query(`
					UPDATE product_batch 
						LEFT JOIN ( SELECT product_batch_id, SUM(quantity) as sum_quantity 
							FROM receipt_item
							WHERE receipt_item.receipt_id = ${receipt.id} AND receipt_item.oid = ${oid}
							GROUP BY product_batch_id
						) receipt_item 
						ON product_batch.id = receipt_item.product_batch_id
					SET product_batch.quantity = product_batch.quantity + receipt_item.sum_quantity
					WHERE product_batch.id IN (${productBatchIds.toString()})
						AND product_batch.oid = ${oid}
				`);
                if (updateBatch.affectedRows !== productBatchIds.length) {
                    throw new Error(`Payment Receipt ${receiptId} failed: Some batch can't update quantity`);
                }
                const productBatches = await manager.findBy(entities_1.ProductBatch, { id: (0, typeorm_2.In)(productBatchIds) });
                const productMovementsEntity = receipt.receiptItems.map((receiptItem) => {
                    const productBatch = productBatches.find((i) => i.id === receiptItem.productBatchId);
                    if (!productBatch) {
                        throw new Error(`Payment Receipt ${receiptId} failed: ProductBatchID ${receiptItem.productBatchId} invalid`);
                    }
                    productBatch.quantity = productBatch.quantity - receiptItem.quantity;
                    return manager.create(entities_1.ProductMovement, {
                        oid,
                        productId: productBatch.productId,
                        productBatchId: productBatch.id,
                        referenceId: receiptId,
                        createTime: time,
                        type: variable_1.ProductMovementType.Receipt,
                        isRefund: false,
                        openQuantity: productBatch.quantity,
                        number: receiptItem.quantity,
                        closeQuantity: productBatch.quantity + receiptItem.quantity,
                        price: productBatch.costPrice,
                        totalMoney: receiptItem.quantity * productBatch.costPrice,
                    });
                });
                await manager.insert(entities_1.ProductMovement, productMovementsEntity);
            }
            if (receipt.debt) {
                const updateDistributor = await manager.increment(entities_1.Distributor, { id: receipt.distributorId }, 'debt', receipt.debt);
                if (updateDistributor.affected !== 1) {
                    throw new Error(`Payment Receipt ${receiptId} failed: Update distributor ${receipt.distributorId} invalid`);
                }
                const distributor = await manager.findOne(entities_1.Distributor, {
                    where: { oid, id: receipt.distributorId },
                    select: { debt: true },
                });
                const distributorDebtDto = manager.create(entities_1.DistributorDebt, {
                    oid,
                    distributorId: receipt.distributorId,
                    receiptId,
                    type: variable_1.DebtType.Borrow,
                    createTime: time,
                    openDebt: distributor.debt - receipt.debt,
                    money: receipt.debt,
                    closeDebt: distributor.debt,
                });
                await manager.insert(entities_1.DistributorDebt, distributorDebtDto);
            }
            return { purchaseId, receiptId };
        });
    }
    async refundReceipt(oid, receiptId, time) {
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const { affected } = await manager.update(entities_1.Receipt, {
                id: receiptId,
                oid,
                paymentStatus: variable_1.PaymentStatus.Full,
            }, {
                paymentStatus: variable_1.PaymentStatus.Refund,
                refundTime: time,
            });
            if (affected !== 1) {
                throw new Error(`Refund Receipt ${receiptId} failed: Receipt ${receiptId} invalid`);
            }
            const [receipt] = await manager.find(entities_1.Receipt, {
                relations: { receiptItems: true },
                relationLoadStrategy: 'join',
                where: { oid, id: receiptId },
            });
            if (receipt.receiptItems.length === 0) {
                throw new Error(`Refund Receipt ${receiptId} failed: Not found receipt_items`);
            }
            const { purchaseId } = receipt;
            const updatePurchase = await manager.update(entities_1.Purchase, { oid, id: receipt.purchaseId }, {
                totalMoney: receipt.totalMoney,
                debt: receipt.debt,
                createTime: time,
                paymentStatus: variable_1.PaymentStatus.Refund,
            });
            if (updatePurchase.affected !== 1) {
                throw new Error(`Refund Receipt ${receiptId} failed: Purchase ${purchaseId} invalid`);
            }
            if (receipt.receiptItems.length) {
                const productBatchIds = (0, object_helper_1.uniqueArray)(receipt.receiptItems.map((i) => i.productBatchId));
                const updateBatch = await manager.query(`
					UPDATE product_batch 
						LEFT JOIN ( SELECT product_batch_id, SUM(quantity) as sum_quantity 
							FROM receipt_item
							WHERE receipt_item.receipt_id = ${receipt.id} AND receipt_item.oid = ${oid}
							GROUP BY product_batch_id
						) receipt_item 
						ON product_batch.id = receipt_item.product_batch_id
					SET product_batch.quantity = product_batch.quantity - receipt_item.sum_quantity
					WHERE product_batch.id IN (${productBatchIds.toString()})
						AND product_batch.oid = ${oid}
				`);
                if (updateBatch.affectedRows !== productBatchIds.length) {
                    throw new Error(`Refund Receipt ${receiptId} failed: Some batch can't update quantity`);
                }
                const productBatches = await manager.findBy(entities_1.ProductBatch, { id: (0, typeorm_2.In)(productBatchIds) });
                const productMovementsEntity = receipt.receiptItems.map((receiptItem) => {
                    const productBatch = productBatches.find((i) => i.id === receiptItem.productBatchId);
                    if (!productBatch) {
                        throw new Error(`Refund Receipt ${receiptId} failed: ProductBatchID ${receiptItem.productBatchId} invalid`);
                    }
                    productBatch.quantity = productBatch.quantity + receiptItem.quantity;
                    return manager.create(entities_1.ProductMovement, {
                        oid,
                        productId: productBatch.productId,
                        productBatchId: productBatch.id,
                        referenceId: receiptId,
                        type: variable_1.ProductMovementType.Receipt,
                        createTime: time,
                        isRefund: true,
                        openQuantity: productBatch.quantity,
                        number: -receiptItem.quantity,
                        closeQuantity: productBatch.quantity - receiptItem.quantity,
                        price: productBatch.costPrice,
                        totalMoney: (-receiptItem.quantity) * productBatch.costPrice,
                    });
                });
                await manager.insert(entities_1.ProductMovement, productMovementsEntity);
            }
            if (receipt.debt) {
                const updateDistributor = await manager.decrement(entities_1.Distributor, { id: receipt.distributorId }, 'debt', receipt.debt);
                if (updateDistributor.affected !== 1) {
                    throw new Error(`Payment Receipt ${receiptId} failed: Update distributor ${receipt.distributorId} invalid`);
                }
                const distributor = await manager.findOne(entities_1.Distributor, {
                    where: { oid, id: receipt.distributorId },
                    select: { debt: true },
                });
                const distributorDebtDto = manager.create(entities_1.DistributorDebt, {
                    oid,
                    distributorId: receipt.distributorId,
                    receiptId,
                    type: variable_1.DebtType.Refund,
                    createTime: time,
                    openDebt: distributor.debt + receipt.debt,
                    money: -receipt.debt,
                    closeDebt: distributor.debt,
                });
                await manager.insert(entities_1.DistributorDebt, distributorDebtDto);
            }
            return { purchaseId, receiptId };
        });
    }
};
PurchaseReceiptRepository = __decorate([
    (0, decorators_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _b : Object])
], PurchaseReceiptRepository);
exports.PurchaseReceiptRepository = PurchaseReceiptRepository;


/***/ }),
/* 69 */
/***/ ((module) => {

module.exports = require("@nestjs/common/decorators");

/***/ }),
/* 70 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 71 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PurchaseRepository = void 0;
const decorators_1 = __webpack_require__(69);
const typeorm_1 = __webpack_require__(35);
const entities_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(14);
let PurchaseRepository = class PurchaseRepository {
    constructor(dataSource, manager) {
        this.dataSource = dataSource;
        this.manager = manager;
    }
    getWhereOptions(criteria = {}) {
        const where = {};
        if (criteria.id != null)
            where.id = criteria.id;
        if (criteria.oid != null)
            where.oid = criteria.oid;
        if (criteria.distributorId != null)
            where.distributorId = criteria.distributorId;
        if (criteria.paymentStatus != null)
            where.paymentStatus = criteria.paymentStatus;
        if (criteria.ids) {
            if (criteria.ids.length === 0)
                criteria.ids.push(0);
            where.id = (0, typeorm_2.In)(criteria.ids);
        }
        if (criteria.distributorIds) {
            if (criteria.distributorIds.length === 0)
                criteria.distributorIds.push(0);
            where.distributorId = (0, typeorm_2.In)(criteria.distributorIds);
        }
        let createTime = undefined;
        if (criteria.fromTime && criteria.toTime)
            createTime = (0, typeorm_2.Between)(criteria.fromTime, criteria.toTime);
        else if (criteria.fromTime)
            createTime = (0, typeorm_2.MoreThanOrEqual)(criteria.fromTime);
        else if (criteria.toTime)
            createTime = (0, typeorm_2.LessThan)(criteria.toTime);
        if (createTime != null)
            where.createTime = createTime;
        return where;
    }
    async pagination(options) {
        const { limit, page, criteria, order } = options;
        const [data, total] = await this.manager.findAndCount(entities_1.Purchase, {
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async findOne(criteria, relations) {
        const [purchase] = await this.manager.find(entities_1.Purchase, {
            where: this.getWhereOptions(criteria),
            relations: {
                distributor: !!(relations === null || relations === void 0 ? void 0 : relations.distributor),
                receipts: relations.receipts ? { receiptItems: { productBatch: { product: true } } } : false,
            },
            relationLoadStrategy: 'join',
        });
        return purchase;
    }
};
PurchaseRepository = __decorate([
    (0, decorators_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _b : Object])
], PurchaseRepository);
exports.PurchaseRepository = PurchaseRepository;


/***/ }),
/* 72 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 73 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReceiptRepository = void 0;
const decorators_1 = __webpack_require__(69);
const typeorm_1 = __webpack_require__(35);
const entities_1 = __webpack_require__(11);
const typeorm_2 = __webpack_require__(14);
let ReceiptRepository = class ReceiptRepository {
    constructor(dataSource, manager) {
        this.dataSource = dataSource;
        this.manager = manager;
    }
    getWhereOptions(criteria = {}) {
        const where = {};
        if (criteria.id != null)
            where.id = criteria.id;
        if (criteria.oid != null)
            where.oid = criteria.oid;
        if (criteria.distributorId != null)
            where.distributorId = criteria.distributorId;
        if (criteria.purchaseId != null)
            where.purchaseId = criteria.purchaseId;
        if (criteria.paymentStatus != null)
            where.paymentStatus = criteria.paymentStatus;
        if (criteria.ids) {
            if (criteria.ids.length === 0)
                criteria.ids.push(0);
            where.id = (0, typeorm_2.In)(criteria.ids);
        }
        if (criteria.distributorIds) {
            if (criteria.distributorIds.length === 0)
                criteria.distributorIds.push(0);
            where.distributorId = (0, typeorm_2.In)(criteria.distributorIds);
        }
        if (criteria.purchaseIds) {
            if (criteria.purchaseIds.length === 0)
                criteria.purchaseIds.push(0);
            where.purchaseId = (0, typeorm_2.In)(criteria.purchaseIds);
        }
        if (criteria.paymentStatuses) {
            if (criteria.paymentStatuses.length === 0)
                criteria.paymentStatuses.push(0);
            where.paymentStatus = (0, typeorm_2.In)(criteria.paymentStatuses);
        }
        let paymentTime = undefined;
        if (criteria.fromTime && criteria.toTime)
            paymentTime = (0, typeorm_2.Between)(criteria.fromTime, criteria.toTime);
        else if (criteria.fromTime)
            paymentTime = (0, typeorm_2.MoreThanOrEqual)(criteria.fromTime);
        else if (criteria.toTime)
            paymentTime = (0, typeorm_2.LessThanOrEqual)(criteria.toTime);
        if (paymentTime != null)
            where.paymentTime = paymentTime;
        return where;
    }
    async pagination(options) {
        const { limit, page, criteria, order } = options;
        const [data, total] = await this.manager.findAndCount(entities_1.Receipt, {
            where: this.getWhereOptions(criteria),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async findMany(criteria, relations) {
        const receipts = await this.manager.find(entities_1.Receipt, {
            where: this.getWhereOptions(criteria),
            relations: {
                distributor: !!(relations === null || relations === void 0 ? void 0 : relations.distributor),
                receiptItems: relations.receiptItems ? { productBatch: { product: true } } : false,
            },
            relationLoadStrategy: 'join',
        });
        return receipts;
    }
    async findOne(criteria, relations) {
        const [receipt] = await this.manager.find(entities_1.Receipt, {
            where: this.getWhereOptions(criteria),
            relations: {
                distributor: !!(relations === null || relations === void 0 ? void 0 : relations.distributor),
                receiptItems: relations.receiptItems ? { productBatch: { product: true } } : false,
            },
            relationLoadStrategy: 'join',
        });
        return receipt;
    }
    async queryOneBy(criteria, relations) {
        var _a;
        let query = this.manager.createQueryBuilder(entities_1.Receipt, 'receipt')
            .where('receipt.id = :id', { id: criteria.id })
            .andWhere('receipt.oid = :oid', { oid: criteria.oid });
        if (relations === null || relations === void 0 ? void 0 : relations.distributor)
            query = query.leftJoinAndSelect('receipt.distributor', 'distributor');
        if (relations === null || relations === void 0 ? void 0 : relations.receiptItems)
            query = query.leftJoinAndSelect('receipt.receiptItems', 'receiptItem');
        if ((_a = relations === null || relations === void 0 ? void 0 : relations.receiptItems) === null || _a === void 0 ? void 0 : _a.productBatch) {
            query = query
                .leftJoinAndSelect('receiptItem.productBatch', 'productBatch')
                .leftJoinAndSelect('productBatch.product', 'product');
        }
        const receipt = await query.getOne();
        return receipt;
    }
};
ReceiptRepository = __decorate([
    (0, decorators_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _b : Object])
], ReceiptRepository);
exports.ReceiptRepository = ReceiptRepository;


/***/ }),
/* 74 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RepositoryModule = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(35);
const entities_1 = __webpack_require__(11);
const arrival_invoice_repository_1 = __webpack_require__(34);
const arrival_repository_1 = __webpack_require__(38);
const customer_debt_repository_1 = __webpack_require__(40);
const customer_repository_1 = __webpack_require__(42);
const distributor_debt_repository_1 = __webpack_require__(48);
const distributor_repository_1 = __webpack_require__(50);
const employee_repository_1 = __webpack_require__(52);
const invoice_item_repository_1 = __webpack_require__(54);
const invoice_repository_1 = __webpack_require__(56);
const organization_repository_1 = __webpack_require__(58);
const procedure_repository_1 = __webpack_require__(60);
const product_batch_repository_1 = __webpack_require__(62);
const product_movement_repository_1 = __webpack_require__(64);
const product_repository_1 = __webpack_require__(66);
const purchase_receipt_repository_1 = __webpack_require__(68);
const purchase_repository_1 = __webpack_require__(71);
const receipt_repository_1 = __webpack_require__(73);
let RepositoryModule = class RepositoryModule {
};
RepositoryModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.Arrival,
                entities_1.Customer,
                entities_1.CustomerDebt,
                entities_1.Diagnosis,
                entities_1.Distributor,
                entities_1.DistributorDebt,
                entities_1.Employee,
                entities_1.Invoice,
                entities_1.InvoiceItem,
                entities_1.Organization,
                entities_1.OrganizationSetting,
                entities_1.Procedure,
                entities_1.Product,
                entities_1.ProductBatch,
                entities_1.ProductMovement,
                entities_1.Purchase,
                entities_1.Receipt,
                entities_1.ReceiptItem,
            ]),
        ],
        providers: [
            arrival_repository_1.ArrivalRepository,
            arrival_invoice_repository_1.ArrivalInvoiceRepository,
            customer_repository_1.CustomerRepository,
            customer_debt_repository_1.CustomerDebtRepository,
            distributor_repository_1.DistributorRepository,
            distributor_debt_repository_1.DistributorDebtRepository,
            employee_repository_1.EmployeeRepository,
            invoice_repository_1.InvoiceRepository,
            invoice_item_repository_1.InvoiceItemRepository,
            organization_repository_1.OrganizationRepository,
            procedure_repository_1.ProcedureRepository,
            product_repository_1.ProductRepository,
            product_batch_repository_1.ProductBatchRepository,
            product_movement_repository_1.ProductMovementRepository,
            purchase_repository_1.PurchaseRepository,
            purchase_receipt_repository_1.PurchaseReceiptRepository,
            receipt_repository_1.ReceiptRepository,
        ],
        exports: [
            arrival_repository_1.ArrivalRepository,
            arrival_invoice_repository_1.ArrivalInvoiceRepository,
            customer_repository_1.CustomerRepository,
            customer_debt_repository_1.CustomerDebtRepository,
            distributor_repository_1.DistributorRepository,
            distributor_debt_repository_1.DistributorDebtRepository,
            employee_repository_1.EmployeeRepository,
            invoice_repository_1.InvoiceRepository,
            invoice_item_repository_1.InvoiceItemRepository,
            organization_repository_1.OrganizationRepository,
            product_repository_1.ProductRepository,
            procedure_repository_1.ProcedureRepository,
            product_batch_repository_1.ProductBatchRepository,
            product_movement_repository_1.ProductMovementRepository,
            purchase_repository_1.PurchaseRepository,
            purchase_receipt_repository_1.PurchaseReceiptRepository,
            receipt_repository_1.ReceiptRepository,
        ],
    })
], RepositoryModule);
exports.RepositoryModule = RepositoryModule;


/***/ }),
/* 75 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SqlModule = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(35);
const sql_config_1 = __webpack_require__(76);
let SqlModule = class SqlModule {
};
SqlModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule.forFeature(sql_config_1.SqlConfig)],
                inject: [sql_config_1.SqlConfig.KEY],
                useFactory: (sqlConfig) => sqlConfig,
            }),
        ],
    })
], SqlModule);
exports.SqlModule = SqlModule;


/***/ }),
/* 76 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SqlConfig = void 0;
const config_1 = __webpack_require__(2);
exports.SqlConfig = (0, config_1.registerAs)('mariadb', () => ({
    type: process.env.SQL_TYPE,
    host: process.env.SQL_HOST,
    port: Number(process.env.SQL_PORT),
    database: process.env.SQL_DATABASE,
    username: process.env.SQL_USERNAME,
    password: process.env.SQL_PASSWORD,
    autoLoadEntities: true,
    logging: process.env.NODE_ENV !== 'production' ? 'all' : ['error'],
}));


/***/ }),
/* 77 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmailModule = void 0;
const mailer_1 = __webpack_require__(78);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const environments_1 = __webpack_require__(79);
const email_service_1 = __webpack_require__(80);
let EmailModule = class EmailModule {
};
EmailModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mailer_1.MailerModule.forRootAsync({
                imports: [config_1.ConfigModule.forFeature(environments_1.EmailConfig)],
                inject: [environments_1.EmailConfig.KEY],
                useFactory: (mailConfig) => {
                    return {
                        transport: {
                            host: mailConfig.host,
                            port: mailConfig.port,
                            auth: {
                                user: mailConfig.user,
                                pass: mailConfig.password,
                            },
                        },
                        defaults: { from: `"${mailConfig.name}" <${mailConfig.from}>` },
                    };
                },
            }),
        ],
        providers: [email_service_1.EmailService],
        exports: [email_service_1.EmailService],
    })
], EmailModule);
exports.EmailModule = EmailModule;


/***/ }),
/* 78 */
/***/ ((module) => {

module.exports = require("@nestjs-modules/mailer");

/***/ }),
/* 79 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmailConfig = exports.JwtConfig = exports.GlobalConfig = void 0;
const config_1 = __webpack_require__(2);
exports.GlobalConfig = (0, config_1.registerAs)('global', () => ({ domain: process.env.DOMAIN }));
exports.JwtConfig = (0, config_1.registerAs)('jwt', () => ({
    accessKey: process.env.JWT_ACCESS_KEY,
    refreshKey: process.env.JWT_REFRESH_KEY,
    accessTime: Number(process.env.JWT_ACCESS_TIME),
    refreshTime: Number(process.env.JWT_REFRESH_TIME),
}));
exports.EmailConfig = (0, config_1.registerAs)('email', () => ({
    name: process.env.EMAIL_NAME || 'medihome',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: +process.env.EMAIL_PORT || 465,
    user: process.env.EMAIL_USER || 'medihome.vn@gmail.com',
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_ADDRESS || 'medihome.vn@gmail.com',
    subject_prefix: process.env.EMAIL_SUBJECT_PREFIX || '【medihome】',
}));


/***/ }),
/* 80 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmailService = void 0;
const mailer_1 = __webpack_require__(78);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
let EmailService = EmailService_1 = class EmailService {
    constructor(configService, mailerService) {
        this.configService = configService;
        this.mailerService = mailerService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.subjectPrefix = this.configService.get('mail.subject_prefix');
    }
    async send(options) {
        await this.mailerService.sendMail(options);
    }
};
EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof mailer_1.MailerService !== "undefined" && mailer_1.MailerService) === "function" ? _b : Object])
], EmailService);
exports.EmailService = EmailService;


/***/ }),
/* 81 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthModule = void 0;
const axios_1 = __webpack_require__(82);
const common_1 = __webpack_require__(1);
const schedule_1 = __webpack_require__(83);
const terminus_1 = __webpack_require__(84);
const health_controller_1 = __webpack_require__(85);
let HealthModule = class HealthModule {
};
HealthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            terminus_1.TerminusModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            axios_1.HttpModule,
        ],
        controllers: [health_controller_1.HealthController],
    })
], HealthModule);
exports.HealthModule = HealthModule;


/***/ }),
/* 82 */
/***/ ((module) => {

module.exports = require("@nestjs/axios");

/***/ }),
/* 83 */
/***/ ((module) => {

module.exports = require("@nestjs/schedule");

/***/ }),
/* 84 */
/***/ ((module) => {

module.exports = require("@nestjs/terminus");

/***/ }),
/* 85 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(10);
const terminus_1 = __webpack_require__(84);
const schedule_1 = __webpack_require__(83);
let HealthController = class HealthController {
    constructor(health, http, db, disk, memory) {
        this.health = health;
        this.http = http;
        this.db = db;
        this.disk = disk;
        this.memory = memory;
    }
    check() {
        const pathStorage = process.platform === 'win32' ? 'C:\\' : '/';
        const thresholdPercent = process.platform === 'win32' ? 0.99 : 0.5;
        return this.health.check([
            () => this.db.pingCheck('database'),
        ]);
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, terminus_1.HealthCheck)(),
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "check", null);
HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [typeof (_a = typeof terminus_1.HealthCheckService !== "undefined" && terminus_1.HealthCheckService) === "function" ? _a : Object, typeof (_b = typeof terminus_1.HttpHealthIndicator !== "undefined" && terminus_1.HttpHealthIndicator) === "function" ? _b : Object, typeof (_c = typeof terminus_1.TypeOrmHealthIndicator !== "undefined" && terminus_1.TypeOrmHealthIndicator) === "function" ? _c : Object, typeof (_d = typeof terminus_1.DiskHealthIndicator !== "undefined" && terminus_1.DiskHealthIndicator) === "function" ? _d : Object, typeof (_e = typeof terminus_1.MemoryHealthIndicator !== "undefined" && terminus_1.MemoryHealthIndicator) === "function" ? _e : Object])
], HealthController);
exports.HealthController = HealthController;


/***/ }),
/* 86 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtExtendModule = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const jwt_1 = __webpack_require__(87);
const environments_1 = __webpack_require__(79);
const jwt_extend_service_1 = __webpack_require__(88);
let JwtExtendModule = class JwtExtendModule {
};
JwtExtendModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forFeature(environments_1.JwtConfig),
            jwt_1.JwtModule,
        ],
        providers: [jwt_extend_service_1.JwtExtendService],
        exports: [jwt_extend_service_1.JwtExtendService],
    })
], JwtExtendModule);
exports.JwtExtendModule = JwtExtendModule;


/***/ }),
/* 87 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 88 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtExtendService = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const jwt_1 = __webpack_require__(87);
const environments_1 = __webpack_require__(79);
const exception_const_1 = __webpack_require__(89);
let JwtExtendService = class JwtExtendService {
    constructor(jwtConfig, jwtService) {
        this.jwtConfig = jwtConfig;
        this.jwtService = jwtService;
    }
    createAccessToken(user, ip) {
        const userPayload = {
            ip,
            orgPhone: user.organization.phone,
            oid: user.organization.id,
            uid: user.id,
            username: user.username,
            role: user.role,
        };
        const exp = Date.now() + this.jwtConfig.accessTime;
        const token = this.jwtService.sign({
            exp: Math.floor(exp / 1000),
            data: userPayload,
        }, { secret: this.jwtConfig.accessKey });
        return { token, exp };
    }
    createRefreshToken(user, ip) {
        const userPayload = {
            ip,
            oid: user.organization.id,
            uid: user.id,
        };
        const exp = Date.now() + this.jwtConfig.refreshTime;
        const token = this.jwtService.sign({
            exp: Math.floor(exp / 1000),
            data: userPayload,
        }, { secret: this.jwtConfig.refreshKey });
        return { token, exp };
    }
    createTokenFromUser(user, ip) {
        const accessToken = this.createAccessToken(user, ip);
        const refreshToken = this.createRefreshToken(user, ip);
        return { accessToken, refreshToken };
    }
    verifyAccessToken(accessToken, ip) {
        try {
            const jwtPayload = this.jwtService.verify(accessToken, { secret: this.jwtConfig.accessKey });
            const data = jwtPayload.data;
            return data;
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new common_1.HttpException(exception_const_1.ErrorMessage.Token.Expired, common_1.HttpStatus.UNAUTHORIZED);
            }
            else if (error.name === 'JsonWebTokenError') {
                throw new common_1.HttpException(exception_const_1.ErrorMessage.Token.Invalid, common_1.HttpStatus.UNAUTHORIZED);
            }
            else if (error.message === exception_const_1.ErrorMessage.Token.Invalid) {
                throw new common_1.HttpException(exception_const_1.ErrorMessage.Token.Invalid, common_1.HttpStatus.UNAUTHORIZED);
            }
            throw new common_1.HttpException(exception_const_1.ErrorMessage.Unknown, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    verifyRefreshToken(refreshToken, ip) {
        try {
            const jwtPayload = this.jwtService.verify(refreshToken, { secret: this.jwtConfig.refreshKey });
            const data = jwtPayload.data;
            if (data.ip !== ip)
                throw new Error(exception_const_1.ErrorMessage.Token.WrongIp);
            return data;
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new common_1.HttpException(exception_const_1.ErrorMessage.Token.Expired, common_1.HttpStatus.FORBIDDEN);
            }
            else if (error.name === 'JsonWebTokenError') {
                throw new common_1.HttpException(exception_const_1.ErrorMessage.Token.Invalid, common_1.HttpStatus.FORBIDDEN);
            }
            else if (error.message === exception_const_1.ErrorMessage.Token.WrongIp) {
                throw new common_1.HttpException(exception_const_1.ErrorMessage.Token.WrongIp, common_1.HttpStatus.FORBIDDEN);
            }
            throw new common_1.HttpException(exception_const_1.ErrorMessage.Unknown, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
JwtExtendService = __decorate([
    __param(0, (0, common_1.Inject)(environments_1.JwtConfig.KEY)),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigType !== "undefined" && config_1.ConfigType) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object])
], JwtExtendService);
exports.JwtExtendService = JwtExtendService;


/***/ }),
/* 89 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ErrorMessage = void 0;
exports.ErrorMessage = {
    Unknown: 'Unknown',
    Database: {
        UpdateFailed: 'Database.UpdateFailed',
        RemoveFailed: 'Database.RemoveFailed',
    },
    Validate: { Failed: 'Validate.Failed' },
    Token: {
        Expired: 'Token.Expired',
        Invalid: 'Token.Invalid',
        WrongIp: 'Token.WrongIp',
    },
    Register: {
        ExistEmailAndPhone: 'Register.ExistEmailAndPhone',
        ExistEmail: 'Register.ExistEmail',
        ExistPhone: 'Register.ExistPhone',
        ExistUsername: 'Register.ExistUsername',
    },
    User: {
        WrongPassword: 'User.WrongPassword',
        NotExist: 'User.NotExist',
    },
    Organization: { NotExist: 'User.NotExist' },
    Diagnosis: { ConflictArrival: 'Diagnosis.ConflictArrival' },
    Product: { NotFound: 'Product.NotFound' },
    Purchase: { NotFound: 'Purchase.NotFound' },
    Consumable: { NotFound: 'Consumable.NotFound' },
    Provider: { NotFound: 'Provider.NotFound' },
    Customer: { NotFound: 'Customer.NotFound' },
    Invoice: { NotFound: 'Invoice.NotFound' },
    Employee: { NotFound: 'Employee.NotFound' },
    Distributor: { NotFound: 'Distributor.NotFound' },
};


/***/ }),
/* 90 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ValidateTokenMiddleware = void 0;
const common_1 = __webpack_require__(1);
const request_ip_1 = __webpack_require__(6);
const jwt_extend_service_1 = __webpack_require__(88);
let ValidateTokenMiddleware = class ValidateTokenMiddleware {
    constructor(jwtExtendService) {
        this.jwtExtendService = jwtExtendService;
    }
    async use(req, res, next) {
        const authorization = req.header('Authorization') || '';
        const [, accessToken] = authorization.split(' ');
        const ip = (0, request_ip_1.getClientIp)(req);
        const decode = this.jwtExtendService.verifyAccessToken(accessToken, ip);
        req.tokenPayload = decode;
        next();
    }
};
ValidateTokenMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_extend_service_1.JwtExtendService !== "undefined" && jwt_extend_service_1.JwtExtendService) === "function" ? _a : Object])
], ValidateTokenMiddleware);
exports.ValidateTokenMiddleware = ValidateTokenMiddleware;


/***/ }),
/* 91 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiArrivalModule = void 0;
const common_1 = __webpack_require__(1);
const api_arrival_controller_1 = __webpack_require__(92);
const api_arrival_service_1 = __webpack_require__(97);
let ApiArrivalModule = class ApiArrivalModule {
};
ApiArrivalModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_arrival_controller_1.ApiArrivalController],
        providers: [api_arrival_service_1.ApiArrivalService],
    })
], ApiArrivalModule);
exports.ApiArrivalModule = ApiArrivalModule;


/***/ }),
/* 92 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiArrivalController = void 0;
const common_1 = __webpack_require__(1);
const route_params_decorator_1 = __webpack_require__(93);
const swagger_1 = __webpack_require__(10);
const swagger_2 = __webpack_require__(94);
const request_decorator_1 = __webpack_require__(96);
const api_arrival_service_1 = __webpack_require__(97);
const request_1 = __webpack_require__(98);
let ApiArrivalController = class ApiArrivalController {
    constructor(apiArrivalService) {
        this.apiArrivalService = apiArrivalService;
    }
    async pagination(userReq, query) {
        return await this.apiArrivalService.pagination(userReq.oid, query);
    }
    async detail(userReq, { id }, query) {
        return await this.apiArrivalService.getOne(userReq.oid, id, query);
    }
    async createInvoiceDraft(userReq, query, body) {
        return await this.apiArrivalService.createInvoiceDraft(userReq.oid, query.customerId, body);
    }
    async createInvoiceDraftAfterRefund(userReq, { id }, body) {
        return await this.apiArrivalService.createInvoiceDraftAfterRefund(userReq.oid, id, body);
    }
    async updateInvoiceDraft(userReq, { id }, body) {
        return await this.apiArrivalService.updateInvoiceDraft(userReq.oid, id, body);
    }
    async paymentInvoiceDraft(userReq, { id }) {
        return await this.apiArrivalService.paymentInvoiceDraft(userReq.oid, id);
    }
    async refund(userReq, { id }) {
        return await this.apiArrivalService.refundInvoice(userReq.oid, id);
    }
};
__decorate([
    (0, common_1.Get)('pagination'),
    __param(0, (0, request_decorator_1.UserReq)()),
    __param(1, (0, route_params_decorator_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof request_decorator_1.TUserReq !== "undefined" && request_decorator_1.TUserReq) === "function" ? _b : Object, typeof (_c = typeof request_1.ArrivalPaginationQuery !== "undefined" && request_1.ArrivalPaginationQuery) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], ApiArrivalController.prototype, "pagination", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    __param(0, (0, request_decorator_1.UserReq)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, route_params_decorator_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof request_decorator_1.TUserReq !== "undefined" && request_decorator_1.TUserReq) === "function" ? _d : Object, typeof (_e = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _e : Object, typeof (_f = typeof request_1.ArrivalGetOneQuery !== "undefined" && request_1.ArrivalGetOneQuery) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], ApiArrivalController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)('create-invoice-draft'),
    __param(0, (0, request_decorator_1.UserReq)()),
    __param(1, (0, route_params_decorator_1.Query)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof request_decorator_1.TUserReq !== "undefined" && request_decorator_1.TUserReq) === "function" ? _g : Object, typeof (_h = typeof request_1.InvoiceCreateQuery !== "undefined" && request_1.InvoiceCreateQuery) === "function" ? _h : Object, typeof (_j = typeof request_1.InvoiceUpsertBody !== "undefined" && request_1.InvoiceUpsertBody) === "function" ? _j : Object]),
    __metadata("design:returntype", Promise)
], ApiArrivalController.prototype, "createInvoiceDraft", null);
__decorate([
    (0, common_1.Post)('create-invoice-draft-after-refund/:id'),
    __param(0, (0, request_decorator_1.UserReq)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_k = typeof request_decorator_1.TUserReq !== "undefined" && request_decorator_1.TUserReq) === "function" ? _k : Object, typeof (_l = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _l : Object, typeof (_m = typeof request_1.InvoiceUpsertBody !== "undefined" && request_1.InvoiceUpsertBody) === "function" ? _m : Object]),
    __metadata("design:returntype", Promise)
], ApiArrivalController.prototype, "createInvoiceDraftAfterRefund", null);
__decorate([
    (0, common_1.Put)('invoice/update-draft/:id'),
    __param(0, (0, request_decorator_1.UserReq)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_o = typeof request_decorator_1.TUserReq !== "undefined" && request_decorator_1.TUserReq) === "function" ? _o : Object, typeof (_p = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _p : Object, typeof (_q = typeof request_1.InvoiceUpsertBody !== "undefined" && request_1.InvoiceUpsertBody) === "function" ? _q : Object]),
    __metadata("design:returntype", Promise)
], ApiArrivalController.prototype, "updateInvoiceDraft", null);
__decorate([
    (0, common_1.Patch)('invoice/payment-draft/:id'),
    __param(0, (0, request_decorator_1.UserReq)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_r = typeof request_decorator_1.TUserReq !== "undefined" && request_decorator_1.TUserReq) === "function" ? _r : Object, typeof (_s = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _s : Object]),
    __metadata("design:returntype", Promise)
], ApiArrivalController.prototype, "paymentInvoiceDraft", null);
__decorate([
    (0, common_1.Patch)('invoice/refund/:id'),
    __param(0, (0, request_decorator_1.UserReq)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_t = typeof request_decorator_1.TUserReq !== "undefined" && request_decorator_1.TUserReq) === "function" ? _t : Object, typeof (_u = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _u : Object]),
    __metadata("design:returntype", Promise)
], ApiArrivalController.prototype, "refund", null);
ApiArrivalController = __decorate([
    (0, swagger_1.ApiTags)('Arrival'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('arrival'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_arrival_service_1.ApiArrivalService !== "undefined" && api_arrival_service_1.ApiArrivalService) === "function" ? _a : Object])
], ApiArrivalController);
exports.ApiArrivalController = ApiArrivalController;


/***/ }),
/* 93 */
/***/ ((module) => {

module.exports = require("@nestjs/common/decorators/http/route-params.decorator");

/***/ }),
/* 94 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.configSwagger = exports.IdParam = void 0;
const swagger_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class IdParam {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'id', example: 45 }),
    (0, class_transformer_1.Expose)({ name: 'id' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IdParam.prototype, "id", void 0);
exports.IdParam = IdParam;
const configSwagger = (app) => {
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Simple API')
        .setDescription('Medihome API use Swagger')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', description: 'Access token' }, 'access-token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('documents', app, document, { swaggerOptions: { persistAuthorization: true } });
};
exports.configSwagger = configSwagger;


/***/ }),
/* 95 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 96 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserReq = exports.OrganizationId = exports.IpRequest = void 0;
const common_1 = __webpack_require__(1);
const request_ip_1 = __webpack_require__(6);
exports.IpRequest = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return (0, request_ip_1.getClientIp)(request);
});
exports.OrganizationId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tokenPayload.oid;
});
exports.UserReq = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return {
        oid: request.tokenPayload.oid,
        uid: request.tokenPayload.uid,
        ip: (0, request_ip_1.getClientIp)(request),
    };
});


/***/ }),
/* 97 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiArrivalService = void 0;
const common_1 = __webpack_require__(1);
const object_helper_1 = __webpack_require__(36);
const repository_1 = __webpack_require__(8);
let ApiArrivalService = class ApiArrivalService {
    constructor(arrivalRepository, arrivalInvoiceRepository, customerRepository) {
        this.arrivalRepository = arrivalRepository;
        this.arrivalInvoiceRepository = arrivalInvoiceRepository;
        this.customerRepository = customerRepository;
    }
    async pagination(oid, query) {
        var _a, _b, _c, _d, _e, _f;
        const { page, limit, total, data } = await this.arrivalRepository.pagination({
            page: query.page,
            limit: query.limit,
            criteria: {
                oid,
                customerId: (_a = query.filter) === null || _a === void 0 ? void 0 : _a.customerId,
                fromTime: (_b = query.filter) === null || _b === void 0 ? void 0 : _b.fromTime,
                toTime: (_c = query.filter) === null || _c === void 0 ? void 0 : _c.toTime,
                types: (_d = query.filter) === null || _d === void 0 ? void 0 : _d.types,
                paymentStatus: (_e = query.filter) === null || _e === void 0 ? void 0 : _e.paymentStatus,
            },
            order: query.sort || { id: 'DESC' },
        });
        if (((_f = query.relations) === null || _f === void 0 ? void 0 : _f.customer) && data.length) {
            const customerIds = (0, object_helper_1.uniqueArray)(data.map((i) => i.customerId));
            const customers = await this.customerRepository.findMany({ ids: customerIds });
            data.forEach((i) => i.customer = customers.find((j) => j.id === i.customerId));
        }
        return { page, limit, total, data };
    }
    async getOne(oid, id, { relations }) {
        const arrival = await this.arrivalRepository.findOne({ id, oid }, {
            customer: !!(relations === null || relations === void 0 ? void 0 : relations.customer),
            invoices: (relations === null || relations === void 0 ? void 0 : relations.invoices) && { invoiceItems: { procedure: true, productBatch: true } },
        });
        return arrival;
    }
    async createInvoiceDraft(oid, customerId, body) {
        try {
            const data = await this.arrivalInvoiceRepository.createInvoiceDraft({
                oid,
                customerId,
                invoiceUpsertDto: repository_1.InvoiceUpsertDto.from(body),
                time: Date.now(),
            });
            return { success: true, data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async createInvoiceDraftAfterRefund(oid, arrivalId, body) {
        try {
            const data = await this.arrivalInvoiceRepository.createInvoiceDraftAfterRefund({
                oid,
                arrivalId,
                invoiceUpsertDto: repository_1.InvoiceUpsertDto.from(body),
            });
            return { success: true, data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async updateInvoiceDraft(oid, invoiceId, body) {
        try {
            const data = await this.arrivalInvoiceRepository.updateInvoiceDraft({
                oid,
                invoiceId,
                invoiceUpsertDto: repository_1.InvoiceUpsertDto.from(body),
            });
            return { success: true, data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async paymentInvoiceDraft(oid, invoiceId) {
        try {
            const data = await this.arrivalInvoiceRepository.paymentInvoiceDraft({
                oid,
                invoiceId,
                time: Date.now(),
            });
            return { success: true, data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async refundInvoice(oid, invoiceId) {
        try {
            const data = await this.arrivalInvoiceRepository.refundInvoice({
                oid,
                invoiceId,
                time: Date.now(),
            });
            return { success: true, data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
};
ApiArrivalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.ArrivalRepository !== "undefined" && repository_1.ArrivalRepository) === "function" ? _a : Object, typeof (_b = typeof repository_1.ArrivalInvoiceRepository !== "undefined" && repository_1.ArrivalInvoiceRepository) === "function" ? _b : Object, typeof (_c = typeof repository_1.CustomerRepository !== "undefined" && repository_1.CustomerRepository) === "function" ? _c : Object])
], ApiArrivalService);
exports.ApiArrivalService = ApiArrivalService;


/***/ }),
/* 98 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(99), exports);
__exportStar(__webpack_require__(101), exports);
__exportStar(__webpack_require__(103), exports);
__exportStar(__webpack_require__(108), exports);


/***/ }),
/* 99 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ArrivalGetOneQuery = exports.ArrivalGetManyQuery = exports.ArrivalPaginationQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
const arrival_options_request_1 = __webpack_require__(101);
class ArrivalPaginationQuery extends pagination_query_1.PaginationQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: arrival_options_request_1.ArrivalFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => arrival_options_request_1.ArrivalFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_a = typeof arrival_options_request_1.ArrivalFilterQuery !== "undefined" && arrival_options_request_1.ArrivalFilterQuery) === "function" ? _a : Object)
], ArrivalPaginationQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: arrival_options_request_1.ArrivalRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => arrival_options_request_1.ArrivalRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_b = typeof arrival_options_request_1.ArrivalRelationsQuery !== "undefined" && arrival_options_request_1.ArrivalRelationsQuery) === "function" ? _b : Object)
], ArrivalPaginationQuery.prototype, "relations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: arrival_options_request_1.ArrivalSortQuery }),
    (0, class_transformer_1.Expose)({ name: 'sort' }),
    (0, class_transformer_1.Type)(() => arrival_options_request_1.ArrivalSortQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_c = typeof arrival_options_request_1.ArrivalSortQuery !== "undefined" && arrival_options_request_1.ArrivalSortQuery) === "function" ? _c : Object)
], ArrivalPaginationQuery.prototype, "sort", void 0);
exports.ArrivalPaginationQuery = ArrivalPaginationQuery;
class ArrivalGetManyQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: arrival_options_request_1.ArrivalFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => arrival_options_request_1.ArrivalFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_d = typeof arrival_options_request_1.ArrivalFilterQuery !== "undefined" && arrival_options_request_1.ArrivalFilterQuery) === "function" ? _d : Object)
], ArrivalGetManyQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: arrival_options_request_1.ArrivalRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => arrival_options_request_1.ArrivalRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_e = typeof arrival_options_request_1.ArrivalRelationsQuery !== "undefined" && arrival_options_request_1.ArrivalRelationsQuery) === "function" ? _e : Object)
], ArrivalGetManyQuery.prototype, "relations", void 0);
exports.ArrivalGetManyQuery = ArrivalGetManyQuery;
class ArrivalGetOneQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: arrival_options_request_1.ArrivalRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => arrival_options_request_1.ArrivalRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_f = typeof arrival_options_request_1.ArrivalRelationsQuery !== "undefined" && arrival_options_request_1.ArrivalRelationsQuery) === "function" ? _f : Object)
], ArrivalGetOneQuery.prototype, "relations", void 0);
exports.ArrivalGetOneQuery = ArrivalGetOneQuery;


/***/ }),
/* 100 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SortQuery = exports.PaginationQuery = void 0;
const swagger_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class PaginationQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'page', example: 1 }),
    (0, class_transformer_1.Expose)({ name: 'page' }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PaginationQuery.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'limit', example: 10 }),
    (0, class_transformer_1.Expose)({ name: 'limit' }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(3),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], PaginationQuery.prototype, "limit", void 0);
exports.PaginationQuery = PaginationQuery;
class SortQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'sort[id]', enum: ['ASC', 'DESC'], example: 'DESC' }),
    (0, class_transformer_1.Expose)({ name: 'id' }),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    __metadata("design:type", String)
], SortQuery.prototype, "id", void 0);
exports.SortQuery = SortQuery;


/***/ }),
/* 101 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ArrivalSortQuery = exports.ArrivalRelationsQuery = exports.ArrivalFilterQuery = void 0;
const swagger_1 = __webpack_require__(10);
const typescript_helper_1 = __webpack_require__(102);
const variable_1 = __webpack_require__(17);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class ArrivalFilterQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[customer_id]' }),
    (0, class_transformer_1.Expose)({ name: 'customer_id' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ArrivalFilterQuery.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[from_time]' }),
    (0, class_transformer_1.Expose)({ name: 'from_time' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ArrivalFilterQuery.prototype, "fromTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[to_time]' }),
    (0, class_transformer_1.Expose)({ name: 'to_time' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ArrivalFilterQuery.prototype, "toTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        name: 'filter[types]',
        type: 'string',
        example: JSON.stringify((0, typescript_helper_1.valuesEnum)(variable_1.ArrivalType)),
        description: JSON.stringify((0, typescript_helper_1.valuesEnum)(variable_1.ArrivalType)),
    }),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch (error) {
            return '';
        }
    }),
    (0, class_transformer_1.Expose)({ name: 'types' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsIn)((0, typescript_helper_1.valuesEnum)(variable_1.ArrivalType), { each: true }),
    __metadata("design:type", Array)
], ArrivalFilterQuery.prototype, "types", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[payment_status]', enum: (0, typescript_helper_1.valuesEnum)(variable_1.PaymentStatus), example: variable_1.PaymentStatus.Full }),
    (0, class_transformer_1.Expose)({ name: 'payment_status' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsEnum)(variable_1.PaymentStatus),
    __metadata("design:type", typeof (_a = typeof variable_1.PaymentStatus !== "undefined" && variable_1.PaymentStatus) === "function" ? _a : Object)
], ArrivalFilterQuery.prototype, "paymentStatus", void 0);
exports.ArrivalFilterQuery = ArrivalFilterQuery;
class ArrivalRelationsQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[customer]' }),
    (0, class_transformer_1.Expose)({ name: 'customer' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ArrivalRelationsQuery.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[invoices]' }),
    (0, class_transformer_1.Expose)({ name: 'invoices' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ArrivalRelationsQuery.prototype, "invoices", void 0);
exports.ArrivalRelationsQuery = ArrivalRelationsQuery;
class ArrivalSortQuery extends pagination_query_1.SortQuery {
}
exports.ArrivalSortQuery = ArrivalSortQuery;


/***/ }),
/* 102 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.objectEnum = exports.valuesEnum = exports.keysEnum = void 0;
const keysEnum = (e) => {
    return Object.keys(e).filter((key) => isNaN(parseInt(key)));
};
exports.keysEnum = keysEnum;
const valuesEnum = (e) => {
    return (0, exports.keysEnum)(e).map((key) => e[key]);
};
exports.valuesEnum = valuesEnum;
const objectEnum = (e) => {
    return (0, exports.keysEnum)(e).reduce((acc, key) => {
        acc[key] = e[key];
        return acc;
    }, {});
};
exports.objectEnum = objectEnum;


/***/ }),
/* 103 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceItemBody = void 0;
const swagger_1 = __webpack_require__(10);
const typescript_helper_1 = __webpack_require__(102);
const variable_1 = __webpack_require__(17);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
const request_1 = __webpack_require__(104);
class InvoiceItemBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'reference_id', example: 12 }),
    (0, class_transformer_1.Expose)({ name: 'reference_id' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceItemBody.prototype, "referenceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'payment_status', enum: (0, typescript_helper_1.valuesEnum)(variable_1.InvoiceItemType), example: variable_1.InvoiceItemType.ProductBatch }),
    (0, class_transformer_1.Expose)({ name: 'type' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsEnum)(variable_1.InvoiceItemType),
    __metadata("design:type", typeof (_a = typeof variable_1.InvoiceItemType !== "undefined" && variable_1.InvoiceItemType) === "function" ? _a : Object)
], InvoiceItemBody.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'unit', type: 'string', example: '{"name":"Viên","rate":1}' }),
    (0, class_transformer_1.Expose)({ name: 'unit' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            const instance = Object.assign(new request_1.UnitConversionQuery(), JSON.parse(value));
            const validate = (0, class_validator_1.validateSync)(instance, { whitelist: true, forbidNonWhitelisted: true });
            if (validate.length)
                return validate;
            else
                return JSON.stringify(instance);
        }
        catch (error) {
            return [error.message];
        }
    }),
    (0, class_validator_1.IsString)({ message: 'Validate unit failed: Example: {"name":"Viên","rate":1}' }),
    __metadata("design:type", String)
], InvoiceItemBody.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'cost_price', example: 12000 }),
    (0, class_transformer_1.Expose)({ name: 'cost_price' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceItemBody.prototype, "costPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'expected_price', example: 25000 }),
    (0, class_transformer_1.Expose)({ name: 'expected_price' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceItemBody.prototype, "expectedPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'discount_money', example: 22500 }),
    (0, class_transformer_1.Expose)({ name: 'discount_money' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceItemBody.prototype, "discountMoney", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'discount_percent', example: 22500 }),
    (0, class_transformer_1.Expose)({ name: 'discount_percent' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceItemBody.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'discount_type', enum: (0, typescript_helper_1.valuesEnum)(variable_1.DiscountType), example: variable_1.DiscountType.VND }),
    (0, class_transformer_1.Expose)({ name: 'discount_type' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsEnum)(variable_1.DiscountType),
    __metadata("design:type", typeof (_b = typeof variable_1.DiscountType !== "undefined" && variable_1.DiscountType) === "function" ? _b : Object)
], InvoiceItemBody.prototype, "discountType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'actual_price', example: 22500 }),
    (0, class_transformer_1.Expose)({ name: 'actual_price' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceItemBody.prototype, "actualPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'quantity', example: 4 }),
    (0, class_transformer_1.Expose)({ name: 'quantity' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], InvoiceItemBody.prototype, "quantity", void 0);
exports.InvoiceItemBody = InvoiceItemBody;


/***/ }),
/* 104 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(105), exports);
__exportStar(__webpack_require__(106), exports);
__exportStar(__webpack_require__(107), exports);


/***/ }),
/* 105 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductGetOneQuery = exports.ProductGetManyQuery = exports.ProductPaginationQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
const product_options_request_1 = __webpack_require__(106);
class ProductPaginationQuery extends pagination_query_1.PaginationQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: product_options_request_1.ProductFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => product_options_request_1.ProductFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_a = typeof product_options_request_1.ProductFilterQuery !== "undefined" && product_options_request_1.ProductFilterQuery) === "function" ? _a : Object)
], ProductPaginationQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: product_options_request_1.ProductRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => product_options_request_1.ProductRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_b = typeof product_options_request_1.ProductRelationsQuery !== "undefined" && product_options_request_1.ProductRelationsQuery) === "function" ? _b : Object)
], ProductPaginationQuery.prototype, "relations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: product_options_request_1.ProductSortQuery }),
    (0, class_transformer_1.Expose)({ name: 'sort' }),
    (0, class_transformer_1.Type)(() => product_options_request_1.ProductSortQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_c = typeof product_options_request_1.ProductSortQuery !== "undefined" && product_options_request_1.ProductSortQuery) === "function" ? _c : Object)
], ProductPaginationQuery.prototype, "sort", void 0);
exports.ProductPaginationQuery = ProductPaginationQuery;
class ProductGetManyQuery {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'limit', example: 10 }),
    (0, class_transformer_1.Expose)({ name: 'limit' }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(3),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ProductGetManyQuery.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: product_options_request_1.ProductFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => product_options_request_1.ProductFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_d = typeof product_options_request_1.ProductFilterQuery !== "undefined" && product_options_request_1.ProductFilterQuery) === "function" ? _d : Object)
], ProductGetManyQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: product_options_request_1.ProductRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => product_options_request_1.ProductRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_e = typeof product_options_request_1.ProductRelationsQuery !== "undefined" && product_options_request_1.ProductRelationsQuery) === "function" ? _e : Object)
], ProductGetManyQuery.prototype, "relations", void 0);
exports.ProductGetManyQuery = ProductGetManyQuery;
class ProductGetOneQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: product_options_request_1.ProductRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => product_options_request_1.ProductRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_f = typeof product_options_request_1.ProductRelationsQuery !== "undefined" && product_options_request_1.ProductRelationsQuery) === "function" ? _f : Object)
], ProductGetOneQuery.prototype, "relations", void 0);
exports.ProductGetOneQuery = ProductGetOneQuery;


/***/ }),
/* 106 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductSortQuery = exports.ProductRelationsQuery = exports.ProductFilterQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class ProductFilterQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[group]' }),
    (0, class_transformer_1.Expose)({ name: 'group' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductFilterQuery.prototype, "group", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[search_text]' }),
    (0, class_transformer_1.Expose)({ name: 'search_text' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductFilterQuery.prototype, "searchText", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[is_active]' }),
    (0, class_transformer_1.Expose)({ name: 'is_active' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductFilterQuery.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[quantity_zero]' }),
    (0, class_transformer_1.Expose)({ name: 'quantity_zero' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductFilterQuery.prototype, "quantityZero", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[overdue]' }),
    (0, class_transformer_1.Expose)({ name: 'overdue' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductFilterQuery.prototype, "overdue", void 0);
exports.ProductFilterQuery = ProductFilterQuery;
class ProductRelationsQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[product_batches]' }),
    (0, class_transformer_1.Expose)({ name: 'product_batches' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductRelationsQuery.prototype, "productBatches", void 0);
exports.ProductRelationsQuery = ProductRelationsQuery;
class ProductSortQuery extends pagination_query_1.SortQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'sort[brand_name]' }),
    (0, class_transformer_1.Expose)({ name: 'brand_name' }),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    __metadata("design:type", String)
], ProductSortQuery.prototype, "brandName", void 0);
exports.ProductSortQuery = ProductSortQuery;


/***/ }),
/* 107 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductUpdateBody = exports.ProductCreateBody = exports.UnitConversionQuery = void 0;
const swagger_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class UnitConversionQuery {
}
__decorate([
    (0, class_transformer_1.Expose)({ name: 'name' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UnitConversionQuery.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'rate' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UnitConversionQuery.prototype, "rate", void 0);
exports.UnitConversionQuery = UnitConversionQuery;
class ProductCreateBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'brand_name', example: 'Klacid 125mg/5ml' }),
    (0, class_transformer_1.Expose)({ name: 'brand_name' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductCreateBody.prototype, "brandName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'substance', example: 'Clarythromycin 125mg/5ml' }),
    (0, class_transformer_1.Expose)({ name: 'substance' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductCreateBody.prototype, "substance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'group', example: '2' }),
    (0, class_transformer_1.Expose)({ name: 'group' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductCreateBody.prototype, "group", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'unit', type: 'string', example: '[{"name":"Viên","rate":1}]' }),
    (0, class_transformer_1.Expose)({ name: 'unit' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            const err = [];
            const result = JSON.parse(value).map((i) => {
                const instance = Object.assign(new UnitConversionQuery(), i);
                const validate = (0, class_validator_1.validateSync)(instance, { whitelist: true, forbidNonWhitelisted: true });
                if (validate.length)
                    err.push(...validate);
                return instance;
            });
            if (err.length)
                return err;
            else
                return JSON.stringify(result);
        }
        catch (error) {
            return [error.message];
        }
    }),
    (0, class_validator_1.IsString)({ message: 'Validate unit failed: Example: [{"name":"Viên","rate":1}]' }),
    __metadata("design:type", String)
], ProductCreateBody.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'route', example: 'Uống' }),
    (0, class_transformer_1.Expose)({ name: 'route' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductCreateBody.prototype, "route", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'source', example: 'Ấn Độ' }),
    (0, class_transformer_1.Expose)({ name: 'source' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductCreateBody.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'image', example: 'https://cdn.medigoapp.com/product/Klacid_125mg_5ml_4724e139c8.jpg' }),
    (0, class_transformer_1.Expose)({ name: 'image' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductCreateBody.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'hint_usage', example: 'Uống 1 viên/ngày, 9h sáng, sau ăn no' }),
    (0, class_transformer_1.Expose)({ name: 'hint_usage' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductCreateBody.prototype, "hintUsage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'is_active', example: true }),
    (0, class_transformer_1.Expose)({ name: 'is_active' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductCreateBody.prototype, "isActive", void 0);
exports.ProductCreateBody = ProductCreateBody;
class ProductUpdateBody extends (0, swagger_1.PartialType)(ProductCreateBody) {
}
exports.ProductUpdateBody = ProductUpdateBody;


/***/ }),
/* 108 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceUpsertBody = exports.InvoiceCreateQuery = void 0;
const swagger_1 = __webpack_require__(10);
const variable_1 = __webpack_require__(17);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
const invoice_item_body_1 = __webpack_require__(103);
class InvoiceCreateQuery {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'customer_id', example: 45 }),
    (0, class_transformer_1.Expose)({ name: 'customer_id' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceCreateQuery.prototype, "customerId", void 0);
exports.InvoiceCreateQuery = InvoiceCreateQuery;
class InvoiceUpsertBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ type: invoice_item_body_1.InvoiceItemBody, isArray: true }),
    (0, class_transformer_1.Expose)({ name: 'invoice_items' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => invoice_item_body_1.InvoiceItemBody),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", Array)
], InvoiceUpsertBody.prototype, "invoiceItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'total_cost_money', example: 750000 }),
    (0, class_transformer_1.Expose)({ name: 'total_cost_money' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceUpsertBody.prototype, "totalCostMoney", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'total_item_money', example: 750000 }),
    (0, class_transformer_1.Expose)({ name: 'total_item_money' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceUpsertBody.prototype, "totalItemMoney", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'discount_money', example: 22500 }),
    (0, class_transformer_1.Expose)({ name: 'discount_money' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceUpsertBody.prototype, "discountMoney", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'discount_percent', example: 22500 }),
    (0, class_transformer_1.Expose)({ name: 'discount_percent' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceUpsertBody.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'discount_type', enum: variable_1.DiscountType, example: variable_1.DiscountType.VND }),
    (0, class_transformer_1.Expose)({ name: 'discount_type' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsEnum)(variable_1.DiscountType),
    __metadata("design:type", typeof (_a = typeof variable_1.DiscountType !== "undefined" && variable_1.DiscountType) === "function" ? _a : Object)
], InvoiceUpsertBody.prototype, "discountType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'surcharge', example: 12000 }),
    (0, class_transformer_1.Expose)({ name: 'surcharge' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceUpsertBody.prototype, "surcharge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'total_money', example: 1250000 }),
    (0, class_transformer_1.Expose)({ name: 'total_money' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceUpsertBody.prototype, "totalMoney", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'expenses', example: 20000 }),
    (0, class_transformer_1.Expose)({ name: 'expenses' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceUpsertBody.prototype, "expenses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'profit', example: 20000 }),
    (0, class_transformer_1.Expose)({ name: 'profit' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceUpsertBody.prototype, "profit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'debt', example: 500000 }),
    (0, class_transformer_1.Expose)({ name: 'debt' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceUpsertBody.prototype, "debt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'note', example: 'Khách hàng không hài lòng dịch vụ nên không trả tiền' }),
    (0, class_transformer_1.Expose)({ name: 'note' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvoiceUpsertBody.prototype, "note", void 0);
exports.InvoiceUpsertBody = InvoiceUpsertBody;


/***/ }),
/* 109 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiCustomerDebtModule = void 0;
const common_1 = __webpack_require__(1);
const api_customer_debt_controller_1 = __webpack_require__(110);
const api_customer_debt_service_1 = __webpack_require__(111);
let ApiCustomerDebtModule = class ApiCustomerDebtModule {
};
ApiCustomerDebtModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_customer_debt_controller_1.ApiCustomerDebtController],
        providers: [api_customer_debt_service_1.ApiCustomerDebtService],
    })
], ApiCustomerDebtModule);
exports.ApiCustomerDebtModule = ApiCustomerDebtModule;


/***/ }),
/* 110 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiCustomerDebtController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(10);
const request_decorator_1 = __webpack_require__(96);
const api_customer_debt_service_1 = __webpack_require__(111);
const request_1 = __webpack_require__(112);
let ApiCustomerDebtController = class ApiCustomerDebtController {
    constructor(apiCustomerDebtService) {
        this.apiCustomerDebtService = apiCustomerDebtService;
    }
    pagination(oid, query) {
        return this.apiCustomerDebtService.pagination(oid, query);
    }
    startPayDebt(oid, body) {
        return this.apiCustomerDebtService.startPayDebt(oid, body);
    }
};
__decorate([
    (0, common_1.Get)('pagination'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof request_1.CustomerDebtPaginationQuery !== "undefined" && request_1.CustomerDebtPaginationQuery) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ApiCustomerDebtController.prototype, "pagination", null);
__decorate([
    (0, common_1.Post)('payment'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof request_1.CustomerDebtPaymentBody !== "undefined" && request_1.CustomerDebtPaymentBody) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], ApiCustomerDebtController.prototype, "startPayDebt", null);
ApiCustomerDebtController = __decorate([
    (0, swagger_1.ApiTags)('Customer Debt'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('customer-debt'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_customer_debt_service_1.ApiCustomerDebtService !== "undefined" && api_customer_debt_service_1.ApiCustomerDebtService) === "function" ? _a : Object])
], ApiCustomerDebtController);
exports.ApiCustomerDebtController = ApiCustomerDebtController;


/***/ }),
/* 111 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiCustomerDebtService = void 0;
const common_1 = __webpack_require__(1);
const repository_1 = __webpack_require__(8);
let ApiCustomerDebtService = class ApiCustomerDebtService {
    constructor(customerDebtRepository) {
        this.customerDebtRepository = customerDebtRepository;
    }
    async pagination(oid, query) {
        var _a;
        return await this.customerDebtRepository.pagination({
            page: query.page,
            limit: query.limit,
            criteria: {
                oid,
                customerId: (_a = query.filter) === null || _a === void 0 ? void 0 : _a.customerId,
            },
            order: query.sort || { id: 'DESC' },
        });
    }
    async startPayDebt(oid, body) {
        const { customer, customerDebt } = await this.customerDebtRepository.startPayDebt({
            oid,
            customerId: body.customerId,
            money: body.money,
            createTime: Date.now(),
            note: body.note,
        });
        return { customer, customerDebt };
    }
};
ApiCustomerDebtService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.CustomerDebtRepository !== "undefined" && repository_1.CustomerDebtRepository) === "function" ? _a : Object])
], ApiCustomerDebtService);
exports.ApiCustomerDebtService = ApiCustomerDebtService;


/***/ }),
/* 112 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(113), exports);
__exportStar(__webpack_require__(114), exports);


/***/ }),
/* 113 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomerDebtPaginationQuery = exports.CustomerDebtSortQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class CustomerDebtFilterQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[customer_id]', example: 12 }),
    (0, class_transformer_1.Expose)({ name: 'customer_id' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CustomerDebtFilterQuery.prototype, "customerId", void 0);
class CustomerDebtSortQuery extends pagination_query_1.SortQuery {
}
exports.CustomerDebtSortQuery = CustomerDebtSortQuery;
class CustomerDebtPaginationQuery extends pagination_query_1.PaginationQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CustomerDebtFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => CustomerDebtFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", CustomerDebtFilterQuery)
], CustomerDebtPaginationQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CustomerDebtSortQuery }),
    (0, class_transformer_1.Expose)({ name: 'sort' }),
    (0, class_transformer_1.Type)(() => CustomerDebtSortQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", CustomerDebtSortQuery)
], CustomerDebtPaginationQuery.prototype, "sort", void 0);
exports.CustomerDebtPaginationQuery = CustomerDebtPaginationQuery;


/***/ }),
/* 114 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomerDebtPaymentBody = void 0;
const swagger_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class CustomerDebtPaymentBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'customer_id', example: 12 }),
    (0, class_transformer_1.Expose)({ name: 'customer_id' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CustomerDebtPaymentBody.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'money', example: 1250000 }),
    (0, class_transformer_1.Expose)({ name: 'money' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CustomerDebtPaymentBody.prototype, "money", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'note', example: 'Khách hàng còn bo thêm tiền' }),
    (0, class_transformer_1.Expose)({ name: 'note' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerDebtPaymentBody.prototype, "note", void 0);
exports.CustomerDebtPaymentBody = CustomerDebtPaymentBody;


/***/ }),
/* 115 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiCustomerModule = void 0;
const common_1 = __webpack_require__(1);
const api_customer_controller_1 = __webpack_require__(116);
const api_customer_service_1 = __webpack_require__(117);
let ApiCustomerModule = class ApiCustomerModule {
};
ApiCustomerModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_customer_controller_1.ApiCustomerController],
        providers: [api_customer_service_1.ApiCustomerService],
    })
], ApiCustomerModule);
exports.ApiCustomerModule = ApiCustomerModule;


/***/ }),
/* 116 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiCustomerController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(10);
const swagger_2 = __webpack_require__(94);
const request_decorator_1 = __webpack_require__(96);
const api_customer_service_1 = __webpack_require__(117);
const request_1 = __webpack_require__(119);
let ApiCustomerController = class ApiCustomerController {
    constructor(apiCustomerService) {
        this.apiCustomerService = apiCustomerService;
    }
    pagination(oid, query) {
        return this.apiCustomerService.pagination(oid, query);
    }
    list(oid, query) {
        return this.apiCustomerService.getMany(oid, query);
    }
    async detail(oid, { id }, query) {
        return await this.apiCustomerService.getOne(oid, id, query);
    }
    async create(oid, body) {
        return await this.apiCustomerService.createOne(oid, body);
    }
    async update(oid, { id }, body) {
        return await this.apiCustomerService.updateOne(oid, +id, body);
    }
};
__decorate([
    (0, common_1.Get)('pagination'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof request_1.CustomerPaginationQuery !== "undefined" && request_1.CustomerPaginationQuery) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ApiCustomerController.prototype, "pagination", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof request_1.CustomerGetManyQuery !== "undefined" && request_1.CustomerGetManyQuery) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], ApiCustomerController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_d = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _d : Object, typeof (_e = typeof request_1.CustomerGetOneQuery !== "undefined" && request_1.CustomerGetOneQuery) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], ApiCustomerController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_f = typeof request_1.CustomerCreateBody !== "undefined" && request_1.CustomerCreateBody) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], ApiCustomerController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('update/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _g : Object, typeof (_h = typeof request_1.CustomerUpdateBody !== "undefined" && request_1.CustomerUpdateBody) === "function" ? _h : Object]),
    __metadata("design:returntype", Promise)
], ApiCustomerController.prototype, "update", null);
ApiCustomerController = __decorate([
    (0, swagger_1.ApiTags)('Customer'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('customer'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_customer_service_1.ApiCustomerService !== "undefined" && api_customer_service_1.ApiCustomerService) === "function" ? _a : Object])
], ApiCustomerController);
exports.ApiCustomerController = ApiCustomerController;


/***/ }),
/* 117 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiCustomerService = void 0;
const common_1 = __webpack_require__(1);
const repository_1 = __webpack_require__(8);
const business_exception_filter_1 = __webpack_require__(118);
const exception_const_1 = __webpack_require__(89);
let ApiCustomerService = class ApiCustomerService {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    async pagination(oid, query) {
        var _a, _b, _c;
        return await this.customerRepository.pagination({
            page: query.page,
            limit: query.limit,
            criteria: {
                oid,
                isActive: (_a = query.filter) === null || _a === void 0 ? void 0 : _a.isActive,
                fullNameEn: ['LIKE', (_b = query.filter) === null || _b === void 0 ? void 0 : _b.fullNameEn],
                phone: ['LIKE', (_c = query.filter) === null || _c === void 0 ? void 0 : _c.phone],
            },
            order: query.sort || { id: 'DESC' },
        });
    }
    async getMany(oid, { limit, filter }) {
        return await this.customerRepository.find({
            criteria: {
                oid,
                fullNameEn: ['LIKE', filter === null || filter === void 0 ? void 0 : filter.fullNameEn],
                phone: ['LIKE', filter === null || filter === void 0 ? void 0 : filter.phone],
            },
            limit,
        });
    }
    async getOne(oid, id, query) {
        const customer = await this.customerRepository.findOne({ oid, id });
        if (!customer)
            throw new business_exception_filter_1.BusinessException(exception_const_1.ErrorMessage.Customer.NotFound);
        return customer;
    }
    async createOne(oid, body) {
        return await this.customerRepository.insertOne(Object.assign({ oid }, body));
    }
    async updateOne(oid, id, body) {
        const { affected } = await this.customerRepository.update({ id, oid }, body);
        if (affected !== 1)
            throw new Error(exception_const_1.ErrorMessage.Database.UpdateFailed);
        return await this.customerRepository.findOne({ id, oid });
    }
};
ApiCustomerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.CustomerRepository !== "undefined" && repository_1.CustomerRepository) === "function" ? _a : Object])
], ApiCustomerService);
exports.ApiCustomerService = ApiCustomerService;


/***/ }),
/* 118 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BusinessExceptionFilter = exports.BusinessException = void 0;
const common_1 = __webpack_require__(1);
class BusinessException extends Error {
    constructor(message) {
        super(message);
    }
}
exports.BusinessException = BusinessException;
let BusinessExceptionFilter = class BusinessExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const httpStatus = common_1.HttpStatus.BAD_REQUEST;
        const { message } = exception;
        response.status(httpStatus).json({
            httpStatus,
            message,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
};
BusinessExceptionFilter = __decorate([
    (0, common_1.Catch)(BusinessException)
], BusinessExceptionFilter);
exports.BusinessExceptionFilter = BusinessExceptionFilter;


/***/ }),
/* 119 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(120), exports);
__exportStar(__webpack_require__(122), exports);


/***/ }),
/* 120 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomerGetOneQuery = exports.CustomerGetManyQuery = exports.CustomerPaginationQuery = void 0;
const swagger_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
const pagination_query_1 = __webpack_require__(100);
const customer_options_request_1 = __webpack_require__(121);
class CustomerPaginationQuery extends pagination_query_1.PaginationQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: customer_options_request_1.CustomerFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => customer_options_request_1.CustomerFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_a = typeof customer_options_request_1.CustomerFilterQuery !== "undefined" && customer_options_request_1.CustomerFilterQuery) === "function" ? _a : Object)
], CustomerPaginationQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: customer_options_request_1.CustomerSortQuery }),
    (0, class_transformer_1.Expose)({ name: 'sort' }),
    (0, class_transformer_1.Type)(() => customer_options_request_1.CustomerSortQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_b = typeof customer_options_request_1.CustomerSortQuery !== "undefined" && customer_options_request_1.CustomerSortQuery) === "function" ? _b : Object)
], CustomerPaginationQuery.prototype, "sort", void 0);
exports.CustomerPaginationQuery = CustomerPaginationQuery;
class CustomerGetManyQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'limit', example: 10 }),
    (0, class_transformer_1.Expose)({ name: 'limit' }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(3),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CustomerGetManyQuery.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: customer_options_request_1.CustomerFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => customer_options_request_1.CustomerFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_c = typeof customer_options_request_1.CustomerFilterQuery !== "undefined" && customer_options_request_1.CustomerFilterQuery) === "function" ? _c : Object)
], CustomerGetManyQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: customer_options_request_1.CustomerRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => customer_options_request_1.CustomerRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_d = typeof customer_options_request_1.CustomerRelationsQuery !== "undefined" && customer_options_request_1.CustomerRelationsQuery) === "function" ? _d : Object)
], CustomerGetManyQuery.prototype, "relations", void 0);
exports.CustomerGetManyQuery = CustomerGetManyQuery;
class CustomerGetOneQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: customer_options_request_1.CustomerRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => customer_options_request_1.CustomerRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_e = typeof customer_options_request_1.CustomerRelationsQuery !== "undefined" && customer_options_request_1.CustomerRelationsQuery) === "function" ? _e : Object)
], CustomerGetOneQuery.prototype, "relations", void 0);
exports.CustomerGetOneQuery = CustomerGetOneQuery;


/***/ }),
/* 121 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomerSortQuery = exports.CustomerFilterQuery = exports.CustomerRelationsQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class CustomerRelationsQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[invoices]' }),
    (0, class_transformer_1.Expose)({ name: 'invoices' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CustomerRelationsQuery.prototype, "invoices", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[customer_debts]' }),
    (0, class_transformer_1.Expose)({ name: 'customer_debts' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CustomerRelationsQuery.prototype, "customerDebts", void 0);
exports.CustomerRelationsQuery = CustomerRelationsQuery;
class CustomerFilterQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[is_active]', example: false }),
    (0, class_transformer_1.Expose)({ name: 'is_active' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CustomerFilterQuery.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[full_name_en]', example: 'Đỗ' }),
    (0, class_transformer_1.Expose)({ name: 'full_name_en' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerFilterQuery.prototype, "fullNameEn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[phone]', example: '09860' }),
    (0, class_transformer_1.Expose)({ name: 'phone' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerFilterQuery.prototype, "phone", void 0);
exports.CustomerFilterQuery = CustomerFilterQuery;
class CustomerSortQuery extends pagination_query_1.SortQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'sort[debt]', enum: ['ASC', 'DESC'], example: 'DESC' }),
    (0, class_transformer_1.Expose)({ name: 'debt' }),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    __metadata("design:type", String)
], CustomerSortQuery.prototype, "debt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'sort[full_name_en]', enum: ['ASC', 'DESC'], example: 'DESC' }),
    (0, class_transformer_1.Expose)({ name: 'full_name_en' }),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    __metadata("design:type", String)
], CustomerSortQuery.prototype, "fullNameEn", void 0);
exports.CustomerSortQuery = CustomerSortQuery;


/***/ }),
/* 122 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomerUpdateBody = exports.CustomerCreateBody = void 0;
const swagger_1 = __webpack_require__(10);
const class_validator_custom_1 = __webpack_require__(123);
const variable_1 = __webpack_require__(17);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class CustomerCreateBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'full_name_vi', example: 'Phạm Hoàng Mai' }),
    (0, class_transformer_1.Expose)({ name: 'full_name_vi' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CustomerCreateBody.prototype, "fullNameVi", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'full_name_en', example: 'Pham Hoang Mai' }),
    (0, class_transformer_1.Expose)({ name: 'full_name_en' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CustomerCreateBody.prototype, "fullNameEn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'phone', example: '0986123456' }),
    (0, class_transformer_1.Expose)({ name: 'phone' }),
    (0, class_validator_1.Validate)(class_validator_custom_1.IsPhone),
    __metadata("design:type", String)
], CustomerCreateBody.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'birthday', example: 1678890707005 }),
    (0, class_transformer_1.Expose)({ name: 'birthday' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CustomerCreateBody.prototype, "birthday", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'gender', enum: [0, 1], example: variable_1.EGender.Female }),
    (0, class_transformer_1.Expose)({ name: 'gender' }),
    (0, class_validator_1.IsIn)([0, 1]),
    __metadata("design:type", typeof (_a = typeof variable_1.EGender !== "undefined" && variable_1.EGender) === "function" ? _a : Object)
], CustomerCreateBody.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'identity_card', example: '0330400025442' }),
    (0, class_transformer_1.Expose)({ name: 'identity_card' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerCreateBody.prototype, "identityCard", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'address_province', example: 'Tỉnh Hưng Yên' }),
    (0, class_transformer_1.Expose)({ name: 'address_province' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerCreateBody.prototype, "addressProvince", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'address_district', example: 'Huyện Khoái Châu' }),
    (0, class_transformer_1.Expose)({ name: 'address_district' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerCreateBody.prototype, "addressDistrict", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'address_ward', example: 'Xã Dạ Trạch' }),
    (0, class_transformer_1.Expose)({ name: 'address_ward' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerCreateBody.prototype, "addressWard", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'address_street', example: 'Thôn Đức Nhuận' }),
    (0, class_transformer_1.Expose)({ name: 'address_street' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerCreateBody.prototype, "addressStreet", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relative', example: 'Mẹ Nguyễn Thị Hương, sđt: 0988021146' }),
    (0, class_transformer_1.Expose)({ name: 'relative' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerCreateBody.prototype, "relative", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'health_history', example: 'Mổ ruột thừa năm 2018' }),
    (0, class_transformer_1.Expose)({ name: 'health_history' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerCreateBody.prototype, "healthHistory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'note', example: 'Khách hàng không' }),
    (0, class_transformer_1.Expose)({ name: 'note' }),
    __metadata("design:type", String)
], CustomerCreateBody.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'is_active', example: true }),
    (0, class_transformer_1.Expose)({ name: 'is_active' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CustomerCreateBody.prototype, "isActive", void 0);
exports.CustomerCreateBody = CustomerCreateBody;
class CustomerUpdateBody extends (0, swagger_1.PartialType)(CustomerCreateBody) {
}
exports.CustomerUpdateBody = CustomerUpdateBody;


/***/ }),
/* 123 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IsGmail = exports.IsPhone = void 0;
const class_validator_1 = __webpack_require__(95);
let IsPhone = class IsPhone {
    validate(text, args) {
        if (typeof text !== 'string' || text.length !== 10)
            return false;
        return /((09|03|07|08|05)+([0-9]{8})\b)/g.test(text);
    }
    defaultMessage(args) {
        return '$property must be real phone number !';
    }
};
IsPhone = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isPhone', async: false })
], IsPhone);
exports.IsPhone = IsPhone;
let IsGmail = class IsGmail {
    validate(text, args) {
        if (typeof text !== 'string')
            return false;
        return /^([a-zA-Z0-9]|\.|-|_)+(@gmail.com)$/.test(text);
    }
    defaultMessage(args) {
        return '$property must be a gmail address !';
    }
};
IsGmail = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isGmail', async: false })
], IsGmail);
exports.IsGmail = IsGmail;


/***/ }),
/* 124 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiDistributorDebtModule = void 0;
const common_1 = __webpack_require__(1);
const api_distributor_debt_controller_1 = __webpack_require__(125);
const api_distributor_debt_service_1 = __webpack_require__(126);
let ApiDistributorDebtModule = class ApiDistributorDebtModule {
};
ApiDistributorDebtModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_distributor_debt_controller_1.ApiDistributorDebtController],
        providers: [api_distributor_debt_service_1.ApiDistributorDebtService],
    })
], ApiDistributorDebtModule);
exports.ApiDistributorDebtModule = ApiDistributorDebtModule;


/***/ }),
/* 125 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiDistributorDebtController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(10);
const request_decorator_1 = __webpack_require__(96);
const api_distributor_debt_service_1 = __webpack_require__(126);
const request_1 = __webpack_require__(127);
let ApiDistributorDebtController = class ApiDistributorDebtController {
    constructor(apiDistributorDebtService) {
        this.apiDistributorDebtService = apiDistributorDebtService;
    }
    pagination(oid, query) {
        return this.apiDistributorDebtService.pagination(oid, query);
    }
    startPayDebt(oid, body) {
        return this.apiDistributorDebtService.startPayDebt(oid, body);
    }
};
__decorate([
    (0, common_1.Get)('pagination'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof request_1.DistributorDebtPaginationQuery !== "undefined" && request_1.DistributorDebtPaginationQuery) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ApiDistributorDebtController.prototype, "pagination", null);
__decorate([
    (0, common_1.Post)('payment'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof request_1.DistributorDebtPaymentBody !== "undefined" && request_1.DistributorDebtPaymentBody) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], ApiDistributorDebtController.prototype, "startPayDebt", null);
ApiDistributorDebtController = __decorate([
    (0, swagger_1.ApiTags)('Distributor Debt'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('distributor-debt'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_distributor_debt_service_1.ApiDistributorDebtService !== "undefined" && api_distributor_debt_service_1.ApiDistributorDebtService) === "function" ? _a : Object])
], ApiDistributorDebtController);
exports.ApiDistributorDebtController = ApiDistributorDebtController;


/***/ }),
/* 126 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiDistributorDebtService = void 0;
const common_1 = __webpack_require__(1);
const repository_1 = __webpack_require__(8);
let ApiDistributorDebtService = class ApiDistributorDebtService {
    constructor(distributorDebtRepository) {
        this.distributorDebtRepository = distributorDebtRepository;
    }
    async pagination(oid, query) {
        var _a;
        return await this.distributorDebtRepository.pagination({
            page: query.page,
            limit: query.limit,
            criteria: { distributorId: (_a = query.filter) === null || _a === void 0 ? void 0 : _a.distributorId },
            order: query.sort || { id: 'DESC' },
        });
    }
    async startPayDebt(oid, body) {
        const { distributor, distributorDebt } = await this.distributorDebtRepository.startPayDebt({
            oid,
            distributorId: body.distributorId,
            money: body.money,
            createTime: Date.now(),
            note: body.note,
        });
        return { distributor, distributorDebt };
    }
};
ApiDistributorDebtService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.DistributorDebtRepository !== "undefined" && repository_1.DistributorDebtRepository) === "function" ? _a : Object])
], ApiDistributorDebtService);
exports.ApiDistributorDebtService = ApiDistributorDebtService;


/***/ }),
/* 127 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(128), exports);
__exportStar(__webpack_require__(129), exports);


/***/ }),
/* 128 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DistributorDebtPaginationQuery = exports.DistributorDebtSortQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class DistributorDebtFilterQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[distributor_id]', example: 12 }),
    (0, class_transformer_1.Expose)({ name: 'distributor_id' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DistributorDebtFilterQuery.prototype, "distributorId", void 0);
class DistributorDebtSortQuery extends pagination_query_1.SortQuery {
}
exports.DistributorDebtSortQuery = DistributorDebtSortQuery;
class DistributorDebtPaginationQuery extends pagination_query_1.PaginationQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: DistributorDebtFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => DistributorDebtFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", DistributorDebtFilterQuery)
], DistributorDebtPaginationQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: DistributorDebtSortQuery }),
    (0, class_transformer_1.Expose)({ name: 'sort' }),
    (0, class_transformer_1.Type)(() => DistributorDebtSortQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", DistributorDebtSortQuery)
], DistributorDebtPaginationQuery.prototype, "sort", void 0);
exports.DistributorDebtPaginationQuery = DistributorDebtPaginationQuery;


/***/ }),
/* 129 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DistributorDebtPaymentBody = void 0;
const swagger_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class DistributorDebtPaymentBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'distributor_id', example: 12 }),
    (0, class_transformer_1.Expose)({ name: 'distributor_id' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DistributorDebtPaymentBody.prototype, "distributorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'money', example: 1250000 }),
    (0, class_transformer_1.Expose)({ name: 'money' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DistributorDebtPaymentBody.prototype, "money", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'note', example: 'NCC còn nợ thêm tiền' }),
    (0, class_transformer_1.Expose)({ name: 'note' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DistributorDebtPaymentBody.prototype, "note", void 0);
exports.DistributorDebtPaymentBody = DistributorDebtPaymentBody;


/***/ }),
/* 130 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiDistributorModule = void 0;
const common_1 = __webpack_require__(1);
const api_distributor_controller_1 = __webpack_require__(131);
const api_distributor_service_1 = __webpack_require__(132);
let ApiDistributorModule = class ApiDistributorModule {
};
ApiDistributorModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_distributor_controller_1.ApiDistributorController],
        providers: [api_distributor_service_1.ApiDistributorService],
    })
], ApiDistributorModule);
exports.ApiDistributorModule = ApiDistributorModule;


/***/ }),
/* 131 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiDistributorController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(10);
const swagger_2 = __webpack_require__(94);
const request_decorator_1 = __webpack_require__(96);
const api_distributor_service_1 = __webpack_require__(132);
const request_1 = __webpack_require__(133);
let ApiDistributorController = class ApiDistributorController {
    constructor(apiDistributorService) {
        this.apiDistributorService = apiDistributorService;
    }
    pagination(oid, query) {
        return this.apiDistributorService.pagination(oid, query);
    }
    list(oid, query) {
        return this.apiDistributorService.getMany(oid, query);
    }
    findOne(oid, { id }) {
        return this.apiDistributorService.getOne(oid, id);
    }
    async createOne(oid, body) {
        return await this.apiDistributorService.createOne(oid, body);
    }
    async updateOne(oid, { id }, body) {
        return await this.apiDistributorService.updateOne(oid, id, body);
    }
};
__decorate([
    (0, common_1.Get)('pagination'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof request_1.DistributorPaginationQuery !== "undefined" && request_1.DistributorPaginationQuery) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ApiDistributorController.prototype, "pagination", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof request_1.DistributorGetManyQuery !== "undefined" && request_1.DistributorGetManyQuery) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], ApiDistributorController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_d = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], ApiDistributorController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof request_1.DistributorCreateBody !== "undefined" && request_1.DistributorCreateBody) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], ApiDistributorController.prototype, "createOne", null);
__decorate([
    (0, common_1.Patch)('update/:id'),
    (0, swagger_1.ApiParam)({ name: 'id', example: 1 }),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_f = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _f : Object, typeof (_g = typeof request_1.DistributorUpdateBody !== "undefined" && request_1.DistributorUpdateBody) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], ApiDistributorController.prototype, "updateOne", null);
ApiDistributorController = __decorate([
    (0, swagger_1.ApiTags)('Distributor'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('distributor'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_distributor_service_1.ApiDistributorService !== "undefined" && api_distributor_service_1.ApiDistributorService) === "function" ? _a : Object])
], ApiDistributorController);
exports.ApiDistributorController = ApiDistributorController;


/***/ }),
/* 132 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiDistributorService = void 0;
const common_1 = __webpack_require__(1);
const repository_1 = __webpack_require__(8);
const business_exception_filter_1 = __webpack_require__(118);
const exception_const_1 = __webpack_require__(89);
let ApiDistributorService = class ApiDistributorService {
    constructor(distributorRepository) {
        this.distributorRepository = distributorRepository;
    }
    async pagination(oid, query) {
        var _a, _b, _c;
        return await this.distributorRepository.pagination({
            page: query.page,
            limit: query.limit,
            criteria: {
                oid,
                isActive: (_a = query.filter) === null || _a === void 0 ? void 0 : _a.isActive,
                fullNameEn: ['LIKE', (_b = query.filter) === null || _b === void 0 ? void 0 : _b.fullNameEn],
                phone: ['LIKE', (_c = query.filter) === null || _c === void 0 ? void 0 : _c.phone],
            },
            order: query.sort || { id: 'DESC' },
        });
    }
    async getMany(oid, { limit, filter }) {
        return await this.distributorRepository.find({
            criteria: {
                oid,
                fullNameEn: ['LIKE', filter === null || filter === void 0 ? void 0 : filter.fullNameEn],
                phone: ['LIKE', filter === null || filter === void 0 ? void 0 : filter.phone],
            },
            limit,
        });
    }
    async getOne(oid, id) {
        const distributor = await this.distributorRepository.findOne({ oid, id });
        if (!distributor)
            throw new business_exception_filter_1.BusinessException(exception_const_1.ErrorMessage.Distributor.NotFound);
        return distributor;
    }
    async createOne(oid, body) {
        return await this.distributorRepository.insertOne(Object.assign({ oid }, body));
    }
    async updateOne(oid, id, body) {
        const { affected } = await this.distributorRepository.updateOne({ id, oid }, body);
        if (affected !== 1)
            throw new Error(exception_const_1.ErrorMessage.Database.UpdateFailed);
        return await this.distributorRepository.findOne({ id });
    }
};
ApiDistributorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.DistributorRepository !== "undefined" && repository_1.DistributorRepository) === "function" ? _a : Object])
], ApiDistributorService);
exports.ApiDistributorService = ApiDistributorService;


/***/ }),
/* 133 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(134), exports);
__exportStar(__webpack_require__(135), exports);
__exportStar(__webpack_require__(136), exports);


/***/ }),
/* 134 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DistributorGetManyQuery = exports.DistributorPaginationQuery = void 0;
const swagger_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
const pagination_query_1 = __webpack_require__(100);
const distributor_options_request_1 = __webpack_require__(135);
class DistributorPaginationQuery extends pagination_query_1.PaginationQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: distributor_options_request_1.DistributorFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => distributor_options_request_1.DistributorFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_a = typeof distributor_options_request_1.DistributorFilterQuery !== "undefined" && distributor_options_request_1.DistributorFilterQuery) === "function" ? _a : Object)
], DistributorPaginationQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: distributor_options_request_1.DistributorSortQuery }),
    (0, class_transformer_1.Expose)({ name: 'sort' }),
    (0, class_transformer_1.Type)(() => distributor_options_request_1.DistributorSortQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_b = typeof distributor_options_request_1.DistributorSortQuery !== "undefined" && distributor_options_request_1.DistributorSortQuery) === "function" ? _b : Object)
], DistributorPaginationQuery.prototype, "sort", void 0);
exports.DistributorPaginationQuery = DistributorPaginationQuery;
class DistributorGetManyQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'limit', example: 10 }),
    (0, class_transformer_1.Expose)({ name: 'limit' }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(3),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], DistributorGetManyQuery.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: distributor_options_request_1.DistributorFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => distributor_options_request_1.DistributorFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_c = typeof distributor_options_request_1.DistributorFilterQuery !== "undefined" && distributor_options_request_1.DistributorFilterQuery) === "function" ? _c : Object)
], DistributorGetManyQuery.prototype, "filter", void 0);
exports.DistributorGetManyQuery = DistributorGetManyQuery;


/***/ }),
/* 135 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DistributorSortQuery = exports.DistributorFilterQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class DistributorFilterQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[is_active]', example: false }),
    (0, class_transformer_1.Expose)({ name: 'is_active' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DistributorFilterQuery.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[full_name_en]', example: 'Đỗ' }),
    (0, class_transformer_1.Expose)({ name: 'full_name_en' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DistributorFilterQuery.prototype, "fullNameEn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[phone]', example: '09860' }),
    (0, class_transformer_1.Expose)({ name: 'phone' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DistributorFilterQuery.prototype, "phone", void 0);
exports.DistributorFilterQuery = DistributorFilterQuery;
class DistributorSortQuery extends pagination_query_1.SortQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'sort[debt]', example: 'DESC' }),
    (0, class_transformer_1.Expose)({ name: 'debt' }),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    __metadata("design:type", String)
], DistributorSortQuery.prototype, "debt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'sort[full_name_en]', example: 'DESC' }),
    (0, class_transformer_1.Expose)({ name: 'full_name_en' }),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    __metadata("design:type", String)
], DistributorSortQuery.prototype, "fullNameEn", void 0);
exports.DistributorSortQuery = DistributorSortQuery;


/***/ }),
/* 136 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DistributorUpdateBody = exports.DistributorCreateBody = void 0;
const swagger_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
const class_validator_custom_1 = __webpack_require__(123);
class DistributorCreateBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'full_name_vi', example: 'Ngô Nhật Dương' }),
    (0, class_transformer_1.Expose)({ name: 'full_name_vi' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DistributorCreateBody.prototype, "fullNameVi", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'full_name_en', example: 'Ngo Nhat Duong' }),
    (0, class_transformer_1.Expose)({ name: 'full_name_en' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DistributorCreateBody.prototype, "fullNameEn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'phone', default: '0986123456' }),
    (0, class_transformer_1.Expose)({ name: 'phone' }),
    (0, class_validator_1.Validate)(class_validator_custom_1.IsPhone),
    __metadata("design:type", String)
], DistributorCreateBody.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Tỉnh Lâm Đồng' }),
    (0, class_transformer_1.Expose)({ name: 'address_province' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DistributorCreateBody.prototype, "addressProvince", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Huyện Cát Tiên' }),
    (0, class_transformer_1.Expose)({ name: 'address_district' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DistributorCreateBody.prototype, "addressDistrict", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Xã Tiên Hoàng' }),
    (0, class_transformer_1.Expose)({ name: 'address_ward' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DistributorCreateBody.prototype, "addressWard", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Thôn Trần Lệ Mai' }),
    (0, class_transformer_1.Expose)({ name: 'address_street' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DistributorCreateBody.prototype, "addressStreet", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'note', example: 'Khách hàng không' }),
    (0, class_transformer_1.Expose)({ name: 'note' }),
    __metadata("design:type", String)
], DistributorCreateBody.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'is_active', example: true }),
    (0, class_transformer_1.Expose)({ name: 'is_active' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DistributorCreateBody.prototype, "isActive", void 0);
exports.DistributorCreateBody = DistributorCreateBody;
class DistributorUpdateBody extends (0, swagger_1.PartialType)(DistributorCreateBody) {
}
exports.DistributorUpdateBody = DistributorUpdateBody;


/***/ }),
/* 137 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiEmployeeModule = void 0;
const common_1 = __webpack_require__(1);
const api_employee_controller_1 = __webpack_require__(138);
const api_employee_service_1 = __webpack_require__(140);
let ApiEmployeeModule = class ApiEmployeeModule {
};
ApiEmployeeModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_employee_controller_1.ApiEmployeeController],
        providers: [api_employee_service_1.ApiEmployeeService],
        exports: [],
    })
], ApiEmployeeModule);
exports.ApiEmployeeModule = ApiEmployeeModule;


/***/ }),
/* 138 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiEmployeeController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(10);
const variable_1 = __webpack_require__(17);
const request_decorator_1 = __webpack_require__(96);
const roles_guard_1 = __webpack_require__(139);
const api_employee_service_1 = __webpack_require__(140);
const request_1 = __webpack_require__(141);
const swagger_2 = __webpack_require__(94);
let ApiEmployeeController = class ApiEmployeeController {
    constructor(apiEmployeeService) {
        this.apiEmployeeService = apiEmployeeService;
    }
    async pagination(oid, query) {
        return await this.apiEmployeeService.pagination(oid, query);
    }
    async detail(oid, { id }) {
        return await this.apiEmployeeService.getOne(oid, id);
    }
    async update(oid, { id }, body) {
        return await this.apiEmployeeService.updateOne(oid, id, body);
    }
};
__decorate([
    (0, common_1.Get)('pagination'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof request_1.EmployeePaginationQuery !== "undefined" && request_1.EmployeePaginationQuery) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], ApiEmployeeController.prototype, "pagination", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], ApiEmployeeController.prototype, "detail", null);
__decorate([
    (0, common_1.Patch)('update/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_d = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _d : Object, typeof (_e = typeof request_1.EmployeeUpdateBody !== "undefined" && request_1.EmployeeUpdateBody) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], ApiEmployeeController.prototype, "update", null);
ApiEmployeeController = __decorate([
    (0, swagger_1.ApiTags)('Employee'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, roles_guard_1.Roles)(variable_1.ERole.Admin),
    (0, common_1.Controller)('employee'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_employee_service_1.ApiEmployeeService !== "undefined" && api_employee_service_1.ApiEmployeeService) === "function" ? _a : Object])
], ApiEmployeeController);
exports.ApiEmployeeController = ApiEmployeeController;


/***/ }),
/* 139 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = exports.Roles = void 0;
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(3);
const Roles = (...roles) => (0, common_1.SetMetadata)('roles_guard', roles);
exports.Roles = Roles;
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride('roles_guard', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles)
            return true;
        const request = context.switchToHttp().getRequest();
        const { role } = request.tokenPayload;
        return requiredRoles.includes(role);
    }
};
RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RolesGuard);
exports.RolesGuard = RolesGuard;


/***/ }),
/* 140 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiEmployeeService = void 0;
const common_1 = __webpack_require__(1);
const repository_1 = __webpack_require__(8);
let ApiEmployeeService = class ApiEmployeeService {
    constructor(employeeRepository) {
        this.employeeRepository = employeeRepository;
    }
    async pagination(oid, query) {
        return await this.employeeRepository.pagination({
            page: query.page,
            limit: query.limit,
            criteria: { oid },
        });
    }
    async getOne(oid, id) {
        return await this.employeeRepository.findOne({ oid, id });
    }
    async updateOne(oid, id, body) {
        return await this.employeeRepository.findOne({ id });
    }
};
ApiEmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.EmployeeRepository !== "undefined" && repository_1.EmployeeRepository) === "function" ? _a : Object])
], ApiEmployeeService);
exports.ApiEmployeeService = ApiEmployeeService;


/***/ }),
/* 141 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(142), exports);
__exportStar(__webpack_require__(143), exports);


/***/ }),
/* 142 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmployeePaginationQuery = void 0;
const pagination_query_1 = __webpack_require__(100);
class EmployeePaginationQuery extends pagination_query_1.PaginationQuery {
}
exports.EmployeePaginationQuery = EmployeePaginationQuery;


/***/ }),
/* 143 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmployeeUpdateBody = exports.EmployeeCreateBody = void 0;
const swagger_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class EmployeeCreateBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'nhatduong2019' }),
    (0, class_transformer_1.Expose)({ name: 'username' }),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], EmployeeCreateBody.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Abc@123456' }),
    (0, class_transformer_1.Expose)({ name: 'password' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], EmployeeCreateBody.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ngô Nhật Dương' }),
    (0, class_transformer_1.Expose)({ name: 'full_name' }),
    __metadata("design:type", String)
], EmployeeCreateBody.prototype, "fullName", void 0);
exports.EmployeeCreateBody = EmployeeCreateBody;
class EmployeeUpdateBody extends (0, swagger_1.PartialType)(EmployeeCreateBody) {
}
exports.EmployeeUpdateBody = EmployeeUpdateBody;


/***/ }),
/* 144 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiInvoiceItemModule = void 0;
const common_1 = __webpack_require__(1);
const api_invoice_item_controller_1 = __webpack_require__(145);
const api_invoice_item_service_1 = __webpack_require__(146);
let ApiInvoiceItemModule = class ApiInvoiceItemModule {
};
ApiInvoiceItemModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_invoice_item_controller_1.ApiInvoiceItemController],
        providers: [api_invoice_item_service_1.ApiInvoiceItemService],
    })
], ApiInvoiceItemModule);
exports.ApiInvoiceItemModule = ApiInvoiceItemModule;


/***/ }),
/* 145 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiInvoiceItemController = void 0;
const common_1 = __webpack_require__(1);
const route_params_decorator_1 = __webpack_require__(93);
const swagger_1 = __webpack_require__(10);
const request_decorator_1 = __webpack_require__(96);
const api_invoice_item_service_1 = __webpack_require__(146);
const request_1 = __webpack_require__(147);
let ApiInvoiceItemController = class ApiInvoiceItemController {
    constructor(apiInvoiceItemService) {
        this.apiInvoiceItemService = apiInvoiceItemService;
    }
    async pagination(oid, query) {
        return await this.apiInvoiceItemService.pagination(oid, query);
    }
};
__decorate([
    (0, common_1.Get)('pagination'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, route_params_decorator_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof request_1.InvoiceItemPaginationQuery !== "undefined" && request_1.InvoiceItemPaginationQuery) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], ApiInvoiceItemController.prototype, "pagination", null);
ApiInvoiceItemController = __decorate([
    (0, swagger_1.ApiTags)('InvoiceItem'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('invoice-item'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_invoice_item_service_1.ApiInvoiceItemService !== "undefined" && api_invoice_item_service_1.ApiInvoiceItemService) === "function" ? _a : Object])
], ApiInvoiceItemController);
exports.ApiInvoiceItemController = ApiInvoiceItemController;


/***/ }),
/* 146 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiInvoiceItemService = void 0;
const common_1 = __webpack_require__(1);
const object_helper_1 = __webpack_require__(36);
const variable_1 = __webpack_require__(17);
const repository_1 = __webpack_require__(8);
let ApiInvoiceItemService = class ApiInvoiceItemService {
    constructor(invoiceItemRepository, invoiceRepository, productBatchRepository, procedureRepository) {
        this.invoiceItemRepository = invoiceItemRepository;
        this.invoiceRepository = invoiceRepository;
        this.productBatchRepository = productBatchRepository;
        this.procedureRepository = procedureRepository;
    }
    async pagination(oid, query) {
        var _a, _b;
        const { page, limit, filter, relations, sort } = query;
        console.log('🚀 ~ file: api-invoice-item.service.ts:19 ~ ApiInvoiceItemService ~ pagination ~ query:', query);
        const { total, data } = await this.invoiceItemRepository.pagination({
            page,
            limit,
            criteria: {
                oid,
                customerId: filter === null || filter === void 0 ? void 0 : filter.customerId,
                referenceId: filter === null || filter === void 0 ? void 0 : filter.referenceId,
                type: filter === null || filter === void 0 ? void 0 : filter.type,
            },
            order: sort || { id: 'DESC' },
        });
        const invoiceIds = (0, object_helper_1.uniqueArray)(data.map((i) => i.invoiceId));
        const productBatchIds = (0, object_helper_1.uniqueArray)(data.filter((i) => i.type === variable_1.InvoiceItemType.ProductBatch)
            .map((i) => i.referenceId));
        const procedureIds = (0, object_helper_1.uniqueArray)(data.filter((i) => i.type === variable_1.InvoiceItemType.Procedure)
            .map((i) => i.referenceId));
        const [invoices, productBatches, procedures] = await Promise.all([
            (relations === null || relations === void 0 ? void 0 : relations.invoice) && invoiceIds.length
                ? this.invoiceRepository.findMany({ ids: invoiceIds }, { customer: !!((_a = relations === null || relations === void 0 ? void 0 : relations.invoice) === null || _a === void 0 ? void 0 : _a.customer) }) : [],
            (relations === null || relations === void 0 ? void 0 : relations.productBatch) && productBatchIds.length
                ? this.productBatchRepository.findMany({ ids: productBatchIds }, { product: !!((_b = relations === null || relations === void 0 ? void 0 : relations.productBatch) === null || _b === void 0 ? void 0 : _b.product) }) : [],
            (relations === null || relations === void 0 ? void 0 : relations.procedure) && procedureIds.length
                ? this.procedureRepository.findMany({ ids: procedureIds }) : [],
        ]);
        data.forEach((ii) => {
            ii.productBatch = productBatches.find((item) => {
                return ii.type === variable_1.InvoiceItemType.ProductBatch && item.id === ii.referenceId;
            });
            ii.procedure = procedures.find((item) => {
                return ii.type === variable_1.InvoiceItemType.Procedure && item.id === ii.referenceId;
            });
            ii.invoice = invoices.find((item) => item.id === ii.invoiceId);
        });
        return { page, limit, total, data };
    }
};
ApiInvoiceItemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.InvoiceItemRepository !== "undefined" && repository_1.InvoiceItemRepository) === "function" ? _a : Object, typeof (_b = typeof repository_1.InvoiceRepository !== "undefined" && repository_1.InvoiceRepository) === "function" ? _b : Object, typeof (_c = typeof repository_1.ProductBatchRepository !== "undefined" && repository_1.ProductBatchRepository) === "function" ? _c : Object, typeof (_d = typeof repository_1.ProcedureRepository !== "undefined" && repository_1.ProcedureRepository) === "function" ? _d : Object])
], ApiInvoiceItemService);
exports.ApiInvoiceItemService = ApiInvoiceItemService;


/***/ }),
/* 147 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(148), exports);
__exportStar(__webpack_require__(149), exports);


/***/ }),
/* 148 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceItemSortQuery = exports.InvoiceItemRelationsQuery = exports.ProductBatchRelationsQuery = exports.InvoiceRelationsQuery = exports.InvoiceItemFilterQuery = void 0;
const swagger_1 = __webpack_require__(10);
const typescript_helper_1 = __webpack_require__(102);
const variable_1 = __webpack_require__(17);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class InvoiceItemFilterQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[reference_id]' }),
    (0, class_transformer_1.Expose)({ name: 'reference_id' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceItemFilterQuery.prototype, "referenceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[customer_id]' }),
    (0, class_transformer_1.Expose)({ name: 'customer_id' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceItemFilterQuery.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        name: 'filter[type]',
        enum: (0, typescript_helper_1.valuesEnum)(variable_1.InvoiceItemType),
        description: JSON.stringify((0, typescript_helper_1.objectEnum)(variable_1.InvoiceItemType)),
    }),
    (0, class_transformer_1.Expose)({ name: 'type' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsEnum)(variable_1.InvoiceItemType),
    __metadata("design:type", typeof (_a = typeof variable_1.InvoiceItemType !== "undefined" && variable_1.InvoiceItemType) === "function" ? _a : Object)
], InvoiceItemFilterQuery.prototype, "type", void 0);
exports.InvoiceItemFilterQuery = InvoiceItemFilterQuery;
class InvoiceRelationsQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[invoice][customer]', enum: ['true', 'false'] }),
    (0, class_transformer_1.Expose)({ name: 'customer' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], InvoiceRelationsQuery.prototype, "customer", void 0);
exports.InvoiceRelationsQuery = InvoiceRelationsQuery;
class ProductBatchRelationsQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[product_batch][product]', enum: ['true', 'false'], example: 'false' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductBatchRelationsQuery.prototype, "product", void 0);
exports.ProductBatchRelationsQuery = ProductBatchRelationsQuery;
class InvoiceItemRelationsQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: InvoiceRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'invoice' }),
    (0, class_transformer_1.Type)(() => InvoiceRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", InvoiceRelationsQuery)
], InvoiceItemRelationsQuery.prototype, "invoice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[procedure]' }),
    (0, class_transformer_1.Expose)({ name: 'procedure' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], InvoiceItemRelationsQuery.prototype, "procedure", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ProductBatchRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'product_batch' }),
    (0, class_transformer_1.Type)(() => ProductBatchRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", ProductBatchRelationsQuery)
], InvoiceItemRelationsQuery.prototype, "productBatch", void 0);
exports.InvoiceItemRelationsQuery = InvoiceItemRelationsQuery;
class InvoiceItemSortQuery extends pagination_query_1.SortQuery {
}
exports.InvoiceItemSortQuery = InvoiceItemSortQuery;


/***/ }),
/* 149 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceItemPaginationQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
const invoice_item_options_request_1 = __webpack_require__(148);
class InvoiceItemPaginationQuery extends pagination_query_1.PaginationQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: invoice_item_options_request_1.InvoiceItemFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => invoice_item_options_request_1.InvoiceItemFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_a = typeof invoice_item_options_request_1.InvoiceItemFilterQuery !== "undefined" && invoice_item_options_request_1.InvoiceItemFilterQuery) === "function" ? _a : Object)
], InvoiceItemPaginationQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: invoice_item_options_request_1.InvoiceItemRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => invoice_item_options_request_1.InvoiceItemRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_b = typeof invoice_item_options_request_1.InvoiceItemRelationsQuery !== "undefined" && invoice_item_options_request_1.InvoiceItemRelationsQuery) === "function" ? _b : Object)
], InvoiceItemPaginationQuery.prototype, "relations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: invoice_item_options_request_1.InvoiceItemSortQuery }),
    (0, class_transformer_1.Expose)({ name: 'sort' }),
    (0, class_transformer_1.Type)(() => invoice_item_options_request_1.InvoiceItemSortQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_c = typeof invoice_item_options_request_1.InvoiceItemSortQuery !== "undefined" && invoice_item_options_request_1.InvoiceItemSortQuery) === "function" ? _c : Object)
], InvoiceItemPaginationQuery.prototype, "sort", void 0);
exports.InvoiceItemPaginationQuery = InvoiceItemPaginationQuery;


/***/ }),
/* 150 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiInvoiceModule = void 0;
const common_1 = __webpack_require__(1);
const api_invoice_controller_1 = __webpack_require__(151);
const api_invoice_service_1 = __webpack_require__(152);
let ApiInvoiceModule = class ApiInvoiceModule {
};
ApiInvoiceModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_invoice_controller_1.ApiInvoiceController],
        providers: [api_invoice_service_1.ApiInvoiceService],
    })
], ApiInvoiceModule);
exports.ApiInvoiceModule = ApiInvoiceModule;


/***/ }),
/* 151 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiInvoiceController = void 0;
const common_1 = __webpack_require__(1);
const route_params_decorator_1 = __webpack_require__(93);
const swagger_1 = __webpack_require__(10);
const swagger_2 = __webpack_require__(94);
const request_decorator_1 = __webpack_require__(96);
const api_invoice_service_1 = __webpack_require__(152);
const request_1 = __webpack_require__(153);
let ApiInvoiceController = class ApiInvoiceController {
    constructor(apiInvoiceService) {
        this.apiInvoiceService = apiInvoiceService;
    }
    async pagination(oid, query) {
        return await this.apiInvoiceService.pagination(oid, query);
    }
    async detail(oid, { id }, query) {
        return await this.apiInvoiceService.getOne(oid, id, query);
    }
};
__decorate([
    (0, common_1.Get)('pagination'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, route_params_decorator_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof request_1.InvoicePaginationQuery !== "undefined" && request_1.InvoicePaginationQuery) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], ApiInvoiceController.prototype, "pagination", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, route_params_decorator_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _c : Object, typeof (_d = typeof request_1.InvoiceGetOneQuery !== "undefined" && request_1.InvoiceGetOneQuery) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], ApiInvoiceController.prototype, "detail", null);
ApiInvoiceController = __decorate([
    (0, swagger_1.ApiTags)('Invoice'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('invoice'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_invoice_service_1.ApiInvoiceService !== "undefined" && api_invoice_service_1.ApiInvoiceService) === "function" ? _a : Object])
], ApiInvoiceController);
exports.ApiInvoiceController = ApiInvoiceController;


/***/ }),
/* 152 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiInvoiceService = void 0;
const common_1 = __webpack_require__(1);
const repository_1 = __webpack_require__(8);
let ApiInvoiceService = class ApiInvoiceService {
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }
    async pagination(oid, query) {
        var _a, _b, _c, _d, _e;
        return await this.invoiceRepository.pagination({
            page: query.page,
            limit: query.limit,
            criteria: {
                oid,
                customerId: (_a = query.filter) === null || _a === void 0 ? void 0 : _a.customerId,
                fromTime: (_b = query.filter) === null || _b === void 0 ? void 0 : _b.fromTime,
                toTime: (_c = query.filter) === null || _c === void 0 ? void 0 : _c.toTime,
                paymentStatus: (_d = query.filter) === null || _d === void 0 ? void 0 : _d.paymentStatus,
            },
            relations: { customer: (_e = query.relations) === null || _e === void 0 ? void 0 : _e.customer },
            order: query.sort || { id: 'DESC' },
        });
    }
    async getOne(oid, id, { relations }) {
        return await this.invoiceRepository.queryOneBy({ oid, id }, {
            customer: !!(relations === null || relations === void 0 ? void 0 : relations.customer),
            invoiceItems: (relations === null || relations === void 0 ? void 0 : relations.invoiceItems) && { procedure: true, productBatch: { product: true } },
        });
    }
};
ApiInvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.InvoiceRepository !== "undefined" && repository_1.InvoiceRepository) === "function" ? _a : Object])
], ApiInvoiceService);
exports.ApiInvoiceService = ApiInvoiceService;


/***/ }),
/* 153 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(154), exports);
__exportStar(__webpack_require__(155), exports);


/***/ }),
/* 154 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceGetOneQuery = exports.InvoicePaginationQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
const invoice_options_request_1 = __webpack_require__(155);
class InvoicePaginationQuery extends pagination_query_1.PaginationQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: invoice_options_request_1.InvoiceFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => invoice_options_request_1.InvoiceFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_a = typeof invoice_options_request_1.InvoiceFilterQuery !== "undefined" && invoice_options_request_1.InvoiceFilterQuery) === "function" ? _a : Object)
], InvoicePaginationQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: invoice_options_request_1.InvoiceRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => invoice_options_request_1.InvoiceRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_b = typeof invoice_options_request_1.InvoiceRelationsQuery !== "undefined" && invoice_options_request_1.InvoiceRelationsQuery) === "function" ? _b : Object)
], InvoicePaginationQuery.prototype, "relations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: invoice_options_request_1.InvoiceSortQuery }),
    (0, class_transformer_1.Expose)({ name: 'sort' }),
    (0, class_transformer_1.Type)(() => invoice_options_request_1.InvoiceSortQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_c = typeof invoice_options_request_1.InvoiceSortQuery !== "undefined" && invoice_options_request_1.InvoiceSortQuery) === "function" ? _c : Object)
], InvoicePaginationQuery.prototype, "sort", void 0);
exports.InvoicePaginationQuery = InvoicePaginationQuery;
class InvoiceGetOneQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: invoice_options_request_1.InvoiceRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'select' }),
    (0, class_transformer_1.Type)(() => invoice_options_request_1.InvoiceRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_d = typeof invoice_options_request_1.InvoiceRelationsQuery !== "undefined" && invoice_options_request_1.InvoiceRelationsQuery) === "function" ? _d : Object)
], InvoiceGetOneQuery.prototype, "relations", void 0);
exports.InvoiceGetOneQuery = InvoiceGetOneQuery;


/***/ }),
/* 155 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceSortQuery = exports.InvoiceRelationsQuery = exports.InvoiceFilterQuery = void 0;
const swagger_1 = __webpack_require__(10);
const typescript_helper_1 = __webpack_require__(102);
const variable_1 = __webpack_require__(17);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class InvoiceFilterQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[customer_id]' }),
    (0, class_transformer_1.Expose)({ name: 'customer_id' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceFilterQuery.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[from_time]' }),
    (0, class_transformer_1.Expose)({ name: 'from_time' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceFilterQuery.prototype, "fromTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[to_time]' }),
    (0, class_transformer_1.Expose)({ name: 'to_time' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InvoiceFilterQuery.prototype, "toTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[payment_status]', enum: (0, typescript_helper_1.valuesEnum)(variable_1.PaymentStatus), example: variable_1.PaymentStatus.Full }),
    (0, class_transformer_1.Expose)({ name: 'payment_status' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsEnum)(variable_1.PaymentStatus),
    __metadata("design:type", typeof (_a = typeof variable_1.PaymentStatus !== "undefined" && variable_1.PaymentStatus) === "function" ? _a : Object)
], InvoiceFilterQuery.prototype, "paymentStatus", void 0);
exports.InvoiceFilterQuery = InvoiceFilterQuery;
class InvoiceRelationsQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[customer]' }),
    (0, class_transformer_1.Expose)({ name: 'customer' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], InvoiceRelationsQuery.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[invoice_items]' }),
    (0, class_transformer_1.Expose)({ name: 'invoice_items' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], InvoiceRelationsQuery.prototype, "invoiceItems", void 0);
exports.InvoiceRelationsQuery = InvoiceRelationsQuery;
class InvoiceSortQuery extends pagination_query_1.SortQuery {
}
exports.InvoiceSortQuery = InvoiceSortQuery;


/***/ }),
/* 156 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiOrganizationModule = void 0;
const common_1 = __webpack_require__(1);
const api_organization_controller_1 = __webpack_require__(157);
const api_organization_service_1 = __webpack_require__(158);
let ApiOrganizationModule = class ApiOrganizationModule {
};
ApiOrganizationModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_organization_controller_1.ApiOrganizationController],
        providers: [api_organization_service_1.ApiOrganizationService],
    })
], ApiOrganizationModule);
exports.ApiOrganizationModule = ApiOrganizationModule;


/***/ }),
/* 157 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiOrganizationController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(10);
const request_decorator_1 = __webpack_require__(96);
const api_organization_service_1 = __webpack_require__(158);
const organization_settings_request_1 = __webpack_require__(159);
const organization_update_body_1 = __webpack_require__(160);
let ApiOrganizationController = class ApiOrganizationController {
    constructor(apiOrganizationService) {
        this.apiOrganizationService = apiOrganizationService;
    }
    async detail(oid) {
        return await this.apiOrganizationService.findOne(+oid);
    }
    async update(oid, body) {
        return await this.apiOrganizationService.updateOne(oid, body);
    }
    async getSettings(oid) {
        return await this.apiOrganizationService.getAllSettings(oid);
    }
    async upsertSetting(oid, { type }, body) {
        await this.apiOrganizationService.upsertSetting(oid, type, body);
        return { success: true };
    }
};
__decorate([
    (0, common_1.Get)('detail'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ApiOrganizationController.prototype, "detail", null);
__decorate([
    (0, common_1.Patch)('update'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof organization_update_body_1.OrganizationUpdateBody !== "undefined" && organization_update_body_1.OrganizationUpdateBody) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], ApiOrganizationController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('settings/get'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ApiOrganizationController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Post)('settings/upsert/:type'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof organization_settings_request_1.OrganizationSettingUpdateParams !== "undefined" && organization_settings_request_1.OrganizationSettingUpdateParams) === "function" ? _c : Object, typeof (_d = typeof organization_settings_request_1.OrganizationSettingUpdateBody !== "undefined" && organization_settings_request_1.OrganizationSettingUpdateBody) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], ApiOrganizationController.prototype, "upsertSetting", null);
ApiOrganizationController = __decorate([
    (0, swagger_1.ApiTags)('Organization'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('organization'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_organization_service_1.ApiOrganizationService !== "undefined" && api_organization_service_1.ApiOrganizationService) === "function" ? _a : Object])
], ApiOrganizationController);
exports.ApiOrganizationController = ApiOrganizationController;


/***/ }),
/* 158 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiOrganizationService = void 0;
const common_1 = __webpack_require__(1);
const repository_1 = __webpack_require__(8);
const exception_const_1 = __webpack_require__(89);
let ApiOrganizationService = class ApiOrganizationService {
    constructor(organizationRepository) {
        this.organizationRepository = organizationRepository;
    }
    async findOne(id) {
        return await this.organizationRepository.findOne(id);
    }
    async updateOne(id, body) {
        const { affected } = await this.organizationRepository.update(id, body);
        if (affected !== 1)
            throw new Error(exception_const_1.ErrorMessage.Database.UpdateFailed);
        return await this.organizationRepository.findOne(id);
    }
    async getAllSettings(oid) {
        return await this.organizationRepository.getAllSetting(oid);
    }
    async upsertSetting(oid, type, body) {
        return await this.organizationRepository.upsertSetting(oid, type, body.data);
    }
};
ApiOrganizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.OrganizationRepository !== "undefined" && repository_1.OrganizationRepository) === "function" ? _a : Object])
], ApiOrganizationService);
exports.ApiOrganizationService = ApiOrganizationService;


/***/ }),
/* 159 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationSettingUpdateBody = exports.OrganizationSettingUpdateParams = exports.OrganizationSettingGetQuery = void 0;
const swagger_1 = __webpack_require__(10);
const typescript_helper_1 = __webpack_require__(102);
const organization_setting_entity_1 = __webpack_require__(29);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class OrganizationSettingGetQuery {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        name: 'types',
        type: 'string',
        example: JSON.stringify((0, typescript_helper_1.keysEnum)(organization_setting_entity_1.OrganizationSettingType)),
        description: JSON.stringify((0, typescript_helper_1.keysEnum)(organization_setting_entity_1.OrganizationSettingType)),
    }),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            return JSON.parse(value);
        }
        catch (error) {
            return '';
        }
    }),
    (0, class_transformer_1.Expose)({ name: 'types' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsIn)((0, typescript_helper_1.keysEnum)(organization_setting_entity_1.OrganizationSettingType), { each: true }),
    __metadata("design:type", Array)
], OrganizationSettingGetQuery.prototype, "types", void 0);
exports.OrganizationSettingGetQuery = OrganizationSettingGetQuery;
class OrganizationSettingUpdateParams {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'type', enum: organization_setting_entity_1.OrganizationSettingType, example: organization_setting_entity_1.OrganizationSettingType.PRODUCT_GROUP }),
    (0, class_transformer_1.Expose)({ name: 'type' }),
    (0, class_validator_1.IsEnum)(organization_setting_entity_1.OrganizationSettingType),
    __metadata("design:type", typeof (_a = typeof organization_setting_entity_1.OrganizationSettingType !== "undefined" && organization_setting_entity_1.OrganizationSettingType) === "function" ? _a : Object)
], OrganizationSettingUpdateParams.prototype, "type", void 0);
exports.OrganizationSettingUpdateParams = OrganizationSettingUpdateParams;
class OrganizationSettingUpdateBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        name: 'data',
        example: JSON.stringify({
            1: 'Kháng sinh - Kháng Virus',
            2: 'Dị ứng',
            3: 'Thần Kinh',
            4: 'Tiêu Hóa',
            5: 'Cơ Xương Khớp',
            6: 'Giảm Đau - Hạ Sốt - NSAID',
            7: 'Corticoid',
            8: 'Thực Phẩm Chức Năng',
            9: 'Dinh Dưỡng',
            10: 'Hô hấp',
            11: 'Tim Mạch',
            12: 'Da Liễu',
        }),
    }),
    (0, class_transformer_1.Expose)({ name: 'data' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrganizationSettingUpdateBody.prototype, "data", void 0);
exports.OrganizationSettingUpdateBody = OrganizationSettingUpdateBody;


/***/ }),
/* 160 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationUpdateBody = void 0;
const swagger_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class OrganizationUpdateBody {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'organization_name', example: 'Phòng khám đa khoa Việt Mỹ' }),
    (0, class_transformer_1.Expose)({ name: 'organization_name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrganizationUpdateBody.prototype, "organizationName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Tỉnh Lâm Đồng' }),
    (0, class_transformer_1.Expose)({ name: 'address_province' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrganizationUpdateBody.prototype, "addressProvince", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Huyện Cát Tiên' }),
    (0, class_transformer_1.Expose)({ name: 'address_district' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrganizationUpdateBody.prototype, "addressDistrict", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Xã Tiên Hoàng' }),
    (0, class_transformer_1.Expose)({ name: 'address_ward' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrganizationUpdateBody.prototype, "addressWard", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Thôn Trần Lệ Mai' }),
    (0, class_transformer_1.Expose)({ name: 'address_street' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrganizationUpdateBody.prototype, "addressStreet", void 0);
exports.OrganizationUpdateBody = OrganizationUpdateBody;


/***/ }),
/* 161 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiProcedureModule = void 0;
const common_1 = __webpack_require__(1);
const api_procedure_controller_1 = __webpack_require__(162);
const api_procedure_service_1 = __webpack_require__(163);
let ApiProcedureModule = class ApiProcedureModule {
};
ApiProcedureModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_procedure_controller_1.ApiProcedureController],
        providers: [api_procedure_service_1.ApiProcedureService],
    })
], ApiProcedureModule);
exports.ApiProcedureModule = ApiProcedureModule;


/***/ }),
/* 162 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiProcedureController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(10);
const swagger_2 = __webpack_require__(94);
const request_decorator_1 = __webpack_require__(96);
const api_procedure_service_1 = __webpack_require__(163);
const request_1 = __webpack_require__(164);
let ApiProcedureController = class ApiProcedureController {
    constructor(apiProcedureService) {
        this.apiProcedureService = apiProcedureService;
    }
    pagination(oid, query) {
        return this.apiProcedureService.pagination(oid, query);
    }
    async list(oid, query) {
        return await this.apiProcedureService.getMany(oid, query);
    }
    async detail(oid, { id }) {
        return await this.apiProcedureService.getOne(oid, id);
    }
    async create(oid, body) {
        return await this.apiProcedureService.createOne(oid, body);
    }
    async update(oid, { id }, body) {
        return await this.apiProcedureService.updateOne(oid, id, body);
    }
};
__decorate([
    (0, common_1.Get)('pagination'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof request_1.ProcedurePaginationQuery !== "undefined" && request_1.ProcedurePaginationQuery) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ApiProcedureController.prototype, "pagination", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof request_1.ProcedureGetManyQuery !== "undefined" && request_1.ProcedureGetManyQuery) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], ApiProcedureController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_d = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], ApiProcedureController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof request_1.ProcedureCreateBody !== "undefined" && request_1.ProcedureCreateBody) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], ApiProcedureController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('update/:id'),
    (0, swagger_1.ApiParam)({ name: 'id', example: 1 }),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_f = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _f : Object, typeof (_g = typeof request_1.ProcedureUpdateBody !== "undefined" && request_1.ProcedureUpdateBody) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], ApiProcedureController.prototype, "update", null);
ApiProcedureController = __decorate([
    (0, swagger_1.ApiTags)('Procedure'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('procedure'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_procedure_service_1.ApiProcedureService !== "undefined" && api_procedure_service_1.ApiProcedureService) === "function" ? _a : Object])
], ApiProcedureController);
exports.ApiProcedureController = ApiProcedureController;


/***/ }),
/* 163 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiProcedureService = void 0;
const common_1 = __webpack_require__(1);
const repository_1 = __webpack_require__(8);
const exception_const_1 = __webpack_require__(89);
let ApiProcedureService = class ApiProcedureService {
    constructor(procedureService) {
        this.procedureService = procedureService;
    }
    async pagination(oid, query) {
        var _a, _b, _c;
        return this.procedureService.pagination({
            page: query.page,
            limit: query.limit,
            criteria: {
                oid,
                group: (_a = query.filter) === null || _a === void 0 ? void 0 : _a.group,
                isActive: (_b = query.filter) === null || _b === void 0 ? void 0 : _b.isActive,
                searchText: (_c = query.filter) === null || _c === void 0 ? void 0 : _c.searchText,
            },
            order: query.sort || { id: 'DESC' },
        });
    }
    async getMany(oid, query) {
        var _a;
        return await this.procedureService.find({
            criteria: {
                oid,
                searchText: (_a = query.filter) === null || _a === void 0 ? void 0 : _a.searchText,
            },
            limit: query.limit,
        });
    }
    async getOne(oid, id) {
        return await this.procedureService.findOne({ oid, id });
    }
    async createOne(oid, body) {
        return await this.procedureService.insertOne(Object.assign({ oid }, body));
    }
    async updateOne(oid, id, body) {
        const { affected } = await this.procedureService.update({ id, oid }, body);
        if (affected !== 1)
            throw new Error(exception_const_1.ErrorMessage.Database.UpdateFailed);
        return await this.procedureService.findOne({ id });
    }
};
ApiProcedureService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.ProcedureRepository !== "undefined" && repository_1.ProcedureRepository) === "function" ? _a : Object])
], ApiProcedureService);
exports.ApiProcedureService = ApiProcedureService;


/***/ }),
/* 164 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(165), exports);
__exportStar(__webpack_require__(166), exports);
__exportStar(__webpack_require__(167), exports);


/***/ }),
/* 165 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProcedureGetManyQuery = exports.ProcedurePaginationQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
const procedure_options_request_1 = __webpack_require__(166);
class ProcedurePaginationQuery extends pagination_query_1.PaginationQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: procedure_options_request_1.ProcedureFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => procedure_options_request_1.ProcedureFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_a = typeof procedure_options_request_1.ProcedureFilterQuery !== "undefined" && procedure_options_request_1.ProcedureFilterQuery) === "function" ? _a : Object)
], ProcedurePaginationQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: procedure_options_request_1.ProcedureSortQuery }),
    (0, class_transformer_1.Expose)({ name: 'sort' }),
    (0, class_transformer_1.Type)(() => procedure_options_request_1.ProcedureSortQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_b = typeof procedure_options_request_1.ProcedureSortQuery !== "undefined" && procedure_options_request_1.ProcedureSortQuery) === "function" ? _b : Object)
], ProcedurePaginationQuery.prototype, "sort", void 0);
exports.ProcedurePaginationQuery = ProcedurePaginationQuery;
class ProcedureGetManyQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'limit', example: 10 }),
    (0, class_transformer_1.Expose)({ name: 'limit' }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(3),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ProcedureGetManyQuery.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: procedure_options_request_1.ProcedureFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => procedure_options_request_1.ProcedureFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_c = typeof procedure_options_request_1.ProcedureFilterQuery !== "undefined" && procedure_options_request_1.ProcedureFilterQuery) === "function" ? _c : Object)
], ProcedureGetManyQuery.prototype, "filter", void 0);
exports.ProcedureGetManyQuery = ProcedureGetManyQuery;


/***/ }),
/* 166 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProcedureSortQuery = exports.ProcedureFilterQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class ProcedureFilterQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[search_text]' }),
    (0, class_transformer_1.Expose)({ name: 'search_text' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcedureFilterQuery.prototype, "searchText", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[group]' }),
    (0, class_transformer_1.Expose)({ name: 'group' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcedureFilterQuery.prototype, "group", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[is_active]' }),
    (0, class_transformer_1.Expose)({ name: 'is_active' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProcedureFilterQuery.prototype, "isActive", void 0);
exports.ProcedureFilterQuery = ProcedureFilterQuery;
class ProcedureSortQuery extends pagination_query_1.SortQuery {
}
exports.ProcedureSortQuery = ProcedureSortQuery;


/***/ }),
/* 167 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProcedureUpdateBody = exports.ProcedureCreateBody = void 0;
const swagger_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class ProcedureCreateBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'name_vi', example: 'Truyền dịch 500ml' }),
    (0, class_transformer_1.Expose)({ name: 'name_vi' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcedureCreateBody.prototype, "nameVi", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'name_en', example: 'Truyen dich 500ml' }),
    (0, class_transformer_1.Expose)({ name: 'name_en' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcedureCreateBody.prototype, "nameEn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'group', example: 'Tiêm truyền' }),
    (0, class_transformer_1.Expose)({ name: 'group' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcedureCreateBody.prototype, "group", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'price', example: 105000 }),
    (0, class_transformer_1.Expose)({ name: 'price' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProcedureCreateBody.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'consumable_hint' }),
    (0, class_transformer_1.Expose)({ name: 'consumable_hint' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcedureCreateBody.prototype, "consumableHint", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'is_active', example: true }),
    (0, class_transformer_1.Expose)({ name: 'is_active' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProcedureCreateBody.prototype, "isActive", void 0);
exports.ProcedureCreateBody = ProcedureCreateBody;
class ProcedureUpdateBody extends (0, swagger_1.PartialType)(ProcedureCreateBody) {
}
exports.ProcedureUpdateBody = ProcedureUpdateBody;


/***/ }),
/* 168 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiProductBatchModule = void 0;
const common_1 = __webpack_require__(1);
const api_product_batch_controller_1 = __webpack_require__(169);
const api_product_batch_service_1 = __webpack_require__(170);
let ApiProductBatchModule = class ApiProductBatchModule {
};
ApiProductBatchModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_product_batch_controller_1.ApiProductBatchController],
        providers: [api_product_batch_service_1.ApiProductBatchService],
    })
], ApiProductBatchModule);
exports.ApiProductBatchModule = ApiProductBatchModule;


/***/ }),
/* 169 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiProductBatchController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(10);
const swagger_2 = __webpack_require__(94);
const request_decorator_1 = __webpack_require__(96);
const api_product_batch_service_1 = __webpack_require__(170);
const request_1 = __webpack_require__(171);
let ApiProductBatchController = class ApiProductBatchController {
    constructor(apiProductBatchService) {
        this.apiProductBatchService = apiProductBatchService;
    }
    pagination(oid, query) {
        return this.apiProductBatchService.pagination(oid, query);
    }
    async detail(oid, { id }, query) {
        return await this.apiProductBatchService.getOne(oid, id, query);
    }
    async create(oid, body) {
        return await this.apiProductBatchService.createOne(oid, body);
    }
    async update(oid, { id }, body) {
        return await this.apiProductBatchService.updateOne(oid, id, body);
    }
    async delete(oid, { id }) {
        return await this.apiProductBatchService.deleteOne(oid, id);
    }
};
__decorate([
    (0, common_1.Get)('pagination'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof request_1.ProductBatchPaginationQuery !== "undefined" && request_1.ProductBatchPaginationQuery) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ApiProductBatchController.prototype, "pagination", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _c : Object, typeof (_d = typeof request_1.ProductBatchGetOneQuery !== "undefined" && request_1.ProductBatchGetOneQuery) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], ApiProductBatchController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof request_1.ProductBatchInsertBody !== "undefined" && request_1.ProductBatchInsertBody) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], ApiProductBatchController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('update/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_f = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _f : Object, typeof (_g = typeof request_1.ProductBatchUpdateBody !== "undefined" && request_1.ProductBatchUpdateBody) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], ApiProductBatchController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('delete/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_h = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _h : Object]),
    __metadata("design:returntype", Promise)
], ApiProductBatchController.prototype, "delete", null);
ApiProductBatchController = __decorate([
    (0, swagger_1.ApiTags)('Product Batch'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('product-batch'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_product_batch_service_1.ApiProductBatchService !== "undefined" && api_product_batch_service_1.ApiProductBatchService) === "function" ? _a : Object])
], ApiProductBatchController);
exports.ApiProductBatchController = ApiProductBatchController;


/***/ }),
/* 170 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiProductBatchService = void 0;
const common_1 = __webpack_require__(1);
const object_helper_1 = __webpack_require__(36);
const repository_1 = __webpack_require__(8);
const exception_const_1 = __webpack_require__(89);
let ApiProductBatchService = class ApiProductBatchService {
    constructor(productBatchRepository, productRepository) {
        this.productBatchRepository = productBatchRepository;
        this.productRepository = productRepository;
    }
    async pagination(oid, query) {
        var _a, _b, _c;
        const { page, limit, total, data } = await this.productBatchRepository.pagination({
            page: query.page,
            limit: query.limit,
            criteria: {
                oid,
                productId: (_a = query.filter) === null || _a === void 0 ? void 0 : _a.productId,
                quantityZero: (_b = query.filter) === null || _b === void 0 ? void 0 : _b.quantityZero,
            },
            order: query.sort || { id: 'DESC' },
        });
        if (((_c = query.relations) === null || _c === void 0 ? void 0 : _c.product) && data.length) {
            const productIds = (0, object_helper_1.uniqueArray)(data.map((i) => i.productId));
            const products = await this.productRepository.findMany({ ids: productIds });
            data.forEach((i) => i.product = products.find((j) => j.id === i.productId));
        }
        return { page, limit, total, data };
    }
    async getOne(oid, id, query) {
        var _a;
        const productBatch = await this.productBatchRepository.findOne({ oid, id }, { product: (_a = query.relations) === null || _a === void 0 ? void 0 : _a.product });
        return productBatch;
    }
    async createOne(oid, body) {
        const productBatch = await this.productBatchRepository.insertOne(oid, body);
        return productBatch;
    }
    async updateOne(oid, id, body) {
        const { affected } = await this.productBatchRepository.update({ id, oid }, body);
        if (affected !== 1) {
            throw new common_1.HttpException(exception_const_1.ErrorMessage.Database.UpdateFailed, common_1.HttpStatus.BAD_REQUEST);
        }
        const productBatch = await this.productBatchRepository.findOne({ id, oid });
        return productBatch;
    }
    async deleteOne(oid, id) {
        try {
            await this.productBatchRepository.delete(oid, id);
            return { success: true };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
};
ApiProductBatchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.ProductBatchRepository !== "undefined" && repository_1.ProductBatchRepository) === "function" ? _a : Object, typeof (_b = typeof repository_1.ProductRepository !== "undefined" && repository_1.ProductRepository) === "function" ? _b : Object])
], ApiProductBatchService);
exports.ApiProductBatchService = ApiProductBatchService;


/***/ }),
/* 171 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(172), exports);
__exportStar(__webpack_require__(173), exports);
__exportStar(__webpack_require__(174), exports);


/***/ }),
/* 172 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductBatchGetOneQuery = exports.ProductBatchPaginationQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
const product_batch_options_request_1 = __webpack_require__(173);
class ProductBatchPaginationQuery extends pagination_query_1.PaginationQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: product_batch_options_request_1.ProductBatchFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => product_batch_options_request_1.ProductBatchFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_a = typeof product_batch_options_request_1.ProductBatchFilterQuery !== "undefined" && product_batch_options_request_1.ProductBatchFilterQuery) === "function" ? _a : Object)
], ProductBatchPaginationQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: product_batch_options_request_1.ProductBatchRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => product_batch_options_request_1.ProductBatchRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_b = typeof product_batch_options_request_1.ProductBatchRelationsQuery !== "undefined" && product_batch_options_request_1.ProductBatchRelationsQuery) === "function" ? _b : Object)
], ProductBatchPaginationQuery.prototype, "relations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: product_batch_options_request_1.ProductBatchSortQuery }),
    (0, class_transformer_1.Expose)({ name: 'sort' }),
    (0, class_transformer_1.Type)(() => product_batch_options_request_1.ProductBatchSortQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_c = typeof product_batch_options_request_1.ProductBatchSortQuery !== "undefined" && product_batch_options_request_1.ProductBatchSortQuery) === "function" ? _c : Object)
], ProductBatchPaginationQuery.prototype, "sort", void 0);
exports.ProductBatchPaginationQuery = ProductBatchPaginationQuery;
class ProductBatchGetOneQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: product_batch_options_request_1.ProductBatchRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => product_batch_options_request_1.ProductBatchRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_d = typeof product_batch_options_request_1.ProductBatchRelationsQuery !== "undefined" && product_batch_options_request_1.ProductBatchRelationsQuery) === "function" ? _d : Object)
], ProductBatchGetOneQuery.prototype, "relations", void 0);
exports.ProductBatchGetOneQuery = ProductBatchGetOneQuery;


/***/ }),
/* 173 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductBatchSortQuery = exports.ProductBatchRelationsQuery = exports.ProductBatchFilterQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class ProductBatchFilterQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[product_id]' }),
    (0, class_transformer_1.Expose)({ name: 'product_id' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductBatchFilterQuery.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[quantity_zero]' }),
    (0, class_transformer_1.Expose)({ name: 'quantity_zero' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductBatchFilterQuery.prototype, "quantityZero", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[is_active]' }),
    (0, class_transformer_1.Expose)({ name: 'overdue' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductBatchFilterQuery.prototype, "overdue", void 0);
exports.ProductBatchFilterQuery = ProductBatchFilterQuery;
class ProductBatchRelationsQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[product]' }),
    (0, class_transformer_1.Expose)({ name: 'product' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductBatchRelationsQuery.prototype, "product", void 0);
exports.ProductBatchRelationsQuery = ProductBatchRelationsQuery;
class ProductBatchSortQuery extends pagination_query_1.SortQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'sort[expiry_date]' }),
    (0, class_transformer_1.Expose)({ name: 'expiry_date' }),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    __metadata("design:type", String)
], ProductBatchSortQuery.prototype, "expiryDate", void 0);
exports.ProductBatchSortQuery = ProductBatchSortQuery;


/***/ }),
/* 174 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductBatchUpdateBody = exports.ProductBatchInsertBody = void 0;
const swagger_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class ProductBatchInsertBody {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'product_id', example: 12 }),
    (0, class_transformer_1.Expose)({ name: 'product_id' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductBatchInsertBody.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'batch', example: 'ABC12345' }),
    (0, class_transformer_1.Expose)({ name: 'batch' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductBatchInsertBody.prototype, "batch", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'expiry_date', example: 1679995369195 }),
    (0, class_transformer_1.Expose)({ name: 'expiry_date' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductBatchInsertBody.prototype, "expiryDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'cost_price', example: 20000 }),
    (0, class_transformer_1.Expose)({ name: 'cost_price' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductBatchInsertBody.prototype, "costPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'retail_price', example: 59000 }),
    (0, class_transformer_1.Expose)({ name: 'retail_price' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductBatchInsertBody.prototype, "retailPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'wholesale_price', example: 45000 }),
    (0, class_transformer_1.Expose)({ name: 'wholesale_price' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductBatchInsertBody.prototype, "wholesalePrice", void 0);
exports.ProductBatchInsertBody = ProductBatchInsertBody;
class ProductBatchUpdateBody extends (0, swagger_1.OmitType)(ProductBatchInsertBody, ['costPrice', 'productId']) {
}
exports.ProductBatchUpdateBody = ProductBatchUpdateBody;


/***/ }),
/* 175 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiProductMovementModule = void 0;
const common_1 = __webpack_require__(1);
const api_product_movement_controller_1 = __webpack_require__(176);
const api_product_movement_service_1 = __webpack_require__(177);
let ApiProductMovementModule = class ApiProductMovementModule {
};
ApiProductMovementModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_product_movement_controller_1.ApiProductMovementController],
        providers: [api_product_movement_service_1.ApiProductMovementService],
    })
], ApiProductMovementModule);
exports.ApiProductMovementModule = ApiProductMovementModule;


/***/ }),
/* 176 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiProductMovementController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(10);
const request_decorator_1 = __webpack_require__(96);
const api_product_movement_service_1 = __webpack_require__(177);
const request_1 = __webpack_require__(178);
let ApiProductMovementController = class ApiProductMovementController {
    constructor(apiProductMovementService) {
        this.apiProductMovementService = apiProductMovementService;
    }
    pagination(oid, query) {
        return this.apiProductMovementService.pagination(oid, query);
    }
};
__decorate([
    (0, common_1.Get)('pagination'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof request_1.ProductMovementPaginationQuery !== "undefined" && request_1.ProductMovementPaginationQuery) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ApiProductMovementController.prototype, "pagination", null);
ApiProductMovementController = __decorate([
    (0, swagger_1.ApiTags)('Product Movement'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('product-movement'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_product_movement_service_1.ApiProductMovementService !== "undefined" && api_product_movement_service_1.ApiProductMovementService) === "function" ? _a : Object])
], ApiProductMovementController);
exports.ApiProductMovementController = ApiProductMovementController;


/***/ }),
/* 177 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiProductMovementService = void 0;
const common_1 = __webpack_require__(1);
const object_helper_1 = __webpack_require__(36);
const variable_1 = __webpack_require__(17);
const repository_1 = __webpack_require__(8);
let ApiProductMovementService = class ApiProductMovementService {
    constructor(productMovementRepository, productBatchRepository, invoiceRepository, receiptRepository) {
        this.productMovementRepository = productMovementRepository;
        this.productBatchRepository = productBatchRepository;
        this.invoiceRepository = invoiceRepository;
        this.receiptRepository = receiptRepository;
    }
    async pagination(oid, query) {
        var _a, _b;
        const { total, page, limit, data } = await this.productMovementRepository.pagination({
            page: query.page,
            limit: query.limit,
            criteria: {
                oid,
                productId: (_a = query.filter) === null || _a === void 0 ? void 0 : _a.productId,
                productBatchId: (_b = query.filter) === null || _b === void 0 ? void 0 : _b.productBatchId,
            },
            order: query.sort || { id: 'DESC' },
        });
        const invoiceIds = data.filter((i) => i.type === variable_1.ProductMovementType.Invoice)
            .map((i) => i.referenceId);
        const receiptIds = data.filter((i) => i.type === variable_1.ProductMovementType.Receipt)
            .map((i) => i.referenceId);
        const productBatchIds = data.map((i) => i.productBatchId);
        const [invoices, receipts, productBatches] = await Promise.all([
            invoiceIds.length ? this.invoiceRepository.findMany({ ids: (0, object_helper_1.uniqueArray)(invoiceIds) }, { customer: true }) : [],
            receiptIds.length ? this.receiptRepository.findMany({ ids: (0, object_helper_1.uniqueArray)(receiptIds) }, { distributor: true }) : [],
            productBatchIds.length ? this.productBatchRepository.findMany({ ids: (0, object_helper_1.uniqueArray)(productBatchIds) }, { product: false }) : [],
        ]);
        data.forEach((mov) => {
            mov.productBatch = productBatches.find((pb) => pb.id === mov.productBatchId);
            if (mov.type === variable_1.ProductMovementType.Invoice) {
                mov.invoice = invoices.find((iv) => iv.id === mov.referenceId);
            }
            else if (mov.type === variable_1.ProductMovementType.Receipt) {
                mov.receipt = receipts.find((rc) => rc.id === mov.referenceId);
            }
        });
        return { total, page, limit, data };
    }
};
ApiProductMovementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.ProductMovementRepository !== "undefined" && repository_1.ProductMovementRepository) === "function" ? _a : Object, typeof (_b = typeof repository_1.ProductBatchRepository !== "undefined" && repository_1.ProductBatchRepository) === "function" ? _b : Object, typeof (_c = typeof repository_1.InvoiceRepository !== "undefined" && repository_1.InvoiceRepository) === "function" ? _c : Object, typeof (_d = typeof repository_1.ReceiptRepository !== "undefined" && repository_1.ReceiptRepository) === "function" ? _d : Object])
], ApiProductMovementService);
exports.ApiProductMovementService = ApiProductMovementService;


/***/ }),
/* 178 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(179), exports);
__exportStar(__webpack_require__(180), exports);


/***/ }),
/* 179 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductMovementSortQuery = exports.ProductMovementRelationsQuery = exports.ProductMovementFilterQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class ProductMovementFilterQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[product_id]' }),
    (0, class_transformer_1.Expose)({ name: 'product_id' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductMovementFilterQuery.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[product_batch_id]' }),
    (0, class_transformer_1.Expose)({ name: 'product_batch_id' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ProductMovementFilterQuery.prototype, "productBatchId", void 0);
exports.ProductMovementFilterQuery = ProductMovementFilterQuery;
class ProductMovementRelationsQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[product_batch]' }),
    (0, class_transformer_1.Expose)({ name: 'product_batch' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductMovementRelationsQuery.prototype, "productBatch", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[invoice]' }),
    (0, class_transformer_1.Expose)({ name: 'invoice' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductMovementRelationsQuery.prototype, "invoice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[receipt]' }),
    (0, class_transformer_1.Expose)({ name: 'receipt' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProductMovementRelationsQuery.prototype, "receipt", void 0);
exports.ProductMovementRelationsQuery = ProductMovementRelationsQuery;
class ProductMovementSortQuery extends pagination_query_1.SortQuery {
}
exports.ProductMovementSortQuery = ProductMovementSortQuery;


/***/ }),
/* 180 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductMovementPaginationQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
const product_movement_options_request_1 = __webpack_require__(179);
class ProductMovementPaginationQuery extends pagination_query_1.PaginationQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: product_movement_options_request_1.ProductMovementRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => product_movement_options_request_1.ProductMovementRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_a = typeof product_movement_options_request_1.ProductMovementRelationsQuery !== "undefined" && product_movement_options_request_1.ProductMovementRelationsQuery) === "function" ? _a : Object)
], ProductMovementPaginationQuery.prototype, "relations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: product_movement_options_request_1.ProductMovementFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => product_movement_options_request_1.ProductMovementFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_b = typeof product_movement_options_request_1.ProductMovementFilterQuery !== "undefined" && product_movement_options_request_1.ProductMovementFilterQuery) === "function" ? _b : Object)
], ProductMovementPaginationQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: product_movement_options_request_1.ProductMovementSortQuery }),
    (0, class_transformer_1.Expose)({ name: 'sort' }),
    (0, class_transformer_1.Type)(() => product_movement_options_request_1.ProductMovementSortQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_c = typeof product_movement_options_request_1.ProductMovementSortQuery !== "undefined" && product_movement_options_request_1.ProductMovementSortQuery) === "function" ? _c : Object)
], ProductMovementPaginationQuery.prototype, "sort", void 0);
exports.ProductMovementPaginationQuery = ProductMovementPaginationQuery;


/***/ }),
/* 181 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiProductModule = void 0;
const common_1 = __webpack_require__(1);
const api_product_controller_1 = __webpack_require__(182);
const api_product_service_1 = __webpack_require__(183);
let ApiProductModule = class ApiProductModule {
};
ApiProductModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_product_controller_1.ApiProductController],
        providers: [api_product_service_1.ApiProductService],
    })
], ApiProductModule);
exports.ApiProductModule = ApiProductModule;


/***/ }),
/* 182 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiProductController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(10);
const swagger_2 = __webpack_require__(94);
const request_decorator_1 = __webpack_require__(96);
const api_product_service_1 = __webpack_require__(183);
const request_1 = __webpack_require__(104);
let ApiProductController = class ApiProductController {
    constructor(apiProductService) {
        this.apiProductService = apiProductService;
    }
    pagination(oid, query) {
        return this.apiProductService.pagination(oid, query);
    }
    async list(oid, query) {
        return await this.apiProductService.getList(oid, query);
    }
    async detail(oid, { id }, query) {
        return await this.apiProductService.getOne(oid, id, query);
    }
    async create(oid, body) {
        return await this.apiProductService.createOne(oid, body);
    }
    async update(oid, { id }, body) {
        return await this.apiProductService.updateOne(oid, id, body);
    }
};
__decorate([
    (0, common_1.Get)('pagination'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof request_1.ProductPaginationQuery !== "undefined" && request_1.ProductPaginationQuery) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ApiProductController.prototype, "pagination", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof request_1.ProductGetManyQuery !== "undefined" && request_1.ProductGetManyQuery) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], ApiProductController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_d = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _d : Object, typeof (_e = typeof request_1.ProductGetOneQuery !== "undefined" && request_1.ProductGetOneQuery) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], ApiProductController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_f = typeof request_1.ProductCreateBody !== "undefined" && request_1.ProductCreateBody) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], ApiProductController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('update/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_g = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _g : Object, typeof (_h = typeof request_1.ProductUpdateBody !== "undefined" && request_1.ProductUpdateBody) === "function" ? _h : Object]),
    __metadata("design:returntype", Promise)
], ApiProductController.prototype, "update", null);
ApiProductController = __decorate([
    (0, swagger_1.ApiTags)('Product'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('product'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_product_service_1.ApiProductService !== "undefined" && api_product_service_1.ApiProductService) === "function" ? _a : Object])
], ApiProductController);
exports.ApiProductController = ApiProductController;


/***/ }),
/* 183 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiProductService = void 0;
const common_1 = __webpack_require__(1);
const object_helper_1 = __webpack_require__(36);
const repository_1 = __webpack_require__(8);
const exception_const_1 = __webpack_require__(89);
let ApiProductService = class ApiProductService {
    constructor(productRepository, productBatchRepository) {
        this.productRepository = productRepository;
        this.productBatchRepository = productBatchRepository;
    }
    async pagination(oid, query) {
        var _a, _b, _c, _d;
        const { page, limit, total, data } = await this.productRepository.pagination({
            page: query.page,
            limit: query.limit,
            criteria: {
                oid,
                group: (_a = query.filter) === null || _a === void 0 ? void 0 : _a.group,
                isActive: (_b = query.filter) === null || _b === void 0 ? void 0 : _b.isActive,
                searchText: (_c = query.filter) === null || _c === void 0 ? void 0 : _c.searchText,
            },
            order: query.sort || { id: 'DESC' },
        });
        if (((_d = query.relations) === null || _d === void 0 ? void 0 : _d.productBatches) && data.length) {
            const productIds = (0, object_helper_1.uniqueArray)(data.map((item) => item.id));
            const productBatches = await this.productBatchRepository.findMany({ productIds, quantityZero: false });
            data.forEach((item) => item.productBatches = productBatches
                .filter((ma) => ma.productId === item.id)
                .sort((a, b) => (a.expiryDate || 0) > (b.expiryDate || 0) ? 1 : -1));
        }
        return { total, page, limit, data };
    }
    async getList(oid, query) {
        var _a, _b, _c, _d;
        const products = await this.productRepository.find({
            criteria: {
                oid,
                isActive: (_a = query.filter) === null || _a === void 0 ? void 0 : _a.isActive,
                group: (_b = query.filter) === null || _b === void 0 ? void 0 : _b.group,
                searchText: (_c = query.filter) === null || _c === void 0 ? void 0 : _c.searchText,
            },
            limit: query.limit,
        });
        if (((_d = query.relations) === null || _d === void 0 ? void 0 : _d.productBatches) && products.length) {
            const productBatches = await this.productBatchRepository.findMany({
                productIds: (0, object_helper_1.uniqueArray)(products.map((item) => item.id)),
                quantityZero: query.filter.quantityZero,
                overdue: query.filter.overdue,
            });
            products.forEach((item) => item.productBatches = productBatches
                .filter((ma) => ma.productId === item.id)
                .sort((a, b) => (a.expiryDate || 0) > (b.expiryDate || 0) ? 1 : -1));
        }
        return products;
    }
    async getOne(oid, id, query) {
        var _a;
        const product = await this.productRepository.findOne({ oid, id });
        if ((_a = query.relations) === null || _a === void 0 ? void 0 : _a.productBatches) {
            const batches = await this.productBatchRepository.findMany({
                oid,
                productId: product.id,
                quantityZero: false,
            });
            product.productBatches = batches.sort((a, b) => (a.expiryDate || 0) > (b.expiryDate || 0) ? 1 : -1);
        }
        return product;
    }
    async createOne(oid, body) {
        return await this.productRepository.insertOne(oid, body);
    }
    async updateOne(oid, id, body) {
        const { affected } = await this.productRepository.update({ id, oid }, body);
        if (affected !== 1)
            throw new Error(exception_const_1.ErrorMessage.Database.UpdateFailed);
        return await this.productRepository.findOne({ id });
    }
};
ApiProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.ProductRepository !== "undefined" && repository_1.ProductRepository) === "function" ? _a : Object, typeof (_b = typeof repository_1.ProductBatchRepository !== "undefined" && repository_1.ProductBatchRepository) === "function" ? _b : Object])
], ApiProductService);
exports.ApiProductService = ApiProductService;


/***/ }),
/* 184 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiPurchaseModule = void 0;
const common_1 = __webpack_require__(1);
const api_purchase_controller_1 = __webpack_require__(185);
const api_purchase_service_1 = __webpack_require__(186);
let ApiPurchaseModule = class ApiPurchaseModule {
};
ApiPurchaseModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_purchase_controller_1.ApiPurchaseController],
        providers: [api_purchase_service_1.ApiPurchaseService],
    })
], ApiPurchaseModule);
exports.ApiPurchaseModule = ApiPurchaseModule;


/***/ }),
/* 185 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiPurchaseController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(10);
const swagger_2 = __webpack_require__(94);
const request_decorator_1 = __webpack_require__(96);
const api_purchase_service_1 = __webpack_require__(186);
const request_1 = __webpack_require__(187);
let ApiPurchaseController = class ApiPurchaseController {
    constructor(apiPurchaseService) {
        this.apiPurchaseService = apiPurchaseService;
    }
    async pagination(oid, query) {
        return this.apiPurchaseService.pagination(oid, query);
    }
    async detail(oid, { id }, query) {
        return this.apiPurchaseService.getOne(oid, +id, query);
    }
    async createReceiptDraft(oid, body) {
        return await this.apiPurchaseService.createReceiptDraft(oid, body);
    }
    async createReceiptDraftAfterRefund(oid, { id }, body) {
        return await this.apiPurchaseService.createReceiptDraftAfterRefund(oid, id, body);
    }
    async updateReceiptDraft(oid, { id }, body) {
        return await this.apiPurchaseService.updateReceiptDraft(oid, id, body);
    }
    async paymentReceiptDraft(oid, { id }) {
        return await this.apiPurchaseService.paymentReceiptDraft(oid, id);
    }
    async refund(oid, { id }) {
        return await this.apiPurchaseService.refundReceipt(oid, id);
    }
};
__decorate([
    (0, common_1.Get)('pagination'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof request_1.PurchasePaginationQuery !== "undefined" && request_1.PurchasePaginationQuery) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], ApiPurchaseController.prototype, "pagination", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _c : Object, typeof (_d = typeof request_1.PurchaseGetOneQuery !== "undefined" && request_1.PurchaseGetOneQuery) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], ApiPurchaseController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)('create-receipt-draft'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_e = typeof request_1.ReceiptCreateBody !== "undefined" && request_1.ReceiptCreateBody) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], ApiPurchaseController.prototype, "createReceiptDraft", null);
__decorate([
    (0, common_1.Post)('create-receipt-draft-after-refund/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_f = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _f : Object, typeof (_g = typeof request_1.ReceiptCreateBody !== "undefined" && request_1.ReceiptCreateBody) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], ApiPurchaseController.prototype, "createReceiptDraftAfterRefund", null);
__decorate([
    (0, common_1.Put)('receipt/update-draft/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_h = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _h : Object, typeof (_j = typeof request_1.ReceiptUpdateBody !== "undefined" && request_1.ReceiptUpdateBody) === "function" ? _j : Object]),
    __metadata("design:returntype", Promise)
], ApiPurchaseController.prototype, "updateReceiptDraft", null);
__decorate([
    (0, common_1.Patch)('receipt/payment-draft/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_k = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _k : Object]),
    __metadata("design:returntype", Promise)
], ApiPurchaseController.prototype, "paymentReceiptDraft", null);
__decorate([
    (0, common_1.Patch)('receipt/refund/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_l = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _l : Object]),
    __metadata("design:returntype", Promise)
], ApiPurchaseController.prototype, "refund", null);
ApiPurchaseController = __decorate([
    (0, swagger_1.ApiTags)('Purchase Order'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('purchase'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_purchase_service_1.ApiPurchaseService !== "undefined" && api_purchase_service_1.ApiPurchaseService) === "function" ? _a : Object])
], ApiPurchaseController);
exports.ApiPurchaseController = ApiPurchaseController;


/***/ }),
/* 186 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiPurchaseService = void 0;
const common_1 = __webpack_require__(1);
const object_helper_1 = __webpack_require__(36);
const repository_1 = __webpack_require__(8);
let ApiPurchaseService = class ApiPurchaseService {
    constructor(purchaseRepository, purchaseReceiptRepository, distributorRepository) {
        this.purchaseRepository = purchaseRepository;
        this.purchaseReceiptRepository = purchaseReceiptRepository;
        this.distributorRepository = distributorRepository;
    }
    async pagination(oid, query) {
        var _a, _b, _c, _d, _e;
        const { page, limit, total, data } = await this.purchaseRepository.pagination({
            limit: query.limit,
            page: query.page,
            criteria: {
                oid,
                distributorId: (_a = query.filter) === null || _a === void 0 ? void 0 : _a.distributorId,
                fromTime: (_b = query.filter) === null || _b === void 0 ? void 0 : _b.fromTime,
                toTime: (_c = query.filter) === null || _c === void 0 ? void 0 : _c.toTime,
                paymentStatus: (_d = query.filter) === null || _d === void 0 ? void 0 : _d.paymentStatus,
            },
            order: query.sort || { id: 'DESC' },
        });
        if (((_e = query.relations) === null || _e === void 0 ? void 0 : _e.distributor) && data.length) {
            const distributorIds = (0, object_helper_1.uniqueArray)(data.map((i) => i.distributorId));
            const distributors = await this.distributorRepository.findMany({ ids: distributorIds });
            data.forEach((i) => i.distributor = distributors.find((j) => j.id === i.distributorId));
        }
        return { page, limit, total, data };
    }
    async getOne(oid, id, query) {
        var _a, _b;
        return await this.purchaseRepository.findOne({ oid, id }, {
            distributor: !!((_a = query === null || query === void 0 ? void 0 : query.relations) === null || _a === void 0 ? void 0 : _a.distributor),
            receipts: !!((_b = query === null || query === void 0 ? void 0 : query.relations) === null || _b === void 0 ? void 0 : _b.receipts),
        });
    }
    async createReceiptDraft(oid, body) {
        try {
            const receiptDto = repository_1.ReceiptInsertDto.from(body);
            const data = await this.purchaseReceiptRepository.createReceiptDraft(oid, receiptDto, Date.now());
            return { success: true, data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async createReceiptDraftAfterRefund(oid, purchaseId, body) {
        try {
            const receiptDto = repository_1.ReceiptInsertDto.from(body);
            const data = await this.purchaseReceiptRepository.createReceiptDraftAfterRefund(oid, purchaseId, receiptDto);
            return { success: true, data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async updateReceiptDraft(oid, receiptId, body) {
        try {
            const receiptDto = repository_1.ReceiptUpdateDto.from(body);
            const data = await this.purchaseReceiptRepository.updateReceiptDraft(oid, receiptId, receiptDto);
            return { success: true, data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async paymentReceiptDraft(oid, receiptId) {
        try {
            const data = await this.purchaseReceiptRepository.paymentReceiptDraft(oid, receiptId, Date.now());
            return { success: true, data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async refundReceipt(oid, receiptId) {
        try {
            const data = await this.purchaseReceiptRepository.refundReceipt(oid, receiptId, Date.now());
            return { success: true, data };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
};
ApiPurchaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.PurchaseRepository !== "undefined" && repository_1.PurchaseRepository) === "function" ? _a : Object, typeof (_b = typeof repository_1.PurchaseReceiptRepository !== "undefined" && repository_1.PurchaseReceiptRepository) === "function" ? _b : Object, typeof (_c = typeof repository_1.DistributorRepository !== "undefined" && repository_1.DistributorRepository) === "function" ? _c : Object])
], ApiPurchaseService);
exports.ApiPurchaseService = ApiPurchaseService;


/***/ }),
/* 187 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(188), exports);
__exportStar(__webpack_require__(189), exports);
__exportStar(__webpack_require__(190), exports);


/***/ }),
/* 188 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PurchaseGetOneQuery = exports.PurchaseGetManyQuery = exports.PurchasePaginationQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
const purchase_options_request_1 = __webpack_require__(189);
class PurchasePaginationQuery extends pagination_query_1.PaginationQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: purchase_options_request_1.PurchaseFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => purchase_options_request_1.PurchaseFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_a = typeof purchase_options_request_1.PurchaseFilterQuery !== "undefined" && purchase_options_request_1.PurchaseFilterQuery) === "function" ? _a : Object)
], PurchasePaginationQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: purchase_options_request_1.PurchaseRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => purchase_options_request_1.PurchaseRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_b = typeof purchase_options_request_1.PurchaseRelationsQuery !== "undefined" && purchase_options_request_1.PurchaseRelationsQuery) === "function" ? _b : Object)
], PurchasePaginationQuery.prototype, "relations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: purchase_options_request_1.PurchaseSortQuery }),
    (0, class_transformer_1.Expose)({ name: 'sort' }),
    (0, class_transformer_1.Type)(() => purchase_options_request_1.PurchaseSortQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_c = typeof purchase_options_request_1.PurchaseSortQuery !== "undefined" && purchase_options_request_1.PurchaseSortQuery) === "function" ? _c : Object)
], PurchasePaginationQuery.prototype, "sort", void 0);
exports.PurchasePaginationQuery = PurchasePaginationQuery;
class PurchaseGetManyQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'limit', example: 10 }),
    (0, class_transformer_1.Expose)({ name: 'limit' }),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(3),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], PurchaseGetManyQuery.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: purchase_options_request_1.PurchaseFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => purchase_options_request_1.PurchaseFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_d = typeof purchase_options_request_1.PurchaseFilterQuery !== "undefined" && purchase_options_request_1.PurchaseFilterQuery) === "function" ? _d : Object)
], PurchaseGetManyQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: purchase_options_request_1.PurchaseRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => purchase_options_request_1.PurchaseRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_e = typeof purchase_options_request_1.PurchaseRelationsQuery !== "undefined" && purchase_options_request_1.PurchaseRelationsQuery) === "function" ? _e : Object)
], PurchaseGetManyQuery.prototype, "relations", void 0);
exports.PurchaseGetManyQuery = PurchaseGetManyQuery;
class PurchaseGetOneQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: purchase_options_request_1.PurchaseRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => purchase_options_request_1.PurchaseRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_f = typeof purchase_options_request_1.PurchaseRelationsQuery !== "undefined" && purchase_options_request_1.PurchaseRelationsQuery) === "function" ? _f : Object)
], PurchaseGetOneQuery.prototype, "relations", void 0);
exports.PurchaseGetOneQuery = PurchaseGetOneQuery;


/***/ }),
/* 189 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PurchaseSortQuery = exports.PurchaseRelationsQuery = exports.PurchaseFilterQuery = void 0;
const swagger_1 = __webpack_require__(10);
const typescript_helper_1 = __webpack_require__(102);
const variable_1 = __webpack_require__(17);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class PurchaseFilterQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[distributor_id]' }),
    (0, class_transformer_1.Expose)({ name: 'distributor_id' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseFilterQuery.prototype, "distributorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[from_time]' }),
    (0, class_transformer_1.Expose)({ name: 'from_time' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseFilterQuery.prototype, "fromTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[to_time]' }),
    (0, class_transformer_1.Expose)({ name: 'to_time' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseFilterQuery.prototype, "toTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[payment_status]', enum: (0, typescript_helper_1.valuesEnum)(variable_1.PaymentStatus), example: variable_1.PaymentStatus.Full }),
    (0, class_transformer_1.Expose)({ name: 'payment_status' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsEnum)(variable_1.PaymentStatus),
    __metadata("design:type", typeof (_a = typeof variable_1.PaymentStatus !== "undefined" && variable_1.PaymentStatus) === "function" ? _a : Object)
], PurchaseFilterQuery.prototype, "paymentStatus", void 0);
exports.PurchaseFilterQuery = PurchaseFilterQuery;
class PurchaseRelationsQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[distributor]' }),
    (0, class_transformer_1.Expose)({ name: 'distributor' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PurchaseRelationsQuery.prototype, "distributor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[receipts]' }),
    (0, class_transformer_1.Expose)({ name: 'receipts' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PurchaseRelationsQuery.prototype, "receipts", void 0);
exports.PurchaseRelationsQuery = PurchaseRelationsQuery;
class PurchaseSortQuery extends pagination_query_1.SortQuery {
}
exports.PurchaseSortQuery = PurchaseSortQuery;


/***/ }),
/* 190 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReceiptUpdateBody = exports.ReceiptCreateBody = exports.ReceiptItemBody = void 0;
const swagger_1 = __webpack_require__(10);
const variable_1 = __webpack_require__(17);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
const request_1 = __webpack_require__(104);
class ReceiptItemBody {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'product_batch_id', example: 52 }),
    (0, class_transformer_1.Expose)({ name: 'product_batch_id' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptItemBody.prototype, "productBatchId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'unit', type: 'string', example: '{"name":"Viên","rate":1}' }),
    (0, class_transformer_1.Expose)({ name: 'unit' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        try {
            const instance = Object.assign(new request_1.UnitConversionQuery(), JSON.parse(value));
            const validate = (0, class_validator_1.validateSync)(instance, { whitelist: true, forbidNonWhitelisted: true });
            if (validate.length)
                return validate;
            else
                return JSON.stringify(instance);
        }
        catch (error) {
            return [error.message];
        }
    }),
    (0, class_validator_1.IsString)({ message: 'Validate unit failed: Example: {"name":"Viên","rate":1}' }),
    __metadata("design:type", String)
], ReceiptItemBody.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'quantity', example: 4 }),
    (0, class_transformer_1.Expose)({ name: 'quantity' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ReceiptItemBody.prototype, "quantity", void 0);
exports.ReceiptItemBody = ReceiptItemBody;
class ReceiptCreateBody {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'distributor_id', example: 52 }),
    (0, class_transformer_1.Expose)({ name: 'distributor_id' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptCreateBody.prototype, "distributorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ReceiptItemBody, isArray: true }),
    (0, class_transformer_1.Expose)({ name: 'receipt_items' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_transformer_1.Type)(() => ReceiptItemBody),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", Array)
], ReceiptCreateBody.prototype, "receiptItems", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'total_item_money', example: 50000 }),
    (0, class_transformer_1.Expose)({ name: 'total_item_money' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptCreateBody.prototype, "totalItemMoney", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'discount_money', example: 80000 }),
    (0, class_transformer_1.Expose)({ name: 'discount_money' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptCreateBody.prototype, "discountMoney", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'discount_percent', example: 10 }),
    (0, class_transformer_1.Expose)({ name: 'discount_percent' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptCreateBody.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'discount_type', enum: variable_1.DiscountType, example: variable_1.DiscountType.VND }),
    (0, class_transformer_1.Expose)({ name: 'discount_type' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsEnum)(variable_1.DiscountType),
    __metadata("design:type", typeof (_a = typeof variable_1.DiscountType !== "undefined" && variable_1.DiscountType) === "function" ? _a : Object)
], ReceiptCreateBody.prototype, "discountType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'surcharge', example: 50000 }),
    (0, class_transformer_1.Expose)({ name: 'surcharge' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptCreateBody.prototype, "surcharge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'total_money', example: 1250000 }),
    (0, class_transformer_1.Expose)({ name: 'total_money' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptCreateBody.prototype, "totalMoney", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'debt', example: 500000 }),
    (0, class_transformer_1.Expose)({ name: 'debt' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptCreateBody.prototype, "debt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'note', example: 'Khách hàng còn bo thêm tiền' }),
    (0, class_transformer_1.Expose)({ name: 'note' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptCreateBody.prototype, "note", void 0);
exports.ReceiptCreateBody = ReceiptCreateBody;
class ReceiptUpdateBody extends (0, swagger_1.OmitType)(ReceiptCreateBody, ['distributorId']) {
}
exports.ReceiptUpdateBody = ReceiptUpdateBody;


/***/ }),
/* 191 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiReceiptModule = void 0;
const common_1 = __webpack_require__(1);
const api_receipt_controller_1 = __webpack_require__(192);
const api_receipt_service_1 = __webpack_require__(193);
let ApiReceiptModule = class ApiReceiptModule {
};
ApiReceiptModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_receipt_controller_1.ApiReceiptController],
        providers: [api_receipt_service_1.ApiReceiptService],
    })
], ApiReceiptModule);
exports.ApiReceiptModule = ApiReceiptModule;


/***/ }),
/* 192 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiReceiptController = void 0;
const common_1 = __webpack_require__(1);
const route_params_decorator_1 = __webpack_require__(93);
const swagger_1 = __webpack_require__(10);
const swagger_2 = __webpack_require__(94);
const request_decorator_1 = __webpack_require__(96);
const api_receipt_service_1 = __webpack_require__(193);
const request_1 = __webpack_require__(194);
let ApiReceiptController = class ApiReceiptController {
    constructor(apiReceiptService) {
        this.apiReceiptService = apiReceiptService;
    }
    async pagination(oid, query) {
        return await this.apiReceiptService.pagination(oid, query);
    }
    async detail(oid, { id }, query) {
        return await this.apiReceiptService.getOne(oid, id, query);
    }
};
__decorate([
    (0, common_1.Get)('pagination'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, route_params_decorator_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof request_1.ReceiptPaginationQuery !== "undefined" && request_1.ReceiptPaginationQuery) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], ApiReceiptController.prototype, "pagination", null);
__decorate([
    (0, common_1.Get)('detail/:id'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, route_params_decorator_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof swagger_2.IdParam !== "undefined" && swagger_2.IdParam) === "function" ? _c : Object, typeof (_d = typeof request_1.ReceiptGetOneQuery !== "undefined" && request_1.ReceiptGetOneQuery) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], ApiReceiptController.prototype, "detail", null);
ApiReceiptController = __decorate([
    (0, swagger_1.ApiTags)('Receipt'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('receipt'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_receipt_service_1.ApiReceiptService !== "undefined" && api_receipt_service_1.ApiReceiptService) === "function" ? _a : Object])
], ApiReceiptController);
exports.ApiReceiptController = ApiReceiptController;


/***/ }),
/* 193 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiReceiptService = void 0;
const common_1 = __webpack_require__(1);
const object_helper_1 = __webpack_require__(36);
const repository_1 = __webpack_require__(8);
let ApiReceiptService = class ApiReceiptService {
    constructor(receiptRepository, distributorRepository) {
        this.receiptRepository = receiptRepository;
        this.distributorRepository = distributorRepository;
    }
    async pagination(oid, query) {
        var _a, _b, _c, _d, _e;
        const { page, limit, total, data } = await this.receiptRepository.pagination({
            page: query.page,
            limit: query.limit,
            criteria: {
                oid,
                distributorId: (_a = query.filter) === null || _a === void 0 ? void 0 : _a.distributorId,
                fromTime: (_b = query.filter) === null || _b === void 0 ? void 0 : _b.fromTime,
                toTime: (_c = query.filter) === null || _c === void 0 ? void 0 : _c.toTime,
                paymentStatus: (_d = query.filter) === null || _d === void 0 ? void 0 : _d.paymentStatus,
            },
            order: query.sort || { id: 'DESC' },
        });
        if (((_e = query.relations) === null || _e === void 0 ? void 0 : _e.distributor) && data.length) {
            const distributorIds = (0, object_helper_1.uniqueArray)(data.map((i) => i.distributorId));
            const distributors = await this.distributorRepository.findMany({ ids: distributorIds });
            data.forEach((i) => i.distributor = distributors.find((j) => j.id === i.distributorId));
        }
        return { page, limit, total, data };
    }
    async getOne(oid, id, { relations }) {
        return await this.receiptRepository.findOne({ oid, id }, {
            distributor: !!(relations === null || relations === void 0 ? void 0 : relations.distributor),
            receiptItems: !!(relations === null || relations === void 0 ? void 0 : relations.receiptItems),
        });
    }
    async queryOne(oid, id, { relations }) {
        return await this.receiptRepository.queryOneBy({ oid, id }, {
            distributor: !!(relations === null || relations === void 0 ? void 0 : relations.distributor),
            receiptItems: !!(relations === null || relations === void 0 ? void 0 : relations.receiptItems) && { productBatch: true },
        });
    }
};
ApiReceiptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.ReceiptRepository !== "undefined" && repository_1.ReceiptRepository) === "function" ? _a : Object, typeof (_b = typeof repository_1.DistributorRepository !== "undefined" && repository_1.DistributorRepository) === "function" ? _b : Object])
], ApiReceiptService);
exports.ApiReceiptService = ApiReceiptService;


/***/ }),
/* 194 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(195), exports);
__exportStar(__webpack_require__(196), exports);


/***/ }),
/* 195 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReceiptGetOneQuery = exports.ReceiptPaginationQuery = void 0;
const swagger_1 = __webpack_require__(10);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
const receipt_options_request_1 = __webpack_require__(196);
class ReceiptPaginationQuery extends pagination_query_1.PaginationQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: receipt_options_request_1.ReceiptFilterQuery }),
    (0, class_transformer_1.Expose)({ name: 'filter' }),
    (0, class_transformer_1.Type)(() => receipt_options_request_1.ReceiptFilterQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_a = typeof receipt_options_request_1.ReceiptFilterQuery !== "undefined" && receipt_options_request_1.ReceiptFilterQuery) === "function" ? _a : Object)
], ReceiptPaginationQuery.prototype, "filter", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: receipt_options_request_1.ReceiptRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'relations' }),
    (0, class_transformer_1.Type)(() => receipt_options_request_1.ReceiptRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_b = typeof receipt_options_request_1.ReceiptRelationsQuery !== "undefined" && receipt_options_request_1.ReceiptRelationsQuery) === "function" ? _b : Object)
], ReceiptPaginationQuery.prototype, "relations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: receipt_options_request_1.ReceiptSortQuery }),
    (0, class_transformer_1.Expose)({ name: 'sort' }),
    (0, class_transformer_1.Type)(() => receipt_options_request_1.ReceiptSortQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_c = typeof receipt_options_request_1.ReceiptSortQuery !== "undefined" && receipt_options_request_1.ReceiptSortQuery) === "function" ? _c : Object)
], ReceiptPaginationQuery.prototype, "sort", void 0);
exports.ReceiptPaginationQuery = ReceiptPaginationQuery;
class ReceiptGetOneQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: receipt_options_request_1.ReceiptRelationsQuery }),
    (0, class_transformer_1.Expose)({ name: 'select' }),
    (0, class_transformer_1.Type)(() => receipt_options_request_1.ReceiptRelationsQuery),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", typeof (_d = typeof receipt_options_request_1.ReceiptRelationsQuery !== "undefined" && receipt_options_request_1.ReceiptRelationsQuery) === "function" ? _d : Object)
], ReceiptGetOneQuery.prototype, "relations", void 0);
exports.ReceiptGetOneQuery = ReceiptGetOneQuery;


/***/ }),
/* 196 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReceiptSortQuery = exports.ReceiptRelationsQuery = exports.ReceiptFilterQuery = void 0;
const swagger_1 = __webpack_require__(10);
const typescript_helper_1 = __webpack_require__(102);
const variable_1 = __webpack_require__(17);
const pagination_query_1 = __webpack_require__(100);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class ReceiptFilterQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[distributor_id]' }),
    (0, class_transformer_1.Expose)({ name: 'distributor_id' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptFilterQuery.prototype, "distributorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[from_time]' }),
    (0, class_transformer_1.Expose)({ name: 'from_time' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptFilterQuery.prototype, "fromTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[to_time]' }),
    (0, class_transformer_1.Expose)({ name: 'to_time' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptFilterQuery.prototype, "toTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'filter[payment_status]', enum: (0, typescript_helper_1.valuesEnum)(variable_1.PaymentStatus), example: variable_1.PaymentStatus.Full }),
    (0, class_transformer_1.Expose)({ name: 'payment_status' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsEnum)(variable_1.PaymentStatus),
    __metadata("design:type", typeof (_a = typeof variable_1.PaymentStatus !== "undefined" && variable_1.PaymentStatus) === "function" ? _a : Object)
], ReceiptFilterQuery.prototype, "paymentStatus", void 0);
exports.ReceiptFilterQuery = ReceiptFilterQuery;
class ReceiptRelationsQuery {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[distributor]' }),
    (0, class_transformer_1.Expose)({ name: 'distributor' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ReceiptRelationsQuery.prototype, "distributor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'relations[receipt_items]' }),
    (0, class_transformer_1.Expose)({ name: 'receipt_items' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (['1', 'true'].includes(value))
            return true;
        if (['0', 'false'].includes(value))
            return false;
        return undefined;
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ReceiptRelationsQuery.prototype, "receiptItems", void 0);
exports.ReceiptRelationsQuery = ReceiptRelationsQuery;
class ReceiptSortQuery extends pagination_query_1.SortQuery {
}
exports.ReceiptSortQuery = ReceiptSortQuery;


/***/ }),
/* 197 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiStatisticsModule = void 0;
const common_1 = __webpack_require__(1);
const api_statistics_controller_1 = __webpack_require__(198);
const api_statistics_service_1 = __webpack_require__(199);
let ApiStatisticsModule = class ApiStatisticsModule {
};
ApiStatisticsModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_statistics_controller_1.ApiStatisticsController],
        providers: [api_statistics_service_1.ApiStatisticsService],
    })
], ApiStatisticsModule);
exports.ApiStatisticsModule = ApiStatisticsModule;


/***/ }),
/* 198 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiStatisticsController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(10);
const request_decorator_1 = __webpack_require__(96);
const api_statistics_service_1 = __webpack_require__(199);
const statistics_revenue_query_1 = __webpack_require__(200);
let ApiStatisticsController = class ApiStatisticsController {
    constructor(apiStatisticsService) {
        this.apiStatisticsService = apiStatisticsService;
    }
    revenueMonth(oid, query) {
        return this.apiStatisticsService.revenueMonth(oid, query.year, query.month);
    }
};
__decorate([
    (0, common_1.Get)('revenue-month'),
    __param(0, (0, request_decorator_1.OrganizationId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_b = typeof statistics_revenue_query_1.StatisticsRevenueMonthQuery !== "undefined" && statistics_revenue_query_1.StatisticsRevenueMonthQuery) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], ApiStatisticsController.prototype, "revenueMonth", null);
ApiStatisticsController = __decorate([
    (0, swagger_1.ApiTags)('Statistics'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('statistics'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_statistics_service_1.ApiStatisticsService !== "undefined" && api_statistics_service_1.ApiStatisticsService) === "function" ? _a : Object])
], ApiStatisticsController);
exports.ApiStatisticsController = ApiStatisticsController;


/***/ }),
/* 199 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiStatisticsService = void 0;
const common_1 = __webpack_require__(1);
const variable_1 = __webpack_require__(17);
const repository_1 = __webpack_require__(8);
let ApiStatisticsService = class ApiStatisticsService {
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }
    async revenueMonth(oid, year, month) {
        const data = Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => ({
            date: i + 1,
            from: Date.UTC(year, month - 1, i + 1, -7),
            to: Date.UTC(year, month - 1, i + 2, -7) - 1,
            revenue: 0,
            profit: 0,
        }));
        const startMonth = Date.UTC(year, month - 1, 1, -7);
        const endMonth = Date.UTC(year, month, 1, -7) - 1;
        const invoices = await this.invoiceRepository.findMany({
            oid,
            fromTime: startMonth,
            toTime: endMonth,
            paymentStatus: variable_1.PaymentStatus.Full,
        });
        invoices.forEach((invoice) => {
            const date = new Date(invoice.paymentTime + 7 * 60 * 60 * 1000).getUTCDate();
            data[date - 1].revenue += invoice.totalMoney;
            data[date - 1].profit += invoice.profit;
        });
        return { data, year, month };
    }
};
ApiStatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.InvoiceRepository !== "undefined" && repository_1.InvoiceRepository) === "function" ? _a : Object])
], ApiStatisticsService);
exports.ApiStatisticsService = ApiStatisticsService;


/***/ }),
/* 200 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StatisticsRevenueMonthQuery = void 0;
const swagger_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class StatisticsRevenueMonthQuery {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'year' }),
    (0, class_transformer_1.Expose)({ name: 'year' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StatisticsRevenueMonthQuery.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'month' }),
    (0, class_transformer_1.Expose)({ name: 'month' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], StatisticsRevenueMonthQuery.prototype, "month", void 0);
exports.StatisticsRevenueMonthQuery = StatisticsRevenueMonthQuery;


/***/ }),
/* 201 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiUserModule = void 0;
const common_1 = __webpack_require__(1);
const api_user_controller_1 = __webpack_require__(202);
const api_user_service_1 = __webpack_require__(203);
let ApiUserModule = class ApiUserModule {
};
ApiUserModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [api_user_controller_1.ApiUserController],
        providers: [api_user_service_1.ApiUserService],
        exports: [],
    })
], ApiUserModule);
exports.ApiUserModule = ApiUserModule;


/***/ }),
/* 202 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiUserController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(10);
const request_decorator_1 = __webpack_require__(96);
const api_user_service_1 = __webpack_require__(203);
const user_change_password_body_1 = __webpack_require__(205);
const user_update_info_body_1 = __webpack_require__(206);
let ApiUserController = class ApiUserController {
    constructor(apiUserService) {
        this.apiUserService = apiUserService;
    }
    async me(userReq) {
        return await this.apiUserService.me(userReq.oid, userReq.id);
    }
    async detail(userReq, body) {
        return await this.apiUserService.changePassword(userReq.oid, userReq.id, body);
    }
    async update(userReq, body) {
        return await this.apiUserService.updateInfo(userReq.oid, userReq.id, body);
    }
};
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, request_decorator_1.UserReq)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof request_decorator_1.TUserReq !== "undefined" && request_decorator_1.TUserReq) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], ApiUserController.prototype, "me", null);
__decorate([
    (0, common_1.Patch)('change-password'),
    __param(0, (0, request_decorator_1.UserReq)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof request_decorator_1.TUserReq !== "undefined" && request_decorator_1.TUserReq) === "function" ? _c : Object, typeof (_d = typeof user_change_password_body_1.UserChangePasswordBody !== "undefined" && user_change_password_body_1.UserChangePasswordBody) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], ApiUserController.prototype, "detail", null);
__decorate([
    (0, common_1.Patch)('update-info'),
    __param(0, (0, request_decorator_1.UserReq)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof request_decorator_1.TUserReq !== "undefined" && request_decorator_1.TUserReq) === "function" ? _e : Object, typeof (_f = typeof user_update_info_body_1.UserUpdateInfoBody !== "undefined" && user_update_info_body_1.UserUpdateInfoBody) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], ApiUserController.prototype, "update", null);
ApiUserController = __decorate([
    (0, swagger_1.ApiTags)('User'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [typeof (_a = typeof api_user_service_1.ApiUserService !== "undefined" && api_user_service_1.ApiUserService) === "function" ? _a : Object])
], ApiUserController);
exports.ApiUserController = ApiUserController;


/***/ }),
/* 203 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiUserService = void 0;
const common_1 = __webpack_require__(1);
const string_helper_1 = __webpack_require__(43);
const repository_1 = __webpack_require__(8);
const bcrypt = __webpack_require__(204);
const exception_const_1 = __webpack_require__(89);
let ApiUserService = class ApiUserService {
    constructor(employeeRepository) {
        this.employeeRepository = employeeRepository;
    }
    async me(oid, id) {
        return await this.employeeRepository.findOne({ oid, id });
    }
    async changePassword(oid, id, body) {
        const { oldPassword, newPassword } = body;
        const employee = await this.employeeRepository.findOne({ id, oid });
        if (!employee)
            throw new common_1.HttpException(exception_const_1.ErrorMessage.Employee.NotFound, common_1.HttpStatus.BAD_REQUEST);
        const checkPassword = await bcrypt.compare(oldPassword, employee.password);
        if (!checkPassword)
            throw new common_1.HttpException(exception_const_1.ErrorMessage.User.WrongPassword, common_1.HttpStatus.BAD_REQUEST);
        const password = await bcrypt.hash(newPassword, 5);
        const secret = (0, string_helper_1.encrypt)(newPassword, employee.username);
        await this.employeeRepository.update({ oid, id }, { password, secret });
        return { success: true };
    }
    async updateInfo(oid, id, body) {
        await this.employeeRepository.update({ oid, id }, {
            fullName: body.fullName,
            birthday: body.birthday,
            gender: body.gender,
            phone: body.phone,
        });
        const employee = await this.employeeRepository.findOne({ oid, id });
        return employee;
    }
};
ApiUserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof repository_1.EmployeeRepository !== "undefined" && repository_1.EmployeeRepository) === "function" ? _a : Object])
], ApiUserService);
exports.ApiUserService = ApiUserService;


/***/ }),
/* 204 */
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),
/* 205 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserChangePasswordBody = void 0;
const swagger_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class UserChangePasswordBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Abc@123456' }),
    (0, class_transformer_1.Expose)({ name: 'old_password' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], UserChangePasswordBody.prototype, "oldPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Abc@123456' }),
    (0, class_transformer_1.Expose)({ name: 'new_password' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], UserChangePasswordBody.prototype, "newPassword", void 0);
exports.UserChangePasswordBody = UserChangePasswordBody;


/***/ }),
/* 206 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserUpdateInfoBody = void 0;
const swagger_1 = __webpack_require__(10);
const class_validator_custom_1 = __webpack_require__(123);
const variable_1 = __webpack_require__(17);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class UserUpdateInfoBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'full_name', example: 'Phạm Hoàng Mai' }),
    (0, class_transformer_1.Expose)({ name: 'full_name' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserUpdateInfoBody.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'birthday', example: 1678890707005 }),
    (0, class_transformer_1.Expose)({ name: 'birthday' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserUpdateInfoBody.prototype, "birthday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0376899866' }),
    (0, class_transformer_1.Expose)({ name: 'phone' }),
    (0, class_validator_1.Validate)(class_validator_custom_1.IsPhone),
    __metadata("design:type", String)
], UserUpdateInfoBody.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ name: 'gender', enum: [0, 1], example: variable_1.EGender.Female }),
    (0, class_transformer_1.Expose)({ name: 'gender' }),
    (0, class_validator_1.IsIn)([0, 1]),
    __metadata("design:type", typeof (_a = typeof variable_1.EGender !== "undefined" && variable_1.EGender) === "function" ? _a : Object)
], UserUpdateInfoBody.prototype, "gender", void 0);
exports.UserUpdateInfoBody = UserUpdateInfoBody;


/***/ }),
/* 207 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(35);
const employee_entity_1 = __webpack_require__(27);
const organization_entity_1 = __webpack_require__(28);
const email_module_1 = __webpack_require__(77);
const jwt_extend_module_1 = __webpack_require__(86);
const environments_1 = __webpack_require__(79);
const auth_controller_1 = __webpack_require__(208);
const auth_service_1 = __webpack_require__(209);
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forFeature(environments_1.GlobalConfig),
            config_1.ConfigModule.forFeature(environments_1.JwtConfig),
            typeorm_1.TypeOrmModule.forFeature([organization_entity_1.default, employee_entity_1.default]),
            jwt_extend_module_1.JwtExtendModule,
            email_module_1.EmailModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService],
    })
], AuthModule);
exports.AuthModule = AuthModule;


/***/ }),
/* 208 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(10);
const jwt_extend_service_1 = __webpack_require__(88);
const request_decorator_1 = __webpack_require__(96);
const auth_service_1 = __webpack_require__(209);
const forgot_password_body_1 = __webpack_require__(210);
const login_body_1 = __webpack_require__(211);
const refresh_token_body_1 = __webpack_require__(212);
const register_body_1 = __webpack_require__(213);
const reset_password_body_1 = __webpack_require__(214);
let AuthController = class AuthController {
    constructor(authService, jwtExtendService) {
        this.authService = authService;
        this.jwtExtendService = jwtExtendService;
    }
    async register(registerDto, ip) {
        const employee = await this.authService.register(registerDto);
        const { accessToken, refreshToken } = this.jwtExtendService.createTokenFromUser(employee, ip);
        return {
            user: employee,
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
    async login(loginDto, ip) {
        const employee = await this.authService.login(loginDto);
        const { accessToken, refreshToken } = this.jwtExtendService.createTokenFromUser(employee, ip);
        return {
            user: employee,
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
    async loginDemo(ip) {
        const employee = await this.authService.loginDemo();
        const { accessToken, refreshToken } = this.jwtExtendService.createTokenFromUser(employee, ip);
        return {
            user: employee,
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
    async logout(id) {
    }
    async forgotPassword(body) {
        return await this.authService.forgotPassword(body);
    }
    async resetPassword(body) {
        return await this.authService.resetPassword(body);
    }
    async grantAccessToken(refreshTokenDto, ip) {
        const accessToken = await this.authService.grantAccessToken(refreshTokenDto.refreshToken, ip);
        return { access_token: accessToken };
    }
};
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, request_decorator_1.IpRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof register_body_1.RegisterBody !== "undefined" && register_body_1.RegisterBody) === "function" ? _c : Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, request_decorator_1.IpRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof login_body_1.LoginBody !== "undefined" && login_body_1.LoginBody) === "function" ? _d : Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('login-demo'),
    __param(0, (0, request_decorator_1.IpRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "loginDemo", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof forgot_password_body_1.ForgotPasswordBody !== "undefined" && forgot_password_body_1.ForgotPasswordBody) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof reset_password_body_1.ResetPasswordBody !== "undefined" && reset_password_body_1.ResetPasswordBody) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, request_decorator_1.IpRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof refresh_token_body_1.RefreshTokenBody !== "undefined" && refresh_token_body_1.RefreshTokenBody) === "function" ? _g : Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "grantAccessToken", null);
AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object, typeof (_b = typeof jwt_extend_service_1.JwtExtendService !== "undefined" && jwt_extend_service_1.JwtExtendService) === "function" ? _b : Object])
], AuthController);
exports.AuthController = AuthController;


/***/ }),
/* 209 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const string_helper_1 = __webpack_require__(43);
const variable_1 = __webpack_require__(17);
const employee_entity_1 = __webpack_require__(27);
const organization_entity_1 = __webpack_require__(28);
const bcrypt = __webpack_require__(204);
const typeorm_1 = __webpack_require__(14);
const email_service_1 = __webpack_require__(80);
const jwt_extend_service_1 = __webpack_require__(88);
const environments_1 = __webpack_require__(79);
const exception_const_1 = __webpack_require__(89);
let AuthService = class AuthService {
    constructor(globalConfig, jwtConfig, dataSource, jwtExtendService, emailService) {
        this.globalConfig = globalConfig;
        this.jwtConfig = jwtConfig;
        this.dataSource = dataSource;
        this.jwtExtendService = jwtExtendService;
        this.emailService = emailService;
    }
    async register(registerDto) {
        const { email, phone, username, password } = registerDto;
        const existOrg = await this.dataSource.manager.findOne(organization_entity_1.default, { where: [{ email }, { phone }] });
        if (existOrg) {
            if (existOrg.email === email && existOrg.phone === phone) {
                throw new common_1.HttpException(exception_const_1.ErrorMessage.Register.ExistEmailAndPhone, common_1.HttpStatus.BAD_REQUEST);
            }
            else if (existOrg.email === email) {
                throw new common_1.HttpException(exception_const_1.ErrorMessage.Register.ExistEmail, common_1.HttpStatus.BAD_REQUEST);
            }
            else if (existOrg.phone === phone) {
                throw new common_1.HttpException(exception_const_1.ErrorMessage.Register.ExistPhone, common_1.HttpStatus.BAD_REQUEST);
            }
        }
        const hashPassword = await bcrypt.hash(password, 5);
        const employee = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const organizationSnap = manager.create(organization_entity_1.default, { phone, email, level: 1 });
            const organization = await manager.save(organizationSnap);
            const employeeSnap = manager.create(employee_entity_1.default, {
                oid: organization.id,
                username,
                password: hashPassword,
                secret: (0, string_helper_1.encrypt)(password, username),
                role: variable_1.ERole.Admin,
            });
            const employee = await manager.save(employeeSnap);
            employee.organization = organization;
            return employee;
        });
        return employee;
    }
    async login(loginDto) {
        const [employee] = await this.dataSource.getRepository(employee_entity_1.default).find({
            relations: { organization: true },
            relationLoadStrategy: 'join',
            where: {
                username: loginDto.username,
                organization: { phone: loginDto.orgPhone },
            },
        });
        if (!employee)
            throw new common_1.HttpException(exception_const_1.ErrorMessage.User.NotExist, common_1.HttpStatus.BAD_REQUEST);
        const checkPassword = await bcrypt.compare(loginDto.password, employee.password);
        if (!checkPassword)
            throw new common_1.HttpException(exception_const_1.ErrorMessage.User.WrongPassword, common_1.HttpStatus.BAD_REQUEST);
        return employee;
    }
    async loginDemo() {
        const [employee] = await this.dataSource.getRepository(employee_entity_1.default).find({
            relations: { organization: true },
            relationLoadStrategy: 'query',
            where: { id: 1, organization: { id: 1 } },
        });
        if (!employee)
            throw new common_1.HttpException(exception_const_1.ErrorMessage.User.NotExist, common_1.HttpStatus.BAD_REQUEST);
        return employee;
    }
    async forgotPassword(body) {
        const organization = await this.dataSource.manager.findOne(organization_entity_1.default, { where: { phone: body.orgPhone, email: body.email } });
        if (!organization)
            throw new common_1.HttpException(exception_const_1.ErrorMessage.Organization.NotExist, common_1.HttpStatus.BAD_REQUEST);
        const employee = await this.dataSource.manager.findOne(employee_entity_1.default, {
            where: {
                username: body.username,
                oid: organization.id,
            },
        });
        if (!employee)
            throw new common_1.HttpException(exception_const_1.ErrorMessage.User.NotExist, common_1.HttpStatus.BAD_REQUEST);
        const token = encodeURIComponent((0, string_helper_1.encrypt)(employee.password, this.jwtConfig.accessKey, 30 * 60 * 1000));
        const link = `${this.globalConfig.domain}/auth/reset-password?token=${token}&org_phone=${body.orgPhone}&username=${body.username}&ver=1`;
        await this.emailService.send({
            to: body.email,
            subject: '[Medihome] - Quên mật khẩu',
            from: 'medihome.vn@gmail.com',
            text: 'welcome',
            html: '<p>Bạn nhận được yêu cầu reset mật khẩu. Nhấn vào đường link sau để cập nhật mật khẩu mới: </p>'
                + `<p><a href="${link}' + recovery_token + '">${link}</a></p>`
                + '<p>Link sẽ bị vô hiệu hóa sau 30 phút</p>',
        });
        return { success: true };
    }
    async resetPassword(body) {
        const [employee] = await this.dataSource.getRepository(employee_entity_1.default).find({
            relations: { organization: true },
            where: {
                username: body.username,
                organization: { phone: body.orgPhone },
            },
        });
        if (!employee)
            throw new common_1.HttpException(exception_const_1.ErrorMessage.User.NotExist, common_1.HttpStatus.BAD_REQUEST);
        let hash;
        try {
            hash = (0, string_helper_1.decrypt)(body.token, this.jwtConfig.accessKey);
        }
        catch (error) {
            throw new common_1.HttpException(exception_const_1.ErrorMessage.Token.Expired, common_1.HttpStatus.BAD_REQUEST);
        }
        if (employee.password !== hash) {
            throw new common_1.HttpException(exception_const_1.ErrorMessage.Token.Invalid, common_1.HttpStatus.BAD_REQUEST);
        }
        employee.password = await bcrypt.hash(body.password, 5);
        employee.secret = (0, string_helper_1.encrypt)(body.password, body.username);
        await this.dataSource.manager.save(employee);
        return employee;
    }
    async grantAccessToken(refreshToken, ip) {
        const { uid, oid } = this.jwtExtendService.verifyRefreshToken(refreshToken, ip);
        const [employee] = await this.dataSource.getRepository(employee_entity_1.default).find({
            relations: { organization: true },
            where: { id: uid, oid },
        });
        if (!employee)
            throw new common_1.HttpException(exception_const_1.ErrorMessage.User.NotExist, common_1.HttpStatus.BAD_REQUEST);
        return this.jwtExtendService.createAccessToken(employee, ip);
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(environments_1.GlobalConfig.KEY)),
    __param(1, (0, common_1.Inject)(environments_1.JwtConfig.KEY)),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigType !== "undefined" && config_1.ConfigType) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigType !== "undefined" && config_1.ConfigType) === "function" ? _b : Object, typeof (_c = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _c : Object, typeof (_d = typeof jwt_extend_service_1.JwtExtendService !== "undefined" && jwt_extend_service_1.JwtExtendService) === "function" ? _d : Object, typeof (_e = typeof email_service_1.EmailService !== "undefined" && email_service_1.EmailService) === "function" ? _e : Object])
], AuthService);
exports.AuthService = AuthService;


/***/ }),
/* 210 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ForgotPasswordBody = void 0;
const swagger_1 = __webpack_require__(10);
const class_validator_custom_1 = __webpack_require__(123);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class ForgotPasswordBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'org_phone', example: '0986021190' }),
    (0, class_transformer_1.Expose)({ name: 'org_phone' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.Validate)(class_validator_custom_1.IsPhone),
    __metadata("design:type", String)
], ForgotPasswordBody.prototype, "orgPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'duyk30b@gmail.com' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.Validate)(class_validator_custom_1.IsGmail),
    __metadata("design:type", String)
], ForgotPasswordBody.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.MinLength)(4),
    __metadata("design:type", String)
], ForgotPasswordBody.prototype, "username", void 0);
exports.ForgotPasswordBody = ForgotPasswordBody;


/***/ }),
/* 211 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoginBody = void 0;
const swagger_1 = __webpack_require__(10);
const class_validator_custom_1 = __webpack_require__(123);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class LoginBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'org_phone', example: '0986021190' }),
    (0, class_transformer_1.Expose)({ name: 'org_phone' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.Validate)(class_validator_custom_1.IsPhone),
    __metadata("design:type", String)
], LoginBody.prototype, "orgPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.MinLength)(4),
    __metadata("design:type", String)
], LoginBody.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Abc@123456' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], LoginBody.prototype, "password", void 0);
exports.LoginBody = LoginBody;


/***/ }),
/* 212 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RefreshTokenBody = void 0;
const swagger_1 = __webpack_require__(10);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class RefreshTokenBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'refresh_token' }),
    (0, class_transformer_1.Expose)({ name: 'refresh_token' }),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], RefreshTokenBody.prototype, "refreshToken", void 0);
exports.RefreshTokenBody = RefreshTokenBody;


/***/ }),
/* 213 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegisterBody = void 0;
const swagger_1 = __webpack_require__(10);
const class_validator_custom_1 = __webpack_require__(123);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class RegisterBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'example-2@gmail.com' }),
    (0, class_transformer_1.Expose)({ name: 'email' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.Validate)(class_validator_custom_1.IsGmail),
    __metadata("design:type", String)
], RegisterBody.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0376899866' }),
    (0, class_transformer_1.Expose)({ name: 'phone' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.Validate)(class_validator_custom_1.IsPhone),
    __metadata("design:type", String)
], RegisterBody.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin' }),
    (0, class_transformer_1.Expose)({ name: 'username' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.MinLength)(4),
    __metadata("design:type", String)
], RegisterBody.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Abc@123456' }),
    (0, class_transformer_1.Expose)({ name: 'password' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], RegisterBody.prototype, "password", void 0);
exports.RegisterBody = RegisterBody;


/***/ }),
/* 214 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResetPasswordBody = void 0;
const swagger_1 = __webpack_require__(10);
const class_validator_custom_1 = __webpack_require__(123);
const class_transformer_1 = __webpack_require__(13);
const class_validator_1 = __webpack_require__(95);
class ResetPasswordBody {
}
__decorate([
    (0, swagger_1.ApiProperty)({ name: 'org_phone', example: '0986021190' }),
    (0, class_transformer_1.Expose)({ name: 'org_phone' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.Validate)(class_validator_custom_1.IsPhone),
    __metadata("design:type", String)
], ResetPasswordBody.prototype, "orgPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.MinLength)(4),
    __metadata("design:type", String)
], ResetPasswordBody.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Abc@123456' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ResetPasswordBody.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '$2b$05$G17lx6yO8fK2iJK6tqX2XODsCrawFzSht5vJQjE7wlDJO0.4zxPxO' }),
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ResetPasswordBody.prototype, "token", void 0);
exports.ResetPasswordBody = ResetPasswordBody;


/***/ }),
/* 215 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpExceptionFilter = void 0;
const common_1 = __webpack_require__(1);
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const httpStatus = exception.getStatus();
        response.status(httpStatus).json({
            httpStatus,
            message: exception.getResponse(),
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
};
HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(common_1.HttpException)
], HttpExceptionFilter);
exports.HttpExceptionFilter = HttpExceptionFilter;


/***/ }),
/* 216 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UnknownExceptionFilter = void 0;
const common_1 = __webpack_require__(1);
let UnknownExceptionFilter = class UnknownExceptionFilter {
    constructor(logger = new common_1.Logger('SERVER_ERROR')) {
        this.logger = logger;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const httpStatus = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        this.logger.error(exception.stack);
        response.status(httpStatus).json({
            httpStatus,
            message: exception.message,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
};
UnknownExceptionFilter = __decorate([
    (0, common_1.Catch)(Error),
    __metadata("design:paramtypes", [Object])
], UnknownExceptionFilter);
exports.UnknownExceptionFilter = UnknownExceptionFilter;


/***/ }),
/* 217 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ValidationExceptionFilter = exports.ValidationException = void 0;
const common_1 = __webpack_require__(1);
const exception_const_1 = __webpack_require__(89);
class ValidationException extends Error {
    constructor(validationErrors = []) {
        super(exception_const_1.ErrorMessage.Validate.Failed);
        this.errors = validationErrors;
    }
    getMessage() {
        return this.message;
    }
    getErrors() {
        return this.errors;
    }
}
exports.ValidationException = ValidationException;
let ValidationExceptionFilter = class ValidationExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const httpStatus = common_1.HttpStatus.UNPROCESSABLE_ENTITY;
        const message = exception.getMessage();
        const errors = exception.getErrors();
        response.status(httpStatus).json({
            httpStatus,
            message,
            errors,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
};
ValidationExceptionFilter = __decorate([
    (0, common_1.Catch)(ValidationException)
], ValidationExceptionFilter);
exports.ValidationExceptionFilter = ValidationExceptionFilter;


/***/ }),
/* 218 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccessLogInterceptor = void 0;
const common_1 = __webpack_require__(1);
const request_ip_1 = __webpack_require__(6);
const rxjs_1 = __webpack_require__(219);
const operators_1 = __webpack_require__(220);
const validation_exception_filter_1 = __webpack_require__(217);
let AccessLogInterceptor = class AccessLogInterceptor {
    constructor(logger = new common_1.Logger('ACCESS_LOG')) {
        this.logger = logger;
    }
    intercept(context, next) {
        const createTime = new Date();
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const { url, method, body } = request;
        const { statusCode } = response;
        const ip = (0, request_ip_1.getClientIp)(request);
        return next.handle().pipe((0, operators_1.catchError)((err) => {
            let errMessage = err.message;
            if (err instanceof validation_exception_filter_1.ValidationException) {
                errMessage = errMessage + ' ' + JSON.stringify(err.getErrors());
            }
            const msg = `[ERROR] ${createTime.toISOString()} | ${ip} | ${method} | ${statusCode} | ${url}`
                + ` | ${JSON.stringify(body)} | ${Date.now() - createTime.getTime()}ms | Message: ${errMessage}`;
            this.logger.log(msg);
            return (0, rxjs_1.throwError)(() => err);
        }), (0, operators_1.tap)(() => {
            const msg = `${createTime.toISOString()} | ${ip} | ${method} | ${statusCode} | ${url}`
                + ` | ${JSON.stringify(body)} | ${Date.now() - createTime.getTime()}ms`;
            return this.logger.log(msg);
        }));
    }
};
AccessLogInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], AccessLogInterceptor);
exports.AccessLogInterceptor = AccessLogInterceptor;


/***/ }),
/* 219 */
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),
/* 220 */
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),
/* 221 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TimeoutInterceptor = void 0;
const common_1 = __webpack_require__(1);
const rxjs_1 = __webpack_require__(219);
const operators_1 = __webpack_require__(220);
let TimeoutInterceptor = class TimeoutInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.timeout)(10000), (0, operators_1.catchError)(err => {
            if (err instanceof rxjs_1.TimeoutError) {
                return (0, rxjs_1.throwError)(() => new common_1.RequestTimeoutException());
            }
            return (0, rxjs_1.throwError)(() => err);
        }));
    }
};
TimeoutInterceptor = __decorate([
    (0, common_1.Injectable)()
], TimeoutInterceptor);
exports.TimeoutInterceptor = TimeoutInterceptor;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const express_rate_limit_1 = __webpack_require__(4);
const helmet_1 = __webpack_require__(5);
const requestIp = __webpack_require__(6);
const app_module_1 = __webpack_require__(7);
const business_exception_filter_1 = __webpack_require__(118);
const http_exception_filter_1 = __webpack_require__(215);
const unknown_exception_filter_1 = __webpack_require__(216);
const validation_exception_filter_1 = __webpack_require__(217);
const roles_guard_1 = __webpack_require__(139);
const access_log_interceptor_1 = __webpack_require__(218);
const timeout_interceptor_1 = __webpack_require__(221);
const swagger_1 = __webpack_require__(94);
async function bootstrap() {
    const logger = new common_1.Logger('bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
    app.use((0, helmet_1.default)());
    app.use((0, express_rate_limit_1.default)({
        windowMs: 60 * 1000,
        max: 200,
        standardHeaders: true,
        message: 'Too many request',
    }));
    app.enableCors();
    app.use(requestIp.mw());
    app.useGlobalInterceptors(new access_log_interceptor_1.AccessLogInterceptor(), new timeout_interceptor_1.TimeoutInterceptor(), new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector), {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
    }));
    app.useGlobalFilters(new unknown_exception_filter_1.UnknownExceptionFilter(), new http_exception_filter_1.HttpExceptionFilter(), new business_exception_filter_1.BusinessExceptionFilter(), new validation_exception_filter_1.ValidationExceptionFilter());
    app.useGlobalGuards(new roles_guard_1.RolesGuard(app.get(core_1.Reflector)));
    app.useGlobalPipes(new common_1.ValidationPipe({
        validationError: { target: false, value: true },
        skipMissingProperties: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            excludeExtraneousValues: false,
            exposeUnsetFields: false,
        },
        exceptionFactory: (errors = []) => new validation_exception_filter_1.ValidationException(errors),
    }));
    const configService = app.get(config_1.ConfigService);
    const NODE_ENV = configService.get('NODE_ENV') || 'local';
    const HOST = configService.get('API_PUBLIC_HOST') || 'localhost';
    const PORT = configService.get('API_PUBLIC_PORT') || 7100;
    if (NODE_ENV !== 'production') {
        (0, swagger_1.configSwagger)(app);
    }
    await app.listen(PORT, () => {
        logger.debug(`🚀 ===== [API] Server document: http://${HOST}:${PORT}/documents =====`);
    });
}
bootstrap();

})();

/******/ })()
;
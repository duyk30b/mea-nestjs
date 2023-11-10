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

module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("nest-commander");

/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SeedDataModule = void 0;
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(6);
const typeorm_1 = __webpack_require__(7);
const entities_1 = __webpack_require__(8);
const repository_1 = __webpack_require__(30);
const sql_module_1 = __webpack_require__(68);
const bui_trang_api_1 = __webpack_require__(70);
const long_nguyen_api_1 = __webpack_require__(71);
const seed_data_api_1 = __webpack_require__(72);
const seed_data_command_1 = __webpack_require__(91);
const invoice_seed_1 = __webpack_require__(84);
const customer_seed_1 = __webpack_require__(79);
const diagnosis_seed_1 = __webpack_require__(81);
const distributor_seed_1 = __webpack_require__(82);
const employee_seed_1 = __webpack_require__(83);
const organization_seed_1 = __webpack_require__(85);
const procedure_seed_1 = __webpack_require__(87);
const product_seed_1 = __webpack_require__(89);
const receipt_seed_1 = __webpack_require__(90);
const test_sql_api_1 = __webpack_require__(92);
let SeedDataModule = class SeedDataModule {
};
SeedDataModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`, '.env'],
                isGlobal: true,
            }),
            sql_module_1.SqlModule,
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.Arrival,
                entities_1.Customer,
                entities_1.CustomerDebt,
                entities_1.Distributor,
                entities_1.DistributorPayment,
                entities_1.Diagnosis,
                entities_1.Employee,
                entities_1.Invoice,
                entities_1.InvoiceItem,
                entities_1.Organization,
                entities_1.OrganizationSetting,
                entities_1.Product,
                entities_1.ProductBatch,
                entities_1.ProductMovement,
                entities_1.Procedure,
                entities_1.Receipt,
                entities_1.ReceiptItem,
            ]),
            repository_1.RepositoryModule,
        ],
        controllers: [bui_trang_api_1.BuiTrangApi, long_nguyen_api_1.LongNguyenApi, seed_data_api_1.SeedDataApi, test_sql_api_1.TestApi],
        providers: [
            invoice_seed_1.InvoiceSeed,
            customer_seed_1.CustomerSeed,
            diagnosis_seed_1.DiagnosisSeed,
            distributor_seed_1.DistributorSeed,
            employee_seed_1.EmployeeSeed,
            organization_seed_1.OrganizationSeed,
            procedure_seed_1.ProcedureSeed,
            receipt_seed_1.ReceiptSeed,
            product_seed_1.ProductSeed,
            seed_data_command_1.SeedDataCommand,
        ],
    })
], SeedDataModule);
exports.SeedDataModule = SeedDataModule;


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReceiptItem = exports.Receipt = exports.ProductMovement = exports.ProductBatch = exports.Product = exports.Procedure = exports.OrganizationSetting = exports.Organization = exports.InvoiceItem = exports.Invoice = exports.Employee = exports.DistributorPayment = exports.Distributor = exports.Diagnosis = exports.CustomerDebt = exports.Customer = exports.Arrival = void 0;
const arrival_entity_1 = __webpack_require__(9);
exports.Arrival = arrival_entity_1.default;
const customer_debt_entity_1 = __webpack_require__(21);
exports.CustomerDebt = customer_debt_entity_1.default;
const customer_entity_1 = __webpack_require__(14);
exports.Customer = customer_entity_1.default;
const diagnosis_entity_1 = __webpack_require__(15);
exports.Diagnosis = diagnosis_entity_1.default;
const distributor_debt_entity_1 = __webpack_require__(22);
exports.DistributorPayment = distributor_debt_entity_1.default;
const distributor_entity_1 = __webpack_require__(23);
exports.Distributor = distributor_entity_1.default;
const employee_entity_1 = __webpack_require__(24);
exports.Employee = employee_entity_1.default;
const invoice_item_entity_1 = __webpack_require__(17);
exports.InvoiceItem = invoice_item_entity_1.default;
const invoice_entity_1 = __webpack_require__(16);
exports.Invoice = invoice_entity_1.default;
const organization_setting_entity_1 = __webpack_require__(26);
exports.OrganizationSetting = organization_setting_entity_1.default;
const organization_entity_1 = __webpack_require__(25);
exports.Organization = organization_entity_1.default;
const procedure_entity_1 = __webpack_require__(18);
exports.Procedure = procedure_entity_1.default;
const product_movement_entity_1 = __webpack_require__(27);
exports.ProductMovement = product_movement_entity_1.default;
const product_batch_entity_1 = __webpack_require__(19);
exports.ProductBatch = product_batch_entity_1.default;
const product_entity_1 = __webpack_require__(20);
exports.Product = product_entity_1.default;
const receipt_item_entity_1 = __webpack_require__(29);
exports.ReceiptItem = receipt_item_entity_1.default;
const receipt_entity_1 = __webpack_require__(28);
exports.Receipt = receipt_entity_1.default;


/***/ }),
/* 9 */
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
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(12);
const variable_1 = __webpack_require__(13);
const customer_entity_1 = __webpack_require__(14);
const diagnosis_entity_1 = __webpack_require__(15);
const invoice_entity_1 = __webpack_require__(16);
let Arrival = class Arrival extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'customer_id', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'customer_id' }),
    __metadata("design:type", Number)
], Arrival.prototype, "customerId", void 0);
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
    (0, typeorm_1.Column)({
        name: 'start_time',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => value == null ? value : Number(value),
        },
    }),
    (0, class_transformer_1.Expose)({ name: 'start_time' }),
    __metadata("design:type", Number)
], Arrival.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'end_time',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => value == null ? value : Number(value),
        },
    }),
    (0, class_transformer_1.Expose)({ name: 'end_time' }),
    __metadata("design:type", Number)
], Arrival.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)((type) => customer_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id', referencedColumnName: 'id' }),
    (0, class_transformer_1.Expose)({ name: 'customer' }),
    __metadata("design:type", typeof (_c = typeof customer_entity_1.default !== "undefined" && customer_entity_1.default) === "function" ? _c : Object)
], Arrival.prototype, "customer", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'invoices' }),
    (0, typeorm_1.OneToMany)(() => invoice_entity_1.default, (invoice) => invoice.arrival),
    __metadata("design:type", Array)
], Arrival.prototype, "invoices", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'diagnosis' }),
    __metadata("design:type", typeof (_d = typeof diagnosis_entity_1.default !== "undefined" && diagnosis_entity_1.default) === "function" ? _d : Object)
], Arrival.prototype, "diagnosis", void 0);
Arrival = __decorate([
    (0, typeorm_1.Entity)('arrival'),
    (0, typeorm_1.Index)(['oid']),
    (0, typeorm_1.Index)('IDX_ARRIVAL___OID__START_TIME', ['oid', 'startTime']),
    (0, typeorm_1.Index)('IDX_ARRIVAL___OID__CUSTOMER_ID__START_TIME', ['oid', 'customerId', 'startTime'])
], Arrival);
exports["default"] = Arrival;


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("typeorm");

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseEntity = void 0;
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
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
/* 13 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ArrivalType = exports.ArrivalStatus = exports.InvoiceItemType = exports.ProductMovementType = exports.ReceiptStatus = exports.InvoiceStatus = exports.DebtType = exports.DiscountType = exports.EOrder = exports.ERole = exports.EGender = void 0;
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
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus[InvoiceStatus["Refund"] = 0] = "Refund";
    InvoiceStatus[InvoiceStatus["Draft"] = 1] = "Draft";
    InvoiceStatus[InvoiceStatus["Process"] = 2] = "Process";
    InvoiceStatus[InvoiceStatus["Finish"] = 3] = "Finish";
})(InvoiceStatus = exports.InvoiceStatus || (exports.InvoiceStatus = {}));
var ReceiptStatus;
(function (ReceiptStatus) {
    ReceiptStatus[ReceiptStatus["Refund"] = 0] = "Refund";
    ReceiptStatus[ReceiptStatus["Draft"] = 1] = "Draft";
    ReceiptStatus[ReceiptStatus["Process"] = 2] = "Process";
    ReceiptStatus[ReceiptStatus["Finish"] = 3] = "Finish";
})(ReceiptStatus = exports.ReceiptStatus || (exports.ReceiptStatus = {}));
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
    ArrivalStatus[ArrivalStatus["Refund"] = 0] = "Refund";
    ArrivalStatus[ArrivalStatus["Draft"] = 1] = "Draft";
    ArrivalStatus[ArrivalStatus["Process"] = 2] = "Process";
    ArrivalStatus[ArrivalStatus["Finish"] = 3] = "Finish";
})(ArrivalStatus = exports.ArrivalStatus || (exports.ArrivalStatus = {}));
var ArrivalType;
(function (ArrivalType) {
    ArrivalType[ArrivalType["Invoice"] = 1] = "Invoice";
    ArrivalType[ArrivalType["Normal"] = 2] = "Normal";
})(ArrivalType = exports.ArrivalType || (exports.ArrivalType = {}));


/***/ }),
/* 14 */
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
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(12);
const variable_1 = __webpack_require__(13);
let Customer = class Customer extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name' }),
    (0, class_transformer_1.Expose)({ name: 'full_name' }),
    __metadata("design:type", String)
], Customer.prototype, "fullName", void 0);
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
    (0, typeorm_1.Entity)('customer')
], Customer);
exports["default"] = Customer;


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
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(12);
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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(12);
const variable_1 = __webpack_require__(13);
const arrival_entity_1 = __webpack_require__(9);
const customer_entity_1 = __webpack_require__(14);
const invoice_item_entity_1 = __webpack_require__(17);
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
    (0, typeorm_1.Column)({ name: 'status', type: 'tinyint', default: 1 }),
    (0, class_transformer_1.Expose)({ name: 'status' }),
    __metadata("design:type", typeof (_a = typeof variable_1.InvoiceStatus !== "undefined" && variable_1.InvoiceStatus) === "function" ? _a : Object)
], Invoice.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'create_time',
        type: 'bigint',
        nullable: true,
        transformer: { to: (value) => value, from: (value) => value == null ? value : Number(value) },
    }),
    (0, class_transformer_1.Expose)({ name: 'create_time' }),
    __metadata("design:type", Number)
], Invoice.prototype, "createTime", void 0);
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
        name: 'ship_time',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => value == null ? value : Number(value),
        },
    }),
    (0, class_transformer_1.Expose)({ name: 'ship_time' }),
    __metadata("design:type", Number)
], Invoice.prototype, "shipTime", void 0);
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
    (0, typeorm_1.Column)({ name: 'surcharge_details', type: 'simple-json', default: '[]' }),
    (0, class_transformer_1.Expose)({ name: 'surcharge_details' }),
    __metadata("design:type", Array)
], Invoice.prototype, "surchargeDetails", void 0);
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
    (0, typeorm_1.Column)({ name: 'expenses_details', type: 'simple-json', default: '[]' }),
    (0, class_transformer_1.Expose)({ name: 'expenses_details' }),
    __metadata("design:type", Array)
], Invoice.prototype, "expensesDetails", void 0);
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
/* 17 */
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
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(12);
const variable_1 = __webpack_require__(13);
const invoice_entity_1 = __webpack_require__(16);
const procedure_entity_1 = __webpack_require__(18);
const product_batch_entity_1 = __webpack_require__(19);
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
    (0, typeorm_1.Column)({ name: 'unit', type: 'simple-json', default: '{"name":"","rate":1}' }),
    (0, class_transformer_1.Expose)({ name: 'unit' }),
    __metadata("design:type", typeof (_b = typeof variable_1.UnitType !== "undefined" && variable_1.UnitType) === "function" ? _b : Object)
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
    __metadata("design:type", typeof (_c = typeof variable_1.DiscountType !== "undefined" && variable_1.DiscountType) === "function" ? _c : Object)
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
    __metadata("design:type", typeof (_d = typeof invoice_entity_1.default !== "undefined" && invoice_entity_1.default) === "function" ? _d : Object)
], InvoiceItem.prototype, "invoice", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'product_batch' }),
    (0, typeorm_1.ManyToOne)((type) => product_batch_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'reference_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_e = typeof product_batch_entity_1.default !== "undefined" && product_batch_entity_1.default) === "function" ? _e : Object)
], InvoiceItem.prototype, "productBatch", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'procedure' }),
    (0, typeorm_1.ManyToOne)((type) => procedure_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'reference_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_f = typeof procedure_entity_1.default !== "undefined" && procedure_entity_1.default) === "function" ? _f : Object)
], InvoiceItem.prototype, "procedure", void 0);
InvoiceItem = __decorate([
    (0, typeorm_1.Entity)('invoice_item'),
    (0, typeorm_1.Index)(['oid', 'invoiceId']),
    (0, typeorm_1.Index)(['oid', 'customerId', 'type']),
    (0, typeorm_1.Index)(['oid', 'referenceId'])
], InvoiceItem);
exports["default"] = InvoiceItem;


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
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(12);
let Procedure = class Procedure extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'name' }),
    (0, class_transformer_1.Expose)({ name: 'name' }),
    __metadata("design:type", String)
], Procedure.prototype, "name", void 0);
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
    (0, typeorm_1.Entity)('procedure')
], Procedure);
exports["default"] = Procedure;


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(12);
const product_entity_1 = __webpack_require__(20);
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
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    (0, class_transformer_1.Expose)({ name: 'is_active' }),
    __metadata("design:type", Boolean)
], ProductBatch.prototype, "isActive", void 0);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(12);
const product_batch_entity_1 = __webpack_require__(19);
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
    (0, typeorm_1.Column)({ name: 'quantity', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'quantity' }),
    __metadata("design:type", Number)
], Product.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'group', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'group' }),
    __metadata("design:type", String)
], Product.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit', type: 'simple-json', default: '[]' }),
    (0, class_transformer_1.Expose)({ name: 'unit' }),
    __metadata("design:type", Array)
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(12);
const variable_1 = __webpack_require__(13);
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
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(12);
const variable_1 = __webpack_require__(13);
let DistributorPayment = class DistributorPayment extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'distributor_id' }),
    (0, class_transformer_1.Expose)({ name: 'distributor_id' }),
    __metadata("design:type", Number)
], DistributorPayment.prototype, "distributorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipt_id', default: 0 }),
    (0, class_transformer_1.Expose)({ name: 'receipt_id' }),
    __metadata("design:type", Number)
], DistributorPayment.prototype, "receiptId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type', type: 'tinyint' }),
    (0, class_transformer_1.Expose)({ name: 'type' }),
    __metadata("design:type", typeof (_a = typeof variable_1.DebtType !== "undefined" && variable_1.DebtType) === "function" ? _a : Object)
], DistributorPayment.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'open_debt' }),
    (0, class_transformer_1.Expose)({ name: 'open_debt' }),
    __metadata("design:type", Number)
], DistributorPayment.prototype, "openDebt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'money' }),
    (0, class_transformer_1.Expose)({ name: 'money' }),
    __metadata("design:type", Number)
], DistributorPayment.prototype, "money", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'close_debt' }),
    (0, class_transformer_1.Expose)({ name: 'close_debt' }),
    __metadata("design:type", Number)
], DistributorPayment.prototype, "closeDebt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'create_time',
        type: 'bigint',
        transformer: { to: (value) => value, from: (value) => Number(value) },
    }),
    (0, class_transformer_1.Expose)({ name: 'create_time' }),
    __metadata("design:type", Number)
], DistributorPayment.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'note', nullable: true }),
    (0, class_transformer_1.Expose)({ name: 'note' }),
    __metadata("design:type", String)
], DistributorPayment.prototype, "note", void 0);
DistributorPayment = __decorate([
    (0, typeorm_1.Entity)('distributor_debt'),
    (0, typeorm_1.Index)(['oid', 'distributorId'])
], DistributorPayment);
exports["default"] = DistributorPayment;


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
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(12);
let DistributorEntity = class DistributorEntity extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'full_name' }),
    (0, class_transformer_1.Expose)({ name: 'full_name' }),
    __metadata("design:type", String)
], DistributorEntity.prototype, "fullName", void 0);
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
    (0, typeorm_1.Entity)('distributor')
], DistributorEntity);
exports["default"] = DistributorEntity;


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(12);
const variable_1 = __webpack_require__(13);
const organization_entity_1 = __webpack_require__(25);
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
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
exports.OrganizationSettingType = void 0;
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(12);
var OrganizationSettingType;
(function (OrganizationSettingType) {
    OrganizationSettingType["PRODUCT_GROUP"] = "PRODUCT_GROUP";
    OrganizationSettingType["PRODUCT_UNIT"] = "PRODUCT_UNIT";
    OrganizationSettingType["PRODUCT_ROUTE"] = "PRODUCT_ROUTE";
    OrganizationSettingType["PROCEDURE_GROUP"] = "PROCEDURE_GROUP";
    OrganizationSettingType["SCREEN_PRODUCT_LIST"] = "SCREEN_PRODUCT_LIST";
    OrganizationSettingType["SCREEN_RECEIPT_LIST"] = "SCREEN_RECEIPT_LIST";
    OrganizationSettingType["SCREEN_RECEIPT_DETAIL"] = "SCREEN_RECEIPT_DETAIL";
    OrganizationSettingType["SCREEN_RECEIPT_UPSERT"] = "SCREEN_RECEIPT_UPSERT";
    OrganizationSettingType["SCREEN_INVOICE_LIST"] = "SCREEN_INVOICE_LIST";
    OrganizationSettingType["SCREEN_INVOICE_DETAIL"] = "SCREEN_INVOICE_DETAIL";
    OrganizationSettingType["SCREEN_INVOICE_UPSERT"] = "SCREEN_INVOICE_UPSERT";
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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(12);
const variable_1 = __webpack_require__(13);
const invoice_entity_1 = __webpack_require__(16);
const product_batch_entity_1 = __webpack_require__(19);
const receipt_entity_1 = __webpack_require__(28);
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const _1 = __webpack_require__(8);
const base_entity_1 = __webpack_require__(12);
const variable_1 = __webpack_require__(13);
const receipt_item_entity_1 = __webpack_require__(29);
let Receipt = class Receipt extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'distributor_id' }),
    (0, class_transformer_1.Expose)({ name: 'distributor_id' }),
    __metadata("design:type", Number)
], Receipt.prototype, "distributorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', type: 'tinyint' }),
    (0, class_transformer_1.Expose)({ name: 'status' }),
    __metadata("design:type", typeof (_a = typeof variable_1.ReceiptStatus !== "undefined" && variable_1.ReceiptStatus) === "function" ? _a : Object)
], Receipt.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'create_time',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => value == null ? value : Number(value),
        },
    }),
    (0, class_transformer_1.Expose)({ name: 'create_time' }),
    __metadata("design:type", Number)
], Receipt.prototype, "createTime", void 0);
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
        name: 'ship_time',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => value == null ? value : Number(value),
        },
    }),
    (0, class_transformer_1.Expose)({ name: 'ship_time' }),
    __metadata("design:type", Number)
], Receipt.prototype, "shipTime", void 0);
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
    (0, class_transformer_1.Expose)({ name: 'distributor' }),
    (0, typeorm_1.ManyToOne)((type) => _1.Distributor, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'distributor_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_c = typeof _1.Distributor !== "undefined" && _1.Distributor) === "function" ? _c : Object)
], Receipt.prototype, "distributor", void 0);
Receipt = __decorate([
    (0, typeorm_1.Entity)('receipt'),
    (0, typeorm_1.Index)(['oid', 'paymentTime'])
], Receipt);
exports["default"] = Receipt;


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const class_transformer_1 = __webpack_require__(10);
const typeorm_1 = __webpack_require__(11);
const base_entity_1 = __webpack_require__(12);
const variable_1 = __webpack_require__(13);
const product_batch_entity_1 = __webpack_require__(19);
const receipt_entity_1 = __webpack_require__(28);
let ReceiptItem = class ReceiptItem extends base_entity_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.Column)({ name: 'receipt_id' }),
    (0, class_transformer_1.Expose)({ name: 'receipt_id' }),
    __metadata("design:type", Number)
], ReceiptItem.prototype, "receiptId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'distributor_id' }),
    (0, class_transformer_1.Expose)({ name: 'distributor_id' }),
    __metadata("design:type", Number)
], ReceiptItem.prototype, "distributorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_batch_id' }),
    (0, class_transformer_1.Expose)({ name: 'product_batch_id' }),
    __metadata("design:type", Number)
], ReceiptItem.prototype, "productBatchId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit', type: 'simple-json', default: '{"name":"","rate":1}' }),
    (0, class_transformer_1.Expose)({ name: 'unit' }),
    __metadata("design:type", typeof (_a = typeof variable_1.UnitType !== "undefined" && variable_1.UnitType) === "function" ? _a : Object)
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
    __metadata("design:type", typeof (_b = typeof receipt_entity_1.default !== "undefined" && receipt_entity_1.default) === "function" ? _b : Object)
], ReceiptItem.prototype, "receipt", void 0);
__decorate([
    (0, class_transformer_1.Expose)({ name: 'product_batch' }),
    (0, typeorm_1.ManyToOne)((type) => product_batch_entity_1.default, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'product_batch_id', referencedColumnName: 'id' }),
    __metadata("design:type", typeof (_c = typeof product_batch_entity_1.default !== "undefined" && product_batch_entity_1.default) === "function" ? _c : Object)
], ReceiptItem.prototype, "productBatch", void 0);
ReceiptItem = __decorate([
    (0, typeorm_1.Entity)('receipt_item'),
    (0, typeorm_1.Index)(['oid', 'productBatchId']),
    (0, typeorm_1.Index)(['oid', 'receiptId'])
], ReceiptItem);
exports["default"] = ReceiptItem;


/***/ }),
/* 30 */
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
__exportStar(__webpack_require__(31), exports);
__exportStar(__webpack_require__(32), exports);
__exportStar(__webpack_require__(33), exports);
__exportStar(__webpack_require__(34), exports);
__exportStar(__webpack_require__(35), exports);
__exportStar(__webpack_require__(36), exports);
__exportStar(__webpack_require__(39), exports);
__exportStar(__webpack_require__(40), exports);
__exportStar(__webpack_require__(41), exports);
__exportStar(__webpack_require__(42), exports);
__exportStar(__webpack_require__(43), exports);
__exportStar(__webpack_require__(44), exports);
__exportStar(__webpack_require__(45), exports);
__exportStar(__webpack_require__(46), exports);
__exportStar(__webpack_require__(47), exports);
__exportStar(__webpack_require__(48), exports);
__exportStar(__webpack_require__(49), exports);
__exportStar(__webpack_require__(50), exports);
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
__exportStar(__webpack_require__(52), exports);
__exportStar(__webpack_require__(63), exports);
__exportStar(__webpack_require__(65), exports);
__exportStar(__webpack_require__(66), exports);
__exportStar(__webpack_require__(67), exports);


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ArrivalRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(7);
const variable_1 = __webpack_require__(13);
const typeorm_2 = __webpack_require__(11);
const entities_1 = __webpack_require__(8);
let ArrivalRepository = class ArrivalRepository {
    constructor(dataSource, manager) {
        this.dataSource = dataSource;
        this.manager = manager;
    }
    getWhereOptions(condition = {}) {
        const where = {};
        if (condition.oid != null)
            where.oid = condition.oid;
        if (condition.id != null)
            where.id = condition.id;
        if (condition.customerId != null)
            where.customerId = condition.customerId;
        if (condition.type != null)
            where.type = condition.type;
        if (condition.status != null)
            where.status = condition.status;
        if (condition.ids) {
            if (condition.ids.length === 0)
                condition.ids.push(0);
            where.id = (0, typeorm_2.In)(condition.ids);
        }
        if (condition.types)
            where.type = (0, typeorm_2.In)(condition.types);
        let startTime = undefined;
        if (condition.fromTime && condition.toTime)
            startTime = (0, typeorm_2.Between)(condition.fromTime, condition.toTime);
        else if (condition.fromTime)
            startTime = (0, typeorm_2.MoreThanOrEqual)(condition.fromTime);
        else if (condition.toTime)
            startTime = (0, typeorm_2.LessThan)(condition.toTime);
        if (startTime != null)
            where.startTime = startTime;
        return where;
    }
    async pagination(options) {
        const { limit, page, condition, order } = options;
        const [data, total] = await this.manager.findAndCount(entities_1.Arrival, {
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async findOne(condition, relation) {
        var _a, _b, _c, _d, _e;
        let query = this.manager.createQueryBuilder(entities_1.Arrival, 'arrival');
        if (relation === null || relation === void 0 ? void 0 : relation.customer)
            query = query.leftJoinAndSelect('arrival.customer', 'customer');
        if (relation === null || relation === void 0 ? void 0 : relation.invoices)
            query = query.leftJoinAndSelect('arrival.invoices', 'invoice');
        if ((_a = relation === null || relation === void 0 ? void 0 : relation.invoices) === null || _a === void 0 ? void 0 : _a.invoiceItems)
            query = query.leftJoinAndSelect('invoice.invoiceItems', 'invoiceItem');
        if ((_c = (_b = relation === null || relation === void 0 ? void 0 : relation.invoices) === null || _b === void 0 ? void 0 : _b.invoiceItems) === null || _c === void 0 ? void 0 : _c.procedure)
            query = query.leftJoinAndSelect('invoiceItem.procedure', 'procedure', 'invoiceItem.type = :typeProcedure', { typeProcedure: variable_1.InvoiceItemType.Procedure });
        if ((_e = (_d = relation === null || relation === void 0 ? void 0 : relation.invoices) === null || _d === void 0 ? void 0 : _d.invoiceItems) === null || _e === void 0 ? void 0 : _e.productBatch) {
            query = query
                .leftJoinAndSelect('invoiceItem.productBatch', 'productBatch', 'invoiceItem.type = :typeProductBatch', { typeProductBatch: variable_1.InvoiceItemType.ProductBatch })
                .leftJoinAndSelect('productBatch.product', 'product');
        }
        query = query.where('arrival.id = :id', { id: condition.id })
            .andWhere('arrival.oid = :oid', { oid: condition.oid });
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
/* 33 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomerDebtCondition = void 0;
class CustomerDebtCondition {
}
exports.CustomerDebtCondition = CustomerDebtCondition;


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomerDebtRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(7);
const variable_1 = __webpack_require__(13);
const entities_1 = __webpack_require__(8);
const typeorm_2 = __webpack_require__(11);
let CustomerDebtRepository = class CustomerDebtRepository {
    constructor(dataSource, customerDebtRepository) {
        this.dataSource = dataSource;
        this.customerDebtRepository = customerDebtRepository;
    }
    getWhereOptions(condition = {}) {
        const where = {};
        if (condition.id != null)
            where.id = condition.id;
        if (condition.oid != null)
            where.oid = condition.oid;
        if (condition.customerId != null)
            where.customerId = condition.customerId;
        if (condition.ids) {
            if (condition.ids.length === 0)
                condition.ids.push(0);
            where.id = (0, typeorm_2.In)(condition.ids);
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, condition, order } = options;
        const [data, total] = await this.customerDebtRepository.findAndCount({
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async findMany(condition) {
        const where = this.getWhereOptions(condition);
        return await this.customerDebtRepository.find({ where });
    }
    async findOne(condition) {
        const where = this.getWhereOptions(condition);
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
/* 35 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 36 */
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
const typeorm_1 = __webpack_require__(7);
const string_helper_1 = __webpack_require__(37);
const base_dto_1 = __webpack_require__(38);
const typeorm_2 = __webpack_require__(11);
const entities_1 = __webpack_require__(8);
let CustomerRepository = class CustomerRepository {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    getWhereOptions(condition) {
        const where = {};
        if (condition.oid != null)
            where.oid = condition.oid;
        if (condition.id != null)
            where.id = condition.id;
        if (condition.isActive != null)
            where.isActive = condition.isActive;
        if (condition.ids) {
            if (condition.ids.length === 0)
                condition.ids.push(0);
            where.id = (0, typeorm_2.In)(condition.ids);
        }
        if (condition.fullName && Array.isArray(condition.fullName)) {
            if (condition.fullName[0] === 'LIKE' && condition.fullName[1]) {
                const text = (0, base_dto_1.escapeSearch)((0, string_helper_1.convertViToEn)(condition.fullName[1]));
                where.fullName = (0, typeorm_2.Like)(`%${text}%`);
            }
        }
        if (condition.phone && Array.isArray(condition.phone)) {
            if (condition.phone[0] === 'LIKE' && condition.phone[1]) {
                where.phone = (0, typeorm_2.Like)(`%${(0, base_dto_1.escapeSearch)(condition.phone[1])}%`);
            }
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, condition, order } = options;
        const [data, total] = await this.customerRepository.findAndCount({
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async find(options) {
        const { limit, condition, order } = options;
        return await this.customerRepository.find({
            where: this.getWhereOptions(condition),
            order,
            take: limit,
        });
    }
    async findMany(condition) {
        return await this.customerRepository.find({ where: this.getWhereOptions(condition) });
    }
    async findOne(condition, order) {
        return await this.customerRepository.findOne({
            where: this.getWhereOptions(condition),
            order,
        });
    }
    async insertOne(dto) {
        const customer = this.customerRepository.create(dto);
        return this.customerRepository.save(customer);
    }
    async update(condition, dto) {
        const where = this.getWhereOptions(condition);
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
/* 37 */
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
/* 38 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.escapeSearch = void 0;
const escapeSearch = (str = '') => {
    return str.toLowerCase().replace(/[?%\\_]/gi, (x) => '\\' + x);
};
exports.escapeSearch = escapeSearch;


/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConditionDiagnosis = void 0;
class ConditionDiagnosis {
}
exports.ConditionDiagnosis = ConditionDiagnosis;


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DiagnosisRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(7);
const diagnosis_entity_1 = __webpack_require__(15);
const typeorm_2 = __webpack_require__(11);
let DiagnosisRepository = class DiagnosisRepository {
    constructor(diagnosisRepository) {
        this.diagnosisRepository = diagnosisRepository;
    }
    getWhereOptions(condition = {}) {
        const where = {};
        if (condition.id != null)
            where.id = condition.id;
        if (condition.arrivalId != null)
            where.arrivalId = condition.arrivalId;
        if (condition.ids) {
            if (condition.ids.length === 0)
                condition.ids.push(0);
            where.id = (0, typeorm_2.In)(condition.ids);
        }
        return where;
    }
    async findOne(condition) {
        const where = this.getWhereOptions(condition);
        return await this.diagnosisRepository.findOne({ where });
    }
    async findMany(condition) {
        const where = this.getWhereOptions(condition);
        return await this.diagnosisRepository.find({ where });
    }
    async insertOne(dto) {
        const product = this.diagnosisRepository.create(dto);
        return this.diagnosisRepository.save(product);
    }
    async update(condition, dto) {
        const where = this.getWhereOptions(condition);
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
/* 41 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DistributorPaymentCondition = void 0;
class DistributorPaymentCondition {
}
exports.DistributorPaymentCondition = DistributorPaymentCondition;


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DistributorPaymentRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(7);
const variable_1 = __webpack_require__(13);
const entities_1 = __webpack_require__(8);
const typeorm_2 = __webpack_require__(11);
let DistributorPaymentRepository = class DistributorPaymentRepository {
    constructor(dataSource, distributorPaymentRepository) {
        this.dataSource = dataSource;
        this.distributorPaymentRepository = distributorPaymentRepository;
    }
    getWhereOptions(condition = {}) {
        const where = {};
        if (condition.id != null)
            where.id = condition.id;
        if (condition.oid != null)
            where.oid = condition.oid;
        if (condition.distributorId != null)
            where.distributorId = condition.distributorId;
        if (condition.ids) {
            if (condition.ids.length === 0)
                condition.ids.push(0);
            where.id = (0, typeorm_2.In)(condition.ids);
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, condition, order } = options;
        const [data, total] = await this.distributorPaymentRepository.findAndCount({
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async findMany(condition) {
        const where = this.getWhereOptions(condition);
        return await this.distributorPaymentRepository.find({ where });
    }
    async findOne(condition) {
        const where = this.getWhereOptions(condition);
        return await this.distributorPaymentRepository.findOne({ where });
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
            const distributorPaymentSnap = manager.create(entities_1.DistributorPayment, {
                oid,
                distributorId,
                type: variable_1.DebtType.PayUp,
                createTime,
                openDebt,
                money: -money,
                closeDebt: openDebt - money,
                note,
            });
            const distributorPayment = await manager.save(distributorPaymentSnap);
            return { distributor, distributorPayment };
        });
    }
};
DistributorPaymentRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.DistributorPayment)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], DistributorPaymentRepository);
exports.DistributorPaymentRepository = DistributorPaymentRepository;


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DistributorCondition = void 0;
class DistributorCondition {
}
exports.DistributorCondition = DistributorCondition;


/***/ }),
/* 44 */
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
const typeorm_1 = __webpack_require__(7);
const string_helper_1 = __webpack_require__(37);
const base_dto_1 = __webpack_require__(38);
const typeorm_2 = __webpack_require__(11);
const entities_1 = __webpack_require__(8);
let DistributorRepository = class DistributorRepository {
    constructor(distributorRepository) {
        this.distributorRepository = distributorRepository;
    }
    getWhereOptions(condition) {
        const where = {};
        if (condition.id != null)
            where.id = condition.id;
        if (condition.oid != null)
            where.oid = condition.oid;
        if (condition.isActive != null)
            where.isActive = condition.isActive;
        if (condition.ids) {
            if (condition.ids.length === 0)
                condition.ids.push(0);
            where.id = (0, typeorm_2.In)(condition.ids);
        }
        if (condition.fullName && Array.isArray(condition.fullName)) {
            if (condition.fullName[0] === 'LIKE' && condition.fullName[1]) {
                const text = (0, base_dto_1.escapeSearch)((0, string_helper_1.convertViToEn)(condition.fullName[1]));
                where.fullName = (0, typeorm_2.Like)(`%${text}%`);
            }
        }
        if (condition.phone && Array.isArray(condition.phone)) {
            if (condition.phone[0] === 'LIKE' && condition.phone[1]) {
                where.phone = (0, typeorm_2.Like)(`%${(0, base_dto_1.escapeSearch)(condition.phone[1])}%`);
            }
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, condition, order } = options;
        const [data, total] = await this.distributorRepository.findAndCount({
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async find(options) {
        return await this.distributorRepository.find({
            where: this.getWhereOptions(options.condition),
            order: options.order,
            take: options.limit,
        });
    }
    async findMany(condition) {
        return await this.distributorRepository.find({ where: this.getWhereOptions(condition) });
    }
    async findOne(condition) {
        return await this.distributorRepository.findOne({ where: this.getWhereOptions(condition) });
    }
    async insertOne(dto) {
        const distributor = this.distributorRepository.create(dto);
        return this.distributorRepository.save(distributor, { transaction: false });
    }
    async updateOne(condition, dto) {
        const where = this.getWhereOptions(condition);
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
/* 45 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmployeeCondition = void 0;
class EmployeeCondition {
}
exports.EmployeeCondition = EmployeeCondition;


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
exports.EmployeeRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(7);
const typeorm_2 = __webpack_require__(11);
const entities_1 = __webpack_require__(8);
let EmployeeRepository = class EmployeeRepository {
    constructor(employeeRepository) {
        this.employeeRepository = employeeRepository;
    }
    getWhereOptions(condition) {
        const where = {};
        if (condition.oid !== undefined)
            where.oid = condition.oid;
        if (condition.id !== undefined)
            where.id = condition.id;
        if (condition.ids) {
            if (condition.ids.length === 0)
                condition.ids.push(0);
            where.id = (0, typeorm_2.In)(condition.ids);
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, condition, order } = options;
        const [data, total] = await this.employeeRepository.findAndCount({
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async findOne(condition) {
        const where = this.getWhereOptions(condition);
        return await this.employeeRepository.findOne({ where });
    }
    async findOneOrFail(condition) {
        const where = this.getWhereOptions(condition);
        return await this.employeeRepository.findOneOrFail({ where });
    }
    async insertOne(dto) {
        const employee = this.employeeRepository.create(dto);
        return this.employeeRepository.save(employee);
    }
    async update(condition, dto) {
        const where = this.getWhereOptions(condition);
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
/* 47 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


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
exports.InvoiceItemRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(7);
const entities_1 = __webpack_require__(8);
const typeorm_2 = __webpack_require__(11);
let InvoiceItemRepository = class InvoiceItemRepository {
    constructor(dataSource, manager) {
        this.dataSource = dataSource;
        this.manager = manager;
    }
    getWhereOptions(condition = {}) {
        const where = {};
        if (condition.id != null)
            where.id = condition.id;
        if (condition.oid != null)
            where.oid = condition.oid;
        if (condition.customerId != null)
            where.customerId = condition.customerId;
        if (condition.referenceId != null)
            where.referenceId = condition.referenceId;
        if (condition.type != null)
            where.type = condition.type;
        if (condition.ids) {
            if (condition.ids.length === 0)
                condition.ids.push(0);
            where.id = (0, typeorm_2.In)(condition.ids);
        }
        return where;
    }
    getQueryBuilder(condition = {}) {
        let query = this.manager.createQueryBuilder(entities_1.InvoiceItem, 'invoiceItem');
        if (condition.id != null) {
            query = query.andWhere('invoiceItem.id = :id', { id: condition.id });
        }
        if (condition.referenceId != null) {
            query = query.andWhere('invoiceItem.referenceId = :referenceId', { referenceId: condition.referenceId });
        }
        if (condition.type != null) {
            query = query.andWhere('invoiceItem.type = :type', { type: condition.type });
        }
        if (condition.oid != null) {
            query = query.andWhere('invoiceItem.oid = :oid', { oid: condition.oid });
        }
        return query;
    }
    async pagination(options) {
        const { limit, page, condition, order } = options;
        const [data, total] = await this.manager.findAndCount(entities_1.InvoiceItem, {
            where: this.getWhereOptions(condition),
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
/* 49 */
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
exports.InvoiceRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(7);
const variable_1 = __webpack_require__(13);
const entities_1 = __webpack_require__(8);
const typeorm_2 = __webpack_require__(11);
let InvoiceRepository = class InvoiceRepository {
    constructor(manager) {
        this.manager = manager;
    }
    getWhereOptions(condition = {}) {
        const where = {};
        if (condition.id != null)
            where.id = condition.id;
        if (condition.oid != null)
            where.oid = condition.oid;
        if (condition.customerId != null)
            where.customerId = condition.customerId;
        if (condition.arrivalId != null)
            where.arrivalId = condition.arrivalId;
        if (condition.status != null)
            where.status = condition.status;
        if (condition.ids) {
            if (condition.ids.length === 0)
                condition.ids.push(0);
            where.id = (0, typeorm_2.In)(condition.ids);
        }
        if (condition.customerIds) {
            if (condition.customerIds.length === 0)
                condition.customerIds.push(0);
            where.customerId = (0, typeorm_2.In)(condition.customerIds);
        }
        if (condition.arrivalIds) {
            if (condition.arrivalIds.length === 0)
                condition.arrivalIds.push(0);
            where.arrivalId = (0, typeorm_2.In)(condition.arrivalIds);
        }
        if (condition.statuses) {
            if (condition.statuses.length === 0)
                condition.statuses.push(0);
            where.status = (0, typeorm_2.In)(condition.statuses);
        }
        if (condition.createTime != null) {
            if (typeof condition.createTime === 'number') {
                where.createTime = condition.createTime;
            }
            else if (Array.isArray(condition.createTime)) {
                if (condition.createTime[0] === 'BETWEEN') {
                    where.createTime = (0, typeorm_2.Between)(condition.createTime[1], condition.createTime[2]);
                }
            }
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, condition, relation, order } = options;
        const [data, total] = await this.manager.findAndCount(entities_1.Invoice, {
            relations: { customer: !!(relation === null || relation === void 0 ? void 0 : relation.customer) },
            relationLoadStrategy: 'query',
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async findOne(condition, relation) {
        const [invoice] = await this.manager.find(entities_1.Invoice, {
            where: this.getWhereOptions(condition),
            relations: { customer: !!(relation === null || relation === void 0 ? void 0 : relation.customer) },
            relationLoadStrategy: 'join',
        });
        return invoice;
    }
    async findMany(condition, relation) {
        const invoices = await this.manager.find(entities_1.Invoice, {
            where: this.getWhereOptions(condition),
            relations: { customer: !!(relation === null || relation === void 0 ? void 0 : relation.customer) },
            relationLoadStrategy: 'join',
        });
        return invoices;
    }
    async queryOneBy(condition, relation) {
        var _a, _b, _c, _d;
        let query = this.manager.createQueryBuilder(entities_1.Invoice, 'invoice')
            .where('invoice.id = :id', { id: condition.id })
            .andWhere('invoice.oid = :oid', { oid: condition.oid });
        if (relation === null || relation === void 0 ? void 0 : relation.customer)
            query = query.leftJoinAndSelect('invoice.customer', 'customer');
        if (relation === null || relation === void 0 ? void 0 : relation.invoiceItems)
            query = query.leftJoinAndSelect('invoice.invoiceItems', 'invoiceItem');
        if ((_a = relation === null || relation === void 0 ? void 0 : relation.invoiceItems) === null || _a === void 0 ? void 0 : _a.procedure)
            query = query.leftJoinAndSelect('invoiceItem.procedure', 'procedure', 'invoiceItem.type = :typeProcedure', { typeProcedure: variable_1.InvoiceItemType.Procedure });
        if ((_b = relation === null || relation === void 0 ? void 0 : relation.invoiceItems) === null || _b === void 0 ? void 0 : _b.productBatch) {
            query = query.leftJoinAndSelect('invoiceItem.productBatch', 'productBatch', 'invoiceItem.type = :typeProductBatch', { typeProductBatch: variable_1.InvoiceItemType.ProductBatch });
        }
        if ((_d = (_c = relation === null || relation === void 0 ? void 0 : relation.invoiceItems) === null || _c === void 0 ? void 0 : _c.productBatch) === null || _d === void 0 ? void 0 : _d.product) {
            query = query.leftJoinAndSelect('productBatch.product', 'product');
        }
        const invoice = await query.getOne();
        return invoice;
    }
};
InvoiceRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _a : Object])
], InvoiceRepository);
exports.InvoiceRepository = InvoiceRepository;


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceQuickRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(7);
const object_helper_1 = __webpack_require__(51);
const variable_1 = __webpack_require__(13);
const entities_1 = __webpack_require__(8);
const typeorm_2 = __webpack_require__(11);
const product_repository_1 = __webpack_require__(52);
let InvoiceQuickRepository = class InvoiceQuickRepository {
    constructor(dataSource, manager, productRepository) {
        this.dataSource = dataSource;
        this.manager = manager;
        this.productRepository = productRepository;
    }
    async createDraft(params) {
        const { oid, invoiceInsertDto } = params;
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            var _a, _b;
            const _c = manager.create(entities_1.Invoice, invoiceInsertDto), { invoiceItems } = _c, invoiceSnap = __rest(_c, ["invoiceItems"]);
            invoiceSnap.oid = oid;
            invoiceSnap.status = variable_1.InvoiceStatus.Draft;
            const invoiceInsertResult = await manager.insert(entities_1.Invoice, invoiceSnap);
            const invoiceId = (_b = (_a = invoiceInsertResult.identifiers) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id;
            if (!invoiceId) {
                throw new Error(`Create Invoice failed: Insert error ${JSON.stringify(invoiceInsertResult)}`);
            }
            const invoiceItemsSnap = manager.create(entities_1.InvoiceItem, invoiceInsertDto.invoiceItems);
            invoiceItemsSnap.forEach((item) => {
                item.oid = oid;
                item.invoiceId = invoiceId;
                item.customerId = invoiceInsertDto.customerId;
            });
            await manager.insert(entities_1.InvoiceItem, invoiceItemsSnap);
            return { invoiceId };
        });
    }
    async updateDraft(params) {
        const { oid, invoiceId, invoiceUpdateDto } = params;
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const _a = manager.create(entities_1.Invoice, invoiceUpdateDto), { invoiceItems } = _a, invoiceSnap = __rest(_a, ["invoiceItems"]);
            const invoiceUpdateResult = await manager.update(entities_1.Invoice, {
                id: invoiceId,
                oid,
                status: variable_1.InvoiceStatus.Draft,
            }, invoiceSnap);
            if (invoiceUpdateResult.affected !== 1) {
                throw new Error(`Update Invoice ${invoiceId} failed: Status invalid`);
            }
            const invoice = await manager.findOneBy(entities_1.Invoice, { id: invoiceId, oid });
            await manager.delete(entities_1.InvoiceItem, { oid, invoiceId });
            const invoiceItemsSnap = manager.create(entities_1.InvoiceItem, invoiceUpdateDto.invoiceItems);
            invoiceItemsSnap.forEach((item) => {
                item.oid = oid;
                item.invoiceId = invoiceId;
                item.customerId = invoice.customerId;
            });
            await manager.insert(entities_1.InvoiceItem, invoiceItemsSnap);
            return { invoiceId };
        });
    }
    async deleteDraft(params) {
        const { oid, invoiceId } = params;
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const invoiceDeleteResult = await manager.delete(entities_1.Invoice, {
                oid,
                id: invoiceId,
                status: variable_1.InvoiceStatus.Draft,
            });
            if (invoiceDeleteResult.affected !== 1) {
                throw new Error(`Delete Invoice ${invoiceId} failed: Status invalid`);
            }
            await manager.delete(entities_1.InvoiceItem, { oid, invoiceId });
        });
    }
    async startShip(params) {
        const { oid, invoiceId, shipTime } = params;
        const transaction = await this.dataSource.transaction(async (manager) => {
            const invoiceUpdateResult = await manager.update(entities_1.Invoice, {
                id: invoiceId,
                oid,
                shipTime: (0, typeorm_2.IsNull)(),
                status: (0, typeorm_2.In)([variable_1.InvoiceStatus.Draft, variable_1.InvoiceStatus.Process]),
            }, {
                shipTime,
                status: variable_1.InvoiceStatus.Process,
            });
            if (invoiceUpdateResult.affected !== 1) {
                throw new Error(`Process Invoice ${invoiceId} failed: Status invalid`);
            }
            const [invoice] = await manager.find(entities_1.Invoice, {
                relations: { invoiceItems: true },
                relationLoadStrategy: 'join',
                where: { oid, id: invoiceId },
            });
            if (invoice.invoiceItems.length === 0) {
                throw new Error(`Process Invoice ${invoiceId} failed: invoiceItems.length = 0`);
            }
            if (invoice.shipTime && invoice.paymentTime) {
                await manager.update(entities_1.Invoice, { id: invoiceId }, { status: variable_1.InvoiceStatus.Finish });
            }
            const invoiceItemsProduct = invoice.invoiceItems.filter((i) => i.type === variable_1.InvoiceItemType.ProductBatch);
            const invoiceItemIds = invoiceItemsProduct.map((i) => i.id);
            const productBatchIds = (0, object_helper_1.uniqueArray)(invoiceItemsProduct.map((i) => i.referenceId));
            let productIds;
            if (shipTime && invoiceItemsProduct.length) {
                const updateBatch = await manager.query(`
					UPDATE product_batch 
						LEFT JOIN ( SELECT reference_id, SUM(quantity) as sum_quantity 
							FROM invoice_item
							WHERE invoice_item.id IN (${invoiceItemIds.toString()})
							GROUP BY reference_id
						) sii 
						ON product_batch.id = sii.reference_id
					SET product_batch.quantity = product_batch.quantity - sii.sum_quantity
					WHERE product_batch.id IN (${productBatchIds.toString()})
						AND product_batch.oid = ${oid}
				`);
                if (updateBatch.affectedRows !== productBatchIds.length) {
                    throw new Error(`Process Invoice ${invoiceId} failed: Some batch can't update quantity`);
                }
                const productBatches = await manager.find(entities_1.ProductBatch, { where: { id: (0, typeorm_2.In)(productBatchIds) } });
                productIds = (0, object_helper_1.uniqueArray)(productBatches.map((i) => i.productId));
                const productMovementsSnap = invoiceItemsProduct.map((invoiceItem) => {
                    const productBatch = productBatches.find((i) => i.id === invoiceItem.referenceId);
                    if (!productBatch) {
                        throw new Error(`Process Invoice ${invoiceId} failed: ProductBatchID ${invoiceItem.referenceId} invalid`);
                    }
                    productBatch.quantity = productBatch.quantity + invoiceItem.quantity;
                    return manager.create(entities_1.ProductMovement, {
                        oid,
                        productId: productBatch.productId,
                        productBatchId: productBatch.id,
                        referenceId: invoiceId,
                        createTime: shipTime,
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
            return { productIds };
        });
        if (transaction.productIds.length) {
            await this.productRepository.calculateProductQuantity({
                oid,
                productIds: transaction.productIds,
            });
        }
    }
    async startPayment(params) {
        const { oid, invoiceId, paymentTime, debt } = params;
        await this.dataSource.transaction(async (manager) => {
            const invoiceUpdateResult = await manager.update(entities_1.Invoice, {
                id: invoiceId,
                oid,
                paymentTime: (0, typeorm_2.IsNull)(),
                status: (0, typeorm_2.In)([variable_1.InvoiceStatus.Draft, variable_1.InvoiceStatus.Process]),
            }, {
                paymentTime,
                debt,
                status: variable_1.InvoiceStatus.Process,
            });
            if (invoiceUpdateResult.affected !== 1) {
                throw new Error(`Payment Invoice ${invoiceId} failed: Status invalid`);
            }
            const invoice = await manager.findOneBy(entities_1.Invoice, { oid, id: invoiceId });
            if (invoice.shipTime && invoice.paymentTime) {
                await manager.update(entities_1.Invoice, { id: invoiceId }, { status: variable_1.InvoiceStatus.Finish });
            }
            if (paymentTime && debt) {
                const updateCustomer = await manager.increment(entities_1.Customer, { id: invoice.customerId }, 'debt', debt);
                if (updateCustomer.affected !== 1) {
                    throw new Error(`Payment Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`);
                }
                const customer = await manager.findOneBy(entities_1.Customer, { oid, id: invoice.customerId });
                const customerDebtDto = manager.create(entities_1.CustomerDebt, {
                    oid,
                    customerId: invoice.customerId,
                    invoiceId,
                    type: variable_1.DebtType.Borrow,
                    createTime: paymentTime,
                    openDebt: customer.debt - debt,
                    money: debt,
                    closeDebt: customer.debt,
                });
                await manager.insert(entities_1.CustomerDebt, customerDebtDto);
            }
        });
    }
    async startRefund(params) {
        const { oid, invoiceId, refundTime } = params;
        const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const invoiceUpdateResult = await manager.update(entities_1.Invoice, {
                id: invoiceId,
                oid,
                status: (0, typeorm_2.In)([variable_1.InvoiceStatus.Process, variable_1.InvoiceStatus.Finish]),
            }, {
                refundTime,
                status: variable_1.InvoiceStatus.Refund,
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
            const invoiceItemsProduct = invoice.invoiceItems.filter((i) => i.type === variable_1.InvoiceItemType.ProductBatch);
            const invoiceItemIds = invoiceItemsProduct.map((i) => i.id);
            const productBatchIds = (0, object_helper_1.uniqueArray)(invoiceItemsProduct.map((i) => i.referenceId));
            let productIds;
            if (invoice.shipTime && invoiceItemsProduct.length) {
                const updateBatch = await manager.query(`
					UPDATE product_batch 
						LEFT JOIN ( SELECT reference_id, SUM(quantity) as sum_quantity
							FROM invoice_item
							WHERE invoice_item.id IN (${invoiceItemIds.toString()})
							GROUP BY reference_id
						) sii 
						ON product_batch.id = sii.reference_id
					SET product_batch.quantity = product_batch.quantity + sii.sum_quantity
					WHERE product_batch.id IN (${productBatchIds.toString()})
						AND product_batch.oid = ${oid}
				`);
                if (updateBatch.affectedRows !== productBatchIds.length) {
                    throw new Error(`Refund Ship Invoice ${invoiceId} failed: Some batch can't update quantity`);
                }
                const productBatches = await manager.findBy(entities_1.ProductBatch, { id: (0, typeorm_2.In)(productBatchIds) });
                productIds = (0, object_helper_1.uniqueArray)(productBatches.map((i) => i.productId));
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
                        createTime: refundTime,
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
            if (invoice.paymentTime && invoice.debt !== 0) {
                const updateCustomer = await manager.decrement(entities_1.Customer, { id: invoice.customerId }, 'debt', invoice.debt);
                if (updateCustomer.affected !== 1) {
                    throw new Error(`Refund Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`);
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
                    createTime: refundTime,
                    openDebt: customer.debt + invoice.debt,
                    money: -invoice.debt,
                    closeDebt: customer.debt,
                });
                await manager.insert(entities_1.CustomerDebt, customerDebtDto);
            }
            return { productIds };
        });
        if (transaction.productIds.length) {
            await this.productRepository.calculateProductQuantity({
                oid,
                productIds: transaction.productIds,
            });
        }
    }
};
InvoiceQuickRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _b : Object, typeof (_c = typeof product_repository_1.ProductRepository !== "undefined" && product_repository_1.ProductRepository) === "function" ? _c : Object])
], InvoiceQuickRepository);
exports.InvoiceQuickRepository = InvoiceQuickRepository;


/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.uniqueArray = void 0;
const uniqueArray = (array) => {
    return Array.from(new Set(array));
};
exports.uniqueArray = uniqueArray;


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
exports.ProductRepository = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(7);
const string_helper_1 = __webpack_require__(37);
const base_dto_1 = __webpack_require__(38);
const typeorm_2 = __webpack_require__(11);
const entities_1 = __webpack_require__(8);
let ProductRepository = class ProductRepository {
    constructor(manager) {
        this.manager = manager;
    }
    getWhereOptions(condition = {}) {
        const where = {};
        if (condition.id != null)
            where.id = condition.id;
        if (condition.oid != null)
            where.oid = condition.oid;
        if (condition.group != null)
            where.group = condition.group;
        if (condition.isActive != null)
            where.isActive = condition.isActive;
        if (condition.ids) {
            if (condition.ids.length === 0)
                condition.ids.push(0);
            where.id = (0, typeorm_2.In)(condition.ids);
        }
        if (condition.searchText) {
            const searchText = `%${(0, base_dto_1.escapeSearch)((0, string_helper_1.convertViToEn)(condition.searchText))}%`;
            where.brandName = (0, typeorm_2.Raw)((alias) => '(brand_name LIKE :searchText OR substance LIKE :searchText)', { searchText });
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, condition, order } = options;
        const [data, total] = await this.manager.findAndCount(entities_1.Product, {
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async find(options) {
        const { limit, condition, order } = options;
        return await this.manager.find(entities_1.Product, {
            where: this.getWhereOptions(condition),
            order,
            take: limit,
        });
    }
    async findMany(condition) {
        const where = this.getWhereOptions(condition);
        return await this.manager.find(entities_1.Product, { where });
    }
    async findOne(condition) {
        const where = this.getWhereOptions(condition);
        const [product] = await this.manager.find(entities_1.Product, { where });
        return product;
    }
    async insertOne(oid, dto) {
        const productEntity = this.manager.create(entities_1.Product, dto);
        productEntity.oid = oid;
        return this.manager.save(productEntity, { transaction: false });
    }
    async update(condition, dto) {
        const where = this.getWhereOptions(condition);
        return await this.manager.update(entities_1.Product, where, dto);
    }
    async calculateProductQuantity(options) {
        const { oid, productIds } = options;
        await this.manager.query(`
			UPDATE product 
				LEFT JOIN ( SELECT product_id, SUM(quantity) as quantity 
					FROM product_batch 
					GROUP BY product_id 
				) spb 
				ON product.id = spb.product_id 
					AND product.id IN (${productIds.toString()})
			SET product.quantity = spb.quantity
			WHERE product.id IN (${productIds.toString()})
				AND product.oid = ${oid}
		`);
    }
};
ProductRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _a : Object])
], ProductRepository);
exports.ProductRepository = ProductRepository;


/***/ }),
/* 53 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceDraftUpdateDto = exports.InvoiceDraftInsertDto = exports.InvoiceItemDto = void 0;
const swagger_1 = __webpack_require__(3);
const entities_1 = __webpack_require__(8);
const class_transformer_1 = __webpack_require__(10);
class InvoiceItemDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(entities_1.InvoiceItem, ['invoiceId', 'procedure', 'productBatch', 'invoice'])) {
}
exports.InvoiceItemDto = InvoiceItemDto;
class InvoiceDraftInsertDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(entities_1.Invoice, ['oid', 'invoiceItems', 'status', 'arrivalId'])) {
    constructor() {
        super(...arguments);
        this.invoiceItems = [];
    }
    static from(plain) {
        const instance = (0, class_transformer_1.plainToInstance)(InvoiceDraftInsertDto, plain, {
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
exports.InvoiceDraftInsertDto = InvoiceDraftInsertDto;
class InvoiceDraftUpdateDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(entities_1.Invoice, ['oid', 'invoiceItems', 'status', 'arrivalId', 'customerId'])) {
    constructor() {
        super(...arguments);
        this.invoiceItems = [];
    }
    static from(plain) {
        const instance = (0, class_transformer_1.plainToInstance)(InvoiceDraftUpdateDto, plain, {
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
exports.InvoiceDraftUpdateDto = InvoiceDraftUpdateDto;


/***/ }),
/* 54 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConditionOrganizationDto = void 0;
class ConditionOrganizationDto {
}
exports.ConditionOrganizationDto = ConditionOrganizationDto;


/***/ }),
/* 55 */
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
const typeorm_1 = __webpack_require__(7);
const typeorm_2 = __webpack_require__(11);
const entities_1 = __webpack_require__(8);
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
/* 56 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 57 */
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
const typeorm_1 = __webpack_require__(7);
const string_helper_1 = __webpack_require__(37);
const base_dto_1 = __webpack_require__(38);
const typeorm_2 = __webpack_require__(11);
const entities_1 = __webpack_require__(8);
let ProcedureRepository = class ProcedureRepository {
    constructor(procedureRepository) {
        this.procedureRepository = procedureRepository;
    }
    getWhereOptions(condition = {}) {
        const where = {};
        if (condition.id != null)
            where.id = condition.id;
        if (condition.oid != null)
            where.oid = condition.oid;
        if (condition.group != null)
            where.group = condition.group;
        if (condition.isActive != null)
            where.isActive = condition.isActive;
        if (condition.ids) {
            if (condition.ids.length === 0)
                condition.ids.push(0);
            where.id = (0, typeorm_2.In)(condition.ids);
        }
        if (condition.searchText) {
            const text = (0, base_dto_1.escapeSearch)((0, string_helper_1.convertViToEn)(condition.searchText));
            where.name = (0, typeorm_2.Like)(`%${text}%`);
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, condition, order } = options;
        const [data, total] = await this.procedureRepository.findAndCount({
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        const totalPage = Math.ceil(total / limit);
        return { total, page, limit, data, totalPage };
    }
    async find(options) {
        const { limit, condition, order } = options;
        return await this.procedureRepository.find({
            where: this.getWhereOptions(condition),
            order,
            take: limit,
        });
    }
    async findMany(condition) {
        const where = this.getWhereOptions(condition);
        return await this.procedureRepository.find({ where });
    }
    async findOne(condition) {
        const where = this.getWhereOptions(condition);
        return await this.procedureRepository.findOne({ where });
    }
    async insertOne(dto) {
        const customer = this.procedureRepository.create(dto);
        return this.procedureRepository.save(customer);
    }
    async update(condition, dto) {
        const where = this.getWhereOptions(condition);
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
/* 58 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductBatchCondition = void 0;
class ProductBatchCondition {
}
exports.ProductBatchCondition = ProductBatchCondition;


/***/ }),
/* 59 */
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
const typeorm_1 = __webpack_require__(7);
const entities_1 = __webpack_require__(8);
const typeorm_2 = __webpack_require__(11);
let ProductBatchRepository = class ProductBatchRepository {
    constructor(dataSource, manager) {
        this.dataSource = dataSource;
        this.manager = manager;
    }
    getWhereOptions(condition = {}) {
        const where = {};
        if (condition.id != null)
            where.id = condition.id;
        if (condition.oid != null)
            where.oid = condition.oid;
        if (condition.productId != null)
            where.productId = condition.productId;
        if (condition.isActive != null)
            where.isActive = condition.isActive;
        if (condition.quantityZero === false)
            where.quantity = (0, typeorm_2.Not)(0);
        if (condition.overdue === false) {
            where.expiryDate = (0, typeorm_2.Raw)((alias) => `(${alias} > :date OR ${alias} IS NULL)`, { date: Date.now() });
        }
        if (condition.ids) {
            if (condition.ids.length === 0)
                condition.ids.push(0);
            where.id = (0, typeorm_2.In)(condition.ids);
        }
        if (condition.productIds) {
            if (condition.productIds.length === 0)
                condition.productIds.push(0);
            where.productId = (0, typeorm_2.In)(condition.productIds);
        }
        return where;
    }
    async pagination(options) {
        const { limit, page, condition, order } = options;
        const [data, total] = await this.manager.findAndCount(entities_1.ProductBatch, {
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async find(options) {
        const { limit, condition, order } = options;
        return await this.manager.find(entities_1.ProductBatch, {
            where: this.getWhereOptions(condition),
            order,
            take: limit,
        });
    }
    async findMany(condition, relation) {
        const productBatches = await this.manager.find(entities_1.ProductBatch, {
            where: this.getWhereOptions(condition),
            relations: { product: !!(relation === null || relation === void 0 ? void 0 : relation.product) },
            relationLoadStrategy: 'join',
        });
        return productBatches;
    }
    async findOne(condition, relation) {
        const [productBatch] = await this.manager.find(entities_1.ProductBatch, {
            where: this.getWhereOptions(condition),
            relations: { product: !!(relation === null || relation === void 0 ? void 0 : relation.product) },
            relationLoadStrategy: 'join',
        });
        return productBatch;
    }
    async insertOne(oid, dto) {
        const batchEntity = this.manager.create(entities_1.ProductBatch, dto);
        batchEntity.oid = oid;
        return this.manager.save(batchEntity, { transaction: false });
    }
    async update(condition, dto) {
        const where = this.getWhereOptions(condition);
        return await this.manager.update(entities_1.ProductBatch, where, dto);
    }
    async delete(oid, id) {
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const deleteBatch = await manager.delete(entities_1.ProductBatch, { oid, id, quantity: 0 });
            if (deleteBatch.affected !== 1) {
                throw new Error('Chỉ có thể xóa lô hàng có số lượng = 0');
            }
            const number = await manager.count(entities_1.ProductMovement, { where: { productBatchId: id, oid } });
            if (number) {
                throw new Error('Không thể xóa lô hàng đã có dữ liệu nhập xuất');
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
/* 60 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductMovementCondition = void 0;
class ProductMovementCondition {
}
exports.ProductMovementCondition = ProductMovementCondition;


/***/ }),
/* 61 */
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
const typeorm_1 = __webpack_require__(7);
const variable_1 = __webpack_require__(13);
const entities_1 = __webpack_require__(8);
const typeorm_2 = __webpack_require__(11);
let ProductMovementRepository = class ProductMovementRepository {
    constructor(manager) {
        this.manager = manager;
    }
    getWhereOptions(condition = {}) {
        const where = {};
        if (condition.oid != null)
            where.oid = condition.oid;
        if (condition.productId != null)
            where.productId = condition.productId;
        if (condition.productBatchId != null)
            where.productBatchId = condition.productBatchId;
        return where;
    }
    async pagination(options) {
        const { limit, page, condition, order } = options;
        const [data, total] = await this.manager.findAndCount(entities_1.ProductMovement, {
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async queryOne(condition, relation) {
        var _a, _b;
        let query = this.manager.createQueryBuilder(entities_1.ProductMovement, 'productMovement')
            .where('productMovement.oid = :oid', { oid: condition.oid });
        if (condition === null || condition === void 0 ? void 0 : condition.productId) {
            query = query.andWhere('productMovement.productId = :productId', { productId: condition.productId });
        }
        if (condition === null || condition === void 0 ? void 0 : condition.productBatchId) {
            query = query.andWhere('productMovement.productBatchId = :productBatchId', { productBatchId: condition.productBatchId });
        }
        if (relation === null || relation === void 0 ? void 0 : relation.invoice) {
            query = query.leftJoinAndSelect('productMovement.invoice', 'invoice', 'productMovement.type = :typeInvoice', { typeInvoice: variable_1.ProductMovementType.Invoice });
        }
        if ((_a = relation === null || relation === void 0 ? void 0 : relation.invoice) === null || _a === void 0 ? void 0 : _a.customer) {
            query = query.leftJoinAndSelect('invoice.customer', 'customer');
        }
        if (relation === null || relation === void 0 ? void 0 : relation.receipt) {
            query = query.leftJoinAndSelect('productMovement.receipt', 'receipt', 'productMovement.type = :typeReceipt', { typeReceipt: variable_1.ProductMovementType.Receipt });
        }
        if ((_b = relation === null || relation === void 0 ? void 0 : relation.receipt) === null || _b === void 0 ? void 0 : _b.distributor) {
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
/* 62 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ProductCondition = void 0;
class ProductCondition {
}
exports.ProductCondition = ProductCondition;


/***/ }),
/* 63 */
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
const decorators_1 = __webpack_require__(64);
const typeorm_1 = __webpack_require__(7);
const entities_1 = __webpack_require__(8);
const typeorm_2 = __webpack_require__(11);
let ReceiptRepository = class ReceiptRepository {
    constructor(dataSource, manager) {
        this.dataSource = dataSource;
        this.manager = manager;
    }
    getWhereOptions(condition = {}) {
        const where = {};
        if (condition.id != null)
            where.id = condition.id;
        if (condition.oid != null)
            where.oid = condition.oid;
        if (condition.distributorId != null)
            where.distributorId = condition.distributorId;
        if (condition.status != null)
            where.status = condition.status;
        if (condition.ids) {
            if (condition.ids.length === 0)
                condition.ids.push(0);
            where.id = (0, typeorm_2.In)(condition.ids);
        }
        if (condition.distributorIds) {
            if (condition.distributorIds.length === 0)
                condition.distributorIds.push(0);
            where.distributorId = (0, typeorm_2.In)(condition.distributorIds);
        }
        if (condition.statuses) {
            if (condition.statuses.length === 0)
                condition.statuses.push(0);
            where.status = (0, typeorm_2.In)(condition.statuses);
        }
        let paymentTime = undefined;
        if (condition.fromTime && condition.toTime)
            paymentTime = (0, typeorm_2.Between)(condition.fromTime, condition.toTime);
        else if (condition.fromTime)
            paymentTime = (0, typeorm_2.MoreThanOrEqual)(condition.fromTime);
        else if (condition.toTime)
            paymentTime = (0, typeorm_2.LessThanOrEqual)(condition.toTime);
        if (paymentTime != null)
            where.paymentTime = paymentTime;
        return where;
    }
    async pagination(options) {
        const { limit, page, condition, order } = options;
        const [data, total] = await this.manager.findAndCount(entities_1.Receipt, {
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        });
        return { total, page, limit, data };
    }
    async findMany(condition, relation) {
        const receipts = await this.manager.find(entities_1.Receipt, {
            where: this.getWhereOptions(condition),
            relations: {
                distributor: !!(relation === null || relation === void 0 ? void 0 : relation.distributor),
                receiptItems: relation.receiptItems ? { productBatch: { product: true } } : false,
            },
            relationLoadStrategy: 'join',
        });
        return receipts;
    }
    async findOne(condition, relation) {
        const [receipt] = await this.manager.find(entities_1.Receipt, {
            where: this.getWhereOptions(condition),
            relations: {
                distributor: !!(relation === null || relation === void 0 ? void 0 : relation.distributor),
                receiptItems: relation.receiptItems ? { productBatch: { product: true } } : false,
            },
            relationLoadStrategy: 'join',
        });
        return receipt;
    }
    async queryOneBy(condition, relation) {
        var _a;
        let query = this.manager.createQueryBuilder(entities_1.Receipt, 'receipt')
            .where('receipt.id = :id', { id: condition.id })
            .andWhere('receipt.oid = :oid', { oid: condition.oid });
        if (relation === null || relation === void 0 ? void 0 : relation.distributor)
            query = query.leftJoinAndSelect('receipt.distributor', 'distributor');
        if (relation === null || relation === void 0 ? void 0 : relation.receiptItems)
            query = query.leftJoinAndSelect('receipt.receiptItems', 'receiptItem');
        if ((_a = relation === null || relation === void 0 ? void 0 : relation.receiptItems) === null || _a === void 0 ? void 0 : _a.productBatch) {
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
/* 64 */
/***/ ((module) => {

module.exports = require("@nestjs/common/decorators");

/***/ }),
/* 65 */
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReceiptProcessRepository = void 0;
const decorators_1 = __webpack_require__(64);
const typeorm_1 = __webpack_require__(7);
const object_helper_1 = __webpack_require__(51);
const variable_1 = __webpack_require__(13);
const entities_1 = __webpack_require__(8);
const typeorm_2 = __webpack_require__(11);
const product_repository_1 = __webpack_require__(52);
let ReceiptProcessRepository = class ReceiptProcessRepository {
    constructor(dataSource, manager, productRepository) {
        this.dataSource = dataSource;
        this.manager = manager;
        this.productRepository = productRepository;
    }
    async createDraft(params) {
        const { oid, receiptInsertDto } = params;
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            var _a, _b;
            const receiptSnap = manager.create(entities_1.Receipt, receiptInsertDto);
            receiptSnap.oid = oid;
            receiptSnap.status = variable_1.ReceiptStatus.Draft;
            const receiptResult = await manager.insert(entities_1.Receipt, receiptSnap);
            const receiptId = (_b = (_a = receiptResult.identifiers) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id;
            if (!receiptId) {
                throw new Error(`Create Receipt failed: Insert error ${JSON.stringify(receiptResult)}`);
            }
            const receiptItemsEntity = manager.create(entities_1.ReceiptItem, receiptInsertDto.receiptItems);
            receiptItemsEntity.forEach((item) => {
                item.oid = oid;
                item.receiptId = receiptId;
                item.distributorId = receiptInsertDto.distributorId;
            });
            await manager.insert(entities_1.ReceiptItem, receiptItemsEntity);
            return { receiptId };
        });
    }
    async updateDraft(params) {
        const { oid, receiptId, receiptUpdateDto } = params;
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const _a = manager.create(entities_1.Receipt, receiptUpdateDto), { receiptItems } = _a, receiptSnap = __rest(_a, ["receiptItems"]);
            const receiptUpdateResult = await manager.update(entities_1.Receipt, {
                id: receiptId,
                oid,
                status: variable_1.ReceiptStatus.Draft,
            }, receiptSnap);
            if (receiptUpdateResult.affected !== 1) {
                throw new Error(`Update Receipt ${receiptId} failed: Status invalid`);
            }
            const receipt = await manager.findOneBy(entities_1.Receipt, { id: receiptId, oid });
            await manager.delete(entities_1.ReceiptItem, { oid, receiptId });
            const receiptItemsEntity = manager.create(entities_1.ReceiptItem, receiptUpdateDto.receiptItems);
            receiptItemsEntity.forEach((item) => {
                item.oid = oid;
                item.receiptId = receiptId;
                item.distributorId = receipt.distributorId;
            });
            await manager.insert(entities_1.ReceiptItem, receiptItemsEntity);
            return { receiptId };
        });
    }
    async deleteDraft(params) {
        const { oid, receiptId } = params;
        return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const receiptDeleteResult = await manager.delete(entities_1.Receipt, {
                oid,
                id: receiptId,
                status: variable_1.ReceiptStatus.Draft,
            });
            if (receiptDeleteResult.affected !== 1) {
                throw new Error(`Delete Invoice ${receiptId} failed: Status invalid`);
            }
            await manager.delete(entities_1.ReceiptItem, { oid, receiptId });
        });
    }
    async startShipAndPayment(params) {
        const { oid, receiptId, shipTime } = params;
        const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const receiptUpdateResult = await manager.update(entities_1.Receipt, {
                id: receiptId,
                oid,
                shipTime: (0, typeorm_2.IsNull)(),
                paymentTime: (0, typeorm_2.IsNull)(),
                status: (0, typeorm_2.In)([variable_1.ReceiptStatus.Draft, variable_1.ReceiptStatus.Process]),
            }, {
                status: variable_1.ReceiptStatus.Finish,
                paymentTime: shipTime,
                shipTime,
            });
            if (receiptUpdateResult.affected !== 1) {
                throw new Error(`Process Receipt ${receiptId} failed: Status invalid`);
            }
            const [receipt] = await manager.find(entities_1.Receipt, {
                relations: { receiptItems: true },
                relationLoadStrategy: 'join',
                where: { oid, id: receiptId },
            });
            if (receipt.receiptItems.length === 0) {
                throw new Error(`Process Receipt ${receiptId} failed: Not found receipt_items`);
            }
            const productBatchIds = (0, object_helper_1.uniqueArray)(receipt.receiptItems.map((i) => i.productBatchId));
            let productIds;
            if (receipt.receiptItems.length) {
                const updateBatch = await manager.query(`
					UPDATE product_batch 
						LEFT JOIN ( SELECT product_batch_id, SUM(quantity) as sum_quantity 
							FROM receipt_item
							WHERE receipt_item.receipt_id = ${receipt.id} AND receipt_item.oid = ${oid}
							GROUP BY product_batch_id
						) sri 
						ON product_batch.id = sri.product_batch_id
					SET product_batch.quantity = product_batch.quantity + sri.sum_quantity
					WHERE product_batch.id IN (${productBatchIds.toString()})
						AND product_batch.oid = ${oid}
				`);
                if (updateBatch.affectedRows !== productBatchIds.length) {
                    throw new Error(`Process Receipt ${receiptId} failed: Some batch can't update quantity`);
                }
                const productBatches = await manager.findBy(entities_1.ProductBatch, { id: (0, typeorm_2.In)(productBatchIds) });
                productIds = (0, object_helper_1.uniqueArray)(productBatches.map((i) => i.productId));
                const productMovementsEntity = receipt.receiptItems.map((receiptItem) => {
                    const productBatch = productBatches.find((i) => i.id === receiptItem.productBatchId);
                    if (!productBatch) {
                        throw new Error(`Process Receipt ${receiptId} failed: ProductBatchID ${receiptItem.productBatchId} invalid`);
                    }
                    productBatch.quantity = productBatch.quantity - receiptItem.quantity;
                    return manager.create(entities_1.ProductMovement, {
                        oid,
                        productId: productBatch.productId,
                        productBatchId: productBatch.id,
                        referenceId: receiptId,
                        createTime: shipTime,
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
                    throw new Error(`Process Receipt ${receiptId} failed: Update distributor ${receipt.distributorId} invalid`);
                }
                const distributor = await manager.findOne(entities_1.Distributor, {
                    where: { oid, id: receipt.distributorId },
                    select: { debt: true },
                });
                const distributorPaymentDto = manager.create(entities_1.DistributorPayment, {
                    oid,
                    distributorId: receipt.distributorId,
                    receiptId,
                    type: variable_1.DebtType.Borrow,
                    createTime: shipTime,
                    openDebt: distributor.debt - receipt.debt,
                    money: receipt.debt,
                    closeDebt: distributor.debt,
                });
                await manager.insert(entities_1.DistributorPayment, distributorPaymentDto);
            }
            return { productIds };
        });
        if (transaction.productIds.length) {
            await this.productRepository.calculateProductQuantity({
                oid,
                productIds: transaction.productIds,
            });
        }
    }
    async startRefund(params) {
        const { oid, receiptId, refundTime } = params;
        const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
            const { affected } = await manager.update(entities_1.Receipt, {
                id: receiptId,
                oid,
                status: variable_1.ReceiptStatus.Finish,
            }, {
                refundTime,
                status: variable_1.ReceiptStatus.Refund,
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
            let productIds;
            const productBatchIds = (0, object_helper_1.uniqueArray)(receipt.receiptItems.map((i) => i.productBatchId));
            if (receipt.receiptItems.length) {
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
                productIds = (0, object_helper_1.uniqueArray)(productBatches.map((i) => i.productId));
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
                        createTime: refundTime,
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
                const distributorPaymentDto = manager.create(entities_1.DistributorPayment, {
                    oid,
                    distributorId: receipt.distributorId,
                    receiptId,
                    type: variable_1.DebtType.Refund,
                    createTime: refundTime,
                    openDebt: distributor.debt + receipt.debt,
                    money: -receipt.debt,
                    closeDebt: distributor.debt,
                });
                await manager.insert(entities_1.DistributorPayment, distributorPaymentDto);
            }
            return { productIds };
        });
        if (transaction.productIds.length) {
            await this.productRepository.calculateProductQuantity({
                oid,
                productIds: transaction.productIds,
            });
        }
    }
};
ReceiptProcessRepository = __decorate([
    (0, decorators_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _b : Object, typeof (_c = typeof product_repository_1.ProductRepository !== "undefined" && product_repository_1.ProductRepository) === "function" ? _c : Object])
], ReceiptProcessRepository);
exports.ReceiptProcessRepository = ReceiptProcessRepository;


/***/ }),
/* 66 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReceiptUpdateDto = exports.ReceiptInsertDto = exports.ReceiptItemDto = void 0;
const swagger_1 = __webpack_require__(3);
const entities_1 = __webpack_require__(8);
const class_transformer_1 = __webpack_require__(10);
class ReceiptItemDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(entities_1.ReceiptItem, ['receiptId', 'receipt'])) {
}
exports.ReceiptItemDto = ReceiptItemDto;
class ReceiptInsertDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(entities_1.Receipt, ['oid', 'receiptItems', 'status'])) {
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
class ReceiptUpdateDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(entities_1.Receipt, ['oid', 'receiptItems', 'status', 'distributorId'])) {
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
/* 67 */
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
const typeorm_1 = __webpack_require__(7);
const entities_1 = __webpack_require__(8);
const arrival_repository_1 = __webpack_require__(32);
const customer_debt_repository_1 = __webpack_require__(34);
const customer_repository_1 = __webpack_require__(36);
const distributor_debt_repository_1 = __webpack_require__(42);
const distributor_repository_1 = __webpack_require__(44);
const employee_repository_1 = __webpack_require__(46);
const invoice_item_repository_1 = __webpack_require__(48);
const invoice_quick_repository_1 = __webpack_require__(50);
const invoice_repository_1 = __webpack_require__(49);
const organization_repository_1 = __webpack_require__(55);
const procedure_repository_1 = __webpack_require__(57);
const product_batch_repository_1 = __webpack_require__(59);
const product_movement_repository_1 = __webpack_require__(61);
const product_repository_1 = __webpack_require__(52);
const receipt_quick_repository_1 = __webpack_require__(65);
const receipt_repository_1 = __webpack_require__(63);
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
                entities_1.DistributorPayment,
                entities_1.Employee,
                entities_1.Invoice,
                entities_1.InvoiceItem,
                entities_1.Organization,
                entities_1.OrganizationSetting,
                entities_1.Procedure,
                entities_1.Product,
                entities_1.ProductBatch,
                entities_1.ProductMovement,
                entities_1.Receipt,
                entities_1.ReceiptItem,
            ]),
        ],
        providers: [
            arrival_repository_1.ArrivalRepository,
            customer_repository_1.CustomerRepository,
            customer_debt_repository_1.CustomerDebtRepository,
            distributor_repository_1.DistributorRepository,
            distributor_debt_repository_1.DistributorPaymentRepository,
            employee_repository_1.EmployeeRepository,
            invoice_repository_1.InvoiceRepository,
            invoice_quick_repository_1.InvoiceQuickRepository,
            invoice_item_repository_1.InvoiceItemRepository,
            organization_repository_1.OrganizationRepository,
            procedure_repository_1.ProcedureRepository,
            product_repository_1.ProductRepository,
            product_batch_repository_1.ProductBatchRepository,
            product_movement_repository_1.ProductMovementRepository,
            receipt_quick_repository_1.ReceiptProcessRepository,
            receipt_repository_1.ReceiptRepository,
        ],
        exports: [
            arrival_repository_1.ArrivalRepository,
            customer_repository_1.CustomerRepository,
            customer_debt_repository_1.CustomerDebtRepository,
            distributor_repository_1.DistributorRepository,
            distributor_debt_repository_1.DistributorPaymentRepository,
            employee_repository_1.EmployeeRepository,
            invoice_repository_1.InvoiceRepository,
            invoice_quick_repository_1.InvoiceQuickRepository,
            invoice_item_repository_1.InvoiceItemRepository,
            organization_repository_1.OrganizationRepository,
            product_repository_1.ProductRepository,
            procedure_repository_1.ProcedureRepository,
            product_batch_repository_1.ProductBatchRepository,
            product_movement_repository_1.ProductMovementRepository,
            receipt_quick_repository_1.ReceiptProcessRepository,
            receipt_repository_1.ReceiptRepository,
        ],
    })
], RepositoryModule);
exports.RepositoryModule = RepositoryModule;


/***/ }),
/* 68 */
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
const config_1 = __webpack_require__(6);
const typeorm_1 = __webpack_require__(7);
const sql_config_1 = __webpack_require__(69);
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
/* 69 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SqlConfig = void 0;
const config_1 = __webpack_require__(6);
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
/* 70 */
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
exports.BuiTrangApi = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(7);
const repository_1 = __webpack_require__(30);
const typeorm_2 = __webpack_require__(11);
let BuiTrangApi = class BuiTrangApi {
    constructor(manager, receiptProcessRepository, invoiceQuickRepository) {
        this.manager = manager;
        this.receiptProcessRepository = receiptProcessRepository;
        this.invoiceQuickRepository = invoiceQuickRepository;
    }
};
BuiTrangApi = __decorate([
    (0, swagger_1.ApiTags)('BuiTrang Data'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('bui-trang'),
    __param(0, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _a : Object, typeof (_b = typeof repository_1.ReceiptProcessRepository !== "undefined" && repository_1.ReceiptProcessRepository) === "function" ? _b : Object, typeof (_c = typeof repository_1.InvoiceQuickRepository !== "undefined" && repository_1.InvoiceQuickRepository) === "function" ? _c : Object])
], BuiTrangApi);
exports.BuiTrangApi = BuiTrangApi;


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LongNguyenApi = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(7);
const typeorm_2 = __webpack_require__(11);
let LongNguyenApi = class LongNguyenApi {
    constructor(manager) {
        this.manager = manager;
    }
};
LongNguyenApi = __decorate([
    (0, swagger_1.ApiTags)('LongNguyen Data'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('long-nguyen'),
    __param(0, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _a : Object])
], LongNguyenApi);
exports.LongNguyenApi = LongNguyenApi;


/***/ }),
/* 72 */
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
exports.SeedDataApi = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(7);
const typeorm_2 = __webpack_require__(11);
const address_service_1 = __webpack_require__(73);
const customer_seed_1 = __webpack_require__(79);
const diagnosis_seed_1 = __webpack_require__(81);
const distributor_seed_1 = __webpack_require__(82);
const employee_seed_1 = __webpack_require__(83);
const invoice_seed_1 = __webpack_require__(84);
const organization_seed_1 = __webpack_require__(85);
const procedure_seed_1 = __webpack_require__(87);
const product_seed_1 = __webpack_require__(89);
const receipt_seed_1 = __webpack_require__(90);
let SeedDataApi = class SeedDataApi {
    constructor(dataSource, manager, organizationSeed, employeeSeed, distributorSeed, customerSeed, productSeed, invoiceSeed, diagnosisSeed, receiptSeed, procedureSeed) {
        this.dataSource = dataSource;
        this.manager = manager;
        this.organizationSeed = organizationSeed;
        this.employeeSeed = employeeSeed;
        this.distributorSeed = distributorSeed;
        this.customerSeed = customerSeed;
        this.productSeed = productSeed;
        this.invoiceSeed = invoiceSeed;
        this.diagnosisSeed = diagnosisSeed;
        this.receiptSeed = receiptSeed;
        this.procedureSeed = procedureSeed;
        this.init();
    }
    async init() {
        await address_service_1.AddressData.init();
    }
    async startSeedData() {
        const startDate = Date.now();
        console.log('======== [START]: Seed data ========');
        const oid = 1;
        await this.organizationSeed.start(oid);
        await this.employeeSeed.start(oid, 50);
        await this.distributorSeed.start(oid, 100);
        await this.customerSeed.start(oid, 100);
        await this.productSeed.startCreateProduct(oid);
        await this.procedureSeed.start(oid);
        await this.productSeed.startCreateProductBatch(oid);
        await this.receiptSeed.start(oid, 200);
        await this.invoiceSeed.start(oid, 200, new Date('2023-06-20'), new Date('2023-08-06'));
        const endDate = Date.now();
        const time = endDate - startDate;
        console.log(`======== [SUCCESS] - ${time}ms ========`);
        return { time };
    }
};
__decorate([
    (0, common_1.Get)('start'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeedDataApi.prototype, "startSeedData", null);
SeedDataApi = __decorate([
    (0, swagger_1.ApiTags)('Seed Data'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('seed'),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _b : Object, typeof (_c = typeof organization_seed_1.OrganizationSeed !== "undefined" && organization_seed_1.OrganizationSeed) === "function" ? _c : Object, typeof (_d = typeof employee_seed_1.EmployeeSeed !== "undefined" && employee_seed_1.EmployeeSeed) === "function" ? _d : Object, typeof (_e = typeof distributor_seed_1.DistributorSeed !== "undefined" && distributor_seed_1.DistributorSeed) === "function" ? _e : Object, typeof (_f = typeof customer_seed_1.CustomerSeed !== "undefined" && customer_seed_1.CustomerSeed) === "function" ? _f : Object, typeof (_g = typeof product_seed_1.ProductSeed !== "undefined" && product_seed_1.ProductSeed) === "function" ? _g : Object, typeof (_h = typeof invoice_seed_1.InvoiceSeed !== "undefined" && invoice_seed_1.InvoiceSeed) === "function" ? _h : Object, typeof (_j = typeof diagnosis_seed_1.DiagnosisSeed !== "undefined" && diagnosis_seed_1.DiagnosisSeed) === "function" ? _j : Object, typeof (_k = typeof receipt_seed_1.ReceiptSeed !== "undefined" && receipt_seed_1.ReceiptSeed) === "function" ? _k : Object, typeof (_l = typeof procedure_seed_1.ProcedureSeed !== "undefined" && procedure_seed_1.ProcedureSeed) === "function" ? _l : Object])
], SeedDataApi);
exports.SeedDataApi = SeedDataApi;


/***/ }),
/* 73 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AddressData = void 0;
const fs = __webpack_require__(74);
const request_helper_1 = __webpack_require__(75);
const random_helper_1 = __webpack_require__(77);
const DIR = 'apps/seed-data/src/address';
class Address {
    constructor() {
        this.provinces = [];
    }
    async init() {
        try {
            this.provinces = JSON.parse(fs.readFileSync(`${DIR}/address-min.json`, 'utf-8'));
        }
        catch (error) {
            console.log('🚀 ~ file: address.service.ts:29 ~ Address ~ initProvince ~ error', error);
        }
        if (this.provinces.length)
            return;
        const response = await (0, request_helper_1.HttpsGet)('https://provinces.open-api.vn/api/p/');
        this.provinces = JSON.parse(response);
        await Promise.all(this.provinces.map((item) => this.initDistrict(item)));
        fs.writeFileSync(`${DIR}/address.json`, JSON.stringify(this.provinces, null, 4));
        fs.writeFileSync(`${DIR}/address-min.json`, JSON.stringify(this.provinces));
    }
    async initDistrict(province) {
        if (province.districts.length === 0) {
            const response = await (0, request_helper_1.HttpsGet)(`https://provinces.open-api.vn/api/p/${province.code}?depth=3`);
            const data = JSON.parse(response);
            province.districts = data.districts;
        }
    }
    getRandomAddress() {
        const province = (0, random_helper_1.randomItemsInArray)(this.provinces);
        const district = (0, random_helper_1.randomItemsInArray)(province.districts);
        const ward = (0, random_helper_1.randomItemsInArray)(district.wards);
        const line = `${(0, random_helper_1.randomNumber)(10, 999)}/${(0, random_helper_1.randomNumber)(10, 999)} Đường ${(0, random_helper_1.randomFullName)()}`;
        const hamlet = `Thôn ${(0, random_helper_1.randomFullName)()}`;
        const street = (0, random_helper_1.randomItemsInArray)([line, hamlet]);
        return {
            province: province === null || province === void 0 ? void 0 : province.name,
            district: district === null || district === void 0 ? void 0 : district.name,
            ward: ward === null || ward === void 0 ? void 0 : ward.name,
            street,
        };
    }
}
exports.AddressData = new Address();


/***/ }),
/* 74 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 75 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpsGet = void 0;
const https = __webpack_require__(76);
const HttpsGet = (url) => new Promise((resolve, reject) => {
    const request = https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(data));
    });
    request.on('error', (err) => reject(err));
    request.end();
});
exports.HttpsGet = HttpsGet;


/***/ }),
/* 76 */
/***/ ((module) => {

module.exports = require("https");

/***/ }),
/* 77 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.randomBloodPressure = exports.randomUsername = exports.randomDate = exports.randomFullName = exports.randomPhoneNumber = exports.randomEnum = exports.randomNumber = exports.randomItemsInArray = exports.shuffleArray = void 0;
const variable_1 = __webpack_require__(13);
const time_formatter_1 = __webpack_require__(78);
const string_helper_1 = __webpack_require__(37);
const shuffleArray = (origin) => [...origin].sort(() => 0.5 - Math.random());
exports.shuffleArray = shuffleArray;
const randomItemsInArray = (items) => items[Math.floor(Math.random() * items.length)];
exports.randomItemsInArray = randomItemsInArray;
const randomNumber = (min, max, step = 1) => {
    const count = (max - min) / step + 1;
    return Math.floor(Math.random() * count) * step + min;
};
exports.randomNumber = randomNumber;
const randomEnum = (e) => {
    const keys = Object.keys(e).filter((key) => isNaN(parseInt(key)));
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return e[randomKey];
};
exports.randomEnum = randomEnum;
const randomPhoneNumber = () => {
    const headNumber = (0, exports.randomItemsInArray)(['03', '05', '07', '08', '09']);
    const tailNumber = ('00000000' + (0, exports.randomNumber)(0, 99999999)).slice(-8);
    return headNumber + tailNumber;
};
exports.randomPhoneNumber = randomPhoneNumber;
const randomFullName = (gender, hasMiddle = true) => {
    const surname = (0, exports.randomItemsInArray)(['Nguyễn', 'Lê', 'Phạm', 'Vũ', 'Phan', 'Trương', 'Trần', 'Bùi', 'Đặng', 'Đỗ', 'Ngô', 'Dương']);
    let middleName = '', lastName = '';
    if (!gender)
        gender = (0, exports.randomEnum)(variable_1.EGender);
    if (gender === variable_1.EGender.Female) {
        middleName = (0, exports.randomItemsInArray)(['Hồng', 'Lệ', 'Thị', 'Thu', 'Thanh', 'Tuyết', 'Thảo', 'Trúc', 'Quỳnh']);
        lastName = (0, exports.randomItemsInArray)(['Bích', 'Chi', 'Diệp', 'Diệu', 'Duyên', 'Hoa', 'Huyền', 'Hương', 'Linh', 'Mai', 'Nga', 'Ngọc', 'Thảo', 'Trang', 'Quỳnh']);
    }
    else {
        middleName = (0, exports.randomItemsInArray)(['Anh', 'Đình', 'Huy', 'Mạnh', 'Minh', 'Nam', 'Ngọc', 'Nhật', 'Thái', 'Thanh', 'Văn', 'Việt']);
        lastName = (0, exports.randomItemsInArray)(['Đạt', 'Khánh', 'Khôi', 'Kiên', 'Lâm', 'Huy', 'Hùng', 'Hoàng', 'Minh', 'Nghĩa', 'Sơn', 'Tùng', 'Trung', 'Trường', 'Thắng', 'Quang', 'Quân']);
    }
    if (!hasMiddle)
        return `${surname} ${lastName}`;
    return `${surname} ${middleName} ${lastName}`;
};
exports.randomFullName = randomFullName;
const randomDate = (minDate, maxDate) => {
    if (!minDate)
        minDate = new Date('1950-12-25');
    if (!maxDate)
        maxDate = new Date('2050-12-25');
    if (typeof minDate !== 'object')
        minDate = new Date(minDate);
    if (typeof maxDate !== 'object')
        maxDate = new Date(maxDate);
    const timeRandom = (0, exports.randomNumber)(minDate.getTime(), maxDate.getTime());
    return new Date(timeRandom);
};
exports.randomDate = randomDate;
const randomUsername = (fullName, birthday) => {
    if (!fullName)
        fullName = (0, exports.randomFullName)();
    if (!birthday)
        birthday = (0, exports.randomDate)('1960-01-29', '2000-12-25');
    const nameEng = (0, string_helper_1.convertViToEn)(fullName).toLowerCase();
    const text = nameEng.split(' ').slice(-2).join('');
    const number = (0, time_formatter_1.timeToText)(birthday, 'DDMMYY');
    return text + number;
};
exports.randomUsername = randomUsername;
const randomBloodPressure = () => {
    const diastolic = (0, exports.randomNumber)(60, 120);
    const systolic = diastolic + (0, exports.randomNumber)(25, 70);
    return `${systolic}/${diastolic}`;
};
exports.randomBloodPressure = randomBloodPressure;


/***/ }),
/* 78 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.textToTime = exports.timeToText = void 0;
const timeToText = (time, pattern = 'DD/MM/YYYY', offset) => {
    if (time == null || time === '')
        return '';
    if (typeof time !== 'object')
        time = new Date(time);
    if (time.toString() === 'Invalid Date')
        return 'Invalid Date';
    if (offset == null)
        offset = time.getTimezoneOffset();
    const date = new Date(time.getTime() - offset * 60 * 1000);
    const rules = {
        YYYY: `${date.getUTCFullYear()}`,
        YY: `${date.getUTCFullYear()}`.slice(-2),
        MM: `0${date.getUTCMonth() + 1}`.slice(-2),
        DD: `0${date.getUTCDate()}`.slice(-2),
        hh: `0${date.getUTCHours()}`.slice(-2),
        mm: `0${date.getUTCMinutes()}`.slice(-2),
        ss: `0${date.getUTCSeconds()}`.slice(-2),
        xxx: `00${date.getUTCMilliseconds()}`.slice(-3),
    };
    let text = pattern;
    Object.entries(rules).forEach(([key, value]) => {
        const re = new RegExp(key, 'g');
        text = text.replace(re, value);
    });
    return text;
};
exports.timeToText = timeToText;
const textToTime = (text, pattern) => {
    const iFullYear = pattern.indexOf('YYYY');
    const iMonth = pattern.indexOf('MM');
    const iDay = pattern.indexOf('DD');
    const iHours = pattern.indexOf('hh');
    const iMinutes = pattern.indexOf('mm');
    const iSeconds = pattern.indexOf('ss');
    const iMs = pattern.indexOf('xxx');
    const year = iFullYear !== -1 ? Number(text.slice(iFullYear, iFullYear + 4)) : 0;
    const month = iMonth !== -1 ? Number(text.slice(iMonth, iMonth + 2)) : 0;
    const date = iDay !== -1 ? Number(text.slice(iDay, iDay + 2)) : 0;
    const hours = iHours !== -1 ? Number(text.slice(iHours, iHours + 2)) : 0;
    const minutes = iMinutes !== -1 ? Number(text.slice(iMinutes, iMinutes + 2)) : 0;
    const seconds = iSeconds !== -1 ? Number(text.slice(iSeconds, iSeconds + 2)) : 0;
    const milliseconds = iMs !== -1 ? Number(text.slice(iMs, iMs + 3)) : 0;
    const time = new Date();
    time.setFullYear(year);
    time.setMonth(month - 1);
    time.setDate(date);
    time.setHours(hours);
    time.setMinutes(minutes);
    time.setSeconds(seconds);
    time.setMilliseconds(milliseconds);
    return time;
};
exports.textToTime = textToTime;


/***/ }),
/* 79 */
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
exports.CustomerSeed = void 0;
const faker_1 = __webpack_require__(80);
const common_1 = __webpack_require__(1);
const random_helper_1 = __webpack_require__(77);
const variable_1 = __webpack_require__(13);
const entities_1 = __webpack_require__(8);
const typeorm_1 = __webpack_require__(11);
const address_service_1 = __webpack_require__(73);
let CustomerSeed = class CustomerSeed {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async start(oid, number) {
        const customersDto = [];
        for (let i = 0; i < number; i++) {
            const gender = (0, random_helper_1.randomEnum)(variable_1.EGender);
            const fullName = (0, random_helper_1.randomFullName)(gender);
            const address = address_service_1.AddressData.getRandomAddress();
            const customer = new entities_1.Customer();
            customer.oid = oid;
            customer.fullName = fullName;
            customer.fullName = fullName;
            customer.phone = (0, random_helper_1.randomPhoneNumber)();
            customer.birthday = (0, random_helper_1.randomDate)('1965-03-28', '2020-12-29').getTime();
            customer.gender = gender;
            customer.addressProvince = address.province;
            customer.addressDistrict = address.district;
            customer.addressWard = address.ward;
            customer.addressStreet = address.street;
            customer.healthHistory = faker_1.faker.lorem.sentence();
            customer.debt = 0;
            customersDto.push(customer);
        }
        await this.dataSource.getRepository(entities_1.Customer).insert(customersDto);
    }
};
CustomerSeed = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object])
], CustomerSeed);
exports.CustomerSeed = CustomerSeed;


/***/ }),
/* 80 */
/***/ ((module) => {

module.exports = require("@faker-js/faker");

/***/ }),
/* 81 */
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
exports.DiagnosisSeed = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(7);
const entities_1 = __webpack_require__(8);
const typeorm_2 = __webpack_require__(11);
let DiagnosisSeed = class DiagnosisSeed {
    constructor(dataSource, arrivalRepository, diagnosisRepository) {
        this.dataSource = dataSource;
        this.arrivalRepository = arrivalRepository;
        this.diagnosisRepository = diagnosisRepository;
    }
};
DiagnosisSeed = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Arrival)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Diagnosis)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object])
], DiagnosisSeed);
exports.DiagnosisSeed = DiagnosisSeed;


/***/ }),
/* 82 */
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
exports.DistributorSeed = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(7);
const random_helper_1 = __webpack_require__(77);
const variable_1 = __webpack_require__(13);
const entities_1 = __webpack_require__(8);
const typeorm_2 = __webpack_require__(11);
const address_service_1 = __webpack_require__(73);
let DistributorSeed = class DistributorSeed {
    constructor(distributorRepository) {
        this.distributorRepository = distributorRepository;
    }
    async start(oid, number) {
        const distributorsDto = [];
        for (let i = 0; i < number; i++) {
            const gender = (0, random_helper_1.randomEnum)(variable_1.EGender);
            const fullName = (0, random_helper_1.randomFullName)(gender);
            const address = address_service_1.AddressData.getRandomAddress();
            const distributor = new entities_1.Distributor();
            distributor.oid = oid;
            distributor.fullName = fullName;
            distributor.fullName = fullName;
            distributor.phone = (0, random_helper_1.randomPhoneNumber)();
            distributor.addressProvince = address.province;
            distributor.addressDistrict = address.district;
            distributor.addressWard = address.ward;
            distributor.addressStreet = address.street;
            distributor.debt = 0;
            distributorsDto.push(distributor);
        }
        await this.distributorRepository.insert(distributorsDto);
    }
};
DistributorSeed = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Distributor)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], DistributorSeed);
exports.DistributorSeed = DistributorSeed;


/***/ }),
/* 83 */
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
exports.EmployeeSeed = void 0;
const common_1 = __webpack_require__(1);
const random_helper_1 = __webpack_require__(77);
const string_helper_1 = __webpack_require__(37);
const variable_1 = __webpack_require__(13);
const entities_1 = __webpack_require__(8);
const typeorm_1 = __webpack_require__(11);
let EmployeeSeed = class EmployeeSeed {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    createFactory(oid, number) {
        const factoryList = [];
        for (let i = 0; i < number; i++) {
            const gender = (0, random_helper_1.randomEnum)(variable_1.EGender);
            const fullName = (0, random_helper_1.randomFullName)(gender);
            const birthday = (0, random_helper_1.randomDate)('1980-03-28', '2001-12-29');
            const userName = (0, random_helper_1.randomUsername)(fullName, birthday);
            const password = '$2b$05$G17lx6yO8fK2iJK6tqX2XODsCrawFzSht5vJQjE7wlDJO0.4zxPxO';
            const secret = (0, string_helper_1.encrypt)('Abc@123456', userName);
            const employee = new entities_1.Employee();
            employee.oid = oid;
            employee.phone = (0, random_helper_1.randomPhoneNumber)();
            employee.username = userName;
            employee.password = password;
            employee.secret = secret;
            employee.role = (0, random_helper_1.randomEnum)(variable_1.ERole);
            employee.gender = gender;
            employee.birthday = birthday.getTime();
            employee.fullName = fullName;
            factoryList.push(employee);
        }
        return factoryList;
    }
    async start(oid, number) {
        const admin = new entities_1.Employee();
        admin.username = 'admin';
        admin.oid = oid;
        admin.password = '$2b$05$G17lx6yO8fK2iJK6tqX2XODsCrawFzSht5vJQjE7wlDJO0.4zxPxO',
            admin.role = variable_1.ERole.Admin;
        await this.dataSource.getRepository(entities_1.Employee).upsert(admin, { skipUpdateIfNoValuesChanged: true, conflictPaths: {} });
        const employeesDto = this.createFactory(oid, number);
        await this.dataSource.getRepository(entities_1.Employee).insert(employeesDto);
    }
};
EmployeeSeed = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object])
], EmployeeSeed);
exports.EmployeeSeed = EmployeeSeed;


/***/ }),
/* 84 */
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
exports.InvoiceSeed = void 0;
const faker_1 = __webpack_require__(80);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(7);
const random_helper_1 = __webpack_require__(77);
const variable_1 = __webpack_require__(13);
const entities_1 = __webpack_require__(8);
const repository_1 = __webpack_require__(30);
const typeorm_2 = __webpack_require__(11);
let InvoiceSeed = class InvoiceSeed {
    constructor(productBatchRepository, customerRepository, procedureRepository, invoiceQuickRepository) {
        this.productBatchRepository = productBatchRepository;
        this.customerRepository = customerRepository;
        this.procedureRepository = procedureRepository;
        this.invoiceQuickRepository = invoiceQuickRepository;
    }
    fakeInvoiceDraftInsertDto(productBatches, procedures) {
        const numberProductBatch = (0, random_helper_1.randomNumber)(2, 5);
        const numberProcedure = (0, random_helper_1.randomNumber)(2, 5);
        const invoiceItemsDto = [];
        for (let i = 0; i < numberProductBatch; i++) {
            const productBatch = productBatches[i];
            const unit = productBatch.product.unit.find((i) => i.rate === 1);
            const expectedPrice = productBatch.retailPrice;
            const discountPercent = (0, random_helper_1.randomNumber)(10, 30);
            const discountMoney = Math.ceil(expectedPrice * discountPercent / 100 / 1000) * 1000;
            const discountType = (0, random_helper_1.randomEnum)(variable_1.DiscountType);
            const actualPrice = expectedPrice - discountMoney;
            invoiceItemsDto.push({
                referenceId: productBatch.id,
                type: variable_1.InvoiceItemType.ProductBatch,
                unit,
                costPrice: productBatch.costPrice,
                expectedPrice,
                quantity: (0, random_helper_1.randomNumber)(1, 5),
                actualPrice,
                discountMoney,
                discountPercent,
                discountType,
            });
        }
        for (let i = 0; i < numberProcedure; i++) {
            const procedure = procedures[i];
            const expectedPrice = procedure.price;
            const discountPercent = (0, random_helper_1.randomNumber)(10, 30);
            const discountMoney = Math.ceil(expectedPrice * discountPercent / 100 / 1000) * 1000;
            const discountType = (0, random_helper_1.randomEnum)(variable_1.DiscountType);
            const actualPrice = expectedPrice - discountMoney;
            invoiceItemsDto.push({
                referenceId: procedure.id,
                type: variable_1.InvoiceItemType.Procedure,
                unit: { name: '', rate: 1 },
                costPrice: 0,
                expectedPrice,
                quantity: (0, random_helper_1.randomNumber)(1, 5),
                actualPrice,
                discountMoney,
                discountPercent,
                discountType,
            });
        }
        const totalCostMoney = invoiceItemsDto.reduce((acc, cur) => acc += cur.quantity * cur.costPrice, 0);
        const totalItemMoney = invoiceItemsDto.reduce((acc, cur) => acc += cur.quantity * cur.actualPrice, 0);
        const discountPercent = (0, random_helper_1.randomNumber)(2, 10);
        const discountMoney = Math.ceil(totalItemMoney * discountPercent / 100 / 1000) * 1000;
        const discountType = (0, random_helper_1.randomEnum)(variable_1.DiscountType);
        const surcharge = (0, random_helper_1.randomNumber)(10000, 1000000, 10000);
        const expenses = (0, random_helper_1.randomNumber)(5000, 500000, 5000);
        const totalMoney = totalItemMoney - discountMoney + surcharge;
        const profit = totalMoney - totalCostMoney - expenses;
        const debt = Math.floor(totalMoney * (0, random_helper_1.randomNumber)(0.1, 0.5, 0.1) / 1000) * 1000;
        const invoiceInsertDto = {
            invoiceItems: invoiceItemsDto,
            totalCostMoney,
            totalItemMoney,
            discountMoney,
            discountPercent,
            discountType,
            surcharge,
            expenses,
            totalMoney,
            profit,
            debt,
            note: faker_1.faker.lorem.sentence(),
        };
        return invoiceInsertDto;
    }
    async start(oid, number, startTime, endTime) {
        const productBatches = await this.productBatchRepository.find({
            relations: { product: true },
            relationLoadStrategy: 'join',
            where: { oid },
        });
        const procedures = await this.procedureRepository.findBy({ oid });
        const customers = await this.customerRepository.findBy({ oid });
        const gap = Math.ceil((endTime.getTime() - startTime.getTime()) / number);
        for (let i = 0; i < number; i++) {
            const customer = (0, random_helper_1.randomItemsInArray)(customers);
            const productBatchesShuffle = (0, random_helper_1.shuffleArray)(productBatches);
            const proceduresShuffle = (0, random_helper_1.shuffleArray)(procedures);
            const createTime = startTime.getTime() + i * gap;
            const paymentTime = startTime.getTime() + i * gap + 60 * 60 * 1000;
            const shipTime = paymentTime;
            const refundTime = startTime.getTime() + i * gap + 2 * 60 * 60 * 1000;
            const invoiceInsertDto = this.fakeInvoiceDraftInsertDto(productBatchesShuffle, proceduresShuffle);
            invoiceInsertDto.createTime = createTime;
            invoiceInsertDto.customerId = customer.id;
            const { invoiceId } = await this.invoiceQuickRepository.createDraft({
                oid,
                invoiceInsertDto,
            });
            if (i % 2 === 0) {
                await this.invoiceQuickRepository.startShip({ oid, invoiceId, shipTime });
            }
            if (i % 3 === 0) {
                await this.invoiceQuickRepository.startPayment({
                    oid,
                    invoiceId,
                    paymentTime,
                    debt: invoiceInsertDto.debt,
                });
            }
            if (i % 6 === 0) {
                await this.invoiceQuickRepository.startRefund({ oid, invoiceId, refundTime });
            }
        }
    }
};
InvoiceSeed = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.ProductBatch)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Customer)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Procedure)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof repository_1.InvoiceQuickRepository !== "undefined" && repository_1.InvoiceQuickRepository) === "function" ? _d : Object])
], InvoiceSeed);
exports.InvoiceSeed = InvoiceSeed;


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationSeed = void 0;
const common_1 = __webpack_require__(1);
const entities_1 = __webpack_require__(8);
const organization_setting_entity_1 = __webpack_require__(26);
const typeorm_1 = __webpack_require__(11);
const product_example_1 = __webpack_require__(86);
let OrganizationSeed = class OrganizationSeed {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async start(oid) {
        await this.dataSource.getRepository(entities_1.Organization).upsert({
            id: oid,
            email: 'duyk30b@gmail.com',
            phone: '0986021190',
        }, { skipUpdateIfNoValuesChanged: true, conflictPaths: {} });
        const orgProductGroupSetting = this.dataSource.manager.create(entities_1.OrganizationSetting, {
            oid,
            type: organization_setting_entity_1.OrganizationSettingType.PRODUCT_GROUP,
            data: JSON.stringify(product_example_1.productGroupExampleData),
        });
        return await this.dataSource
            .createQueryBuilder()
            .insert()
            .into(entities_1.OrganizationSetting)
            .values(orgProductGroupSetting)
            .orUpdate(['data'], 'IDX_CLINIC_SETTING_TYPE')
            .execute();
    }
};
OrganizationSeed = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object])
], OrganizationSeed);
exports.OrganizationSeed = OrganizationSeed;


/***/ }),
/* 86 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.productExampleData = exports.productGroupExampleData = void 0;
exports.productGroupExampleData = {
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
};
exports.productExampleData = [
    {
        brandName: 'AMK 457/5ml',
        substance: 'Amoxicilin 400mg + Acid Clavulanic 57mg',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Thái Lan',
        costPrice: 95,
        expiryDate: 1638921600000,
        retailPrice: 170,
    },
    {
        brandName: 'akudinir 250mg/5ml',
        substance: 'cefdinir ',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'ấn độ',
        costPrice: 100,
        expiryDate: 1670803200000,
        retailPrice: 150,
    },
    {
        brandName: 'Fleming 457mg/5ml',
        substance: 'Amoxicilin 400mg + Acid Clavulanic 57mg',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Ấn Độ',
        costPrice: 110,
        expiryDate: null,
        retailPrice: 160,
    },
    {
        brandName: 'Fleming 1g',
        substance: 'Amoxicilin 875mg + Acid Clavulanic 125mg',
        unit: 'Vỉ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Ấn Độ',
        costPrice: 80,
        expiryDate: null,
        retailPrice: 130,
    },
    {
        brandName: 'Klacid 125mg/5ml',
        substance: 'Clarythromycin 125mg/5ml',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'indonesia',
        costPrice: 105,
        expiryDate: 1635724800000,
        retailPrice: 160,
    },
    {
        brandName: 'Novafex 37,5ml',
        substance: 'cefixime 100mg/5ml',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Australia',
        costPrice: 62,
        expiryDate: 1665705600000,
        retailPrice: 110,
    },
    {
        brandName: 'Cefpivoxime 50mg',
        substance: 'cefditoren 50mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'CPDP Hà Tây',
        costPrice: 7.5,
        expiryDate: 1641168000000,
        retailPrice: 13,
    },
    {
        brandName: 'Glencinone 125mg',
        substance: 'cefdinir 125mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'VN',
        costPrice: 3.5,
        expiryDate: 1670803200000,
        retailPrice: 7,
    },
    {
        brandName: 'Glencinone 250mg',
        substance: 'cefdinir 250mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Vn',
        costPrice: 5,
        expiryDate: 1647216000000,
        retailPrice: 11,
    },
    {
        brandName: 'Aziphar',
        substance: 'azithromycin 200mg/5ml',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'mekophar',
        costPrice: 65,
        expiryDate: 1636761600000,
        retailPrice: 130,
    },
    {
        brandName: 'Tolsus',
        substance: 'Trimethoprime 40mg+ sulfamethosazonle 200mg',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Thái Lan',
        costPrice: 30,
        expiryDate: 1654646400000,
        retailPrice: 70,
    },
    {
        brandName: 'Bactirid 30ml',
        substance: 'cefixime 100mg/5ml',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'pakistan',
        costPrice: 45,
        expiryDate: 1625875200000,
        retailPrice: 80,
    },
    {
        brandName: 'Qincef ',
        substance: 'cefuroxime 125mg/5ml',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'VN',
        costPrice: 36,
        expiryDate: 1692489600000,
        retailPrice: 70,
    },
    {
        brandName: 'Zinnat 125mg/5ml',
        substance: 'cefuroxime 125mg/5ml',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Anh',
        costPrice: 115,
        expiryDate: 1634947200000,
        retailPrice: 160,
    },
    {
        brandName: 'Zinnat 125mg',
        substance: 'cefuroxime 125mg/gói',
        unit: 'Gói',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Anh',
        costPrice: 14.1,
        expiryDate: 1670198400000,
        retailPrice: 18,
    },
    {
        brandName: 'Curam 60ml ,250mg/5ml ',
        substance: 'Amoxicilin 250mg + Acid Clavulanic 62,5mg',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Australia',
        costPrice: 72,
        expiryDate: 1673740800000,
        retailPrice: 140,
    },
    {
        brandName: 'Verzat 60ml',
        substance: 'cefaclor 125mg/5ml',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'philipin',
        costPrice: 65,
        expiryDate: 1641859200000,
        retailPrice: 110,
    },
    {
        brandName: 'clamoxyl 250mg',
        substance: 'amoxicilin 250mg',
        unit: 'Gói',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Pháp',
        costPrice: 5,
        expiryDate: 1639267200000,
        retailPrice: 6,
    },
    {
        brandName: 'Azismile ',
        substance: 'azithromycin 200mg/5ml',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Hàn quốc',
        costPrice: 61,
        expiryDate: 1675468800000,
        retailPrice: 110,
    },
    {
        brandName: 'Claminat 500mg/62,5mg',
        substance: 'Amoxicilin 500mg + Acid Clavulanic 62,5mg',
        unit: 'Gói',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'VN',
        costPrice: 6,
        expiryDate: 1671840000000,
        retailPrice: 12,
    },
    {
        brandName: 'Ceclor 60ml',
        substance: 'cefaclor 125mg/5ml',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Italia',
        costPrice: 95,
        expiryDate: 1634342400000,
        retailPrice: 160,
    },
    {
        brandName: 'azithromycin 500mg',
        substance: 'azithromycin 500mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Hậu Giang',
        costPrice: 2,
        expiryDate: 1684454400000,
        retailPrice: 6,
    },
    {
        brandName: 'Augmentin 250mg',
        substance: 'Amoxicilin 200mg + Acid Clavulanic 31,25mg',
        unit: 'Gói',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Pháp',
        costPrice: 10,
        expiryDate: 1653782400000,
        retailPrice: 12,
    },
    {
        brandName: 'Augmentin 500mg',
        substance: 'Amoxicilin 500mg + Acid Clavulanic 62,5mg',
        unit: 'Gói',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Pháp',
        costPrice: 14,
        expiryDate: 1643328000000,
        retailPrice: 18,
    },
    {
        brandName: 'Cardiroxime 500mg',
        substance: 'cefuroxime 500mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'VN',
        costPrice: 12,
        expiryDate: 1632960000000,
        retailPrice: 6,
    },
    {
        brandName: 'Hagimox 500mg',
        substance: 'amoxicilin 500mg',
        unit: 'Vỉ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Hậu Giang',
        costPrice: 10,
        expiryDate: 1702339200000,
        retailPrice: 20,
    },
    {
        brandName: 'Mebicefpo 200mg',
        substance: 'cefpodoxime 200mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'VN',
        costPrice: 3,
        expiryDate: null,
        retailPrice: 7,
    },
    {
        brandName: 'flagyl 250mg',
        substance: 'metronidazole 250mg',
        unit: 'Vỉ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'VN',
        costPrice: 10.5,
        expiryDate: 1656028800000,
        retailPrice: 25,
    },
    {
        brandName: 'Hohallis',
        substance: 'Thảo dược',
        unit: 'Vỉ',
        group: 'Khác',
        route: 'Khác',
        source: 'VN',
        costPrice: 10,
        expiryDate: null,
        retailPrice: 20,
    },
    {
        brandName: 'fexolergic 60mg',
        substance: 'fexofenadin 60mg',
        unit: 'Vỉ',
        group: 'Dị ứng',
        route: 'Uống',
        source: 'VN',
        costPrice: 16,
        expiryDate: 1620950400000,
        retailPrice: 30,
    },
    {
        brandName: 'nootropil 800mg',
        substance: 'piracetam 800mg',
        unit: 'Viên',
        group: 'Thần Kinh',
        route: 'Uống',
        source: 'singapore',
        costPrice: 3.6,
        expiryDate: 1670803200000,
        retailPrice: 6,
    },
    {
        brandName: 'sorbitol 5g',
        substance: 'sorbitol',
        unit: 'Gói',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'VN',
        costPrice: 0.6,
        expiryDate: 1676592000000,
        retailPrice: 2,
    },
    {
        brandName: 'Viatril S',
        substance: 'glucosamin 1500mg',
        unit: 'Gói',
        group: 'Cơ Xương Khớp',
        route: 'Uống',
        source: 'Ailen',
        costPrice: 15,
        expiryDate: 1668124800000,
        retailPrice: 19,
    },
    {
        brandName: 'magie B6 Corbiere',
        substance: 'magie 470mg, vitamin b6 5mg',
        unit: 'Vỉ',
        group: 'Thần Kinh',
        route: 'Uống',
        source: 'VN',
        costPrice: 16,
        expiryDate: 1658361600000,
        retailPrice: 30,
    },
    {
        brandName: 'Mobic 7,5mg',
        substance: 'meloxicam 7,5mg',
        unit: 'Viên',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: 'Hy Lạp',
        costPrice: 8,
        expiryDate: 1638921600000,
        retailPrice: 10,
    },
    {
        brandName: 'Betamethasone 30g',
        substance: 'Betamethasone',
        unit: 'Tuýp',
        group: 'Corticoid',
        route: 'Bôi',
        source: 'VN',
        costPrice: 40,
        expiryDate: 1665619200000,
        retailPrice: 50,
    },
    {
        brandName: 'Myonal 50mg',
        substance: 'eperison 50mg',
        unit: 'Vỉ',
        group: 'Cơ Xương Khớp',
        route: 'Uống',
        source: 'Thái Lan',
        costPrice: 39,
        expiryDate: 1653609600000,
        retailPrice: 50,
    },
    {
        brandName: 'Primperam 10mg',
        substance: 'metoclopramid 10mg',
        unit: 'Viên',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Pháp',
        costPrice: 1,
        expiryDate: 1651708800000,
        retailPrice: 5,
    },
    {
        brandName: 'Allopurinon 300mg',
        substance: 'Allopurinon 300mg',
        unit: 'Vỉ',
        group: 'Cơ Xương Khớp',
        route: 'Uống',
        source: 'VN',
        costPrice: 9.5,
        expiryDate: 1715731200000,
        retailPrice: 20,
    },
    {
        brandName: 'Tanganil 500mg',
        substance: 'acetil leucine',
        unit: 'Viên',
        group: 'Thần Kinh',
        route: 'Uống',
        source: 'Pháp',
        costPrice: 4,
        expiryDate: 1670803200000,
        retailPrice: 6,
    },
    {
        brandName: 'Debridat 100mg',
        substance: 'trimebutinhe 100mg',
        unit: 'Viên',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Pháp',
        costPrice: 2,
        expiryDate: 1642896000000,
        retailPrice: 5,
    },
    {
        brandName: 'Arcorxia 60mg',
        substance: 'etoricoxib 60mg',
        unit: 'Viên',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: 'Anh',
        costPrice: 13,
        expiryDate: 1658880000000,
        retailPrice: 17,
    },
    {
        brandName: 'salonpas gel 15mg',
        substance: 'methyl salicilat 15g',
        unit: 'Tuýp',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Bôi',
        source: 'VN',
        costPrice: 21,
        expiryDate: 1698364800000,
        retailPrice: 30,
    },
    {
        brandName: 'ameflu',
        substance: 'acetaminophen, phenyl ephrine, vit C, Guaifenesin, dextromethorphan',
        unit: 'Viên',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: 'VN',
        costPrice: 0.9,
        expiryDate: 1653868800000,
        retailPrice: 1.5,
    },
    {
        brandName: 'ginkobiloba 2000',
        substance: 'ginko 2000',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 135,
        expiryDate: 1701388800000,
        retailPrice: 230,
    },
    {
        brandName: 'Ostelin kids Calcium vit D3',
        substance: 'calcium 350mg+D3 300UI',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 50,
        expiryDate: null,
        retailPrice: 290,
    },
    {
        brandName: 'Bioisland Lysine Step Up',
        substance: 'Lysine 250mg',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 225,
        expiryDate: 1690761600000,
        retailPrice: 320,
    },
    {
        brandName: 'Bioisland ZinC',
        substance: 'zinc 3mg',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 225,
        expiryDate: 1700611200000,
        retailPrice: 320,
    },
    {
        brandName: 'Bioisland DHA',
        substance: 'DHA 100mg',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 235,
        expiryDate: 1638921600000,
        retailPrice: 350,
    },
    {
        brandName: 'pediakid sommeil',
        substance: 'bé ngủ ngon',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Pháp',
        costPrice: 180,
        expiryDate: 1683244800000,
        retailPrice: 240,
    },
    {
        brandName: 'Prospan',
        substance: 'cao khô lá thường xuân',
        unit: 'Lọ',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'Đức',
        costPrice: 150,
        expiryDate: 1638921600000,
        retailPrice: 220,
    },
    {
        brandName: 'anaferon siro',
        substance: 'anaferon',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Nga',
        costPrice: 130,
        expiryDate: 1638921600000,
        retailPrice: 190,
    },
    {
        brandName: 'anaferon viên',
        substance: 'anaferon',
        unit: 'Vỉ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Nga',
        costPrice: 90,
        expiryDate: 1635292800000,
        retailPrice: 140,
    },
    {
        brandName: 'maxclary 250mg',
        substance: 'Clarythromycin 250mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'VN',
        costPrice: 4.5,
        expiryDate: 1670803200000,
        retailPrice: 7,
    },
    {
        brandName: 'Clavuraem 625mg',
        substance: 'Amoxicilin 500mg + Acid Clavulanic 125mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'CH Séc',
        costPrice: 7.5,
        expiryDate: 1662681600000,
        retailPrice: 12,
    },
    {
        brandName: 'Cool-Flu',
        substance: 'Thảo dược',
        unit: 'Lọ',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'VN',
        costPrice: 30,
        expiryDate: 1638921600000,
        retailPrice: 70,
    },
    {
        brandName: 'Mekotricin',
        substance: 'tyrothycin',
        unit: 'Túi',
        group: 'Hô hấp',
        route: 'Ngậm',
        source: 'VN',
        costPrice: 8,
        expiryDate: null,
        retailPrice: 20,
    },
    {
        brandName: 'Hapacol 80mg',
        substance: 'paracetamol 80mg',
        unit: 'Gói',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: 'Hậu Giang',
        costPrice: 1,
        expiryDate: 1702339200000,
        retailPrice: 5,
    },
    {
        brandName: 'Hapacol 150mg',
        substance: 'paracetamol 150mg',
        unit: 'Gói',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: 'Hậu Giang',
        costPrice: 1.25,
        expiryDate: 1699747200000,
        retailPrice: 5,
    },
    {
        brandName: 'Hapacol 250mg',
        substance: 'paracetamol 250mg',
        unit: 'Gói',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: 'Hậu Giang',
        costPrice: 1.5,
        expiryDate: 1702339200000,
        retailPrice: 5,
    },
    {
        brandName: 'efferalgan 80mg',
        substance: 'paracetamol 80mg',
        unit: 'Viên',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Khác',
        source: 'Hậu Giang',
        costPrice: 2.2,
        expiryDate: 1670803200000,
        retailPrice: 5,
    },
    {
        brandName: 'efferalgan 150mg',
        substance: 'paracetamol 150mg',
        unit: 'Viên',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Khác',
        source: 'Hậu Giang',
        costPrice: 2.5,
        expiryDate: 1680912000000,
        retailPrice: 5,
    },
    {
        brandName: 'Multipro',
        substance: 'vitamin',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Anh',
        costPrice: 153,
        expiryDate: 1645401600000,
        retailPrice: 250,
    },
    {
        brandName: 'Medibest',
        substance: 'Vitamin D3 400Ui+ K2 2,5mcg',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Italia',
        costPrice: 165,
        expiryDate: 1719619200000,
        retailPrice: 260,
    },
    {
        brandName: 'Immunoglucan C',
        substance: 'betagluca+ vit C',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Italia',
        costPrice: 175,
        expiryDate: -55131753600000,
        retailPrice: 250,
    },
    {
        brandName: 'Bone cal',
        substance: 'Calcium 500mg+ D3 200Ui+k2 10mcg',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Italia',
        costPrice: 200,
        expiryDate: 1653955200000,
        retailPrice: 280,
    },
    {
        brandName: 'multivitamin mini drop natures aid',
        substance: '9 vitamin',
        unit: 'Chai',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Natures aid- Anh',
        costPrice: 40,
        expiryDate: null,
        retailPrice: 250,
    },
    {
        brandName: 'Imunoglukan P4H',
        substance: 'betagluca+ vit C',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: '',
        costPrice: 100,
        expiryDate: null,
        retailPrice: 320,
    },
    {
        brandName: 'Pedia Iron Drops',
        substance: 'sắt 15mg/ml',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'mỹ',
        costPrice: 157,
        expiryDate: 1651104000000,
        retailPrice: 250,
    },
    {
        brandName: 'Blackmores prenancy iron',
        substance: 'sắt 24mg',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 145,
        expiryDate: 1653955200000,
        retailPrice: 200,
    },
    {
        brandName: 'BioGaia _ Balan',
        substance: 'lactobacillus reuteri',
        unit: 'Lọ',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'balan',
        costPrice: 265,
        expiryDate: 1696982400000,
        retailPrice: 350,
    },
    {
        brandName: 'Ostelin Calcium vit D3 infant',
        substance: 'calcium 600mg+D3 500UI',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 195,
        expiryDate: 1638921600000,
        retailPrice: 350,
    },
    {
        brandName: 'Ferrotamin syrup',
        substance: 'sắt 7mg/5ml + vitamin',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'hungary',
        costPrice: 110,
        expiryDate: 1718841600000,
        retailPrice: 180,
    },
    {
        brandName: 'Zinc plex',
        substance: 'kẽm 15mg/5ml+ lysin 10mg+selenium',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Italia',
        costPrice: 175,
        expiryDate: 1718841600000,
        retailPrice: 270,
    },
    {
        brandName: 'Kids Smart drops DHA ',
        substance: 'DHA',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Nature\'s Way - Australia',
        costPrice: 160,
        expiryDate: 1702339200000,
        retailPrice: 260,
    },
    {
        brandName: 'Kids high strength DHA ',
        substance: 'DHA 100mg',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 145,
        expiryDate: 1693353600000,
        retailPrice: 220,
    },
    {
        brandName: 'Broncho-Vaxom children',
        substance: 'lyophilized bacterial lysates 3,5mg',
        unit: 'Vỉ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Thuỵ sĩ',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 170,
    },
    {
        brandName: 'zinofa',
        substance: 'kẽm',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'VN',
        costPrice: 38,
        expiryDate: 1697414400000,
        retailPrice: 100,
    },
    {
        brandName: 'Bioisland Milk Calcium for kids',
        substance: 'calcium 78mg',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 295,
        expiryDate: 1699920000000,
        retailPrice: 390,
    },
    {
        brandName: 'Dutimol',
        substance: 'vitamin+ acid amin',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'VN',
        costPrice: 85,
        expiryDate: 1719619200000,
        retailPrice: 180,
    },
    {
        brandName: 'vita gold',
        substance: 'vitamin+ tâm sen',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'VN',
        costPrice: 140,
        expiryDate: 1719619200000,
        retailPrice: 220,
    },
    {
        brandName: 'Laforin bạc hà',
        substance: 'nước súc miệng',
        unit: 'Chai',
        group: 'Khác',
        route: 'Khác',
        source: 'VN',
        costPrice: 92,
        expiryDate: 1678752000000,
        retailPrice: 115,
    },
    {
        brandName: 'Laforin đào',
        substance: 'nước súc miệng',
        unit: 'Chai',
        group: 'Khác',
        route: 'Khác',
        source: 'VN',
        costPrice: 92,
        expiryDate: 1678752000000,
        retailPrice: 115,
    },
    {
        brandName: 'Blackmores glucosamine ',
        substance: 'glucosamin 1500mg',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 515,
        expiryDate: 1673395200000,
        retailPrice: 670,
    },
    {
        brandName: 'Phacoter',
        substance: 'Codein 10mg + Terpin Hydrat 100mg',
        unit: 'Viên',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'vn',
        costPrice: 0.5,
        expiryDate: 1671062400000,
        retailPrice: 1.5,
    },
    {
        brandName: 'Spydmax ',
        substance: 'Spiramycin 1.500.000 IU',
        unit: 'Gói',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'VN',
        costPrice: 4.9,
        expiryDate: 1629590400000,
        retailPrice: 8,
    },
    {
        brandName: 'Lopran',
        substance: 'Loperamide BP 2mg',
        unit: 'Viên',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Ấn Độ',
        costPrice: 0.1,
        expiryDate: null,
        retailPrice: 0.3,
    },
    {
        brandName: 'Spasmaverine',
        substance: 'Alverine citrate 60mg',
        unit: 'Viên',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'VN',
        costPrice: 0.7,
        expiryDate: 1616544000000,
        retailPrice: 1,
    },
    {
        brandName: 'Colchicin',
        substance: 'Colchicin 1mg',
        unit: 'Vỉ',
        group: 'Cơ Xương Khớp',
        route: 'Uống',
        source: 'VN',
        costPrice: 18,
        expiryDate: 1692230400000,
        retailPrice: 40,
    },
    {
        brandName: 'Medrol 16',
        substance: 'Methyprednisolone 16mg',
        unit: 'Viên',
        group: 'Corticoid',
        route: 'Uống',
        source: 'Italia',
        costPrice: 3.733,
        expiryDate: 1697932800000,
        retailPrice: 5,
    },
    {
        brandName: 'Modom\'S',
        substance: 'Domperidon 10mg',
        unit: '',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'VN',
        costPrice: 0.5,
        expiryDate: null,
        retailPrice: 1,
    },
    {
        brandName: 'SOSCough',
        substance: 'Cetirizin 5mg + Guaifenesin 100mg + Dextromethorphan 15mg',
        unit: 'Vỉ',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'VN',
        costPrice: 12.667,
        expiryDate: 1700092800000,
        retailPrice: 20,
    },
    {
        brandName: 'Hagizin',
        substance: 'Flunarizine 5mg',
        unit: 'Viên',
        group: 'Thần Kinh',
        route: 'Uống',
        source: 'VN',
        costPrice: 0.88,
        expiryDate: 1664841600000,
        retailPrice: 2.5,
    },
    {
        brandName: 'Medlicet',
        substance: 'Ceftirizine BP 10mg',
        unit: 'Viên',
        group: 'Dị ứng',
        route: 'Uống',
        source: 'VN',
        costPrice: 0.2,
        expiryDate: 1649030400000,
        retailPrice: 0.5,
    },
    {
        brandName: ' Cenfast 120',
        substance: 'Fexofenadin 120mg',
        unit: 'Viên',
        group: 'Dị ứng',
        route: 'Uống',
        source: 'VN',
        costPrice: 1.55,
        expiryDate: 1657584000000,
        retailPrice: 5,
    },
    {
        brandName: 'Brexin',
        substance: 'Piroxicam 20mg',
        unit: 'Viên',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: 'Italia',
        costPrice: 7.8,
        expiryDate: 1644624000000,
        retailPrice: 9.5,
    },
    {
        brandName: 'Panangin',
        substance: 'Mg 11,8mg + K 36,2 mg',
        unit: 'Viên',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Hungary',
        costPrice: 1.56,
        expiryDate: 1643155200000,
        retailPrice: 2.5,
    },
    {
        brandName: 'Strepsils ',
        substance: 'ngậm',
        unit: 'Vỉ',
        group: 'Khác',
        route: 'Khác',
        source: 'Thái Lan',
        costPrice: 15,
        expiryDate: 1638921600000,
        retailPrice: 20,
    },
    {
        brandName: 'Zebacef 300',
        substance: 'Cefdinir 300mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Thổ Nhĩ Kỳ',
        costPrice: 7.2,
        expiryDate: 1648598400000,
        retailPrice: 12,
    },
    {
        brandName: 'Akugabalin',
        substance: 'Pregabalin 75mg',
        unit: 'Viên',
        group: 'Thần Kinh',
        route: 'Uống',
        source: 'Ấn Độ',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 9,
    },
    {
        brandName: 'Difelene',
        substance: 'Diclofenac 50mg',
        unit: 'Viên',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: 'Thái Lan',
        costPrice: 1,
        expiryDate: 1707955200000,
        retailPrice: 2,
    },
    {
        brandName: 'Clorpheniramin 4mg',
        substance: 'Clorpheniramin 4mg',
        unit: 'Vỉ',
        group: 'Dị ứng',
        route: 'Uống',
        source: 'VN',
        costPrice: 2,
        expiryDate: 1679702400000,
        retailPrice: 5,
    },
    {
        brandName: 'AluGold Gel',
        substance: 'Magie + Nhôm + Thảo dược',
        unit: 'Gói',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'VN',
        costPrice: 4.5,
        expiryDate: 1682985600000,
        retailPrice: 9,
    },
    {
        brandName: 'Gastropulgite',
        substance: 'Aluminium + Magnesium',
        unit: 'Gói',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'singapore',
        costPrice: 3.1,
        expiryDate: 1655769600000,
        retailPrice: 5,
    },
    {
        brandName: 'Postan_eight',
        substance: 'Bromelain 50mg + Papain 20mg + Rutin 5mg',
        unit: 'Vỉ',
        group: 'Khác',
        route: 'Uống',
        source: 'vn',
        costPrice: 10,
        expiryDate: 1649548800000,
        retailPrice: 30,
    },
    {
        brandName: 'Tanganil 500mg/ 5ml',
        substance: 'acetil leucine',
        unit: 'Ống',
        group: 'Thần Kinh',
        route: 'Tiêm',
        source: 'Pháp',
        costPrice: 30,
        expiryDate: 1686009600000,
        retailPrice: 45,
    },
    {
        brandName: 'Adrenalin 1mg/1ml',
        substance: 'Adrenalin',
        unit: 'Ống',
        group: 'Tim Mạch',
        route: 'Tiêm',
        source: 'vn',
        costPrice: 2,
        expiryDate: 1661558400000,
        retailPrice: 10,
    },
    {
        brandName: 'Nifephabaco',
        substance: 'Nifedipin',
        unit: 'Vỉ',
        group: 'Tim Mạch',
        route: 'Uống',
        source: 'vn',
        costPrice: 9,
        expiryDate: 1685404800000,
        retailPrice: 10,
    },
    {
        brandName: 'Vincomid',
        substance: 'Metocloramid 10mg/2ml',
        unit: 'Ống',
        group: 'Tiêu Hóa',
        route: 'Tiêm',
        source: 'vn',
        costPrice: 20,
        expiryDate: 1690934400000,
        retailPrice: 30,
    },
    {
        brandName: 'Mejybes Vitamin C',
        substance: 'Vitamin C',
        unit: 'Vỉ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'vn',
        costPrice: 5,
        expiryDate: 1672531200000,
        retailPrice: 10,
    },
    {
        brandName: 'Medi X',
        substance: 'Bromelain 30mg + Papain 50mg + Rutin 40mg',
        unit: 'Viên',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'vn',
        costPrice: 1.58,
        expiryDate: 1678233600000,
        retailPrice: 2.5,
    },
    {
        brandName: '3B - Medi',
        substance: 'Vitamin B1 125mg + B6 125mg + B12 250mg',
        unit: 'Vỉ',
        group: 'Thần Kinh',
        route: 'Uống',
        source: 'vn',
        costPrice: 9.4,
        expiryDate: 1671753600000,
        retailPrice: 15,
    },
    {
        brandName: 'Betaserc ',
        substance: 'Betahistine 16mg',
        unit: 'Viên',
        group: 'Thần Kinh',
        route: 'Uống',
        source: 'Hà Lan',
        costPrice: 3.217,
        expiryDate: 1625011200000,
        retailPrice: 6,
    },
    {
        brandName: 'PrazoPro',
        substance: 'Esomeprazol 40mg',
        unit: 'Vỉ',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'vn',
        costPrice: 36,
        expiryDate: 1630713600000,
        retailPrice: 55,
    },
    {
        brandName: 'Levo DHG',
        substance: 'Levofloxacin 500mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'vn',
        costPrice: 4.567,
        expiryDate: 1655164800000,
        retailPrice: 6,
    },
    {
        brandName: 'Cefdinir 300',
        substance: 'Cefdinir 300mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'vn',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 13,
    },
    {
        brandName: 'MedSkin Clovir 800',
        substance: 'Acyclovir 800mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'vn',
        costPrice: 3.333,
        expiryDate: 1670803200000,
        retailPrice: 6,
    },
    {
        brandName: 'Amlodipin 5mg',
        substance: 'Amlodipin 5mg',
        unit: 'Vỉ',
        group: 'Tim Mạch',
        route: 'Uống',
        source: 'vn',
        costPrice: 9,
        expiryDate: 1675728000000,
        retailPrice: 10,
    },
    {
        brandName: 'Daitos ',
        substance: 'Ketorolac 30mg/1ml',
        unit: 'Ống',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Tiêm',
        source: 'Hàn Quốc',
        costPrice: 15,
        expiryDate: 1626652800000,
        retailPrice: 30,
    },
    {
        brandName: 'Vinsolon',
        substance: 'Methylprednisolone 40mg',
        unit: 'Ống',
        group: 'Corticoid',
        route: 'Tiêm',
        source: 'vn',
        costPrice: 10,
        expiryDate: 1676592000000,
        retailPrice: 30,
    },
    {
        brandName: 'Solu-Medrol',
        substance: 'Methylprednisolone 40 mg',
        unit: 'Ống',
        group: 'Corticoid',
        route: 'Tiêm',
        source: 'Bỉ',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 80,
    },
    {
        brandName: 'Midasol',
        substance: 'Bromo camphor 20mg + Methylene 20mg',
        unit: 'Vỉ',
        group: 'Khác',
        route: 'Uống',
        source: 'VN',
        costPrice: 5.5,
        expiryDate: 1690416000000,
        retailPrice: 10,
    },
    {
        brandName: 'Lodegald - Cipro',
        substance: 'Ciprofloxacin 500mg',
        unit: 'Vỉ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'vn',
        costPrice: 18.5,
        expiryDate: 1656374400000,
        retailPrice: 30,
    },
    {
        brandName: 'panadol extra',
        substance: 'paracetamol 500mg + Caffeine 65 mg',
        unit: 'Vỉ',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: 'vn',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 20,
    },
    {
        brandName: 'Daflon 500',
        substance: 'Diosmine ',
        unit: 'Vỉ',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Pháp',
        costPrice: 52.5,
        expiryDate: 1703980800000,
        retailPrice: 75,
    },
    {
        brandName: 'Diacerein ',
        substance: 'Diacerein 50mg',
        unit: 'Viên',
        group: 'Cơ Xương Khớp',
        route: 'Uống',
        source: 'vn',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 2.5,
    },
    {
        brandName: 'MedSkin Clovir 400',
        substance: 'Acyclovir 400mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'vn',
        costPrice: 1.85,
        expiryDate: 1657929600000,
        retailPrice: 5,
    },
    {
        brandName: 'Herperax 200',
        substance: 'Acyclovir 200mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Ấn Độ',
        costPrice: 1.3,
        expiryDate: 1651104000000,
        retailPrice: 2,
    },
    {
        brandName: 'Hapacol Extra 650',
        substance: 'paracetamol 650mg + Caffeine 65 mg',
        unit: 'Vỉ',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: 'vn',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 10,
    },
    {
        brandName: 'Lodegald - Levo',
        substance: 'Levofloxacin 500mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'vn',
        costPrice: 4,
        expiryDate: 1679011200000,
        retailPrice: 8,
    },
    {
        brandName: 'Pyme Azi 250',
        substance: 'azithromycin 250mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'vn',
        costPrice: 17.5,
        expiryDate: 1649721600000,
        retailPrice: 3.5,
    },
    {
        brandName: 'Tiarutundin',
        substance: 'Thảo dược',
        unit: 'Vỉ',
        group: 'Thần Kinh',
        route: 'Uống',
        source: 'vn',
        costPrice: 5,
        expiryDate: 1646870400000,
        retailPrice: 10,
    },
    {
        brandName: 'Cifataze DT 100',
        substance: 'Cefixime 100mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Ấn độ',
        costPrice: 1.4,
        expiryDate: 1646438400000,
        retailPrice: 5,
    },
    {
        brandName: 'Keatabs',
        substance: 'Roxithromycin 150mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'vn',
        costPrice: 55,
        expiryDate: 1654819200000,
        retailPrice: 3.5,
    },
    {
        brandName: 'Sanlein 0.1',
        substance: 'Natri hyaluronat 0,1%',
        unit: 'Ống',
        group: 'Khác',
        route: 'Nhỏ Giọt',
        source: 'Nhật Bản',
        costPrice: 61,
        expiryDate: 1638921600000,
        retailPrice: 80,
    },
    {
        brandName: 'Candid',
        substance: 'Clotrimazole',
        unit: 'Ống',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Nhỏ Giọt',
        source: 'Ấn độ',
        costPrice: 75,
        expiryDate: 1660953600000,
        retailPrice: 90,
    },
    {
        brandName: 'Daktarin Oral gel',
        substance: 'Miconazole',
        unit: 'Tuýp',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'Thái Lan',
        costPrice: 42.5,
        expiryDate: 1685923200000,
        retailPrice: 55,
    },
    {
        brandName: 'Subạc',
        substance: 'Nano bạc',
        unit: 'Tuýp',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'VN',
        costPrice: 140,
        expiryDate: 1759622400000,
        retailPrice: 150,
    },
    {
        brandName: 'Metrogyl Denta',
        substance: 'Metronidazole gel 10mg/g',
        unit: 'Tuýp',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Bôi',
        source: 'Ấn Độ',
        costPrice: 29,
        expiryDate: 1640649600000,
        retailPrice: 55,
    },
    {
        brandName: 'Bactronil',
        substance: 'Mỡ Mupirocin 2%',
        unit: 'Tuýp',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'Ấn Độ',
        costPrice: 32,
        expiryDate: 1633910400000,
        retailPrice: 60,
    },
    {
        brandName: 'Tobrex',
        substance: 'Tobramycin 3mg/ml',
        unit: 'Ống',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Nhỏ Giọt',
        source: 'vn',
        costPrice: 40,
        expiryDate: 1635724800000,
        retailPrice: 55,
    },
    {
        brandName: 'Oflovid',
        substance: 'Ofloxacin 0,3%',
        unit: 'Ống',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Nhỏ Giọt',
        source: 'Nhật Bản',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 70,
    },
    {
        brandName: 'Plenmoxin',
        substance: 'Moxifloxacin',
        unit: 'Ống',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Nhỏ Giọt',
        source: 'Ấn Độ',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 60,
    },
    {
        brandName: 'Cinepark',
        substance: 'Ofloxacin 15mg + Dexamethason 5,5mg',
        unit: 'Ống',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Nhỏ Giọt',
        source: 'vn',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 50,
    },
    {
        brandName: 'Phenergan',
        substance: 'Promethazine',
        unit: 'Tuýp',
        group: 'Dị ứng',
        route: 'Bôi',
        source: 'VN',
        costPrice: 13,
        expiryDate: 1649721600000,
        retailPrice: 25,
    },
    {
        brandName: 'Elossy',
        substance: 'Xylometazoline 0,05%',
        unit: 'Ống',
        group: 'Hô hấp',
        route: 'Nhỏ Giọt',
        source: 'vn',
        costPrice: 5.3,
        expiryDate: 1650931200000,
        retailPrice: 10,
    },
    {
        brandName: 'Dermovate 15g',
        substance: 'Clobeasol propionate 0,05%',
        unit: 'Tuýp',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'Anh',
        costPrice: 45,
        expiryDate: 1634947200000,
        retailPrice: 65,
    },
    {
        brandName: 'Tatracyclin 1%',
        substance: 'Tatracyclin 1%',
        unit: 'Tuýp',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Bôi',
        source: 'vn',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 10,
    },
    {
        brandName: 'Zytee',
        substance: 'Cholin salicylat + Clorua Benzalkonium',
        unit: 'Tuýp',
        group: 'Khác',
        route: 'Bôi',
        source: 'Ấn Độ',
        costPrice: 23,
        expiryDate: 1657929600000,
        retailPrice: 35,
    },
    {
        brandName: 'Kamistad - Gel N',
        substance: 'Lidocain',
        unit: 'Tuýp',
        group: 'Khác',
        route: 'Bôi',
        source: 'Germany',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 45,
    },
    {
        brandName: 'Eumovate cream',
        substance: 'Clobetasone',
        unit: 'Tuýp',
        group: 'Corticoid',
        route: 'Bôi',
        source: 'Anh',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 35,
    },
    {
        brandName: 'Dipolac ',
        substance: 'Betamethasone 9,6mg + Gentamycin 15mg + Clotrimazole 150mg',
        unit: 'Tuýp',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Bôi',
        source: 'usa',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 30,
    },
    {
        brandName: 'Tamiflu',
        substance: 'Osetamivir 75mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'ý',
        costPrice: 75,
        expiryDate: 1724803200000,
        retailPrice: 100,
    },
    {
        brandName: 'ACC Cylin',
        substance: 'N - Acetyl -L- Cystein 200mg',
        unit: 'Lọ',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'vn',
        costPrice: 30,
        expiryDate: 1704326400000,
        retailPrice: 70,
    },
    {
        brandName: 'Babycanyl',
        substance: 'Terbutalin sulfat 1,5mg + Guaifenesin',
        unit: 'Lọ',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'vn',
        costPrice: 28,
        expiryDate: 1680307200000,
        retailPrice: 60,
    },
    {
        brandName: 'Legomux',
        substance: 'Ambroxol 6mg/ml',
        unit: 'Lọ',
        group: 'Hô hấp',
        route: 'Nhỏ Giọt',
        source: 'Banglades',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 60,
    },
    {
        brandName: 'Delopedil 60ml',
        substance: 'Desloratadine 0,5mg',
        unit: 'Lọ',
        group: 'Dị ứng',
        route: 'Uống',
        source: 'VN',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 60,
    },
    {
        brandName: 'Nhiệt Smile',
        substance: 'Vitamin c 1000mg + Vitamin PP, B1, B2,B6',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'vn',
        costPrice: 21.5,
        expiryDate: 1640649600000,
        retailPrice: 70,
    },
    {
        brandName: 'OLESOM 100ml',
        substance: 'Ambroxol 30mg/5ml',
        unit: 'Lọ',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'Ấn Độ',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 60,
    },
    {
        brandName: 'Halixol siro100ml',
        substance: 'Ambroxol 15mg/5ml',
        unit: 'Lọ',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'hungary',
        costPrice: 34,
        expiryDate: 1638921600000,
        retailPrice: 70,
    },
    {
        brandName: 'Best GSV 60ml',
        substance: 'Betamethason 3mg + Desclorpheniramin maleat 24mg',
        unit: 'Lọ',
        group: 'Dị ứng',
        route: 'Uống',
        source: 'vn',
        costPrice: 30,
        expiryDate: 1666310400000,
        retailPrice: 60,
    },
    {
        brandName: 'HIDRASEC ',
        substance: 'Racecadotril 10mg',
        unit: 'Gói',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Pháp',
        costPrice: 4.688,
        expiryDate: 1639267200000,
        retailPrice: 6,
    },
    {
        brandName: 'CLANOZ',
        substance: 'Loratadin 10mg',
        unit: 'Viên',
        group: 'Dị ứng',
        route: 'Uống',
        source: 'vn',
        costPrice: 0.55,
        expiryDate: 1634947200000,
        retailPrice: 1,
    },
    {
        brandName: 'Theralene',
        substance: 'Alimemazine 5mg',
        unit: 'Viên',
        group: 'Dị ứng',
        route: 'Uống',
        source: 'vn',
        costPrice: 0.3,
        expiryDate: -55781308800000,
        retailPrice: 1,
    },
    {
        brandName: 'MEKOCETIN',
        substance: 'Betamethasone 0,5 mg',
        unit: 'Viên',
        group: 'Corticoid',
        route: 'Uống',
        source: 'vn',
        costPrice: 0.175,
        expiryDate: 1638921600000,
        retailPrice: 1,
    },
    {
        brandName: 'Duphalac 15ml/1 gói',
        substance: 'Lactulose 10g',
        unit: 'Gói',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Hà lan',
        costPrice: 4.65,
        expiryDate: 1651276800000,
        retailPrice: 7,
    },
    {
        brandName: 'PROGERMILA',
        substance: 'Bacillus clausii (TB lợi khuẩn)',
        unit: 'Ống',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'vn',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 7,
    },
    {
        brandName: 'Frazin 10ml',
        substance: 'Thymomodulin 800mg + Zn gluconate 400mg',
        unit: 'Ống',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'vn',
        costPrice: 4.583,
        expiryDate: -55100217600000,
        retailPrice: 8.5,
    },
    {
        brandName: 'Colibasi - BM 5ml',
        substance: 'Bacillus clausii (TB lợi khuẩn)',
        unit: 'Ống',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'vn',
        costPrice: 4.25,
        expiryDate: 1670803200000,
        retailPrice: 7,
    },
    {
        brandName: 'ZENTEL',
        substance: 'Albendazole 200mg',
        unit: 'Gói',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'vn',
        costPrice: 11,
        expiryDate: 1671753600000,
        retailPrice: 20,
    },
    {
        brandName: 'Unafen 100ml',
        substance: 'Ibuprofen 100mg/5ml',
        unit: 'Lọ',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: 'Ấn độ',
        costPrice: 45,
        expiryDate: 1652140800000,
        retailPrice: 80,
    },
    {
        brandName: 'Bobotic 30ml',
        substance: 'Simeticonum 66,66mg/ml',
        unit: 'Lọ',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Ba lan',
        costPrice: 53,
        expiryDate: 1657238400000,
        retailPrice: 100,
    },
    {
        brandName: 'Ibupain 100mg/50ml',
        substance: 'Ibuprofen ',
        unit: 'Lọ',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: 'vn',
        costPrice: 35,
        expiryDate: 1639526400000,
        retailPrice: 70,
    },
    {
        brandName: 'PARACETAMOL - 120',
        substance: 'paracetamol 120mg/60ml',
        unit: 'Lọ',
        group: '',
        route: 'Uống',
        source: 'Malaisia',
        costPrice: 32,
        expiryDate: 1632960000000,
        retailPrice: 52,
    },
    {
        brandName: 'Centrum Kids',
        substance: 'Vitamin + A.Folic + Zn, Mg, P, Ca',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 270,
    },
    {
        brandName: 'ORACORTIA',
        substance: 'Triamcinolone 0,1%',
        unit: 'Gói',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Bôi',
        source: 'Thái Lan',
        costPrice: 8.7,
        expiryDate: 1685664000000,
        retailPrice: 15,
    },
    {
        brandName: 'BULOXDINE ',
        substance: 'Ibuprofen 100mg/5ml',
        unit: 'Gói',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: 'Hàn Quốc',
        costPrice: 4.5,
        expiryDate: 1629331200000,
        retailPrice: 65,
    },
    {
        brandName: 'ORESOL 5,58g',
        substance: 'Glucose 4g + Natri Clorid 0,7g + Natricitrat 0,58g + Kaki clorid 0,3g',
        unit: 'Gói',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'vn',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 1,
    },
    {
        brandName: 'Ibumed 400',
        substance: 'Ibuprofen 400mg',
        unit: 'Vỉ',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: 'singapore',
        costPrice: 3,
        expiryDate: 1635724800000,
        retailPrice: 10,
    },
    {
        brandName: 'Xitmos',
        substance: 'Thảo dược',
        unit: 'Lọ',
        group: 'Da Liễu',
        route: 'Khác',
        source: 'vn',
        costPrice: 25,
        expiryDate: 1645401600000,
        retailPrice: 50,
    },
    {
        brandName: 'Liver KIDS Siro',
        substance: 'Thảo dược',
        unit: 'Ống',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'VN',
        costPrice: 5,
        expiryDate: -27080352000000,
        retailPrice: 150,
    },
    {
        brandName: 'Redmulti _ Sủi',
        substance: 'Vitamin C + a.Folic + PP, E, B1, B2, B6',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'vn',
        costPrice: 25,
        expiryDate: 1657411200000,
        retailPrice: 40,
    },
    {
        brandName: 'ZoZo _ chanh',
        substance: 'Điện giải',
        unit: 'Chai',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'VN',
        costPrice: 7.5,
        expiryDate: 1638921600000,
        retailPrice: 10,
    },
    {
        brandName: 'ZoZo _ cam',
        substance: 'Điện giải',
        unit: 'Chai',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'vn',
        costPrice: 7.5,
        expiryDate: 1636761600000,
        retailPrice: 10,
    },
    {
        brandName: 'OMSERGY ',
        substance: 'Omeprazole 20mg',
        unit: 'Vỉ',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Ấn Độ',
        costPrice: 2.85,
        expiryDate: 1656633600000,
        retailPrice: 10,
    },
    {
        brandName: 'Rovanten 50ml',
        substance: 'Cefpodi 40mg/5ml',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Banglades',
        costPrice: 78,
        expiryDate: 1626739200000,
        retailPrice: 140,
    },
    {
        brandName: 'AZALOVIR 5g',
        substance: 'Acyclovir 5g',
        unit: 'Tuýp',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Bôi',
        source: 'Ấn Độ',
        costPrice: 6,
        expiryDate: 1702339200000,
        retailPrice: 10,
    },
    {
        brandName: 'HURAZOL ',
        substance: 'Esomeprazole 40mg',
        unit: 'Vỉ',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'vn',
        costPrice: 60,
        expiryDate: 1631750400000,
        retailPrice: 120,
    },
    {
        brandName: 'FEMALTO 30ml',
        substance: 'sắt hữu cơ dạng lỏng',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'vn',
        costPrice: 138,
        expiryDate: 1714780800000,
        retailPrice: 200,
    },
    {
        brandName: 'SAFVEX ',
        substance: 'Bacillus clausii (TB lợi khuẩn)',
        unit: 'Gói',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'VN',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 150,
    },
    {
        brandName: 'HISU Gold _ yến sào',
        substance: 'Vitamin + dinh dưỡng ',
        unit: 'Ống',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'vn',
        costPrice: 2.5,
        expiryDate: 1636761600000,
        retailPrice: 6,
    },
    {
        brandName: 'Monte H4',
        substance: 'Montelukast 4mg',
        unit: 'Vỉ',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'Ấn Độ',
        costPrice: 20,
        expiryDate: 1640908800000,
        retailPrice: 50,
    },
    {
        brandName: 'Acemuc 100',
        substance: 'Acetylcystein 100mg',
        unit: 'Gói',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'vn',
        costPrice: 1.833,
        expiryDate: 1638921600000,
        retailPrice: 4,
    },
    {
        brandName: 'Acemuc 200',
        substance: 'Acetylcystein 200mg',
        unit: 'Gói',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'vn',
        costPrice: 2.5,
        expiryDate: 1638921600000,
        retailPrice: 5,
    },
    {
        brandName: 'AT Fexofenadin 30ml',
        substance: 'Fexofenadin 30mg/5ml',
        unit: 'Lọ',
        group: 'Dị ứng',
        route: 'Uống',
        source: 'vn',
        costPrice: 28,
        expiryDate: 1635724800000,
        retailPrice: 80,
    },
    {
        brandName: 'Stervy Baby 70ml',
        substance: 'Nano bạc + Benzalkonium',
        unit: 'Chai',
        group: 'Hô hấp',
        route: 'Khác',
        source: 'vn',
        costPrice: 18,
        expiryDate: 1698796800000,
        retailPrice: 30,
    },
    {
        brandName: 'An Thanh',
        substance: 'Thảo dược',
        unit: 'Viên',
        group: 'Hô hấp',
        route: 'Ngậm',
        source: 'vn',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 2,
    },
    {
        brandName: 'Vitamin C plus',
        substance: 'vitamin C 100mg',
        unit: 'Ống',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'vn',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 6,
    },
    {
        brandName: 'Erolin 120ml',
        substance: 'Loratadin 1mg/ml',
        unit: 'Lọ',
        group: 'Dị ứng',
        route: 'Uống',
        source: 'hungary',
        costPrice: 18,
        expiryDate: 1634947200000,
        retailPrice: 60,
    },
    {
        brandName: 'Natri clorid 0,9% 10ml',
        substance: 'NaCl ',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Nhỏ Giọt',
        source: 'vn',
        costPrice: 3,
        expiryDate: 1666137600000,
        retailPrice: 5,
    },
    {
        brandName: 'STIPROL 9g',
        substance: 'Glycerol',
        unit: 'Tuýp',
        group: 'Tiêu Hóa',
        route: 'Thụt Hậu Môn',
        source: 'vn',
        costPrice: 5,
        expiryDate: 1687132800000,
        retailPrice: 10,
    },
    {
        brandName: 'STIPROL 4g',
        substance: 'Glycerol',
        unit: 'Tuýp',
        group: 'Tiêu Hóa',
        route: 'Thụt Hậu Môn',
        source: 'vn',
        costPrice: 4,
        expiryDate: 1653868800000,
        retailPrice: 10,
    },
    {
        brandName: 'Baby Balsam',
        substance: 'Nha đam, dầu Dừa, nước hoa Oải Hương',
        unit: 'Lọ',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'Australia',
        costPrice: 135,
        expiryDate: 1635724800000,
        retailPrice: 200,
    },
    {
        brandName: 'Studex _ Hoa tai bấm tự động',
        substance: '',
        unit: '',
        group: 'Khác',
        route: 'Khác',
        source: 'Mexico',
        costPrice: 130,
        expiryDate: 1634342400000,
        retailPrice: 230,
    },
    {
        brandName: 'Microlife _ Bấm trán',
        substance: 'Nhiệt kế điện tử',
        unit: 'Chiếc',
        group: 'Khác',
        route: 'Khác',
        source: 'thuỵ điển',
        costPrice: 0,
        expiryDate: -27080352000000,
        retailPrice: 870,
    },
    {
        brandName: 'Dr.Frei _ kẹp nách',
        substance: 'Nhiệt kế điện tử',
        unit: 'Chiếc',
        group: 'Khác',
        route: 'Khác',
        source: 'Đức',
        costPrice: 55,
        expiryDate: -27080352000000,
        retailPrice: 100,
    },
    {
        brandName: 'Nebusal spray Baby',
        substance: 'Nước muối biển ưu trương',
        unit: 'Lọ',
        group: 'Hô hấp',
        route: 'Xịt',
        source: 'vn',
        costPrice: 80,
        expiryDate: 1632960000000,
        retailPrice: 100,
    },
    {
        brandName: 'Cetaphil baby _ sữa tắm và gội',
        substance: ' Calendula hữu cơ',
        unit: 'Chai',
        group: 'Da Liễu',
        route: 'Khác',
        source: 'Đức',
        costPrice: 0,
        expiryDate: -27080352000000,
        retailPrice: 200,
    },
    {
        brandName: 'bình rửa mũi NASAL COLL',
        substance: 'Nước muối biển ưu trương',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Khác',
        source: 'vn',
        costPrice: 50,
        expiryDate: 1739923200000,
        retailPrice: 100,
    },
    {
        brandName: 'Jack N\'Jill',
        substance: 'kem đánh răng',
        unit: 'Tuýp',
        group: 'Khác',
        route: 'Khác',
        source: 'USA',
        costPrice: 80,
        expiryDate: 1688860800000,
        retailPrice: 150,
    },
    {
        brandName: 'Intima _ Ziaja (Lan Chuông)',
        substance: 'Dung dịch VSPN',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Khác',
        source: 'Ba lan',
        costPrice: 70,
        expiryDate: 1651276800000,
        retailPrice: 150,
    },
    {
        brandName: 'Intima _ Ziaja (Viêm nhẹ)',
        substance: 'Dung dịch VSPN _ hồng',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Khác',
        source: 'Ba lan',
        costPrice: 85,
        expiryDate: 1638921600000,
        retailPrice: 150,
    },
    {
        brandName: 'Intima _ Ziaja (Viêm nặng)',
        substance: 'Dung dịch VSPN _ Xanh nhạt',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Khác',
        source: 'Ba lan',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 150,
    },
    {
        brandName: 'Intima _ Ziaja (Dưỡng ẩm)',
        substance: 'Dung dịch VSPN _ Xanh đậm',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Khác',
        source: 'Ba lan',
        costPrice: 85,
        expiryDate: 1638921600000,
        retailPrice: 150,
    },
    {
        brandName: 'Intima _ Ziaja (chống viêm)',
        substance: 'Dung dịch VSPN _ Da cam',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Khác',
        source: 'Ba lan',
        costPrice: 70,
        expiryDate: 1651276800000,
        retailPrice: 150,
    },
    {
        brandName: 'Intima _ Ziaja (Cúc la mã)',
        substance: 'Dung dịch VSPN',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Khác',
        source: 'Ba lan',
        costPrice: 70,
        expiryDate: 1651276800000,
        retailPrice: 150,
    },
    {
        brandName: 'Nhũ tương dưỡng ẩm _ Ziaja',
        substance: 'Urea 1%',
        unit: 'Chai',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'Ba lan',
        costPrice: 200,
        expiryDate: 1638921600000,
        retailPrice: 350,
    },
    {
        brandName: 'Kem dưỡng ẩm _ Mocznik 3% _ Ziaja',
        substance: 'Urea 3%',
        unit: 'Tuýp',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'Ba lan',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 280,
    },
    {
        brandName: 'Kem dưỡng ẩm _ Mocznik 15% _ Ziaja',
        substance: 'Urea 15%',
        unit: 'Tuýp',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'Ba lan',
        costPrice: 135,
        expiryDate: 1638921600000,
        retailPrice: 230,
    },
    {
        brandName: 'Kem dưỡng ẩm _ AZS 5% _ Ziaja',
        substance: 'Urea 5%',
        unit: 'Tuýp',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'Ba lan',
        costPrice: 130,
        expiryDate: 1638921600000,
        retailPrice: 270,
    },
    {
        brandName: 'Kem phục hồi da _ Bioderma',
        substance: '',
        unit: 'Tuýp',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'Pháp',
        costPrice: 180,
        expiryDate: 1680134400000,
        retailPrice: 300,
    },
    {
        brandName: 'xịt muỗi _ Vape Skin',
        substance: '',
        unit: 'Chai',
        group: 'Da Liễu',
        route: 'Xịt',
        source: 'Nhật Bản',
        costPrice: 125,
        expiryDate: -27080352000000,
        retailPrice: 160,
    },
    {
        brandName: 'Kem dưỡng ẩm _ Vaseline',
        substance: '',
        unit: 'Lọ',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'USA',
        costPrice: 0,
        expiryDate: -27080352000000,
        retailPrice: 80,
    },
    {
        brandName: 'Kem bôi hăm _ Sudocrem',
        substance: 'ZinC oxide, Benzyl alcohol, Banzyl benzoate, Benzyl cinamate',
        unit: 'Lọ',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'Ailen',
        costPrice: 70,
        expiryDate: 1680825600000,
        retailPrice: 100,
    },
    {
        brandName: 'Meiact _ Fine Granules',
        substance: 'Cefditoren 50mg',
        unit: 'Gói',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Nhật Bản',
        costPrice: 20.095,
        expiryDate: 1685491200000,
        retailPrice: 27,
    },
    {
        brandName: 'Test Cúm A & B',
        substance: '',
        unit: 'Cái',
        group: 'Khác',
        route: 'Khác',
        source: 'Hàn Quốc',
        costPrice: 75,
        expiryDate: 1643587200000,
        retailPrice: 120,
    },
    {
        brandName: 'Laforin ỔI',
        substance: 'nước súc miệng',
        unit: 'Chai',
        group: 'Khác',
        route: 'Khác',
        source: 'vn',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 115,
    },
    {
        brandName: 'ZENSALBU 2,5mg/2,5ml',
        substance: 'Salbutamol ',
        unit: 'Ống',
        group: 'Hô hấp',
        route: 'Xịt',
        source: 'vn',
        costPrice: 4.41,
        expiryDate: 1636761600000,
        retailPrice: 8,
    },
    {
        brandName: 'ZENSONID 0,5mg/2ml',
        substance: 'Budesonid',
        unit: 'Ống',
        group: 'Hô hấp',
        route: 'Xịt',
        source: 'vn',
        costPrice: 12.6,
        expiryDate: 1636761600000,
        retailPrice: 16,
    },
    {
        brandName: 'Combartrin _ tẩy giun',
        substance: 'pyrantel',
        unit: 'Vỉ',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Australia',
        costPrice: 66,
        expiryDate: 1651276800000,
        retailPrice: 90,
    },
    {
        brandName: 'TheKatadexan',
        substance: 'Neomycin + Dexamethason',
        unit: 'Ống',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Nhỏ Giọt',
        source: 'vn',
        costPrice: 15,
        expiryDate: 1672963200000,
        retailPrice: 30,
    },
    {
        brandName: 'Zitromax 200mg/5ml',
        substance: 'azithromicin',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'ý',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 140,
    },
    {
        brandName: 'Smecta',
        substance: 'Diosmectite',
        unit: 'Gói',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Pháp',
        costPrice: 3.4,
        expiryDate: 1664582400000,
        retailPrice: 5,
    },
    {
        brandName: 'Medilices ',
        substance: 'Ceftirizine BP 10mg',
        unit: 'Viên',
        group: 'Dị ứng',
        route: 'Uống',
        source: 'Ấn Độ',
        costPrice: 0.2,
        expiryDate: 1649030400000,
        retailPrice: 0.5,
    },
    {
        brandName: 'Paracetamol Kabi 1000mg',
        substance: 'Paracetamol',
        unit: 'Lọ',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Tiêm',
        source: 'VN',
        costPrice: 30,
        expiryDate: 1647129600000,
        retailPrice: 50,
    },
    {
        brandName: 'Clabact 500',
        substance: 'Clarythromycin 500mg',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'VN',
        costPrice: 4.8,
        expiryDate: 1658966400000,
        retailPrice: 8,
    },
    {
        brandName: 'Doliprame 2,4% 100ml',
        substance: 'paracetamol 2,4g',
        unit: 'Lọ',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: 'Pháp',
        costPrice: 95,
        expiryDate: 1682812800000,
        retailPrice: 160,
    },
    {
        brandName: 'D - Fluoretten 50 I.E.',
        substance: 'Vitamin D3 + Florua',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Đức',
        costPrice: 130,
        expiryDate: 1719619200000,
        retailPrice: 200,
    },
    {
        brandName: 'Mini Drops DHA 50ml',
        substance: 'DHA',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'UK',
        costPrice: 205,
        expiryDate: 1635724800000,
        retailPrice: 300,
    },
    {
        brandName: 'BioCare Nutrisorb ZinC 30ml',
        substance: 'Kẽm',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'UK',
        costPrice: 225,
        expiryDate: 1643587200000,
        retailPrice: 320,
    },
    {
        brandName: 'Ginkgo 6000 THOMPSON\'S',
        substance: 'ginko 6000',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 280,
        expiryDate: 1638921600000,
        retailPrice: 400,
    },
    {
        brandName: 'chíp chíp',
        substance: 'vintamin D',
        unit: 'Túi',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'VN',
        costPrice: 5,
        expiryDate: -27080352000000,
        retailPrice: 10,
    },
    {
        brandName: 'Doromax 200',
        substance: 'azithromycin 200mg',
        unit: 'Gói',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'VN',
        costPrice: 4,
        expiryDate: 1682553600000,
        retailPrice: 10,
    },
    {
        brandName: 'Lấy ráy tai - phát sáng',
        substance: '',
        unit: '',
        group: 'Khác',
        route: 'Khác',
        source: 'VN',
        costPrice: 6,
        expiryDate: 1623196800000,
        retailPrice: 15,
    },
    {
        brandName: 'Mask khí dung',
        substance: '',
        unit: 'Chiếc',
        group: 'Khác',
        route: 'Khác',
        source: 'VN',
        costPrice: 15,
        expiryDate: 1636761600000,
        retailPrice: 20,
    },
    {
        brandName: 'Máy khí dung _ Respizer',
        substance: '',
        unit: 'Chiếc',
        group: 'Khác',
        route: 'Khác',
        source: 'Đài Loan',
        costPrice: 0.1,
        expiryDate: -27080352000000,
        retailPrice: 550,
    },
    {
        brandName: 'efferalgan 500 _ Sủi',
        substance: 'paracetamol 500mg',
        unit: 'Viên',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Khác',
        source: 'Pháp',
        costPrice: 2.813,
        expiryDate: 1670803200000,
        retailPrice: 5,
    },
    {
        brandName: 'BioGaia _ Pháp',
        substance: 'lactobacillus ',
        unit: 'Tuýp',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Pháp',
        costPrice: 230,
        expiryDate: 1635724800000,
        retailPrice: 320,
    },
    {
        brandName: 'Laxdokid- ăn ngon',
        substance: 'Vitamin',
        unit: 'Hộp',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Vn',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 120,
    },
    {
        brandName: 'Biogaia - nga',
        substance: 'Lactobacillus reuteri',
        unit: 'Ống',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Nga',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 360,
    },
    {
        brandName: 'Lucas',
        substance: 'Chiết xuất đu đủ',
        unit: 'Tuýp',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'Australia',
        costPrice: 68,
        expiryDate: 1703980800000,
        retailPrice: 150,
    },
    {
        brandName: 'Xịt tan ráy clean ears',
        substance: 'Tan ráy tai',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Xịt',
        source: 'Australia',
        costPrice: 195,
        expiryDate: 1702339200000,
        retailPrice: 270,
    },
    {
        brandName: 'Trị nứt đầu ti',
        substance: 'Mỡ cừu',
        unit: 'Tuýp',
        group: 'Khác',
        route: '',
        source: 'Newzelan',
        costPrice: 80,
        expiryDate: 1690761600000,
        retailPrice: 130,
    },
    {
        brandName: 'Calcium milk kid HTC',
        substance: 'Calci ngto 65mg+D3 100UI',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 150,
        expiryDate: 1693440000000,
        retailPrice: 230,
    },
    {
        brandName: 'Vita gummies- nature\'s way',
        substance: 'Calcium phosphat 100mg+D3 200UI',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 165,
        expiryDate: 1638921600000,
        retailPrice: 240,
    },
    {
        brandName: 'Verni flour',
        substance: 'Flour',
        unit: 'Chiếc',
        group: 'Khác',
        route: 'Bôi',
        source: 'Anh',
        costPrice: 50,
        expiryDate: -27080352000000,
        retailPrice: 80,
    },
    {
        brandName: 'Sữa tắm thảo dược ',
        substance: 'Thảo dược',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Khác',
        source: 'VN',
        costPrice: 95,
        expiryDate: 1665705600000,
        retailPrice: 140,
    },
    {
        brandName: 'Sữa tắm thảo dược gói',
        substance: 'Thảo dược',
        unit: 'Gói',
        group: 'Khác',
        route: 'Khác',
        source: 'VN',
        costPrice: 4.75,
        expiryDate: 1648512000000,
        retailPrice: 8,
    },
    {
        brandName: 'Osteocare Calci',
        substance: 'Calci, magie, Zn',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Anh',
        costPrice: 165,
        expiryDate: 1635724800000,
        retailPrice: 290,
    },
    {
        brandName: 'Oralcortia',
        substance: 'Triamcinolone',
        unit: 'Tuýp',
        group: 'Khác',
        route: 'Bôi',
        source: '',
        costPrice: 30,
        expiryDate: 1695772800000,
        retailPrice: 60,
    },
    {
        brandName: 'Elevit bầu',
        substance: 'Vitamin',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: '',
        costPrice: 1040,
        expiryDate: 1707350400000,
        retailPrice: 1200,
    },
    {
        brandName: 'Bioisland DHA bầu',
        substance: 'Dha',
        unit: 'Viên',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: '',
        costPrice: 340,
        expiryDate: 1682208000000,
        retailPrice: 450,
    },
    {
        brandName: 'Motilium',
        substance: 'Domperidom',
        unit: 'Lọ',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Thái lan',
        costPrice: 26,
        expiryDate: 1685664000000,
        retailPrice: 50,
    },
    {
        brandName: 'Rinofil',
        substance: 'Desloratandin',
        unit: 'Lọ',
        group: 'Dị ứng',
        route: 'Uống',
        source: 'Chile',
        costPrice: 25,
        expiryDate: 1639526400000,
        retailPrice: 50,
    },
    {
        brandName: 'Heathy plex ',
        substance: 'D3400ui ,k2 10ucg',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Italia',
        costPrice: 175,
        expiryDate: 1719619200000,
        retailPrice: 280,
    },
    {
        brandName: 'Claminat',
        substance: 'Amoxicilin 500mg,clavulanic 62,5mg',
        unit: 'Gói',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Việt nam',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 12,
    },
    {
        brandName: 'Sữa tắm buchen',
        substance: 'Thảo dược',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Khác',
        source: 'Đức',
        costPrice: 70,
        expiryDate: 1651017600000,
        retailPrice: 140,
    },
    {
        brandName: 'Lăn khử mùi etiaxil',
        substance: 'K',
        unit: 'Lọ',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'Pháp',
        costPrice: 170,
        expiryDate: 1685836800000,
        retailPrice: 220,
    },
    {
        brandName: 'Menevit',
        substance: 'Vitamin',
        unit: 'Hộp',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Bayer',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 1150,
    },
    {
        brandName: 'Bostocef',
        substance: 'Cefdinir 25mg/ml',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Vn liên doanh mỹ',
        costPrice: 90,
        expiryDate: 1670803200000,
        retailPrice: 150,
    },
    {
        brandName: 'Kefodime',
        substance: 'Cefotaxime',
        unit: '',
        group: 'Kháng sinh - Kháng Virus',
        route: '',
        source: '',
        costPrice: 45,
        expiryDate: 1656633600000,
        retailPrice: 90,
    },
    {
        brandName: 'Noviceftrin 2g',
        substance: 'Ceftriaxone 2g',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Tiêm',
        source: 'Thụy điển',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 85,
    },
    {
        brandName: 'Vitsball',
        substance: '',
        unit: 'Ống',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Vn',
        costPrice: 3,
        expiryDate: 1702339200000,
        retailPrice: 5,
    },
    {
        brandName: 'Novozinc',
        substance: 'Kẽm gluconat ( <=> 20g/ml)',
        unit: 'Viên',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Việt nam',
        costPrice: 85,
        expiryDate: 1632873600000,
        retailPrice: 150,
    },
    {
        brandName: 'Elevit bú',
        substance: 'Vitamin',
        unit: 'Viên',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Bayer',
        costPrice: 450,
        expiryDate: 1688083200000,
        retailPrice: 550,
    },
    {
        brandName: 'Prospan gói',
        substance: 'Cao khô lá thường xuân',
        unit: 'Gói',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'Đức',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 230,
    },
    {
        brandName: 'Black more zinc',
        substance: 'Zinc 25mg,',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 220,
        expiryDate: 1688860800000,
        retailPrice: 360,
    },
    {
        brandName: 'Pregnacare bú ',
        substance: 'Vitamin cho phụ nữ sau sinh',
        unit: 'Hộp',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Anh',
        costPrice: 300,
        expiryDate: 1634342400000,
        retailPrice: 450,
    },
    {
        brandName: 'Black more tinh dầu hoa anh thảo',
        substance: 'Tinh dầu hoa anh thảo',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 440,
        expiryDate: 1638921600000,
        retailPrice: 580,
    },
    {
        brandName: 'Bio marine collagen',
        substance: 'Collagen 2000',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 350,
        expiryDate: 1717113600000,
        retailPrice: 550,
    },
    {
        brandName: 'Fenano',
        substance: 'Sắt 4omg',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Vn',
        costPrice: 110,
        expiryDate: 1713571200000,
        retailPrice: 210,
    },
    {
        brandName: 'Sancoba',
        substance: 'Vitaminb',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Nhỏ Giọt',
        source: 'Nhật',
        costPrice: 51.5,
        expiryDate: 1638921600000,
        retailPrice: 90,
    },
    {
        brandName: 'Sữa tắm Penaten',
        substance: 'Sữa tắm cảm cúm',
        unit: 'Lọ',
        group: 'Da Liễu',
        route: 'Khác',
        source: 'Gree',
        costPrice: 0,
        expiryDate: -27080352000000,
        retailPrice: 210,
    },
    {
        brandName: 'Arginin',
        substance: 'Aspartat, orginin',
        unit: 'Hộp',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Vn',
        costPrice: 30,
        expiryDate: 1719619200000,
        retailPrice: 60,
    },
    {
        brandName: 'Vitamin e',
        substance: 'Vitamin e 500ui',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Úc',
        costPrice: 300,
        expiryDate: 1634342400000,
        retailPrice: 430,
    },
    {
        brandName: 'E đỏ nga',
        substance: 'Vitamin e 400mg',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Nga',
        costPrice: 160,
        expiryDate: 1687996800000,
        retailPrice: 230,
    },
    {
        brandName: 'hút mũi',
        substance: 'dụng cụ',
        unit: 'Chiếc',
        group: 'Khác',
        route: 'Khác',
        source: 'VN',
        costPrice: 18,
        expiryDate: 1632700800000,
        retailPrice: 25,
    },
    {
        brandName: 'terpin codein',
        substance: 'terpin hydrat+ codein',
        unit: 'Vỉ',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'VN',
        costPrice: 8.5,
        expiryDate: 1670803200000,
        retailPrice: 20,
    },
    {
        brandName: 'agiclovir 400mg',
        substance: 'Acyclovir 400mg',
        unit: 'Vỉ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: '',
        costPrice: 20,
        expiryDate: 1670803200000,
        retailPrice: 60,
    },
    {
        brandName: 'effe codein',
        substance: 'Paracetamol+ codein',
        unit: 'Viên',
        group: 'Giảm Đau - Hạ Sốt - NSAID',
        route: 'Uống',
        source: '',
        costPrice: 4.25,
        expiryDate: 1670803200000,
        retailPrice: 10,
    },
    {
        brandName: 'novita ',
        substance: 'multivitamin',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'VN',
        costPrice: 90,
        expiryDate: -27080352000000,
        retailPrice: 120,
    },
    {
        brandName: 'Ostelin kids Calcium vit D3 LIQUID',
        substance: 'CALCI 100MG, D3',
        unit: 'Chai',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 255,
        expiryDate: 1635724800000,
        retailPrice: 350,
    },
    {
        brandName: 'HIDRASEC 30MG',
        substance: 'Racecadotril 30mg',
        unit: 'Gói',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Pháp',
        costPrice: 5.4,
        expiryDate: 1639267200000,
        retailPrice: 7,
    },
    {
        brandName: 'INFOSGO',
        substance: 'CHẤT XƠ',
        unit: 'Gói',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'VN',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 0,
    },
    {
        brandName: 'FLUCISTAD',
        substance: 'ACID FUCIDIC',
        unit: 'Tuýp',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Bôi',
        source: 'VN',
        costPrice: 27,
        expiryDate: 1702339200000,
        retailPrice: 40,
    },
    {
        brandName: 'GEL BẠC',
        substance: 'Nano bạc',
        unit: 'Tuýp',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'VN',
        costPrice: 30,
        expiryDate: 1702339200000,
        retailPrice: 60,
    },
    {
        brandName: 'KEM NẺ DEXERY',
        substance: 'DƯỠNG ẨM',
        unit: 'Tuýp',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'Pháp',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 160,
    },
    {
        brandName: 'Vita gummies- nature\'s way vit C , Kẽm',
        substance: 'vit C +kẽm',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Australia',
        costPrice: 165,
        expiryDate: 1638921600000,
        retailPrice: 240,
    },
    {
        brandName: 'akudinir 300mg',
        substance: 'cefdinir 300mg',
        unit: 'Vỉ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Ấn Độ',
        costPrice: 48,
        expiryDate: 1702339200000,
        retailPrice: 100,
    },
    {
        brandName: 'Fleming 1g ',
        substance: 'Amoxicillin + clavulanic',
        unit: 'Hộp',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Ấn độ',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 130,
    },
    {
        brandName: 'PROGERMILA ',
        substance: 'Bacillus clausi',
        unit: 'Ống',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'Vn',
        costPrice: 5.75,
        expiryDate: 1639526400000,
        retailPrice: 7,
    },
    {
        brandName: 'Bông ngoáy tai sơ sinh',
        substance: 'Bông',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Khác',
        source: 'Vn',
        costPrice: 30,
        expiryDate: 1635724800000,
        retailPrice: 35,
    },
    {
        brandName: 'Bông ngoáy tai ',
        substance: 'Bông',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Khác',
        source: 'Vn',
        costPrice: 20,
        expiryDate: 1635292800000,
        retailPrice: 30,
    },
    {
        brandName: 'Gadopax',
        substance: 'Betaglucan',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Slovenia',
        costPrice: 165,
        expiryDate: 1638921600000,
        retailPrice: 280,
    },
    {
        brandName: 'Vitamin d3k2 đức',
        substance: 'D3 200ui k2 10ug',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'Đức',
        costPrice: 260,
        expiryDate: 1635724800000,
        retailPrice: 340,
    },
    {
        brandName: 'Muối uống coldcalm ',
        substance: 'Vi lượng đồng căn',
        unit: 'Ống',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'Mỹ',
        costPrice: 7.833,
        expiryDate: 1635724800000,
        retailPrice: 320,
    },
    {
        brandName: 'Nhỏ mũi fysoline vàng kháng viêm',
        substance: 'Thảo dược',
        unit: 'Ống',
        group: 'Khác',
        route: 'Nhỏ Giọt',
        source: 'Pháp',
        costPrice: 5,
        expiryDate: 1635724800000,
        retailPrice: 160,
    },
    {
        brandName: 'Moxieye',
        substance: 'Moxifloxacin',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Nhỏ Giọt',
        source: 'Cpc1',
        costPrice: 0,
        expiryDate: 1635724800000,
        retailPrice: 90,
    },
    {
        brandName: 'Fosmitic',
        substance: 'Fomycin',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Nhỏ Giọt',
        source: 'Cpc1',
        costPrice: 45,
        expiryDate: 1635724800000,
        retailPrice: 70,
    },
    {
        brandName: 'Sachi eye',
        substance: 'VitaminA,taurin,lutein,dầu đậu núi',
        unit: 'Hộp',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'Vn',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 160,
    },
    {
        brandName: 'Xịt sâu răng midkid',
        substance: '',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Uống',
        source: 'Vn',
        costPrice: 135,
        expiryDate: 1636761600000,
        retailPrice: 190,
    },
    {
        brandName: 'Cefaclor 125mg/5ml',
        substance: 'Cefaclor',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Malaysia',
        costPrice: 80,
        expiryDate: 1636761600000,
        retailPrice: 120,
    },
    {
        brandName: 'Dutixim 200mg',
        substance: 'Cefpodoxime 200mg',
        unit: 'Vỉ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Vn',
        costPrice: 50,
        expiryDate: 1636761600000,
        retailPrice: 100,
    },
    {
        brandName: 'Basultam 2g',
        substance: 'Cefoperazol 1g +sulbactam 1g',
        unit: 'Ống',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Tiêm',
        source: '',
        costPrice: 35,
        expiryDate: 1636761600000,
        retailPrice: 75,
    },
    {
        brandName: 'Bacsulfo 1g ',
        substance: 'Cefoperazol 1g',
        unit: 'Ống',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Tiêm',
        source: '',
        costPrice: 25,
        expiryDate: 1636761600000,
        retailPrice: 50,
    },
    {
        brandName: 'Son dưỡng môi nhật ( micky)',
        substance: '',
        unit: 'Viên',
        group: '',
        route: 'Uống',
        source: '',
        costPrice: 65,
        expiryDate: 1638921600000,
        retailPrice: 0,
    },
    {
        brandName: 'Son bioderma',
        substance: '',
        unit: 'Tuýp',
        group: 'Khác',
        route: 'Bôi',
        source: 'Pháp',
        costPrice: 36,
        expiryDate: 1638921600000,
        retailPrice: 70,
    },
    {
        brandName: 'Klamentin 875/125',
        substance: 'Amoxicilin 875+ acid klavulanic 125',
        unit: 'Vỉ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Vn',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 70,
    },
    {
        brandName: 'Diacerein 50mg',
        substance: 'Diacerein 50mg',
        unit: 'Viên',
        group: 'Cơ Xương Khớp',
        route: 'Uống',
        source: 'Vn',
        costPrice: 3.2,
        expiryDate: 1638921600000,
        retailPrice: 5,
    },
    {
        brandName: 'Gabcure',
        substance: 'Gabapentin 300mg ',
        unit: 'Viên',
        group: 'Thần Kinh',
        route: 'Uống',
        source: '',
        costPrice: 4,
        expiryDate: 1638921600000,
        retailPrice: 7,
    },
    {
        brandName: 'Soslac',
        substance: 'Dipolac',
        unit: 'Tuýp',
        group: 'Da Liễu',
        route: 'Bôi',
        source: 'Vn',
        costPrice: 17,
        expiryDate: 1638921600000,
        retailPrice: 30,
    },
    {
        brandName: 'Neomezol ',
        substance: 'Neomycin+ betamethasone',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Nhỏ Giọt',
        source: 'Vn',
        costPrice: 16,
        expiryDate: 1638921600000,
        retailPrice: 30,
    },
    {
        brandName: 'Sát khuẩn tay',
        substance: 'Cồn',
        unit: 'Lọ',
        group: 'Khác',
        route: 'Khác',
        source: 'Vn',
        costPrice: 65,
        expiryDate: 1639526400000,
        retailPrice: 90,
    },
    {
        brandName: 'Khẩu trang người lớn darin',
        substance: 'Kt',
        unit: 'Hộp',
        group: 'Khác',
        route: 'Khác',
        source: 'Vn',
        costPrice: 28,
        expiryDate: 1639526400000,
        retailPrice: 40,
    },
    {
        brandName: 'Khẩu trang trẻ em darin',
        substance: 'Kt',
        unit: 'Hộp',
        group: 'Khác',
        route: 'Khác',
        source: 'Vn',
        costPrice: 27,
        expiryDate: 1639526400000,
        retailPrice: 40,
    },
    {
        brandName: 'Khẩu trang người lớn ami',
        substance: 'Kt',
        unit: 'Hộp',
        group: 'Khác',
        route: 'Khác',
        source: 'Vn',
        costPrice: 30,
        expiryDate: 1639526400000,
        retailPrice: 45,
    },
    {
        brandName: 'Ocean d3 k2',
        substance: 'D3 400Ui, k2 25ug',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Xịt',
        source: 'Turkey',
        costPrice: 185,
        expiryDate: 1639526400000,
        retailPrice: 295,
    },
    {
        brandName: 'Son trẻ em',
        substance: 'dưỡng ẩm môi',
        unit: 'Tuýp',
        group: 'Khác',
        route: 'Bôi',
        source: 'Nhật Bản',
        costPrice: 65,
        expiryDate: 1639526400000,
        retailPrice: 100,
    },
    {
        brandName: 'imubron',
        substance: '13 loại vi khuẩn',
        unit: 'Vỉ',
        group: 'Khác',
        route: 'Uống',
        source: 'Đức',
        costPrice: 110,
        expiryDate: 1640649600000,
        retailPrice: 150,
    },
    {
        brandName: 'smart air 4mg',
        substance: 'Montelukast 4mg',
        unit: 'Hộp',
        group: 'Khác',
        route: 'Uống',
        source: 'mỹ',
        costPrice: 50,
        expiryDate: 1640649600000,
        retailPrice: 70,
    },
    {
        brandName: 'niflad es',
        substance: 'amoxicillin 600mg + 42.5 clavilanic',
        unit: 'Viên',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'việt nam',
        costPrice: 7.3,
        expiryDate: 1726272000000,
        retailPrice: 10,
    },
    {
        brandName: 'bilclmos 312mg/5ml',
        substance: 'amoxicilin 250mg+ clavulanic 62.5mg',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Ấn Độ',
        costPrice: 120,
        expiryDate: -27080352000000,
        retailPrice: 180,
    },
    {
        brandName: 'Tedavi 457mg/5ml',
        substance: 'amoxicilin 400mg+ clavulanic 57mg',
        unit: 'Lọ',
        group: 'Kháng sinh - Kháng Virus',
        route: 'Uống',
        source: 'Ấn Độ',
        costPrice: 120,
        expiryDate: 1756512000000,
        retailPrice: 190,
    },
    {
        brandName: 'natrulax',
        substance: 'sorbitol+ FOS+thảo dược',
        unit: 'Ống',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'việt nam',
        costPrice: 3.9,
        expiryDate: 1742860800000,
        retailPrice: 7,
    },
    {
        brandName: 'BUONA Nebial 3%',
        substance: 'muối 3%',
        unit: 'Ống',
        group: 'Khác',
        route: 'Nhỏ Giọt',
        source: 'italya',
        costPrice: 9,
        expiryDate: -27080352000000,
        retailPrice: 12,
    },
    {
        brandName: 'BUONA circadiem( ngủ ngon)',
        substance: 'melatoin 1mg/4 giọt',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'italya',
        costPrice: 187,
        expiryDate: -27080352000000,
        retailPrice: 260,
    },
    {
        brandName: 'pemolip (cefditoren 50mg)',
        substance: 'cefditoren 50mg',
        unit: 'Gói',
        group: 'Kháng sinh - Kháng Virus',
        route: '',
        source: 'việt nam',
        costPrice: 9,
        expiryDate: 1712707200000,
        retailPrice: 15,
    },
    {
        brandName: 'PEGinpol',
        substance: 'macrogol 3350',
        unit: 'Gói',
        group: 'Tiêu Hóa',
        route: 'Uống',
        source: 'italya',
        costPrice: 11,
        expiryDate: 1745971200000,
        retailPrice: 13,
    },
    {
        brandName: 'BUONA ferroduo ( sắt)',
        substance: 'sắt 1mg/1 giọt',
        unit: 'Lọ',
        group: '',
        route: 'Uống',
        source: 'italya',
        costPrice: 181,
        expiryDate: 1748563200000,
        retailPrice: 215,
    },
    {
        brandName: 'imochild d3k2dha',
        substance: '400UI d3 + k222.5ug+ dha 5ug',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'pháp',
        costPrice: 200,
        expiryDate: 1759190400000,
        retailPrice: 300,
    },
    {
        brandName: 'ostelin d3 liquid',
        substance: '200ui d3/ 0,5ml',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'úc',
        costPrice: 95,
        expiryDate: 1714435200000,
        retailPrice: 150,
    },
    {
        brandName: 'gummies vita calci+d',
        substance: '100mg calci+ 200 UI d3 / viên',
        unit: 'Lọ',
        group: 'Thực Phẩm Chức Năng',
        route: 'Uống',
        source: 'úc',
        costPrice: 175,
        expiryDate: 1688083200000,
        retailPrice: 240,
    },
    {
        brandName: 'calci lunik',
        substance: '(calici 547.4mg+ magnes 50mg+ d3 3.75mcg+k2 20mcg)/10ml',
        unit: 'Lọ',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'italya',
        costPrice: 0,
        expiryDate: null,
        retailPrice: 395,
    },
    {
        brandName: 'Montenuzyd 10mg',
        substance: 'montelukast 10mg',
        unit: 'Vỉ',
        group: 'Hô hấp',
        route: 'Uống',
        source: 'Ấn Độ',
        costPrice: 0,
        expiryDate: -27080352000000,
        retailPrice: 100,
    },
    {
        brandName: 'AT ZinC',
        substance: 'kẽm gluconate 20mg/10ml',
        unit: 'Ống',
        group: 'Dinh Dưỡng',
        route: 'Uống',
        source: 'việt nam',
        costPrice: 0,
        expiryDate: -27080352000000,
        retailPrice: 10,
    },
];


/***/ }),
/* 87 */
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
exports.ProcedureSeed = void 0;
const common_1 = __webpack_require__(1);
const entities_1 = __webpack_require__(8);
const typeorm_1 = __webpack_require__(11);
const random_helper_1 = __webpack_require__(77);
const procedure_example_1 = __webpack_require__(88);
let ProcedureSeed = class ProcedureSeed {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async start(oid) {
        const countProcedure = await this.dataSource.getRepository(entities_1.Procedure).count();
        if (countProcedure)
            return;
        const proceduresDto = [];
        for (let i = 0; i < procedure_example_1.procedureExampleData.length; i++) {
            const procedure = new entities_1.Procedure();
            const procedureName = procedure_example_1.procedureExampleData[i];
            procedure.oid = oid;
            procedure.name = procedureName;
            procedure.price = (0, random_helper_1.randomNumber)(500000, 20000000, 100);
            procedure.isActive = true;
            proceduresDto.push(procedure);
        }
        await this.dataSource.getRepository(entities_1.Procedure).insert(proceduresDto);
    }
};
ProcedureSeed = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object])
], ProcedureSeed);
exports.ProcedureSeed = ProcedureSeed;


/***/ }),
/* 88 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.procedureExampleData = void 0;
exports.procedureExampleData = [
    'Cắt lọc - khâu vết thương da đầu mang tóc',
    'che phủ vết thương khuyết da đầu mang tóc bằng vạt tại chỗ',
    'che phủ vết thương khuyết da đầu mang tóc bằng vạt lân cận',
    'che phủ vết thương khuyết da đầu mang tóc bằng vạt tự do',
    'điều trị lột da đầu bán phần',
    'điều trị da đầu đứt rời không sử dụng kỹ thuật vi phẫu',
    'cắt bỏ u da lành tính vùng da đầu từ 2cm trở lên',
    'cắt bỏ ung thư da vùng da đầu dưới 2cm',
    'cắt bỏ ung thư da vùng da đầu từ 2cm trở lên',
    'Tạo hình khuyết da đầu bằng ghép da mỏng',
    'Tạo hình khuyết da đầu bằng ghép da dày',
    'tạo vạt da lân cận che phủ các khuyết da đầu',
    'tạo vạt da tự do che phủ các khuyết da đầu',
    'tạo hình che phủ khuyết phức hợp vùng đầu bằng vạt da cân xương có cuống nuôi',
    'tạo hình che phủ khuyết phức hợp vùng đầu bằng vạt da cân xương tự do',
    'đặt túi giãn da vùng da đầu',
    'bơm túi giãn da vùng da đầu',
    'tạo vạt giãn da vùng da đầu',
    'giãn da cấp tính vùng da đầu',
    'ghép mỡ trung bì vùng trán',
    'độn khuyết xương sọ bằng sụn tự thân',
    'độn khuyết xương sọ bằng xương tự thân',
    'độn khuyết xương sọ bằng chất liệu nhân tạo',
    'ghép mỡ tự thân coleman vùng trán',
    'tái tạo trán lõm bằng xi măng xương',
    'lấy mảnh xương sọ hoại tử',
    'ghép bộ phận mũi đứt rời không sử dụng vi phẫu',
    'tạo hình môi toàn bộ bằng vạt tại chỗ',
    'tạo hình môi toàn bộ bằng vạt tự do',
    'tạo hình môi từng phần bằng vạt tại chỗ',
    'tạo hình môi từng phần bằng vạt lân cận',
    'tạo hình môi từng phần bằng vạt từ xa',
    'tạo hình môi kết hợp các bộ phận xung quanh bằng kỹ thuật vi phẫu',
    'chỉnh sửa lệch miệng do liệt thần kinh VII',
    'phục hồi, tái tạo dây thần kinh VII (đoạn ngoài sọ)',
    'khâu vết thương thấu má và ống tuyến nước bọt',
    'khâu vết thương ống tuyến nước bọt',
    'khâu vết thương thần kinh',
    'ghép lại mảnh da mặt đứt rời không bằng vi phẫu',
    'vết thương vùng hàm mặt do hỏa khí',
    'tạo hình khe hở sọ mặt số 7',
    'tạo hình khe hở sọ mặt số 8',
    'tạo hình khe hở sọ mặt 2 bên',
    'tạo hình thiểu sản bẩm sinh nửa mặt bằng ghép mỡ coleman',
    'tạo hình thiểu sản bẩm sinh toàn bộ mặt bằng ghép mỡ coleman',
    'sửa sẹo vùng cổ, mặt bằng vạt da tại chỗ',
    'sửa sẹo vùng cổ, mặt bằng vạt da lân cận',
    'Ghép da dầy toàn bộ, diện tích dưới 10cm2',
    'Ghép da dầy toàn bộ, diện tích trên 10cm2',
    'Cắt u máu vùng đầu mặt cổ',
    'Cắt dị dạng bạch mạch đầu mặt cổ',
    'Cắt dị dạng tĩnh mạch đầu mặt cổ',
    'Tiêm xơ dị dạng tĩnh mạch đầu mặt cổ',
    'cắt ung thư da vùng cổ mặt dưới 5cm và tạo hình bằng ghép da tự thân',
    'cắt ung thư da vùng cổ mặt dưới 5cm và tạo hình bằng vạt da tại chỗ',
    'cắt ung thư da vùng cổ mặt trên 5cm và tạo hình bằng vạt da lân cận',
    'cắt ung thư da vùng cổ mặt trên 5cm và tạo hình bằng vạt da bằng kỹ thuật vi phẫu',
    'Cắt u mỡ hệ thống lan tỏa vùng hàm mặt',
    'lấy bỏ chất silicon lỏng vùng mặt cổ',
    'lấy bỏ chất liệu độn vùng mặt cổ',
    'thu nhỏ vú phì đại',
    'Cắt bỏ khối u da lành tính dưới 5cm',
    'Cắt bỏ khối u da lành tính trên 5cm',
    'ghép da tự thân các khuyết phần mềm cánh tay',
    'ghép da tự thân các khuyết phần mềm cẳng tay',
    'tạo hình các khuyết phần mềm phức tạp cánh tay bằng vạt tại chỗ',
    'tạo hình các khuyết phần mềm phức tạp cẳng tay bằng vạt tại chỗ',
    'tạo hình các khuyết phần mềm phức tạp cẳng tay bằng vạt lân cận',
    'tạo hình các khuyết phần mềm phức tạp cánh tay bằng vạt da có sử dụng vi phẫu thuật',
    'điều trị vết thương bàn tay bằng ghép da tự thân',
    'điều trị vết thương bàn tay bằng các vạt da tại chỗ',
    'điều trị vết thương bàn tay bằng các vạt da lân cận',
    'điều trị vết thương bàn tay bằng các vạt da từ xa',
    'điều trị vết thương bàn tay bằng vạt có sử dụng vi phẫu thuật',
    'điều trị vết thương ngón tay bằng ghép da tự thân',
    'điều trị vết thương ngón tay bằng các vạt da tại chỗ',
    'điều trị vết thương ngón tay bằng các vạt da lân cận',
    'điều trị vết thương ngón tay bằng các vạt da từ xa',
    'điều trị vết thương ngón tay bằng vạt có sử dụng vi phẫu thuật',
    'Nối gân gấp',
    'ghép gân gấp không sử dụng vi phẫu thuật',
    'ghép gân gấp có sử dụng vi phẫu thuật',
    'Nối gân duỗi',
    'Gỡ dính gân',
    'Khâu nối thần kinh không sử dụng vi phẫu thuật',
    'Khâu nối thần kinh sử dụng vi phẫu thuật',
    'Gỡ dính thần kinh',
    'tái tạo ngón cái bằng kỹ thuật vi phẫu',
    'cái hóa',
    'Chuyển ngón có cuống mạch nuôi',
    'tạo hình kẽ ngón cái',
    'Rút nẹp vít và các dụng cụ khác sau phẫu thuật',
    'Thay khớp bàn tay',
    'Thay khớp liên đốt các ngón tay',
    'tách dính 2 ngón tay',
    'tách dính 3 ngón tay',
    'tách dính 4 ngón tay',
    'cắt ngón tay thừa',
    'cắt bỏ ngón tay cái thừa',
    'tạo hình ngón tay cái xẻ đôi',
    'sửa sẹo co nách bằng ghép da tự thân',
    'sửa sẹo co khuỷu bằng ghép da tự thân',
    'sửa sẹo co nách bằng vạt da tại chỗ',
    'sửa sẹo co khuỷu bằng vạt tại chỗ',
    'sửa sẹo co nách bằng vạt da cơ lân cận',
    'sửa sẹo co khuỷu bằng vạt da từ xa',
    'sửa sẹo co nách bằng vạt da có sử dụng vi phẫu thuật',
    'sửa sẹo co khuỷu bằng vạt da có sử dụng vi phẫu thuật',
    'sửa sẹo co cổ bàn tay bằng tạo hình chữ Z',
    'sửa sẹo co ngón tay bằng tạo hình chữ Z',
    'sửa sẹo co cổ bàn tay bằng ghép da tự thân',
    'sửa sẹo co ngón tay bằng ghép da tự thân',
    'vi phẫu tích làm mỏng vạt tạo hình bàn ngón tay',
    'tạo vạt trì hoãn cho bàn ngón tay',
    'tạo vạt tĩnh mạch cho khuyết phần mềm bàn ngón tay',
    'ghép móng',
    'giãn da cho vùng cánh cẳng tay',
    'giãn da điều trị dính ngón bẩm sinh',
    'tạo hình các khuyết da vùng đùi bằng ghép da tự thân',
    'tạo hình các khuyết da vùng khoeo bằng ghép da tự thân',
    'tạo hình các khuyết da vùng cẳng bằng ghép da tự thân',
    'tạo hình các khuyết da vùng cổ chân bằng ghép da tự thân',
    'tạo hình các khuyết da vùng bàn chân bằng ghép da tự thân',
    'tạo hình các khuyết da vùng đùi bằng vạt da tại chỗ',
    'tạo hình các khuyết da vùng khoeo bằng vạt da tại chỗ',
    'tạo hình các khuyết da vùng cẳng chân bằng vạt da tại chỗ',
    'tạo hình các khuyết da vùng đùi bằng vạt da lân cận',
    'tạo hình các khuyết da vùng khoeo bằng vạt da lân cận',
    'tạo hình các khuyết da vùng cẳng chân bằng vạt da lân cận',
    'tạo hình các khuyết da vùng bàn chân bằng ghép da lân cận',
    'tạo hình các khuyết da vùng cẳng chân bằng vạt da có sử dụng kỹ thuật vi phẫu',
    'tạo hình các khuyết da vùng bàn chân bằng ghép da có sử dụng kỹ thuật vi phẫu',
    'Khâu nối thần kinh ngoại biên vùng cổ',
    'khâu vết thương thấu má',
    'Điều trị gãy xương chỉnh mũi bằng nắn chỉnh',
    'Điều trị gãy xương chỉnh mũi bằng nắn chỉnh',
    'chỉnh sửa góc hàm xương hàm dưới',
    'chỉnh sửa góc hàm xương hàm dưới',
    'cắt chỉnh cằm',
    'chỉnh sửa thân xương hàm dưới',
    'tạo hình thiểu sản bẩm sinh nửa mặt bằng chất làm đầy',
    'tạo hình thiểu sản bẩm sinh nửa mặt bằng chất làm đầy',
    'cắt bỏ u da mặt lành tính',
    'khâu đóng trực tiếp sẹo vùng cổ, mặt (dưới 3cm)',
    'khâu đóng trực tiếp sẹo vùng cổ, mặt (trên 3cm)',
    'sửa sẹo vùng cổ, mặt bằng vạt da từ xa',
    'ghép xương tự thân tức thì sau đoạn xương hàm trên',
    'ghép xương bằng vật liệu thay thế tức thì sau cắt đoạn xương hàm trên',
    'Tạo hình hộp sọ trong dị tật hẹp hộp sọ',
    'Tạo hình không âm đạo bằng (tạo khoang và) nong giãn',
    'Tạo hình dị tật ngắn âm đạo bằng nong giãn',
    'cắt bỏ tổ chức hoại tử trong ổ loét tỳ đè',
    'ghép sụn mi mắt',
    'ghép da tự thân vùng mi mắt',
    'tạo hình mi mắt kết hợp các bộ phận xung quanh',
    'ghép mỡ tự thân coleman điều trị lõm mắt',
    'ghép mỡ trung bì tự thân điều trị lõm mắt',
    'Đặt sụn sườn vào dưới màng xương điều trị lõm mắt',
    'Đặt bản silicon trong điều trị lõm mắt',
    'Nâng sàn hốc mắt',
    'Tạo hình hốc mắt trong tật không nhãn cầu để lắp mắt giả',
    'Tái tạo toàn bộ mi bằng vạt có cuống mạch',
    'Tái tạo toàn bộ mi và cùng đồ bằng vạt có cuống mạch',
    'Tái tạo toàn bộ mi và cùng đồ bằng vạt tự do',
    'Điều trị chứng co giật mi trên bằng botox',
    'Tái tạo cung mày bằng vật có cuống mạch nuôi',
    'Tái tạo cung mày bằng ghép da đầu mang tóc',
    'Khâu và cắt lọc vết thương vùng mũi',
    'tạo hình mũi toàn bộ',
    'tạo hình mũi một phần',
    'tạo hình tháp mũi bằng vạt có cuống mạch nuôi',
    'tạo hình tháp mũi bằng vạt da kế cận',
    'tạo hình tháp mũi bằng vạt da từ xa',
    'tạo hình cánh mũi bằng các vạt có cuống mạch nuôi',
    'tạo hình cánh mũi bằng ghép phức hợp vành tai',
    'cắt bỏ u lành tính vùng mũi (dưới 2cm)',
    'cắt bỏ u lành tính vùng mũi (trên 2cm)',
    'tạo hình mũi sư tử',
    'sửa cánh mũi trong sẹo khe hở môi đơn',
    'treo cung mày bằng chỉ',
    'tạo hình thiểu năng vòm hầu bằng tiêm chất làm đầy',
    'Hút mỡ vùng hông',
    'Hút mỡ vùng lưng',
    'Hút mỡ tạo bụng 6 múi',
    'chỉnh sửa các biến chứng sau hút mỡ',
    'cấy mỡ tạo dáng cơ thể',
    'cấy mỡ nâng mũi',
    'cấy mỡ làm đầy vùng mặt',
    'cấy mỡ bàn tay',
    'cấy mỡ vùng mông',
    'làm to mông bằng túi độn mông',
    'nâng vú bằng túi độn ngực',
    'nâng vú bằng chất làm đầy',
    'chỉnh sửa các biến chứng sau mổ nâng vú',
    'căng da bụng không cắt rời và di chuyển rốn',
    'căng da bụng có cắt rời và di chuyển rốn',
    'tái tạo thành bụng đơn giản',
    'tái tạo thành bụng phức tạp',
    'tạo hình thành bụng toàn phần kết hợp hút mỡ bụng',
    'chỉnh sửa các biến chứng sau mổ tạo hình thẩm mỹ bụng',
    'độn cằm',
    'chỉnh hình cằm bằng cấy mỡ',
    'chỉnh hình cằm bằng tiêm chất làm đầy',
    'chỉnh sửa các biến chứng sau mổ chỉnh hình cằm',
    'thẩm mỹ cơ quan sinh dục ngoài nữ',
    'thu nhỏ âm đạo',
    'Laser điều trị u da',
    'Laser điều trị nám da',
    'Laser điều trị đồi mồi',
    'Laser điều trị nếp nhăn                       ',
    'Tiêm botulium điều trị nếp nhăn',
    'Tiêm chất làm đầy xóa nếp nhăn',
    'Tiêm chất làm đầy nâng mũi',
    'Tiêm chất làm đầy độn mô',
    'cắt xương điều trị nhô cằm',
    'điều trị hoại tử mô do tia xạ bằng vạt có cuống mạch nuôi',
    'điều trị hoại tử xương hàm do tia xạ',
    'điều trị hoại tử xương và phần mềm vùng hàm mặt do tia xạ',
    'đặt túi bơm giãn da',
    'Nút động mạch dị dạng động tĩnh mạch ở vùng đầu và hàm mặt',
    'Cắt u phần mềm vùng cổ',
    'Cắt nơvi sắc tố vùng hàm mặt',
    'ghép lại mảnh da mặt đứt rời bằng vi phẫu',
];


/***/ }),
/* 89 */
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
exports.ProductSeed = void 0;
const faker_1 = __webpack_require__(80);
const common_1 = __webpack_require__(1);
const random_helper_1 = __webpack_require__(77);
const entities_1 = __webpack_require__(8);
const typeorm_1 = __webpack_require__(11);
const product_example_1 = __webpack_require__(86);
let ProductSeed = class ProductSeed {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async startCreateProduct(oid) {
        const countProduct = await this.dataSource.getRepository(entities_1.Product).count();
        if (countProduct)
            return;
        const productsDto = [];
        for (let i = 0; i < product_example_1.productExampleData.length; i++) {
            const product = new entities_1.Product();
            const medicine = product_example_1.productExampleData[i];
            product.oid = oid;
            product.brandName = medicine.brandName;
            product.substance = medicine.substance;
            product.group = medicine.group;
            product.unit = [{ name: medicine.unit, rate: 1 }];
            product.route = medicine.route;
            product.source = medicine.source;
            product.hintUsage = faker_1.faker.lorem.sentence();
            productsDto.push(product);
        }
        await this.dataSource.getRepository(entities_1.Product).insert(productsDto);
    }
    async startCreateProductBatch(oid) {
        const products = await this.dataSource.getRepository(entities_1.Product).findBy({ oid });
        const productBatchesDto = [];
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const number = (0, random_helper_1.randomNumber)(2, 5);
            const costPrice = (0, random_helper_1.randomNumber)(10000, 1000000, 1000);
            for (let j = 0; j < number; j++) {
                const expiryDate = (0, random_helper_1.randomDate)(new Date('2025-06-03'), new Date('2028-07-09'));
                const productBatch = new entities_1.ProductBatch();
                const rate = (0, random_helper_1.randomNumber)(0.8, 1.2, 0.01);
                productBatch.oid = oid;
                productBatch.productId = product.id;
                productBatch.batch = faker_1.faker.lorem.word(5);
                productBatch.expiryDate = expiryDate.getTime();
                productBatch.costPrice = Math.floor(costPrice * rate / 5000) * 5000;
                productBatch.retailPrice = Math.floor(costPrice * rate * 1.8 / 5000) * 5000;
                productBatch.wholesalePrice = Math.floor(costPrice * rate * 1.2 / 5000) * 5000;
                productBatchesDto.push(productBatch);
            }
        }
        await this.dataSource.getRepository(entities_1.ProductBatch).insert(productBatchesDto);
    }
};
ProductSeed = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object])
], ProductSeed);
exports.ProductSeed = ProductSeed;


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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReceiptSeed = void 0;
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(7);
const random_helper_1 = __webpack_require__(77);
const variable_1 = __webpack_require__(13);
const entities_1 = __webpack_require__(8);
const repository_1 = __webpack_require__(30);
const typeorm_2 = __webpack_require__(11);
let ReceiptSeed = class ReceiptSeed {
    constructor(productBatchRepository, distributorRepository, receiptProcessRepository) {
        this.productBatchRepository = productBatchRepository;
        this.distributorRepository = distributorRepository;
        this.receiptProcessRepository = receiptProcessRepository;
    }
    fakeReceiptInsertDto(productBatches) {
        const numberStock = (0, random_helper_1.randomNumber)(10, 20);
        const receiptItemsDto = [];
        for (let i = 0; i < numberStock; i++) {
            const productBatch = productBatches[i];
            const unit = productBatch.product.unit.find((i) => i.rate === 1);
            receiptItemsDto.push({
                productBatchId: productBatch.id,
                quantity: (0, random_helper_1.randomNumber)(20, 50, 5),
                unit,
                productBatch,
            });
        }
        const totalItemMoney = receiptItemsDto.reduce((acc, cur) => {
            return acc + cur.quantity * cur.productBatch.costPrice;
        }, 0);
        const discountPercent = (0, random_helper_1.randomNumber)(10, 30);
        const discountMoney = Math.ceil(totalItemMoney * discountPercent / 100 / 1000) * 1000;
        const discountType = (0, random_helper_1.randomEnum)(variable_1.DiscountType);
        const surcharge = (0, random_helper_1.randomNumber)(50000, 200000, 1000);
        const totalMoney = totalItemMoney - discountMoney + surcharge;
        const debt = (0, random_helper_1.randomNumber)(10000, 200000, 10000);
        const receiptInsertDto = {
            totalItemMoney,
            discountMoney,
            discountPercent,
            discountType,
            surcharge,
            totalMoney,
            debt,
            receiptItems: receiptItemsDto,
        };
        return receiptInsertDto;
    }
    async start(oid, number) {
        const productBatches = await this.productBatchRepository.find({
            relations: { product: true },
            relationLoadStrategy: 'join',
            where: { oid },
        });
        const distributors = await this.distributorRepository.findBy({ oid });
        const firstTime = new Date('2020-06-07');
        for (let i = 0; i < number; i++) {
            const distributor = (0, random_helper_1.randomItemsInArray)(distributors);
            const productBatchesShuffle = (0, random_helper_1.shuffleArray)(productBatches);
            const createTime = firstTime.getTime() + i * 3 * 24 * 60 * 60 * 1000;
            const shipTime = firstTime.getTime() + i * 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000;
            const refundTime = firstTime.getTime() + i * 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000;
            const receiptInsertDto = this.fakeReceiptInsertDto(productBatchesShuffle);
            receiptInsertDto.distributorId = distributor.id;
            receiptInsertDto.createTime = createTime;
            const { receiptId } = await this.receiptProcessRepository.createDraft({ oid, receiptInsertDto });
            if (i % 2 === 0) {
                await this.receiptProcessRepository.startShipAndPayment({ oid, receiptId, shipTime });
                if (i % 4 === 0) {
                    await this.receiptProcessRepository.startRefund({ oid, receiptId, refundTime });
                }
            }
        }
    }
};
ReceiptSeed = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.ProductBatch)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Distributor)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof repository_1.ReceiptProcessRepository !== "undefined" && repository_1.ReceiptProcessRepository) === "function" ? _c : Object])
], ReceiptSeed);
exports.ReceiptSeed = ReceiptSeed;


/***/ }),
/* 91 */
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
var SeedDataCommand_1;
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SeedDataCommand = void 0;
const common_1 = __webpack_require__(1);
const nest_commander_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(11);
const address_service_1 = __webpack_require__(73);
const customer_seed_1 = __webpack_require__(79);
const distributor_seed_1 = __webpack_require__(82);
const employee_seed_1 = __webpack_require__(83);
const invoice_seed_1 = __webpack_require__(84);
const organization_seed_1 = __webpack_require__(85);
const procedure_seed_1 = __webpack_require__(87);
const product_seed_1 = __webpack_require__(89);
const receipt_seed_1 = __webpack_require__(90);
let SeedDataCommand = SeedDataCommand_1 = class SeedDataCommand extends nest_commander_1.CommandRunner {
    constructor(dataSource, organizationSeed, employeeSeed, distributorSeed, customerSeed, productSeed, invoiceSeed, receiptSeed, procedureSeed) {
        super();
        this.dataSource = dataSource;
        this.organizationSeed = organizationSeed;
        this.employeeSeed = employeeSeed;
        this.distributorSeed = distributorSeed;
        this.customerSeed = customerSeed;
        this.productSeed = productSeed;
        this.invoiceSeed = invoiceSeed;
        this.receiptSeed = receiptSeed;
        this.procedureSeed = procedureSeed;
        this.logger = new common_1.Logger(SeedDataCommand_1.name);
    }
    async run(passedParams, options) {
        try {
            const startDate = Date.now();
            console.log('======== [START]: Seed data ========');
            await address_service_1.AddressData.init();
            const oid = 1;
            await this.organizationSeed.start(oid);
            await this.employeeSeed.start(oid, 50);
            await this.distributorSeed.start(oid, 100);
            await this.customerSeed.start(oid, 100);
            await this.productSeed.startCreateProduct(oid);
            await this.procedureSeed.start(oid);
            await this.productSeed.startCreateProductBatch(oid);
            await this.receiptSeed.start(oid, 200);
            await this.invoiceSeed.start(oid, 200, new Date('2023-06-20'), new Date('2023-08-06'));
            const endDate = Date.now();
            const time = endDate - startDate;
            console.log(`======== [SUCCESS] - ${time}ms ========`);
        }
        catch (error) {
            this.logger.error(error);
        }
        finally {
            process.exit();
        }
    }
};
SeedDataCommand = SeedDataCommand_1 = __decorate([
    (0, nest_commander_1.Command)({ name: 'start:seed' }),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object, typeof (_b = typeof organization_seed_1.OrganizationSeed !== "undefined" && organization_seed_1.OrganizationSeed) === "function" ? _b : Object, typeof (_c = typeof employee_seed_1.EmployeeSeed !== "undefined" && employee_seed_1.EmployeeSeed) === "function" ? _c : Object, typeof (_d = typeof distributor_seed_1.DistributorSeed !== "undefined" && distributor_seed_1.DistributorSeed) === "function" ? _d : Object, typeof (_e = typeof customer_seed_1.CustomerSeed !== "undefined" && customer_seed_1.CustomerSeed) === "function" ? _e : Object, typeof (_f = typeof product_seed_1.ProductSeed !== "undefined" && product_seed_1.ProductSeed) === "function" ? _f : Object, typeof (_g = typeof invoice_seed_1.InvoiceSeed !== "undefined" && invoice_seed_1.InvoiceSeed) === "function" ? _g : Object, typeof (_h = typeof receipt_seed_1.ReceiptSeed !== "undefined" && receipt_seed_1.ReceiptSeed) === "function" ? _h : Object, typeof (_j = typeof procedure_seed_1.ProcedureSeed !== "undefined" && procedure_seed_1.ProcedureSeed) === "function" ? _j : Object])
], SeedDataCommand);
exports.SeedDataCommand = SeedDataCommand;


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TestApi = void 0;
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(7);
const function_helper_1 = __webpack_require__(93);
const random_helper_1 = __webpack_require__(77);
const variable_1 = __webpack_require__(13);
const entities_1 = __webpack_require__(8);
const typeorm_2 = __webpack_require__(11);
let TestApi = class TestApi {
    constructor(dataSource, manager, arrivalRepository) {
        this.dataSource = dataSource;
        this.manager = manager;
        this.arrivalRepository = arrivalRepository;
    }
    async update_query_join() {
        const result = await this.manager.query(`
			UPDATE product_movement LEFT JOIN product_batch
				ON product_movement.product_batch_id = product_batch.id
			SET product_movement.open_quantity = product_batch.quantity,
				product_movement.close_quantity = product_batch.quantity + product_movement.number,
				product_batch.quantity = product_batch.quantity + product_movement.number
			WHERE product_movement.reference_id = 1 AND product_batch.oid = 1
		`);
        return result;
    }
    async insert() {
    }
    async queryBuilder() {
        const result = await this.manager.createQueryBuilder(entities_1.Arrival, 'arrival')
            .leftJoinAndSelect('arrival.customer', 'customer')
            .leftJoinAndSelect('arrival.invoices', 'invoice')
            .leftJoinAndSelect('invoice.invoiceItems', 'invoiceItem')
            .leftJoinAndSelect('invoiceItem.procedure', 'procedure', 'invoiceItem.type = :typeProcedure', { typeProcedure: variable_1.InvoiceItemType.Procedure })
            .leftJoinAndSelect('invoiceItem.productBatch', 'productBatch', 'invoiceItem.type = :typeProductBatch', { typeProductBatch: variable_1.InvoiceItemType.ProductBatch })
            .where('arrival.id = :id', { id: 1 })
            .getOne();
        console.log('🚀 ~ file: test.api.ts:81 ~ TestApi ~ queryBuilder ~ result:', result);
        return result;
    }
    async transaction_READ_UNCOMMITTED() {
        const startTime = Date.now();
        const [customerRoot] = await this.manager.find(entities_1.Customer, { where: { id: 1 } });
        const result = await Promise.allSettled([
            this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
                await (0, function_helper_1.sleep)(1000);
                await manager.update(entities_1.Customer, { id: 1, fullName: '444' }, { fullName: '666' });
                await (0, function_helper_1.sleep)(3000);
            }),
            this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
                await manager.update(entities_1.Customer, { id: 1 }, { fullName: '555' });
                await (0, function_helper_1.sleep)(2000);
            }),
        ]);
        const endTime = Date.now();
        const [customerAfter] = await this.manager.find(entities_1.Customer, { where: { id: 1 } });
        return {
            customerRoot: customerRoot.fullName,
            result,
            customerAfter: customerAfter.fullName,
            time: endTime - startTime,
        };
    }
    async transaction_REPEATABLE_READ() {
        const [receiptRoot] = await this.manager.find(entities_1.Receipt, { where: { id: 1 } });
        const startTime = Date.now();
        const result = await Promise.allSettled([
            this.dataSource.transaction('REPEATABLE READ', async (manager) => {
                await (0, function_helper_1.sleep)(1000);
                await manager.update(entities_1.Distributor, { id: 156 }, { fullName: (0, random_helper_1.randomFullName)() });
                await (0, function_helper_1.sleep)(3000);
            }),
            this.dataSource.transaction('SERIALIZABLE', async (manager) => {
                const [receipt] = await manager.find(entities_1.Receipt, {
                    where: { id: 1, oid: 1 },
                    relations: { receiptItems: true, distributor: true },
                    relationLoadStrategy: 'join',
                });
                await (0, function_helper_1.sleep)(2000);
                return receipt.note;
            }),
        ]);
        const endTime = Date.now();
        const [receiptAfter] = await this.manager.find(entities_1.Receipt, { where: { id: 1 } });
        return {
            receiptRoot: receiptRoot.note,
            result,
            receiptAfter: receiptAfter.note,
            time: endTime - startTime,
        };
    }
    async transaction_SERIALIZABLE() {
        const startTime = Date.now();
        const [customerRoot] = await this.manager.find(entities_1.Customer, { where: { id: 1 } });
        const result = await Promise.allSettled([
            this.dataSource.transaction('SERIALIZABLE', async (manager) => {
                await (0, function_helper_1.sleep)(1000);
                await manager.update(entities_1.Customer, { id: 1 }, { fullName: (0, random_helper_1.randomFullName)() });
                await (0, function_helper_1.sleep)(3000);
            }),
            this.dataSource.transaction('SERIALIZABLE', async (manager) => {
                const [customer] = await manager.find(entities_1.Customer, { where: { id: 1 } });
                await (0, function_helper_1.sleep)(2000);
                return customer.fullName;
            }),
        ]);
        const endTime = Date.now();
        const [customerAfter] = await this.manager.find(entities_1.Customer, { where: { id: 1 } });
        return {
            customerRoot: customerRoot.fullName,
            result,
            customerAfter: customerAfter.fullName,
            time: endTime - startTime,
        };
    }
    async query_transaction() {
        const [customerRoot] = await this.manager.find(entities_1.Customer, { where: { id: 1 } });
        const startTime = Date.now();
        const result = await Promise.allSettled([
            this.dataSource.transaction('SERIALIZABLE', async (manager) => {
                manager.find(entities_1.Customer, { where: { id: 1 } });
                await (0, function_helper_1.sleep)(3000);
            }),
            (async () => {
                await (0, function_helper_1.sleep)(2000);
                await this.manager.update(entities_1.Customer, { id: 1 }, { fullName: new Date().toISOString() });
                await (0, function_helper_1.sleep)(1000);
            })(),
        ]);
        const endTime = Date.now();
        const [customerAfter] = await this.manager.find(entities_1.Customer, { where: { id: 1 } });
        return {
            customerRoot: customerRoot.fullName,
            result,
            customerAfter: customerAfter.fullName,
            time: endTime - startTime,
        };
    }
    async transaction_DEADLOCK() {
        const result = await Promise.allSettled([
            this.dataSource.transaction('SERIALIZABLE', async (manager) => {
                const [customer] = await manager.find(entities_1.Customer, { where: { id: 1 } });
                await (0, function_helper_1.sleep)(2000);
                await manager.update(entities_1.Customer, { id: 1 }, { fullName: (0, random_helper_1.randomFullName)() });
            }),
            this.dataSource.transaction('SERIALIZABLE', async (manager) => {
                const [customer] = await manager.find(entities_1.Customer, { where: { id: 1 } });
                await (0, function_helper_1.sleep)(2000);
                await manager.update(entities_1.Customer, { id: 1 }, { fullName: (0, random_helper_1.randomFullName)() });
            }),
        ]);
        return { result };
    }
    async transaction_DEADLOCK_READ_UNCOMMITTED() {
        const result = await Promise.allSettled([
            this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
                await manager.update(entities_1.Customer, { id: 1 }, { fullName: (0, random_helper_1.randomFullName)() });
                await (0, function_helper_1.sleep)(2000);
                await manager.update(entities_1.Customer, { id: 2 }, { fullName: (0, random_helper_1.randomFullName)() });
            }),
            this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
                await manager.update(entities_1.Customer, { id: 2 }, { fullName: (0, random_helper_1.randomFullName)() });
                await (0, function_helper_1.sleep)(2000);
                await manager.update(entities_1.Customer, { id: 1 }, { fullName: (0, random_helper_1.randomFullName)() });
            }),
        ]);
        return { result };
    }
};
__decorate([
    (0, common_1.Get)('update_query_join'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestApi.prototype, "update_query_join", null);
__decorate([
    (0, common_1.Get)('insert'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestApi.prototype, "insert", null);
__decorate([
    (0, common_1.Get)('query-builder'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestApi.prototype, "queryBuilder", null);
__decorate([
    (0, common_1.Get)('transaction_READ_UNCOMMITTED'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestApi.prototype, "transaction_READ_UNCOMMITTED", null);
__decorate([
    (0, common_1.Get)('transaction_REPEATABLE_READ'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestApi.prototype, "transaction_REPEATABLE_READ", null);
__decorate([
    (0, common_1.Get)('transaction_SERIALIZABLE'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestApi.prototype, "transaction_SERIALIZABLE", null);
__decorate([
    (0, common_1.Get)('query-transaction'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestApi.prototype, "query_transaction", null);
__decorate([
    (0, common_1.Get)('transaction-DEADLOCK'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestApi.prototype, "transaction_DEADLOCK", null);
__decorate([
    (0, common_1.Get)('transaction-DEADLOCK_READ_UNCOMMITTED'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestApi.prototype, "transaction_DEADLOCK_READ_UNCOMMITTED", null);
TestApi = __decorate([
    (0, swagger_1.ApiTags)('Test'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('test'),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Arrival)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.EntityManager !== "undefined" && typeorm_2.EntityManager) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object])
], TestApi);
exports.TestApi = TestApi;


/***/ }),
/* 93 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sleep = exports.throttle = exports.debounceAsync = exports.debounce = void 0;
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(...args);
            timeout = null;
        }, delay);
    };
};
exports.debounce = debounce;
const debounceAsync = (func, delay) => {
    let state = 0;
    return async (...args) => {
        state++;
        const current = state;
        await new Promise((resolve) => setTimeout(resolve, delay));
        if (current !== state)
            return null;
        return await func(...args);
    };
};
exports.debounceAsync = debounceAsync;
const throttle = (func, delay) => {
    let lastCall = 0;
    return function (...args) {
        const now = new Date().getTime();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func(...args);
        }
    };
};
exports.throttle = throttle;
const sleep = async (time) => {
    await new Promise((resolve) => setTimeout(resolve, time));
};
exports.sleep = sleep;


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
const core_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(3);
const nest_commander_1 = __webpack_require__(4);
const seed_data_module_1 = __webpack_require__(5);
async function startCommandLine() {
    await nest_commander_1.CommandFactory.runWithoutClosing(seed_data_module_1.SeedDataModule, ['log', 'debug', 'warn', 'error']);
}
async function startApi() {
    const logger = new common_1.Logger('bootstrap');
    const app = await core_1.NestFactory.create(seed_data_module_1.SeedDataModule);
    app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Simple API')
        .setDescription('Medihome API use Swagger')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', description: 'Access token' }, 'access-token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('document', app, document);
    await app.listen(20001, () => {
        logger.debug('🚀 ===== [TEST] Server document: http://localhost:20001/document =====');
    });
}
startApi();

})();

/******/ })()
;
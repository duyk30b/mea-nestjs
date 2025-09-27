import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version1101758795275070 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            const tableBasicList = [
                'Appointment',
                'Payment',
                'PaymentTicketItem',
                'ProductMovement',
                'PurchaseOrder',
                'PurchaseOrderItem',
                'StockCheck',
                'StockCheckItem',
                'Ticket',
            ]
            for (const table of tableBasicList) {
                await queryRunner.query(`
                    ALTER TABLE "${table}" ALTER COLUMN id TYPE bigint;
                    ALTER TABLE "${table}" ALTER COLUMN id SET NOT NULL;
                    ALTER TABLE "${table}" ALTER COLUMN id DROP DEFAULT;
                    DROP SEQUENCE IF EXISTS "${table}_id_seq";
                `)
            }

            const tableTicketList = [
                'TicketAttribute',
                'TicketBatch',
                'TicketExpense',
                'TicketLaboratoryGroup',
                'TicketLaboratoryResult',
                'TicketLaboratory',
                'TicketProcedure',
                'TicketProduct',
                'TicketRadiology',
                // 'TicketReception', // mới tạo
                // 'TicketRegimenItem', // mới tạo
                'TicketRegimen',
                'TicketSurcharge',
                'TicketUser',
            ]
            for (const table of tableTicketList) {
                await queryRunner.query(`
                    ALTER TABLE "${table}" ALTER COLUMN id TYPE bigint;
                    ALTER TABLE "${table}" ALTER COLUMN id SET NOT NULL;
                    ALTER TABLE "${table}" ALTER COLUMN id DROP DEFAULT;
                    DROP SEQUENCE IF EXISTS "${table}_id_seq";
                    ALTER TABLE "${table}" ALTER COLUMN "ticketId" TYPE bigint;
                `)
            }

            await queryRunner.query(`
                DROP INDEX "public"."IDX_Ticket__oid_registeredAt";
                ALTER TABLE "Ticket" RENAME COLUMN "registeredAt" TO "createdAt";
                ALTER TABLE "Ticket" RENAME COLUMN "startedAt" TO "receptionAt";
                CREATE INDEX "IDX_Ticket__oid_createdAt" ON "Ticket" ("oid", "createdAt");
                CREATE INDEX "IDX_Ticket__oid_receptionAt" ON "Ticket" ("oid", "receptionAt");

                ALTER TABLE "Ticket"
                    ADD "isPaymentEachItem" smallint NOT NULL DEFAULT '0';
            `)

            await queryRunner.query(`
                ALTER TABLE "Image" ALTER COLUMN "ticketId" TYPE bigint;
                ALTER TABLE "Image" ALTER COLUMN "ticketId" DROP DEFAULT;
                ALTER TABLE "Image" ALTER COLUMN "ticketItemId" TYPE bigint;
            `)

            await queryRunner.query(`
                ALTER TABLE "Appointment" ALTER COLUMN "fromTicketId" TYPE bigint;
                ALTER TABLE "Appointment" ALTER COLUMN "toTicketId" TYPE bigint;
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketUser" ALTER COLUMN "ticketItemId" TYPE bigint;
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketLaboratoryResult" ALTER COLUMN "ticketLaboratoryId" TYPE bigint;
                ALTER TABLE "TicketLaboratoryResult" ALTER COLUMN "ticketLaboratoryGroupId" TYPE bigint;
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketLaboratory" ALTER COLUMN "ticketLaboratoryGroupId" TYPE bigint;
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketProduct"
                    ADD "paymentEffect" smallint NOT NULL DEFAULT '1',
                    ADD "ticketProcedureId" bigint NOT NULL DEFAULT '0';
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketBatch" ALTER COLUMN "ticketProductId" TYPE bigint;
            `)

            await queryRunner.query(`
                ALTER TABLE "PurchaseOrderItem" 
                    ALTER COLUMN "purchaseOrderId" TYPE bigint;
            `)

            await queryRunner.query(`
                ALTER TABLE "Regimen" DROP COLUMN "gapHours";
                ALTER TABLE "Regimen" DROP COLUMN "gapHoursType";
            `)

            await queryRunner.query(`
                ALTER TABLE "RegimenItem"
                    ADD "gapDay" smallint NOT NULL DEFAULT '1';
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketProcedure" DROP COLUMN "sessionIndex";

                ALTER TABLE "TicketProcedure" 
                    ALTER COLUMN "ticketRegimenId" TYPE bigint;

                ALTER TABLE "TicketProcedure"
                    ADD "ticketRegimenItemId" bigint NOT NULL DEFAULT '0',
                    ADD "indexSession" smallint NOT NULL DEFAULT '0';
            `)
            await queryRunner.query(`
                ALTER TABLE "StockCheckItem" 
                    ALTER COLUMN "stockCheckId" TYPE bigint;
            `)

            await queryRunner.query(`
                ALTER TABLE "Payment" ALTER COLUMN "voucherId" TYPE bigint;
            `)

            await queryRunner.query(`
                ALTER TABLE "PaymentTicketItem" ALTER COLUMN "paymentId" TYPE bigint;
                ALTER TABLE "PaymentTicketItem" ALTER COLUMN "paymentId" DROP DEFAULT;
                ALTER TABLE "PaymentTicketItem" ALTER COLUMN "ticketId" TYPE bigint;
                ALTER TABLE "PaymentTicketItem" ALTER COLUMN "ticketId" DROP DEFAULT;
                ALTER TABLE "PaymentTicketItem" ALTER COLUMN "ticketItemId" TYPE bigint;
                ALTER TABLE "PaymentTicketItem" ALTER COLUMN "ticketItemId" DROP DEFAULT;
            `)

            await queryRunner.query(`
                ALTER TABLE "ProductMovement" ALTER COLUMN "voucherProductId" TYPE bigint;
                ALTER TABLE "ProductMovement" ALTER COLUMN "voucherId" TYPE bigint;
            `)

            await queryRunner.query(`
                CREATE TABLE "TicketReception" (
                    "oid" integer NOT NULL,
                    "id" bigint NOT NULL,
                    "ticketId" bigint NOT NULL,
                    "roomId" integer NOT NULL DEFAULT '0',
                    "customerId" integer NOT NULL,
                    "customerSourceId" integer NOT NULL DEFAULT '0',
                    "receptionAt" bigint NOT NULL,
                    "isFirstReception" smallint NOT NULL DEFAULT '1',
                    "reason" character varying(255) NOT NULL DEFAULT '',
                    CONSTRAINT "PK_908e12cc551d5db43144fb50217" PRIMARY KEY ("id")
                );
                CREATE INDEX "IDX_TicketReception__oid_receptionAt" 
                    ON "TicketReception" ("oid", "receptionAt");
            `)

            await queryRunner.query(`
                CREATE TABLE "TicketRegimenItem" (
                    "oid" integer NOT NULL,
                    "id" bigint NOT NULL,
                    "ticketId" bigint NOT NULL,
                    "customerId" integer NOT NULL,
                    "ticketRegimenId" bigint NOT NULL,
                    "regimenId" integer NOT NULL,
                    "procedureId" integer NOT NULL,
                    "gapDay" smallint NOT NULL DEFAULT '1',
                    "quantityTotal" integer NOT NULL DEFAULT '0',
                    "quantityFinish" integer NOT NULL DEFAULT '0',
                    "expectedPrice" integer NOT NULL DEFAULT '0',
                    "discountType" character varying(25) NOT NULL DEFAULT 'VNĐ',
                    "discountPercent" numeric(7, 3) NOT NULL DEFAULT '0',
                    "discountMoney" integer NOT NULL DEFAULT '0',
                    "actualPrice" integer NOT NULL DEFAULT '0',
                    CONSTRAINT "PK_c65db5965d4c1fe9631323410a1" PRIMARY KEY ("id")
                );
                CREATE INDEX "IDX_TicketRegimenItem__oid_ticketId" 
                    ON "TicketRegimenItem" ("oid", "ticketId");
            `)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

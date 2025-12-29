import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version1191767004412103 implements MigrationInterface {
    name = 'Version1191767004412103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            await queryRunner.query(`
                ALTER TABLE "Ticket"
                    ADD "id2" bigint NOT NULL DEFAULT '0';

                WITH ranked_ticket AS (
                    SELECT
                        id,
                        to_char(
                            to_timestamp("createdAt" / 1000) AT TIME ZONE 'Asia/Ho_Chi_Minh',
                            'YYMMDD'
                        ) AS yymmdd,
                        ROW_NUMBER() OVER (
                            PARTITION BY oid, (to_timestamp("createdAt" / 1000) AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE
                            ORDER BY "createdAt", id
                        ) AS seq
                        FROM "Ticket"
                    )
                UPDATE "Ticket" t
                SET id2 = (t.oid * 10000000000) + (r.yymmdd::bigint * 10000) + r.seq
                FROM ranked_ticket r
                WHERE t.id = r.id;
            `)

            await queryRunner.query(`
                ALTER TABLE "PurchaseOrder"
                    ADD "id2" bigint NOT NULL DEFAULT '0';

                WITH ranked_po AS (
                    SELECT
                        id,
                        to_char(
                            to_timestamp("startedAt" / 1000) AT TIME ZONE 'Asia/Ho_Chi_Minh',
                            'YYMMDD'
                        ) AS yymmdd,
                        ROW_NUMBER() OVER (
                            PARTITION BY oid, (to_timestamp("startedAt" / 1000) AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE
                            ORDER BY "startedAt", id
                        ) AS seq
                        FROM "PurchaseOrder"
                    )
                UPDATE "PurchaseOrder" t
                SET id2 = (t.oid * 10000000000) + (r.yymmdd::bigint * 10000) + r.seq
                FROM ranked_po r
                WHERE t.id = r.id;
            `)

            const tables = [
                'Image',
                'PaymentTicketItem',
                'TicketAttribute',
                'TicketBatch',
                'TicketExpense',
                'TicketLaboratoryGroup',
                'TicketLaboratoryResult',
                'TicketLaboratory',
                'TicketPaymentDetail',
                'TicketProcedure',
                'TicketProduct',
                'TicketRadiology',
                'TicketReception',
                'TicketRegimenItem',
                'TicketRegimen',
                'TicketSurcharge',
                'TicketUser',
            ]
            for (const table of tables) {
                await queryRunner.query(`
                    UPDATE  "${table}"
                    SET     "ticketId" = "Ticket"."id2"
                    FROM    "Ticket"
                    WHERE   "Ticket"."id" = "${table}"."ticketId";
                `)
            }

            await queryRunner.query(`
                UPDATE  "PurchaseOrderItem"
                SET     "purchaseOrderId" = "PurchaseOrder"."id2"
                FROM    "PurchaseOrder"
                WHERE   "PurchaseOrder"."id" = "PurchaseOrderItem"."purchaseOrderId";
            `)

            await queryRunner.query(`
                UPDATE  "Payment"
                SET     "voucherId" = "Ticket"."id2"
                FROM    "Ticket"
                WHERE   "Ticket"."id" = "Payment"."voucherId" AND "Payment"."voucherType" = 2;

                UPDATE  "Payment"
                SET     "voucherId" = "PurchaseOrder"."id2"
                FROM    "PurchaseOrder"
                WHERE   "PurchaseOrder"."id" = "Payment"."voucherId" AND "Payment"."voucherType" = 1;
            `)

            await queryRunner.query(`
                UPDATE  "ProductMovement"
                SET     "voucherId" = "Ticket"."id2"
                FROM    "Ticket"
                WHERE   "Ticket"."id" = "ProductMovement"."voucherId" AND "ProductMovement"."movementType" = 2;

                UPDATE  "ProductMovement"
                SET     "voucherId" = "PurchaseOrder"."id2"
                FROM    "PurchaseOrder"
                WHERE   "PurchaseOrder"."id" = "ProductMovement"."voucherId" AND "ProductMovement"."movementType" = 1;
            `)

            await queryRunner.query(`
                UPDATE  "Ticket"  SET "id" = "id2", "id2" = "id";
                UPDATE  "PurchaseOrder" SET "id" = "id2", "id2" = "id";
            `)

            await queryRunner.query(`
                ALTER TABLE "Payment"
                    ADD "id2" bigint NOT NULL DEFAULT '0';

                WITH ranked_payment AS (
                    SELECT
                        id,
                        to_char(
                            to_timestamp("createdAt" / 1000) AT TIME ZONE 'Asia/Ho_Chi_Minh',
                            'YYMMDDHH24MISS'
                        ) AS yymmddhhmmss,
                        ROW_NUMBER() OVER (
                            PARTITION BY 
                                date_trunc(
                                    'second',
                                    to_timestamp("createdAt" / 1000)
                                    AT TIME ZONE 'Asia/Ho_Chi_Minh'
                                )
                            ORDER BY "createdAt", id
                        ) AS seq
                        FROM "Payment"
                    )
                UPDATE "Payment" t
                SET id2 = (r.yymmddhhmmss::bigint * 10000000) + (t.oid * 1000) + r.seq
                FROM ranked_payment r
                WHERE t.id = r.id;

                UPDATE  "Payment"  SET "id" = "id2", "id2" = "id";
                ALTER TABLE "Payment" DROP COLUMN "id2";
            `)

            await queryRunner.query(`
                ALTER TABLE "ProductMovement"
                    ADD "id2" bigint NOT NULL DEFAULT '0';

                WITH ranked_movement AS (
                    SELECT
                        id,
                        to_char(
                            to_timestamp("createdAt" / 1000) AT TIME ZONE 'Asia/Ho_Chi_Minh',
                            'YYMMDDHH24MISS'
                        ) AS yymmddhhmmss,
                        ROW_NUMBER() OVER (
                            PARTITION BY 
                                date_trunc(
                                    'second',
                                    to_timestamp("createdAt" / 1000)
                                    AT TIME ZONE 'Asia/Ho_Chi_Minh'
                                )
                            ORDER BY "createdAt", id
                        ) AS seq
                        FROM "ProductMovement"
                    )
                UPDATE "ProductMovement" t
                SET id2 = (r.yymmddhhmmss::bigint * 10000000) + (t.oid * 1000) + r.seq
                FROM ranked_movement r
                WHERE t.id = r.id;

                UPDATE  "ProductMovement"  SET "id" = "id2";
                ALTER TABLE "ProductMovement" DROP COLUMN "id2";
            `)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

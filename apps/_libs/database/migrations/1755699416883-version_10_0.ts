import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version1001755699416883 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const queryArray: string[] = []

        queryArray.push(`
            CREATE TABLE "Surcharge" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "code" character varying(50) NOT NULL,
                "name" character varying NOT NULL,
                "isActive" smallint NOT NULL DEFAULT '1',
                CONSTRAINT "UNIQUE_Surcharge__oid_code" UNIQUE ("oid", "code"),
                CONSTRAINT "PK_c7c671615b4f4dc33891f19a568" PRIMARY KEY ("id")
            );
        `)
        queryArray.push(`
            CREATE TABLE "Expense" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "code" character varying(50) NOT NULL,
                "name" character varying NOT NULL,
                "isActive" smallint NOT NULL DEFAULT '1',
                CONSTRAINT "UNIQUE_Expense__oid_code" UNIQUE ("oid", "code"),
                CONSTRAINT "PK_fb42c5db1dfc3d1e57fd9118bf1" PRIMARY KEY ("id")
            );
        `)

        queryArray.push(`
            ALTER TABLE "TicketSurcharge" 
                DROP COLUMN "key",
                DROP COLUMN "name";
            ALTER TABLE "TicketSurcharge"
                ADD "surchargeId" integer NOT NULL DEFAULT '0';
        `)

        queryArray.push(`
            ALTER TABLE "TicketExpense" 
                DROP COLUMN "key",
                DROP COLUMN "name";
            ALTER TABLE "TicketExpense"
                ADD "expenseId" integer NOT NULL DEFAULT '0';
        `)

        queryArray.push(`
            ALTER TABLE "Procedure" DROP CONSTRAINT "UNIQUE_Procedure__oid_procedureCode";
            DROP TRIGGER IF EXISTS set_updatedAt_procedure_trigger ON "Procedure";

            ALTER TABLE "Procedure" 
                DROP COLUMN "updatedAt",
                DROP COLUMN "consumablesHint";
                
            ALTER TABLE "Procedure" RENAME COLUMN "procedureCode" TO "code";
            ALTER TABLE "Procedure" RENAME COLUMN "quantityDefault" TO "totalSessions";

            ALTER TABLE "Procedure" ALTER COLUMN "price" SET NOT NULL;
            ALTER TABLE "Procedure" ALTER COLUMN "price" SET DEFAULT '0';

            ALTER TABLE "Procedure"
                ADD "gapHoursType" smallint NOT NULL DEFAULT '24';

            ALTER TABLE "Procedure" ADD CONSTRAINT "UNIQUE_Procedure__oid_code" UNIQUE ("oid", "code");
        `)

        queryArray.push(`
            ALTER TABLE "TicketProcedure" 
                DROP COLUMN "result",
                DROP COLUMN "imageIds";
            ALTER TABLE "TicketProcedure" 
                ADD "totalSessions" integer NOT NULL DEFAULT '0',
                ADD "completedSessions" integer NOT NULL DEFAULT '0';
            ALTER TABLE "TicketProcedure" 
                ALTER COLUMN "quantity" SET DEFAULT '1';
        `)

        queryArray.push(`
            CREATE TABLE "TicketProcedureItem" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "ticketId" integer NOT NULL,
                "ticketProcedureId" integer NOT NULL,
                "status" smallint NOT NULL DEFAULT '2',
                "completedAt" bigint,
                "result" text NOT NULL DEFAULT '',
                "imageIds" character varying(100) NOT NULL DEFAULT '[]',
                CONSTRAINT "PK_c65db5965d4c1fe9631323410a1" PRIMARY KEY ("id")
            );
            CREATE INDEX "IDX_TicketProcedureItem__oid_ticketId" ON "TicketProcedureItem" ("oid", "ticketId");
        `)

        queryArray.push(`
            ALTER TABLE "PaymentMethod" DROP COLUMN "priority";
            ALTER TABLE "PaymentMethod" ADD "code" character varying(50) NOT NULL DEFAULT '';

            UPDATE  "PaymentMethod" SET     "code" = "id";

            ALTER TABLE "PaymentMethod" ALTER COLUMN "code" DROP DEFAULT;
            ALTER TABLE "PaymentMethod"
                ADD CONSTRAINT "UNIQUE_PaymentMethod__oid_code" UNIQUE ("oid", "code");
        `)

        queryArray.push(`
            DROP INDEX "public"."IDX_Receipt__oid_distributorId";
            DROP INDEX "public"."IDX_Receipt__oid_startedAt";

            ALTER TABLE "Receipt" RENAME TO "PurchaseOrder";
            ALTER SEQUENCE "Receipt_id_seq" RENAME TO "PurchaseOrder_id_seq";

            CREATE INDEX "IDX_PurchaseOrder__oid_distributorId" ON "PurchaseOrder" ("oid", "distributorId");
            CREATE INDEX "IDX_PurchaseOrder__oid_startedAt" ON "PurchaseOrder" ("oid", "startedAt");


        `)

        queryArray.push(`
            DROP INDEX "public"."IDX_ReceiptItem__oid_receiptId";
            DROP INDEX "public"."IDX_ReceiptItem__oid_productId";
            DROP INDEX "public"."IDX_ReceiptItem__oid_batchId";

            ALTER TABLE "ReceiptItem" RENAME TO "PurchaseOrderItem";
            ALTER SEQUENCE "ReceiptItem_id_seq" RENAME TO "PurchaseOrderItem_id_seq";

            ALTER TABLE "PurchaseOrderItem" RENAME COLUMN "receiptId" TO "purchaseOrderId";

            CREATE INDEX "IDX_PurchaseOrderItem__oid_purchaseOrderId" ON "PurchaseOrderItem" ("oid", "purchaseOrderId");
            CREATE INDEX "IDX_PurchaseOrderItem__oid_productId" ON "PurchaseOrderItem" ("oid", "productId");
        `)

        queryArray.push(`
            ALTER TABLE "Room" RENAME COLUMN "roomCode" TO "code";

            TRUNCATE TABLE "Room" RESTART IDENTITY CASCADE;
            TRUNCATE TABLE "UserRoom" RESTART IDENTITY CASCADE;

            INSERT INTO "Room" (oid, "name", "code", "roomInteractType", "roomStyle", "isCommon")
            SELECT id, 'Phòng Khám', '1', 1, 121, 0  FROM "Organization" ORDER BY id;

            INSERT INTO "Room" (oid, "name", "code", "roomInteractType", "roomStyle", "isCommon")
            SELECT id, 'Bán hàng', '2', 1, 111, 0  FROM "Organization" ORDER BY id;

            INSERT INTO "Room" (oid, "name", "code", "roomInteractType", "roomStyle", "isCommon")
            VALUES (23, 'Đo thị lực', '3', 1, 123, 0);
            INSERT INTO "Room" (oid, "name", "code", "roomInteractType", "roomStyle", "isCommon")
            VALUES (23, 'Tiếp đón', '0', 1, 101, 1);

            INSERT INTO "UserRoom" (oid, "userId", "roomId")
            SELECT "User".oid, "User".id, "Room".id 
                FROM "User" LEFT JOIN "Room" On "User".oid = "Room".oid ORDER BY "User".oid;

            UPDATE  "Ticket"
            SET     "roomId" = "Room"."id"
            FROM    "Room"
            WHERE   "Room"."oid" = "Ticket"."oid" AND "Ticket"."ticketType" = 2 AND "Room"."roomStyle" = 111;

            UPDATE  "Ticket"
            SET     "roomId" = "Room"."id"
            FROM    "Room"
            WHERE   "Room"."oid" = "Ticket"."oid" AND "Ticket"."ticketType" != 2 AND "Room"."roomStyle" = 121;

            UPDATE  "Ticket"
            SET     "roomId" = "Room"."id"
            FROM    "Room"
            WHERE   "Room"."oid" = 23 
                AND "Ticket"."oid" = 23
                AND "Ticket"."ticketType" != 2 
                AND "Ticket"."customType" = 1
                AND "Room"."roomStyle" = 123;
        `)

        queryArray.push(`
            ALTER TABLE "Ticket" 
                DROP COLUMN "ticketType",
                DROP COLUMN "customType";
            CREATE INDEX "IDX_Ticket__oid_roomId" ON "Ticket" ("oid", "roomId");
        `)

        await queryRunner.query(queryArray.join(''))
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

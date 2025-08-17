import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version991755225366463 implements MigrationInterface {
    name = 'Version991755225366463'

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
            CREATE TABLE "Regimen" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "code" character varying(50) NOT NULL,
                "name" character varying(255) NOT NULL,
                "price" integer,
                "isActive" smallint NOT NULL DEFAULT '1',
                CONSTRAINT "UNIQUE_Regimen__oid_code" UNIQUE ("oid", "code"),
                CONSTRAINT "PK_10e1a5bdde0a60fbb992c00d38e" PRIMARY KEY ("id")
            );
        `)

        queryArray.push(`
            CREATE TABLE "RegimenItem" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "regimenId" integer NOT NULL,
                "procedureId" integer NOT NULL,
                "quantity" smallint NOT NULL DEFAULT '1',
                "gapHoursType" smallint NOT NULL DEFAULT '24',
                "gapHours" smallint NOT NULL DEFAULT '0',
                CONSTRAINT "PK_1eceeb9cd3b811a9e2f7d13871c" PRIMARY KEY ("id")
            );
            CREATE INDEX "IDX_RegimenItem__oid_regimenId" ON "RegimenItem" ("oid", "regimenId");
        `)
        queryArray.push(`
            CREATE TABLE "TicketRegimen" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "ticketId" integer NOT NULL,
                "customerId" integer NOT NULL,
                "regimenId" integer NOT NULL,
                "status" smallint NOT NULL DEFAULT '2',
                "paymentMoneyStatus" smallint NOT NULL DEFAULT '1',
                "registeredAt" bigint,
                "completedAt" bigint,
                CONSTRAINT "PK_d90ee5d9c6ca4aab6c4e57d9b70" PRIMARY KEY ("id")
            );
            CREATE INDEX "IDX_TicketRegimen__oid_ticketId" ON "TicketRegimen" ("oid", "ticketId");
            CREATE INDEX "IDX_TicketRegimen__oid_registeredAt" ON "TicketRegimen" ("oid", "registeredAt");
        `)
        queryArray.push(`
            CREATE TABLE "TicketRegimenItem" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "ticketId" integer NOT NULL,
                "customerId" integer NOT NULL,
                "ticketRegimenId" integer NOT NULL,
                "regimenItemId" integer NOT NULL,
                "regimenId" integer NOT NULL,
                "procedureId" integer NOT NULL,
                "status" smallint NOT NULL DEFAULT '2',
                "completedAt" bigint,
                CONSTRAINT "PK_c65db5965d4c1fe9631323410a1" PRIMARY KEY ("id")
            );
            CREATE INDEX "IDX_TicketRegimenItem__oid_ticketId" ON "TicketRegimenItem" ("oid", "ticketId");
        `)

        queryArray.push(`
            ALTER TABLE "Procedure" 
                DROP COLUMN "quantityDefault",
                DROP COLUMN "procedureType",
                DROP COLUMN "gapHours",
                DROP COLUMN "consumablesHint";
            ALTER TABLE "Procedure" DROP CONSTRAINT "UNIQUE_Procedure__oid_procedureCode";
            ALTER TABLE "Procedure" RENAME COLUMN "procedureCode" TO "code";
            ALTER TABLE "Procedure" ADD CONSTRAINT "UNIQUE_Procedure__oid_code" UNIQUE ("oid", "code");
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
            ALTER TABLE "PaymentMethod" DROP COLUMN "priority";
            ALTER TABLE "PaymentMethod" ADD "code" character varying(50) NOT NULL DEFAULT '';

            UPDATE  "PaymentMethod" SET     "code" = "id";

            ALTER TABLE "PaymentMethod" ALTER COLUMN "code" DROP DEFAULT;
            ALTER TABLE "PaymentMethod"
                ADD CONSTRAINT "UNIQUE_PaymentMethod__oid_code" UNIQUE ("oid", "code");
        `)

        queryArray.push(`
            ALTER TABLE "Room" ADD "roomStyle" smallint NOT NULL DEFAULT '0';
            ALTER TABLE "Room" RENAME COLUMN "roomCode" TO "code";
        `)
        await queryRunner.query(queryArray.join(''))
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

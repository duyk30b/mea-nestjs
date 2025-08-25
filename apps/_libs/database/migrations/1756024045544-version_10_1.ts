import { MigrationInterface, QueryRunner } from 'typeorm'

enum TicketStatus {
    Schedule = 1,
    Draft = 2,
    Deposited = 3,
    Executing = 4,
    Debt = 5,
    Completed = 6,
    Cancelled = 7,
}

enum TicketProcedureStatus {
    Empty = 1,
    Pending = 2,
    Executing = 3,
    Completed = 4,
}

export class Version1011756024045544 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            await queryRunner.query(`
                ALTER TABLE "Room"
                    RENAME COLUMN "roomInteractType" TO "roomType";
                `)

            await queryRunner.query(`
                DELETE FROM "TicketProcedure" tp
                    WHERE NOT EXISTS ( SELECT 1 FROM "Ticket" t WHERE t.id = tp."ticketId" );
                    
                UPDATE "Ticket"
                    SET "registeredAt" = "updatedAt"
                    WHERE "registeredAt" IS NULL;

                ALTER TABLE "TicketProcedure"
                    RENAME COLUMN "startedAt" TO "createdAt";

                UPDATE  "TicketProcedure"
                SET     "createdAt" = "Ticket"."registeredAt",
                        "status"    =   CASE 
                                            WHEN("Ticket"."status" = ${TicketStatus.Debt}) 
                                                THEN ${TicketProcedureStatus.Completed}
                                            WHEN("Ticket"."status" = ${TicketStatus.Completed}) 
                                                THEN ${TicketProcedureStatus.Completed}
                                            ELSE "TicketProcedure"."status"
                                        END
                FROM    "Ticket"
                WHERE   "Ticket"."id" = "TicketProcedure"."ticketId";

                ALTER TABLE "TicketProcedure"
                    ALTER COLUMN "createdAt" SET NOT NULL;
                CREATE INDEX "IDX_TicketProcedure__oid_createdAt" 
                    ON "TicketProcedure" ("oid", "createdAt");
                `)

            await queryRunner.query(`
                DROP INDEX "public"."IDX_TicketLaboratoryGroup__oid_registeredAt";

                ALTER TABLE "TicketLaboratoryGroup" RENAME COLUMN "registeredAt" TO "createdAt";
                ALTER TABLE "TicketLaboratoryGroup" RENAME COLUMN "startedAt" TO "completedAt";

                ALTER TABLE "TicketLaboratoryGroup" ALTER COLUMN "createdAt" SET NOT NULL;

                CREATE INDEX "IDX_TicketLaboratoryGroup__oid_createdAt" 
                    ON "TicketLaboratoryGroup" ("oid", "createdAt");
                `)

            await queryRunner.query(`
                DROP INDEX "public"."IDX_TicketLaboratory__oid_startedAt";

                ALTER TABLE "TicketLaboratory" RENAME COLUMN "startedAt" TO "createdAt";
                ALTER TABLE "TicketLaboratory" ADD "completedAt" bigint;

                UPDATE  "TicketLaboratory"
                SET     "createdAt" = "Ticket"."registeredAt"
                FROM    "Ticket"
                WHERE   "Ticket"."id" = "TicketLaboratory"."ticketId";

                ALTER TABLE "TicketLaboratory" ALTER COLUMN "createdAt" SET NOT NULL;
                
                CREATE INDEX "IDX_TicketLaboratory__oid_createdAt" 
                    ON "TicketLaboratory" ("oid", "createdAt");
                `)

            await queryRunner.query(`
                DROP INDEX "public"."IDX_TicketRadiology__oid_registeredAt";

                ALTER TABLE "TicketRadiology" RENAME COLUMN "registeredAt" TO "createdAt";
                ALTER TABLE "TicketRadiology" RENAME COLUMN "startedAt" TO "completedAt";

                ALTER TABLE "TicketRadiology" ALTER COLUMN "createdAt" SET NOT NULL;
                ALTER TABLE "TicketRadiology" ALTER COLUMN "createdAt" DROP DEFAULT;

                CREATE INDEX "IDX_TicketRadiology__oid_createdAt" 
                    ON "TicketRadiology" ("oid", "createdAt");
                `)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

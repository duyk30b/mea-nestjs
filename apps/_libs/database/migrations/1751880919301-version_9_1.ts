import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version911751880919301 implements MigrationInterface {
    name = 'Version911751880919301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "TicketRadiology"
                ADD "registeredAt" bigint DEFAULT '0';

            DROP INDEX "public"."IDX_TicketRadiology__oid_startedAt";
            CREATE INDEX "IDX_TicketRadiology__oid_registeredAt" 
                ON "TicketRadiology" ("oid", "registeredAt")
        `)
        await queryRunner.query(`
            DROP INDEX "public"."IDX_TicketLaboratoryGroup__oid_startedAt";
            CREATE INDEX "IDX_TicketLaboratoryGroup__oid_registeredAt" 
                ON "TicketLaboratoryGroup" ("oid", "registeredAt")
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

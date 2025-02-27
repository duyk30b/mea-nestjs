import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version711740668273673 implements MigrationInterface {
  name = 'Version711740668273673'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "Laboratory"
                ADD "costPrice" integer NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE "Radiology"
                ADD "costPrice" integer NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE "TicketLaboratory"
                ADD "costPrice" bigint NOT NULL DEFAULT '0';

            CREATE INDEX "IDX_TicketLaboratory__oid_startedAt" 
                ON "TicketLaboratory" ("oid", "startedAt");
        `)
    await queryRunner.query(`
            ALTER TABLE "TicketRadiology"
                ADD "costPrice" bigint NOT NULL DEFAULT '0';

            CREATE INDEX "IDX_TicketRadiology__oid_startedAt" 
                ON "TicketRadiology" ("oid", "startedAt");

        `)
    await queryRunner.query(`
            ALTER TABLE "Ticket"
                ADD "customType" smallint NOT NULL DEFAULT '0';
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

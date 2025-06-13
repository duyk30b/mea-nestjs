import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version961752472376715 implements MigrationInterface {
    name = 'Version961752472376715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "PrintHtml"
                ADD "priority" integer NOT NULL DEFAULT '0'
        `)
        await queryRunner.query(`
            ALTER TABLE "RadiologySample"
                ADD "userId" integer NOT NULL DEFAULT '0',
                ADD "priority" integer NOT NULL DEFAULT '0'
        `)

        await queryRunner.query(`
            ALTER TABLE "PrescriptionSample"
            ADD "userId" integer NOT NULL DEFAULT '0'
        `)

        await queryRunner.query(`
            ALTER TABLE "TicketRadiology"
                ADD "printHtmlId" integer NOT NULL DEFAULT '0',
                ADD "customStyles" text NOT NULL DEFAULT '',
                ADD "customVariables" text NOT NULL DEFAULT '';
                
            UPDATE  "TicketRadiology" "tr"
                SET     "printHtmlId" = "radiology"."printHtmlId"
                FROM    "Radiology" "radiology"
                WHERE   "tr"."radiologyId" = "radiology"."id"
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

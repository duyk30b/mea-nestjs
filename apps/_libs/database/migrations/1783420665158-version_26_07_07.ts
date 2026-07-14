import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version2607071783420665158 implements MigrationInterface {
    name = 'Version2607071783420665158'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()
        try {
            await queryRunner.query(`
                CREATE TABLE "Attribute" (
                    "key" character varying(255) NOT NULL,
                    "description" character varying NOT NULL DEFAULT '',
                    "valueExample" character varying NOT NULL DEFAULT '',
                    CONSTRAINT "PK_ed5738b985f8bcc93d5b845138c" PRIMARY KEY ("key")
                )
            `)

            await queryRunner.query(`
                ALTER TABLE "LaboratoryGroup"
                    RENAME COLUMN "printHtmlId" TO "templateHtmlId";
                ALTER TABLE "Radiology"
                    RENAME COLUMN "printHtmlId" TO "templateHtmlId";
                ALTER TABLE "TicketRadiology"
                    RENAME COLUMN "printHtmlId" TO "templateHtmlId";
                ALTER TABLE "RadiologySample"
                    RENAME COLUMN "printHtmlId" TO "templateHtmlId"
            `)

            await queryRunner.query(`
                ALTER TABLE "PrintHtml" RENAME TO "TemplateHtml";
                ALTER SEQUENCE "PrintHtml_id_seq" RENAME TO "TemplateHtml_id_seq";

                ALTER TABLE "TemplateHtml"
                    RENAME COLUMN "printHtmlType" TO "templateHtmlType";
                ALTER TABLE "TemplateHtml"
                    RENAME COLUMN "html" TO "htmlPrint";
                ALTER TABLE "TemplateHtml"
                    RENAME COLUMN "css" TO "cssPrint";

                ALTER TABLE "TemplateHtml"
                    ADD "htmlInput" text NOT NULL DEFAULT '',
                    ADD "jsInput" text NOT NULL DEFAULT '';
            `)

            await queryRunner.query(`
                ALTER TABLE "PrintHtmlSetting" RENAME TO "PrintSetting";
                ALTER SEQUENCE "PrintHtmlSetting_id_seq" RENAME TO "PrintSetting_id_seq";

                ALTER TABLE "PrintSetting"
                    RENAME COLUMN "printHtmlType" TO "templateHtmlType";
                ALTER TABLE "PrintSetting"
                    RENAME COLUMN "printHtmlId" TO "templateHtmlId";
            `)

            await queryRunner.query(`
                ALTER TABLE "Room"
                    ADD "roomSetting" text NOT NULL DEFAULT '{}';

                UPDATE  "Room"
                SET     "roomType" = 2
                WHERE   "roomType" = 1 AND "roomStyle" != 111;

                ALTER TABLE "Room" DROP COLUMN "roomStyle";
            `)

            await queryRunner.query(`
                UPDATE  "TicketProduct"
                SET     "pickupStrategy" = CASE 
                            WHEN("pickupStrategy" = -1) THEN 0
                            WHEN("pickupStrategy" = 0) THEN 1
                            WHEN("pickupStrategy" = 1) THEN 2
                            WHEN("pickupStrategy" = 2) THEN 3
                            WHEN("pickupStrategy" = 3) THEN 4
                            ELSE 0
                        END;
            `)

            await queryRunner.query(`
                UPDATE "TicketAttribute"
                SET "value" = REPLACE("value", 'T17:00:00.000Z', '')
                WHERE "oid" = 27 AND "value" LIKE '%T17:00:00.000Z';
            `)

            await queryRunner.commitTransaction()
        }
        catch (error: any) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "Attribute"
        `)

        await queryRunner.query(`
            ALTER TABLE "RadiologySample"
                RENAME COLUMN "templateHtmlId" TO "printHtmlId";
            ALTER TABLE "TicketRadiology"
                RENAME COLUMN "templateHtmlId" TO "printHtmlId";
            ALTER TABLE "Radiology"
                RENAME COLUMN "templateHtmlId" TO "printHtmlId";
            ALTER TABLE "LaboratoryGroup"
                RENAME COLUMN "templateHtmlId" TO "printHtmlId"
        `)
    }
}

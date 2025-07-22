import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version951753207412569 implements MigrationInterface {
    name = 'Version951753207412569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "PrintHtml"
                ADD "printHtmlType" integer NOT NULL DEFAULT '0',
                ADD "isDefault" smallint NOT NULL DEFAULT '0';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }
}

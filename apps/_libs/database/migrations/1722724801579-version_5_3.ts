import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version531722724801579 implements MigrationInterface {
    name = 'Version531722724801579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Organization"
                ADD "emailVerify" smallint NOT NULL DEFAULT '0',
                ADD "dataVersion" smallint NOT NULL DEFAULT '1'
            `)
        await queryRunner.query(`
            ALTER TABLE "Organization"
                ALTER COLUMN "email" DROP NOT NULL
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Organization"
                ALTER COLUMN "email" SET NOT NULL
        `)
        await queryRunner.query(`
            ALTER TABLE "Organization" 
                DROP COLUMN "dataVersion",
                DROP COLUMN "emailVerify"
        `)
    }
}

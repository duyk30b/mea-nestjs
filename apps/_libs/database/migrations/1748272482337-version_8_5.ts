import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version851748272482337 implements MigrationInterface {
    name = 'Version851748272482337'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Organization"
                ADD "facebook" character varying(255) NOT NULL DEFAULT '';
        `)
        await queryRunner.query(`
            ALTER TABLE "Customer"
                ADD "facebook" character varying(255) NOT NULL DEFAULT '',
                ADD "zalo" character varying(255) NOT NULL DEFAULT '';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Customer" DROP COLUMN "zalo";
            ALTER TABLE "Customer" DROP COLUMN "facebook";
        `)
        await queryRunner.query(`
            ALTER TABLE "Organization" DROP COLUMN "facebook"
        `)
    }
}

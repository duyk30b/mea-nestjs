import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version921751967307920 implements MigrationInterface {
    name = 'Version921751967307920'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "Address" (
                "id" SERIAL NOT NULL,
                "province" character varying(100) NOT NULL DEFAULT '',
                "ward" character varying(100) NOT NULL DEFAULT '',
                CONSTRAINT "PK_9034683839599c80ebe9ebb0891" PRIMARY KEY ("id")
            )
        `)
        await queryRunner.query(`
            ALTER TABLE "Distributor" DROP COLUMN "addressDistrict"
        `)
        await queryRunner.query(`
            ALTER TABLE "Organization" DROP COLUMN "addressDistrict"
        `)
        await queryRunner.query(`
            ALTER TABLE "Customer" DROP COLUMN "addressDistrict"
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }
}

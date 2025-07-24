import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version961753319732491 implements MigrationInterface {
    name = 'Version961753319732491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Image" RENAME COLUMN "hostId" TO "externalId";
            ALTER TABLE "Image"
            ADD "externalUrl" character varying(255) NOT NULL DEFAULT ''
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

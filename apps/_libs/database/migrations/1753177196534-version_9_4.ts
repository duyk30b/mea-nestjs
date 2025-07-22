import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version941753177196534 implements MigrationInterface {
    name = 'Version941753177196534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "User"
            ADD "imageIds" character varying(100) NOT NULL DEFAULT '[]'
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

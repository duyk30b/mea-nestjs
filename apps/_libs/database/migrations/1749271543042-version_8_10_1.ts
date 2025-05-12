import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version81011749271543042 implements MigrationInterface {
    name = 'Version81011749271543042'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "ReceiptItem"
                ADD "listPrice" bigint NOT NULL DEFAULT '0'
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

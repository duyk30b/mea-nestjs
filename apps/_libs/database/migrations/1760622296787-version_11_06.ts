import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version11061760622296787 implements MigrationInterface {
    name = 'Version11061760622296787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            await queryRunner.query(`
                ALTER TABLE "Customer"
                    ADD "citizenIdCard" character varying(20) NOT NULL DEFAULT '';
            `)

            await queryRunner.query(`
                UPDATE "TicketAttribute" SET key = 'NhanAp_MP' WHERE key = 'NhanAp_MP_mmHg';
                UPDATE "TicketAttribute" SET key = 'NhanAp_MT' WHERE key = 'NhanAp_MT_mmHg';
            `)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

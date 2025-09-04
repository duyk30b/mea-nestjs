import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version1041757004860171 implements MigrationInterface {
    name = 'Version1041757004860171'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            await queryRunner.query(`
                ALTER TABLE "Ticket"
                    RENAME COLUMN "imageIds" TO "imageDiagnosisIds"
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketProcedure"
                    RENAME COLUMN "type" TO "procedureType"
            `)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version571731070851291 implements MigrationInterface {
    name = 'Version571731070851291'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Ticket"
                RENAME COLUMN "voucherType" TO "ticketType"
        `)
        await queryRunner.query(`
            ALTER TABLE "Appointment" DROP COLUMN "voucherType"
        `)
        await queryRunner.query(`
            UPDATE  "BatchMovement" "u"
                SET     "voucherType" = CASE 
                            WHEN("voucherType" = 1) THEN 1
                            WHEN("voucherType" = 2) THEN 2
                            WHEN("voucherType" = 3) THEN 2
                            ELSE 0
                        END;
        `)
        await queryRunner.query(`
            UPDATE  "ProductMovement" "u"
                SET     "voucherType" = CASE 
                            WHEN("voucherType" = 1) THEN 1
                            WHEN("voucherType" = 2) THEN 2
                            WHEN("voucherType" = 3) THEN 2
                            ELSE 0
                        END;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }
}

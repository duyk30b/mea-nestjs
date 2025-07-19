import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version931752914016722 implements MigrationInterface {
    name = 'Version931752914016722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const queryArray: string[] = []

        queryArray.push(`
            UPDATE  "TicketLaboratoryGroup" 
            SET     "status" = CASE 
                        WHEN("status" = 2) THEN 3
                        WHEN("status" = 3) THEN 4
                        ELSE 0
                    END;
            UPDATE  "TicketLaboratory" 
            SET     "status" = CASE 
                        WHEN("status" = 2) THEN 3
                        WHEN("status" = 3) THEN 4
                        ELSE 0
                    END;
        `)

        queryArray.push(`
            ALTER TABLE "Payment" RENAME TO "PaymentItem";
            ALTER SEQUENCE "Payment_id_seq" RENAME TO "PaymentItem_id_seq";
        `)

        await queryRunner.query(queryArray.join(''))
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

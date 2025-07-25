import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version9711753467436976 implements MigrationInterface {
    name = 'Version9711753467436976'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const queryArray: string[] = []
        queryArray.push(`
            ALTER TABLE "PaymentItem"
                ADD "expectedPrice" bigint NOT NULL DEFAULT '0',
                ADD "actualPrice" bigint NOT NULL DEFAULT '0',
                ADD "discountMoney" bigint NOT NULL DEFAULT '0',
                ADD "discountPercent" numeric(7, 3) NOT NULL DEFAULT '0',
                ADD "quantity" integer NOT NULL DEFAULT '1';

            UPDATE "PaymentItem"
                SET     "expectedPrice" = "paidAmount",
                        "actualPrice"   = "paidAmount",
                        "quantity"      = 1;
        `)
        queryArray.push(queryArray.join(''))
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

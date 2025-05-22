import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version831747803221451 implements MigrationInterface {
    name = 'Version831747803221451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "PaymentMethod" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "priority" integer NOT NULL DEFAULT '1',
                "name" character varying NOT NULL,
                "isActive" smallint NOT NULL DEFAULT '1',
                CONSTRAINT "PK_0480b49ef167d813dc1150d7dec" PRIMARY KEY ("id")
            )
        `)
        await queryRunner.query(`
            ALTER TABLE "CustomerPayment"
                ADD "paymentMethodId" integer NOT NULL DEFAULT '0';
            CREATE INDEX "IDX_CustomerPayment__oid_paymentMethodId" ON "CustomerPayment" ("oid", "paymentMethodId")
        `)
        await queryRunner.query(`
            ALTER TABLE "DistributorPayment"
                ADD "paymentMethodId" integer NOT NULL DEFAULT '0'
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_CustomerPayment__oid_paymentMethodId"
        `)
        await queryRunner.query(`
            ALTER TABLE "DistributorPayment" DROP COLUMN "paymentMethodId"
        `)
        await queryRunner.query(`
            ALTER TABLE "CustomerPayment" DROP COLUMN "paymentMethodId"
        `)
        await queryRunner.query(`
            DROP TABLE "PaymentMethod"
        `)
    }
}

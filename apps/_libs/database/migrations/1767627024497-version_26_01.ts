import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version26011767627024497 implements MigrationInterface {
    name = 'Version26011767627024497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            await queryRunner.query(`
                ALTER TABLE "PurchaseOrder" DROP COLUMN "id2";
                ALTER TABLE "Ticket" DROP COLUMN "id2";
            `)

            await queryRunner.query(`
                DROP INDEX "public"."IDX_OrganizationPayment__oid";

                ALTER TABLE "OrganizationPayment" 
                    DROP COLUMN "oid",
                    DROP COLUMN "payment";

                ALTER TABLE "OrganizationPayment"
                    ADD "oid" integer NOT NULL,
                    ADD "money" integer NOT NULL DEFAULT '0',
                    ADD "expiryAt" bigint NOT NULL;

                CREATE INDEX "IDX_OrganizationPayment__oid" ON "OrganizationPayment" ("oid");
            `)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

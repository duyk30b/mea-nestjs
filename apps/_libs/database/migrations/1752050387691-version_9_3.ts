import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version931752050387691 implements MigrationInterface {
    name = 'Version931752050387691'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "ICD" (
                "id" SERIAL NOT NULL,
                "code" character varying(25) NOT NULL DEFAULT '',
                "name" character varying NOT NULL DEFAULT '',
                CONSTRAINT "PK_1b8018881f5d76b6f5dff9234dd" PRIMARY KEY ("id")
            )
        `)
        await queryRunner.query(`
            CREATE TABLE "Discount" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "isActive" smallint NOT NULL DEFAULT '1',
                "priority" integer NOT NULL DEFAULT '0',
                "discountInteractType" smallint NOT NULL DEFAULT '1',
                "discountInteractId" integer NOT NULL DEFAULT '0',
                "discountMoney" bigint NOT NULL DEFAULT '0',
                "discountPercent" numeric(7, 3) NOT NULL DEFAULT '0',
                "discountType" character varying(25) NOT NULL DEFAULT '%',
                "discountRepeatType" smallint NOT NULL DEFAULT '2',
                "periodsDay" character varying(255) NOT NULL,
                "periodsTime" character varying(255) NOT NULL,
                CONSTRAINT "PK_cc96b4ff4199e3766bb660d1157" PRIMARY KEY ("id")
            );

            CREATE INDEX "IDX_Discount__oid_discountInteractType_discountInteractId" ON "Discount" (
                "oid",
                "discountInteractType",
                "discountInteractId"
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

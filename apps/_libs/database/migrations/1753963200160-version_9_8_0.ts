import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version9801753963200160 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "public"."PaymentOld" (
            "id" SERIAL NOT NULL,
            "paymentMethodId" integer DEFAULT '0' NOT NULL,
            "moneyDirection" smallint NOT NULL,
            CONSTRAINT "PK_PaymentOldId" PRIMARY KEY ("id")
        );

        INSERT INTO "PaymentOld" ("id", "paymentMethodId", "moneyDirection") VALUES (1,0,2), (19877,0,1);

        UPDATE  "Payment"
        SET     "paymentMethodId" = "PaymentOld"."paymentMethodId",
                "moneyDirection" = "PaymentOld"."moneyDirection"
        FROM    "PaymentOld"
        WHERE   "Payment"."id" = "PaymentOld"."id";

        UPDATE  "Payment"
        SET     "paymentMethodId" = CASE 
                        WHEN("paidAmount" = 0) THEN 0
                        ELSE "paymentMethodId"
                    END,
                "moneyDirection" = CASE 
                        WHEN("paidAmount" = 0) THEN 0
                        ELSE "moneyDirection"
                    END;

        DROP TABLE "PaymentOld" CASCADE;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> { }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version26031768449717952 implements MigrationInterface {
    name = 'Version26031768449717952'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            await queryRunner.query(`
                ALTER TABLE "PurchaseOrderItem"
                    ADD "unitListPrice" bigint NOT NULL DEFAULT '0',
                    ADD "unitCostPrice" bigint NOT NULL DEFAULT '0',
                    ADD "unitQuantity" integer NOT NULL DEFAULT '0';

                UPDATE  "PurchaseOrderItem"
                SET     "unitListPrice"     = "listPrice" * "unitRate",
                        "unitCostPrice"     = "costPrice" * "unitRate",
                        "unitQuantity"      = "quantity" / "unitRate";
                    
                ALTER TABLE "PurchaseOrderItem" 
                    DROP COLUMN "listPrice",
                    DROP COLUMN "costPrice",
                    DROP COLUMN "quantity";
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketProduct"
                    ADD "unitQuantityPrescription" integer NOT NULL DEFAULT '0',
                    ADD "unitQuantity" integer NOT NULL DEFAULT '0',
                    ADD "unitExpectedPrice" bigint NOT NULL DEFAULT '0',
                    ADD "unitDiscountMoney" bigint NOT NULL DEFAULT '0',
                    ADD "unitActualPrice" bigint NOT NULL DEFAULT '0';

                UPDATE  "TicketProduct"
                SET     "unitQuantityPrescription"  = "quantityPrescription" / "unitRate",
                        "unitQuantity"              = "quantity" / "unitRate",
                        "unitExpectedPrice"         = "expectedPrice" * "unitRate",
                        "unitDiscountMoney"         = "discountMoney" * "unitRate",
                        "unitActualPrice"           = "actualPrice" * "unitRate";

                ALTER TABLE "TicketProduct" 
                    DROP COLUMN "quantityPrescription",
                    DROP COLUMN "quantity",
                    DROP COLUMN "expectedPrice",
                    DROP COLUMN "discountMoney",
                    DROP COLUMN "actualPrice";
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketBatch"
                    ADD "unitQuantity" integer NOT NULL DEFAULT '0',
                    ADD "unitExpectedPrice" bigint NOT NULL DEFAULT '0',
                    ADD "unitActualPrice" bigint NOT NULL DEFAULT '0';

                UPDATE  "TicketBatch"
                SET     "unitQuantity"              = "quantity" / "unitRate",
                        "unitExpectedPrice"         = "expectedPrice" * "unitRate",
                        "unitActualPrice"           = "actualPrice" * "unitRate";

                ALTER TABLE "TicketBatch" 
                    DROP COLUMN "quantity",
                    DROP COLUMN "expectedPrice",
                    DROP COLUMN "actualPrice";
            `)

            await queryRunner.query(`
                ALTER TABLE "PaymentTicketItem"
                    ADD "unitRate" integer NOT NULL DEFAULT '1'
            `)

            await queryRunner.query(`
                TRUNCATE TABLE "PrescriptionSample";
                ALTER TABLE "PrescriptionSample" 
                    DROP CONSTRAINT "PK_b628159e31fff01febe74dda3cb";
                ALTER TABLE "PrescriptionSample" 
                    DROP COLUMN "medicines",
                    DROP COLUMN "id";
                ALTER TABLE "PrescriptionSample"
                    ADD "id" bigint NOT NULL;
                ALTER TABLE "PrescriptionSample"
                    ADD CONSTRAINT "PK_PrescriptionSample_id" PRIMARY KEY ("id")
            `)

            await queryRunner.query(`
                CREATE TABLE "PrescriptionSampleItem" (
                    "oid" integer NOT NULL,
                    "id" bigint NOT NULL,
                    "prescriptionSampleId" bigint NOT NULL,
                    "priority" integer NOT NULL DEFAULT '1',
                    "productId" integer NOT NULL DEFAULT '0',
                    "unitQuantity" integer NOT NULL DEFAULT '1',
                    "unitRate" integer NOT NULL DEFAULT '1',
                    "hintUsage" text NOT NULL DEFAULT '',
                    CONSTRAINT "PK_PrescriptionSampleItem_id" PRIMARY KEY ("id", "prescriptionSampleId")
                )
            `)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

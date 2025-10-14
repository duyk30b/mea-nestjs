import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version11041760406448747 implements MigrationInterface {
    name = 'Version11041760406448747'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            await queryRunner.query(`
                ALTER TABLE "TicketRegimen"
                    ADD "moneyAmountWallet" integer NOT NULL DEFAULT '0';
                ALTER TABLE "TicketRegimen" 
                    RENAME COLUMN "moneyAmountRegular" TO "expectedPrice";
                ALTER TABLE "TicketRegimen" 
                    RENAME COLUMN "moneyAmountSale" TO "actualPrice";
            `)

            await queryRunner.query(`
                ALTER TABLE "TicketRegimenItem" 
                    DROP COLUMN "quantityPaid",
                    DROP COLUMN "moneyAmountPaid";
            `)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

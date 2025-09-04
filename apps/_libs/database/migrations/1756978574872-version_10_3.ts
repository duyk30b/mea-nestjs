import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version1031756978574872 implements MigrationInterface {
    name = 'Version1031756978574872'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction()

        try {
            await queryRunner.query(`
                ALTER TABLE "Image" 
                    DROP COLUMN "customerId";

                ALTER TABLE "Image"
                    ADD "imageInteractType" character varying(25) NOT NULL DEFAULT '3',
                    ADD "imageInteractId" integer NOT NULL DEFAULT '0',
                    ADD "ticketItemId" integer NOT NULL DEFAULT '0',
                    ADD "ticketItemChildId" integer NOT NULL DEFAULT '0';

                CREATE INDEX "IDX_Image__oid_imageInteractType_imageInteractId_ticketId" ON "Image" (
                    "oid",
                    "imageInteractType",
                    "imageInteractId",
                    "ticketId"
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

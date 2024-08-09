import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version541723116221727 implements MigrationInterface {
    name = 'Version541723116221727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "Appointment" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "customerId" integer NOT NULL,
                "registeredAt" bigint NOT NULL,
                "appointmentType" smallint NOT NULL DEFAULT '1',
                "appointmentStatus" smallint NOT NULL DEFAULT '1',
                "reason" character varying(255),
                CONSTRAINT "PK_b4c282a5c7803f8bd875bc6c4d5" PRIMARY KEY ("id")
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "Appointment"
        `)
    }
}

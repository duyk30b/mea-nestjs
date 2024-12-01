import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version5131732870085786 implements MigrationInterface {
    name = 'Version5131732870085786'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Customer"
                ADD "yearOfBirth" smallint
        `)

        await queryRunner.query(`
            CREATE TABLE "PrescriptionSample" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "priority" integer NOT NULL DEFAULT '1',
                "name" character varying(255) NOT NULL,
                "medicines" text NOT NULL DEFAULT '[]',
                CONSTRAINT "PK_b628159e31fff01febe74dda3cb" PRIMARY KEY ("id")
            )
        `)
        await queryRunner.query(`
            CREATE TABLE "LaboratoryKit" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "priority" integer NOT NULL DEFAULT '1',
                "name" character varying(255) NOT NULL,
                "laboratoryIds" text NOT NULL DEFAULT '[]',
                CONSTRAINT "PK_eb5f357c988c94d0d2fff9ad246" PRIMARY KEY ("id")
            )
        `)
        await queryRunner.query(`
            ALTER TABLE "Laboratory"
                ADD "priority" integer NOT NULL DEFAULT '1';
        `)

        await queryRunner.query(`
            UPDATE "Appointment" SET reason = '' WHERE reason IS NULL;
            ALTER TABLE "Appointment" ALTER COLUMN "reason" SET NOT NULL;
            ALTER TABLE "Appointment" ALTER COLUMN "reason" SET DEFAULT '';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }
}

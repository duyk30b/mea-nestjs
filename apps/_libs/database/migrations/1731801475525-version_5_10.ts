import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version5101731801475525 implements MigrationInterface {
    name = 'Version5101731801475525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "LaboratoryGroup" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                CONSTRAINT "PK_67a026b08be18f9c77b5a5f055f" PRIMARY KEY ("id")
            )
        `)
        await queryRunner.query(`
            CREATE TABLE "Laboratory" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "laboratoryGroupId" integer NOT NULL DEFAULT '0',
                "level" smallint NOT NULL DEFAULT '1',
                "price" integer,
                "minValue" numeric(7, 3),
                "maxValue" numeric(7, 3),
                "unit" character varying(25) NOT NULL,
                CONSTRAINT "PK_61b5650915b01e38f26c5327172" PRIMARY KEY ("id")
            )
        `)
        await queryRunner.query(`
            ALTER TABLE "Radiology"
                ADD "priority" integer NOT NULL DEFAULT '1',
                ADD "requestNoteDefault" character varying(255) NOT NULL DEFAULT ''
        `)
        await queryRunner.query(`
            ALTER TABLE "ProcedureGroup" DROP COLUMN "updatedAt"
        `)
        await queryRunner.query(`
            ALTER TABLE "RadiologyGroup" DROP COLUMN "updatedAt"
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

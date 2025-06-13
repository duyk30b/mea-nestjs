import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version941752211318937 implements MigrationInterface {
    name = 'Version941752211318937'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Procedure"
                ADD "procedureCode" character varying(50) NOT NULL DEFAULT '';
            UPDATE      "Procedure"  SET "procedureCode" = "id";
            ALTER TABLE "Procedure"
                ALTER COLUMN "procedureCode" DROP DEFAULT;
            ALTER TABLE "Procedure"
                ADD CONSTRAINT "UNIQUE_Procedure__oid_procedureCode" UNIQUE ("oid", "procedureCode")
        `)
        await queryRunner.query(`
            ALTER TABLE "Laboratory"
                ADD "laboratoryCode" character varying(50) NOT NULL DEFAULT '';
            UPDATE      "Laboratory"  SET "laboratoryCode" = "id";
            ALTER TABLE "Laboratory"
                ALTER COLUMN "laboratoryCode" DROP DEFAULT;
            ALTER TABLE "Laboratory"
                ADD CONSTRAINT "UNIQUE_Laboratory__oid_laboratoryCode" UNIQUE ("oid", "laboratoryCode")
        `)

        await queryRunner.query(`
            ALTER TABLE "Radiology" DROP COLUMN "priority";
            ALTER TABLE "Radiology"
                ADD "radiologyCode" character varying(50) NOT NULL DEFAULT '';
            UPDATE      "Radiology"  SET "radiologyCode" = "id";
            ALTER TABLE "Radiology"
                ALTER COLUMN "radiologyCode" DROP DEFAULT;
            ALTER TABLE "Radiology"
                ADD CONSTRAINT "UNIQUE_Radiology__oid_radiologyCode" UNIQUE ("oid", "radiologyCode");
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version411719138744671 implements MigrationInterface {
  name = 'Version411719138744671'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "Image" (
            "oid" integer NOT NULL,
            "id" SERIAL NOT NULL,
            "name" character varying(50) NOT NULL,
            "size" integer NOT NULL,
            "mimeType" character varying(100) NOT NULL,
            "hostType" character varying(50) NOT NULL DEFAULT 'GoogleDriver',
            "hostAccount" character varying(50) NOT NULL,
            "hostId" character varying(50) NOT NULL,
            "waitDelete" smallint NOT NULL DEFAULT '0',
            CONSTRAINT "PK_ddecd6b02f6dd0d3d10a0a74717" PRIMARY KEY ("id")
        )
    `)
    await queryRunner.query(`
        CREATE TABLE "Radiology" (
            "oid" integer NOT NULL,
            "id" SERIAL NOT NULL,
            "name" character varying(50) NOT NULL,
            "price" integer,
            "descriptionDefault" text NOT NULL DEFAULT '',
            "resultDefault" text NOT NULL DEFAULT '',
            "updatedAt" bigint NOT NULL DEFAULT (
                EXTRACT(
                    epoch
                    FROM now()
                ) * (1000)
            ),
            "deletedAt" bigint,
            CONSTRAINT "PK_73221f9dce01012a68295e2ffce" PRIMARY KEY ("id")
        )
    `)

    await queryRunner.query(`
        CREATE TABLE "VisitRadiology" (
            "oid" integer NOT NULL,
            "id" SERIAL NOT NULL,
            "visitId" integer NOT NULL,
            "customerId" integer NOT NULL,
            "radiologyId" integer NOT NULL,
            "doctorId" integer NOT NULL DEFAULT '0',
            "expectedPrice" bigint NOT NULL DEFAULT '0',
            "discountMoney" bigint NOT NULL DEFAULT '0',
            "discountPercent" numeric(7, 3) NOT NULL DEFAULT '0',
            "discountType" character varying(25) NOT NULL DEFAULT 'VNĐ',
            "actualPrice" bigint NOT NULL DEFAULT '0',
            "startedAt" bigint,
            "description" text NOT NULL DEFAULT '',
            "result" text NOT NULL DEFAULT '',
            "imageIds" character varying(100) NOT NULL DEFAULT '[]',
            CONSTRAINT "PK_11e8b3260073d3f57fb47efeb23" PRIMARY KEY ("id")
        )
    `)
    await queryRunner.query(`
        CREATE INDEX "IDX_VisitRadiology__oid_radiologyId" 
            ON "VisitRadiology" ("oid", "radiologyId")
    `)
    await queryRunner.query(`
        CREATE INDEX "IDX_VisitRadiology__oid_visitId" 
            ON "VisitRadiology" ("oid", "visitId")
    `)

    await queryRunner.query(`
        ALTER TABLE "VisitDiagnosis"
        ADD "imageIds" character varying(100) NOT NULL DEFAULT '[]'
    `)

    await queryRunner.query(`
        ALTER TABLE "Visit"
        ADD "radiologyMoney" bigint NOT NULL DEFAULT '0'
    `)

    await queryRunner.query(`
        DROP INDEX "public"."IDX_OrganizationSetting__type";
    `)
    await queryRunner.query(`
        ALTER TABLE "OrganizationSetting" RENAME TO "Setting";
        ALTER SEQUENCE "OrganizationSetting_id_seq" RENAME TO "Setting_id_seq"
    `)
    await queryRunner.query(`
        ALTER TABLE "Setting" RENAME COLUMN "type" TO "key";
    `)
    await queryRunner.query(`
        CREATE UNIQUE INDEX "IDX_Setting__oid_key" ON "Setting" ("oid", "key")
    `)

    await queryRunner.query(`
        UPDATE  "Organization" "org"
        SET     "id" = 4
        WHERE   "org"."id" = 1
    `)
    await queryRunner.query(`
        UPDATE  "Organization" "org"
        SET     "id" = 1
        WHERE   "org"."id" = 0
    `)
    await queryRunner.query(`
        UPDATE  "User" "u"
        SET     "id" = 4, "oid" = 4
        WHERE   "u"."id" = 1
    `)
    await queryRunner.query(`
        UPDATE  "User" "u"
        SET     "id" = 1, "oid" = 1
        WHERE   "u"."id" = 0
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

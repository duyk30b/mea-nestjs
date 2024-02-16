import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version321706347158382 implements MigrationInterface {
  name = 'Version321706347158382'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_EMPLOYEE__OID_USERNAME"
        `)
    await queryRunner.query(`
            CREATE TABLE "Role" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "permissionIds" text NOT NULL DEFAULT '[]',
                "isActive" smallint NOT NULL DEFAULT '1',
                "createdAt" bigint NOT NULL DEFAULT (
                    EXTRACT(
                        epoch
                        FROM now()
                    ) * (1000)
                ),
                "updatedAt" bigint NOT NULL DEFAULT (
                    EXTRACT(
                        epoch
                        FROM now()
                    ) * (1000)
                ),
                "deletedAt" bigint,
                CONSTRAINT "PK_9309532197a7397548e341e5536" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
        ALTER TABLE "User" DROP COLUMN "role"
    `)
    await queryRunner.query(`
        ALTER TABLE "User"
            ADD "roleId" integer NOT NULL DEFAULT '1'
    `)
    await queryRunner.query(`
        ALTER TABLE "User"
            RENAME COLUMN "password" TO "hashPassword"
    `)
    await queryRunner.query(`
        ALTER TABLE "Organization"
            ADD "permissionIds" text NOT NULL DEFAULT '[]'
    `)
    await queryRunner.query(`
        CREATE TABLE "Permission" (
            "id" SERIAL NOT NULL,
            "level" smallint NOT NULL,
            "code" character varying(255) NOT NULL,
            "name" character varying(255) NOT NULL,
            "parentId" smallint NOT NULL DEFAULT '0',
            "status" smallint NOT NULL DEFAULT '0',
            "pathId" character varying(255) NOT NULL,
            CONSTRAINT "PK_96c82eedac1e126a1aa90eb0285" PRIMARY KEY ("id")
        )
    `)
    await queryRunner.query(`
        ALTER TABLE "Organization"
            RENAME COLUMN "organizationName" TO "name"
    `)
    await queryRunner.query(`
        ALTER TABLE "Organization" DROP COLUMN "createTime"
    `)
    await queryRunner.query(`
        ALTER TABLE "Organization"
            ADD "createdAt" bigint NOT NULL DEFAULT (
                    EXTRACT(
                        epoch
                        FROM now()
                    ) * (1000)
                )
    `)
    await queryRunner.query(`
        ALTER TABLE "Organization"
            ADD "updatedAt" bigint NOT NULL DEFAULT (
                    EXTRACT(
                        epoch
                        FROM now()
                    ) * (1000)
                )
    `)
    await queryRunner.query(`
        ALTER TABLE "Organization"
            ADD "deletedAt" bigint
    `)
    await queryRunner.query(`
        ALTER TABLE "Organization"
         ADD "isActive" smallint NOT NULL DEFAULT '1'
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "Organization" DROP COLUMN "isActive"
    `)

    await queryRunner.query(`
        ALTER TABLE "Organization" DROP COLUMN "deletedAt"
    `)
    await queryRunner.query(`
        ALTER TABLE "Organization" DROP COLUMN "updatedAt"
    `)
    await queryRunner.query(`
        ALTER TABLE "Organization" DROP COLUMN "createdAt"
    `)
    await queryRunner.query(`
        ALTER TABLE "Organization"
            ADD "createTime" bigint
    `)
    await queryRunner.query(`
        ALTER TABLE "Organization"
            RENAME COLUMN "name" TO "organizationName"
    `)
    await queryRunner.query(`
        DROP TABLE "Permission"
    `)
    await queryRunner.query(`
        ALTER TABLE "Organization" DROP COLUMN "permissionIds"
    `)
    await queryRunner.query(`
        ALTER TABLE "User"
            RENAME COLUMN "hashPassword" TO "password"
    `)
    await queryRunner.query(`
        ALTER TABLE "User" DROP COLUMN "roleId"
    `)
    await queryRunner.query(`
        ALTER TABLE "User"
            ADD "role" smallint NOT NULL DEFAULT '2'
    `)
    await queryRunner.query(`
        DROP TABLE "Role"
    `)
    await queryRunner.query(`
        CREATE UNIQUE INDEX "IDX_EMPLOYEE__OID_USERNAME" ON "User" ("oid", "username")
    `)
  }
}

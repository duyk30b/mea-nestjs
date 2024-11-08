import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version561730977554130 implements MigrationInterface {
    name = 'Version561730977554130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "PrintHtml" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "key" character varying(255) NOT NULL,
                "radiologyId" integer NOT NULL DEFAULT '0',
                "content" text NOT NULL,
                "updatedAt" bigint NOT NULL DEFAULT (
                    EXTRACT(
                        epoch
                        FROM now()
                    ) * (1000)
                ),
                CONSTRAINT "PK_52522553dd60e640d2ef4d44523" PRIMARY KEY ("id")
            )
        `)
        await queryRunner.query(`
            ALTER TABLE "Receipt" DROP COLUMN "deletedAt"
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}

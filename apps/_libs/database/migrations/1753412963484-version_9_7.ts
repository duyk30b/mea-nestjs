import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version971753412963484 implements MigrationInterface {
    name = 'Version971753412963484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const queryArray: string[] = []
        queryArray.push(`
            ALTER TABLE "PrintHtml" DROP COLUMN "isDefault";
        `)

        queryArray.push(`
            CREATE TABLE "PrintHtmlSetting" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "printHtmlType" integer NOT NULL DEFAULT '0',
                "printHtmlId" integer NOT NULL DEFAULT '0',
                CONSTRAINT "PK_0b97a4f4f19825ffb5f45c19cc0" PRIMARY KEY ("id")
            )
        `)
        await queryRunner.query(queryArray.join(''))
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

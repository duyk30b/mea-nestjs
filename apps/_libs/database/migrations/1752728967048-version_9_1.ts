import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version911752728967048 implements MigrationInterface {
    name = 'Version911752728967048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "UserRoom" (
                "oid" integer NOT NULL,
                "id" SERIAL NOT NULL,
                "userId" integer NOT NULL,
                "roomId" integer NOT NULL,
                CONSTRAINT "PK_7fc50213ca8ed029edca2c73f70" PRIMARY KEY ("id")
            )
        `)
        await queryRunner.query(`
            ALTER TABLE "Room" DROP COLUMN "showMenu"
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }
}

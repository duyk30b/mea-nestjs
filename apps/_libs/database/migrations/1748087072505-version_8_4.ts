import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version841748087072505 implements MigrationInterface {
    name = 'Version841748087072505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "Role" SET "displayName" = "name";
                ALTER TABLE "Role" RENAME COLUMN "displayName" TO "roleCode";
        `)

        await queryRunner.query(`
            ALTER TABLE "Radiology"
                ADD "customVariables" text NOT NULL DEFAULT '',
                ADD "customStyles" text NOT NULL DEFAULT '';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}

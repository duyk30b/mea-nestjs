import { MigrationInterface, QueryRunner } from 'typeorm'

export class PermissionIsActiveRootId1707974825881 implements MigrationInterface {
  name = 'PermissionIsActiveRootId1707974825881'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "Permission" DROP COLUMN "status"
        `)
    await queryRunner.query(`
            ALTER TABLE "Permission"
            ADD "rootId" smallint NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE "Permission"
            ADD "isActive" smallint NOT NULL DEFAULT '1'
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "Permission" DROP COLUMN "isActive"
        `)
    await queryRunner.query(`
            ALTER TABLE "Permission" DROP COLUMN "rootId"
        `)
    await queryRunner.query(`
            ALTER TABLE "Permission"
            ADD "status" smallint NOT NULL DEFAULT '0'
        `)
  }
}

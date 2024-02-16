import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTimestampColumnsAndTriggers1704082064570 implements MigrationInterface {
  name = 'AddTimestampColumnsAndTriggers1704082064570'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = ['Customer', 'Product', 'Distributor', 'ProductBatch', 'Procedure', 'User']
    for (const table of tables) {
      await queryRunner.query(`
                ALTER TABLE "${table}"
                    ADD "createdAt" bigint NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
                    ADD "updatedAt" bigint NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
                    ADD "deletedAt" bigint
            `)
    }

    for (const table of tables) {
      await queryRunner.query(`
                CREATE OR REPLACE FUNCTION set_updatedAt_${table}_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW."updatedAt" = EXTRACT(EPOCH FROM NOW()) * 1000;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            `)

      await queryRunner.query(`
                CREATE TRIGGER set_updatedAt_${table}_trigger
                BEFORE UPDATE ON "${table}"
                FOR EACH ROW
                EXECUTE FUNCTION set_updatedAt_${table}_column();
            `)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers and functions for each table
    const tables = ['Customer', 'Product', 'Distributor', 'ProductBatch', 'Procedure', 'User']
    for (const table of tables) {
      await queryRunner.query(`
                DROP TRIGGER IF EXISTS set_updatedAt_${table}_trigger ON "${table}";
                DROP FUNCTION IF EXISTS set_updatedAt_${table}_column();
            `)
    }

    // Drop columns from each table
    for (const table of tables) {
      await queryRunner.query(`
                ALTER TABLE "${table}"
                    DROP COLUMN "createdAt",
                    DROP COLUMN "deletedAt",
                    DROP COLUMN "updatedAt"
            `)
    }
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version2609131789305954007 implements MigrationInterface {
  name = 'Version2609131789305954007'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE  "Payment" "pt"
        SET     "moneyDirection" = CASE 
                    WHEN("paidTotal" = 0) THEN 0
                    ELSE "moneyDirection"
                END;
      `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

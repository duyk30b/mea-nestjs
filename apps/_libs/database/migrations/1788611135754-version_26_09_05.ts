import { MigrationInterface, QueryRunner } from 'typeorm'

export class Version2609051788611135754 implements MigrationInterface {
  name = 'Version2609051788611135754'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE  "PaymentTicket" "pt"
        SET     "ticketActionType" = CASE 
                    WHEN("ticketActionType" = 1) THEN 1
                    WHEN("ticketActionType" = 2) THEN 2
                    WHEN("ticketActionType" = 3) THEN 3
                    WHEN("ticketActionType" = 4) THEN 4
                    WHEN("ticketActionType" = 5) THEN 5
                    WHEN("ticketActionType" = 6) THEN 6
                    WHEN("ticketActionType" = 7) THEN 8
                    WHEN("ticketActionType" = 8) THEN 9
                    WHEN("ticketActionType" = 9) THEN 10
                    WHEN("ticketActionType" = 10) THEN 11
                    WHEN("ticketActionType" = 11) THEN 12
                    WHEN("ticketActionType" = 12) THEN 13
                    WHEN("ticketActionType" = 13) THEN 14
                    ELSE "ticketActionType"
                END;
      `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

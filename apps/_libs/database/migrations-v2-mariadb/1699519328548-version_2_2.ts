import { MigrationInterface, QueryRunner } from 'typeorm'

export class version221699519328548 implements MigrationInterface {
  name = 'version221699519328548'

  public async up(queryRunner: QueryRunner): Promise<void> {
    if ('Receipt') {
      await queryRunner.query(`
                DROP INDEX \`IDX_ddbeebd03fdcebab9803ef6a86\` ON \`receipt\`
            `)
      await queryRunner.query(`
                ALTER TABLE \`receipt\`
                    ADD \`paid\` int NOT NULL DEFAULT '0',
                    ADD \`delete_time\` bigint NULL
            `)
      // Thay đổi status của Refund từ 0 => -1
      await queryRunner.query(`
                UPDATE receipt 
                    SET receipt.status = -1, receipt.debt = 0, receipt.paid = 0
                    WHERE receipt.status = 0
            `)
      // Thay đổi status của Draft từ 1 => 0
      await queryRunner.query(`
                UPDATE receipt 
                    SET receipt.status = 0, receipt.debt = 0, receipt.paid = 0
                    WHERE receipt.status = 1
            `)
      // Status = 3 thì thêm "paid"
      await queryRunner.query(`
                UPDATE receipt 
                    SET receipt.paid = receipt.total_money - receipt.debt
                    WHERE receipt.status = 3
            `)
      await queryRunner.query(`
                ALTER TABLE \`receipt\` 
                    DROP COLUMN \`refund_time\`,
                    DROP COLUMN \`payment_time\`,
                    DROP COLUMN \`ship_time\`
            `)
      await queryRunner.query(`
                CREATE INDEX \`IDX_RECEIPT__CREATE_TIME\` ON \`receipt\` (\`oid\`, \`create_time\`)
            `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_RECEIPT__DISTRIBUTOR_ID\` ON \`receipt\` (\`oid\`, \`distributor_id\`)
        `)
    }
    if ('Invoice') {
      await queryRunner.query(`
                DROP INDEX \`IDX_fa89aa3d5768ec2d54ffbd0b60\` ON \`invoice\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_3655a45b4999ca5fa614e8901d\` ON \`invoice\`
            `)
      await queryRunner.query(`
                ALTER TABLE \`invoice\`
                    ADD \`paid\` int NOT NULL DEFAULT '0',
                    ADD \`delete_time\` bigint NULL
            `)
      // Thay đổi status của Refund từ 0 => -1
      await queryRunner.query(`
                UPDATE invoice 
                    SET invoice.status = -1, 
                        invoice.debt = 0, 
                        invoice.paid = 0
                    WHERE invoice.status = 0
            `)
      // Thay đổi status của Draft từ 1 => 0
      await queryRunner.query(`
                UPDATE invoice 
                    SET invoice.status = 0, 
                        invoice.debt = 0, 
                        invoice.paid = 0
                    WHERE invoice.status = 1
            `)
      // Đơn trước đây ở trạng thái Process (chưa gửi hàng, đã thanh toán) => chuyển sang trạng thái: "thanh toán trước"
      await queryRunner.query(`
                UPDATE invoice 
                    SET invoice.status = 1, 
                        invoice.paid = invoice.total_money - invoice.debt, 
                        invoice.debt = 0
                    WHERE invoice.status = 2 AND invoice.payment_time IS NOT NULL
            `)
      // Đơn trước đây ở trạng thái Process (đã gửi hàng, chưa thanh toán) => chuyển sang trạng thái: "nợ"
      await queryRunner.query(`
                UPDATE invoice 
                    SET invoice.status = 2, 
                        invoice.paid = invoice.total_money - invoice.debt
                    WHERE invoice.status = 2 AND invoice.ship_time IS NOT NULL
            `)
      // Đơn hàng ở trạng thái hoàn thành => xóa hết nợ
      await queryRunner.query(`
                UPDATE invoice 
                    SET invoice.status = 3, 
                        invoice.paid = invoice.total_money,
                        invoice.debt = 0
                    WHERE invoice.status = 3
            `)
      // Set đơn hoàn thành cuối cùng làm đơn nợ
      await queryRunner.query(`
        UPDATE customer JOIN invoice
          ON customer.id = invoice.customer_id 
          AND invoice.create_time = (
            SELECT MAX(create_time) FROM invoice iv 
              WHERE iv.customer_id = customer.id AND iv.status = 3
          )
        SET invoice.paid = invoice.total_money - customer.debt,
            invoice.debt = customer.debt,
            invoice.status = 2,
            invoice.note = 'Cập nhật hệ thống: Dồn hết số nợ còn lại vào đơn này'
        `)
      // Đơn cuối cùng làm đơn nợ, nhưng nếu số nợ = 0 thì cho hoàn thành
      await queryRunner.query(`
                UPDATE invoice
                    SET invoice.status = 3, invoice.note = ''
                    WHERE invoice.status = 2 AND invoice.debt = 0
            `)
      await queryRunner.query(`
                ALTER TABLE \`invoice\` 
                    DROP COLUMN \`refund_time\`,
                    DROP COLUMN \`payment_time\`,
                    DROP COLUMN \`ship_time\`
            `)
      await queryRunner.query(`
                CREATE INDEX \`IDX_INVOICE__CREATE_TIME\` ON \`invoice\` (\`oid\`, \`create_time\`)
            `)
      await queryRunner.query(`
                CREATE INDEX \`IDX_INVOICE__CUSTOMER_ID\` ON \`invoice\` (\`oid\`, \`customer_id\`)
            `)
    }
    if ('DistributorDebt ===> Distributor Payment') {
      await queryRunner.query(`
                DROP INDEX \`IDX_30800e79e2cab0345762b42f11\` ON \`distributor_debt\`
            `)
      await queryRunner.query(`
                ALTER TABLE \`distributor_debt\` 
                    CHANGE \`create_time\` \`time\` bigint NOT NULL,
                    CHANGE \`money\` \`debit\` int NOT NULL DEFAULT '0',
                    CHANGE \`open_debt\` \`open_debt\` int NULL,
                    CHANGE \`close_debt\` \`close_debt\` int NULL
            `)
      await queryRunner.query(`
                ALTER TABLE \`distributor_debt\`
                    ADD \`paid\` int NOT NULL DEFAULT '0',
                    ADD \`description\` varchar(255) NULL
            `)
      await queryRunner.query(`
                CREATE INDEX \`IDX_DISTRIBUTOR_PAYMENT__DISTRIBUTOR_ID\` 
                    ON \`distributor_debt\` (\`oid\`, \`distributor_id\`)
            `)
      await queryRunner.query(`
                CREATE INDEX \`IDX_DISTRIBUTOR_PAYMENT__RECEIPT_ID\` 
                    ON \`distributor_debt\` (\`oid\`, \`receipt_id\`)
            `)
      await queryRunner.query(`
                ALTER TABLE \`distributor_debt\` RENAME \`distributor_payment\`
            `)
    }
    if ('Customer Debt ===> Customer Payment') {
      await queryRunner.query(`
                DROP INDEX \`IDX_58d7593e401ba54185a6f1617b\` ON \`customer_debt\`
            `)
      await queryRunner.query(`
                ALTER TABLE \`customer_debt\` 
                    CHANGE \`create_time\` \`time\` bigint NOT NULL,
                    CHANGE \`money\` \`debit\` int NOT NULL DEFAULT '0',
                    CHANGE \`open_debt\` \`open_debt\` int NULL,
                    CHANGE \`close_debt\` \`close_debt\` int NULL
            `)
      await queryRunner.query(`
                ALTER TABLE \`customer_debt\`
                    ADD \`paid\` int NOT NULL DEFAULT '0',
                    ADD \`description\` varchar(255) NULL
            `)
      await queryRunner.query(`
                ALTER TABLE \`customer_debt\` RENAME \`customer_payment\`
            `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_CUSTOMER_PAYMENT__CUSTOMER_ID\` 
          ON \`customer_payment\` (\`oid\`, \`customer_id\`)
      `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_CUSTOMER_PAYMENT__INVOICE_ID\` 
          ON \`customer_payment\` (\`oid\`, \`invoice_id\`)
      `)

      // Các lần hoàn trả: type từ 3 => -1, lấy paid từ đơn hàng
      await queryRunner.query(`
                UPDATE customer_payment JOIN invoice
                    ON customer_payment.invoice_id = invoice.id
                SET customer_payment.type = -1,
                    customer_payment.paid = - invoice.total_money - customer_payment.debit
                WHERE customer_payment.type = 3
            `)
      // Các lần trả tiền trực tiếp chỉ ghi nợ bằng debit, nên phải lấy paid từ đơn hàng
      await queryRunner.query(`
                UPDATE customer_payment JOIN invoice
                    ON customer_payment.invoice_id = invoice.id
                SET customer_payment.paid = invoice.total_money - customer_payment.debit
                WHERE customer_payment.type = 1
            `)
      // Các lần trả nợ thì lưu thêm paid
      await queryRunner.query(`
                UPDATE customer_payment 
                    SET customer_payment.paid = -customer_payment.debit
                    WHERE customer_payment.type = 2
            `)
    }
    if ('InvoiceItem') {
      await queryRunner.query(`
                ALTER TABLE \`invoice_item\`
                    ADD \`hint_usage\` varchar(255) NULL
            `)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if ('Receipt') {
      await queryRunner.query(`
                DROP INDEX \`IDX_RECEIPT__DISTRIBUTOR_ID\` ON \`receipt\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_RECEIPT__CREATE_TIME\` ON \`receipt\`
            `)
      await queryRunner.query(`
                ALTER TABLE \`receipt\` 
                    DROP COLUMN \`paid\`,
                    DROP COLUMN \`delete_time\`
                `)
      await queryRunner.query(`
                ALTER TABLE \`receipt\`
                    ADD \`refund_time\` bigint NULL,
                    ADD \`payment_time\` bigint NULL,
                    ADD \`ship_time\` bigint NULL
            `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_ddbeebd03fdcebab9803ef6a86\` ON \`receipt\` (\`oid\`, \`payment_time\`)
      `)
    }
    if ('Invoice') {
      await queryRunner.query(`
                DROP INDEX \`IDX_INVOICE__CUSTOMER_ID\` ON \`invoice\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_INVOICE__CREATE_TIME\` ON \`invoice\`
            `)
      await queryRunner.query(`
                ALTER TABLE \`invoice\` 
                    DROP COLUMN \`paid\`,
                    DROP COLUMN \`delete_time\`
            `)
      await queryRunner.query(`
                ALTER TABLE \`invoice\`
                    ADD \`refund_time\` bigint NULL,
                    ADD \`payment_time\` bigint NULL,
                    ADD \`ship_time\` bigint NULL
            `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_3655a45b4999ca5fa614e8901d\` ON \`invoice\` (\`oid\`, \`customer_id\`)
      `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_fa89aa3d5768ec2d54ffbd0b60\` ON \`invoice\` (\`oid\`, \`payment_time\`)
      `)
    }
    if ('DistributorDebt ===> Distributor Payment') {
      await queryRunner.query(`
                ALTER TABLE \`customer_payment\` RENAME \`customer_debt\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_CUSTOMER_PAYMENT__CUSTOMER_ID\` ON \`customer_debt\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_CUSTOMER_PAYMENT__INVOICE_ID\` ON \`customer_debt\`
            `)
      await queryRunner.query(`
                ALTER TABLE \`customer_debt\` 
                    CHANGE \`close_debt\` \`close_debt\` int NOT NULL,
                    CHANGE \`open_debt\` \`open_debt\` int NOT NULL,
                    CHANGE \`debit\` \`money\` int NOT NULL,
                    CHANGE \`time\` \`create_time\` bigint NOT NULL
            `)
      await queryRunner.query(`
                ALTER TABLE \`customer_debt\` 
                    DROP COLUMN \`paid\`,
                    DROP COLUMN \`description\`
            `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_58d7593e401ba54185a6f1617b\` 
          ON \`customer_debt\` (\`oid\`, \`customer_id\`)
      `)
    }
    if ('Customer Debt ===> Customer Payment') {
      await queryRunner.query(`
                ALTER TABLE \`distributor_payment\` RENAME \`distributor_debt\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_DISTRIBUTOR_PAYMENT__DISTRIBUTOR_ID\` ON \`distributor_debt\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_DISTRIBUTOR_PAYMENT__RECEIPT_ID\` ON \`distributor_debt\`
            `)
      await queryRunner.query(`
                ALTER TABLE \`distributor_debt\` 
                    CHANGE \`close_debt\` \`close_debt\` int NOT NULL,
                    CHANGE \`open_debt\` \`open_debt\` int NOT NULL,
                    CHANGE \`debit\` \`money\` int NOT NULL,
                    CHANGE \`time\` \`create_time\` bigint NOT NULL
            `)
      await queryRunner.query(`
                ALTER TABLE \`distributor_debt\` 
                    DROP COLUMN \`paid\`,
                    DROP COLUMN \`description\`
            `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_30800e79e2cab0345762b42f11\` 
          ON \`distributor_debt\` (\`oid\`, \`distributor_id\`)
      `)
    }
    if ('InvoiceItem') {
      await queryRunner.query(`
                ALTER TABLE \`invoice_item\` 
                    DROP COLUMN \`hint_usage\`
            `)
    }
  }
}

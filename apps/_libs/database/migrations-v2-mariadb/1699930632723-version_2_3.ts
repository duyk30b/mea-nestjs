import { MigrationInterface, QueryRunner } from 'typeorm'

export class version231699930632723 implements MigrationInterface {
  name = 'version231699930632723'

  public async up(queryRunner: QueryRunner): Promise<void> {
    if ('CustomerPayment') {
      await queryRunner.query(`
                ALTER TABLE \`customer_payment\` RENAME \`CustomerPayment\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_CUSTOMER_PAYMENT__INVOICE_ID\` ON \`CustomerPayment\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_CUSTOMER_PAYMENT__CUSTOMER_ID\` ON \`CustomerPayment\`
            `)
      await queryRunner.query(`
                UPDATE CustomerPayment SET open_debt = 0 WHERE open_debt IS NULL
            `)
      await queryRunner.query(`
                UPDATE CustomerPayment SET close_debt = 0 WHERE close_debt IS NULL
            `)
      await queryRunner.query(`
                ALTER TABLE \`CustomerPayment\`
                    DROP COLUMN \`other_id\`,
                    ADD \`invoiceOpenDebt\` bigint NOT NULL,
                    ADD \`invoiceCloseDebt\` bigint NOT NULL,
                    CHANGE \`invoice_id\` \`invoiceId\` int NOT NULL,
                    CHANGE \`customer_id\` \`customerId\` int NOT NULL,
                    CHANGE \`type\` \`type\` smallint NOT NULL,
                    CHANGE \`paid\` \`paid\` bigint NOT NULL,
                    CHANGE \`debit\` \`debit\` bigint NOT NULL,
                    CHANGE \`open_debt\` \`customerOpenDebt\` bigint NOT NULL,
                    CHANGE \`close_debt\` \`customerCloseDebt\` bigint NOT NULL
            `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_CustomerPayment__invoiceId\` 
          ON \`CustomerPayment\` (\`oid\`, \`invoiceId\`)
      `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_CustomerPayment__customerId\` 
          ON \`CustomerPayment\` (\`oid\`, \`customerId\`)
      `)
    }

    if ('Customer') {
      await queryRunner.query(`
                ALTER TABLE \`customer\` RENAME \`Customer\`
            `)
      await queryRunner.query(`
                ALTER TABLE \`Customer\` 
                    DROP COLUMN \`other_id\`,
                    CHANGE \`gender\` \`gender\` smallint NULL,
                    CHANGE \`debt\` \`debt\` bigint NOT NULL DEFAULT '0',
                    CHANGE \`full_name\` \`fullName\` varchar(255) NOT NULL,
                    CHANGE \`identity_card\` \`identityCard\` varchar(255) NULL,
                    CHANGE \`address_province\` \`addressProvince\` varchar(255) NULL,
                    CHANGE \`address_district\` \`addressDistrict\` varchar(255) NULL,
                    CHANGE \`address_ward\` \`addressWard\` varchar(255) NULL,
                    CHANGE \`address_street\` \`addressStreet\` varchar(255) NULL,
                    CHANGE \`health_history\` \`healthHistory\` text NULL,
                    CHANGE \`is_active\` \`isActive\` tinyint NOT NULL DEFAULT 1
            `)
    }

    if ('DistributorPayment') {
      await queryRunner.query(`
                ALTER TABLE \`distributor_payment\` RENAME \`DistributorPayment\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_DISTRIBUTOR_PAYMENT__DISTRIBUTOR_ID\` ON \`DistributorPayment\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_DISTRIBUTOR_PAYMENT__RECEIPT_ID\` ON \`DistributorPayment\`
            `)
      await queryRunner.query(`
                UPDATE DistributorPayment SET open_debt = 0 WHERE open_debt IS NULL
            `)
      await queryRunner.query(`
                UPDATE DistributorPayment SET close_debt = 0 WHERE close_debt IS NULL
            `)
      await queryRunner.query(`
                ALTER TABLE \`DistributorPayment\` 
                    DROP COLUMN \`other_id\`,
                    ADD \`receiptOpenDebt\` bigint NOT NULL,
                    ADD \`receiptCloseDebt\` bigint NOT NULL,
                    CHANGE \`receipt_id\` \`receiptId\` int NOT NULL,
                    CHANGE \`distributor_id\` \`distributorId\` int NOT NULL,
                    CHANGE \`type\` \`type\` smallint NOT NULL,
                    CHANGE \`paid\` \`paid\` bigint NOT NULL,
                    CHANGE \`debit\` \`debit\` bigint NOT NULL,
                    CHANGE \`open_debt\` \`distributorOpenDebt\` bigint NOT NULL,
                    CHANGE \`close_debt\` \`distributorCloseDebt\` bigint NOT NULL
            `)
      await queryRunner.query(`
                CREATE INDEX \`IDX_DistributorPayment__distributorId\` 
                    ON \`DistributorPayment\` (\`oid\`, \`distributorId\`)
            `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_DistributorPayment__receiptId\` 
          ON \`DistributorPayment\` (\`oid\`, \`receiptId\`)
      `)
    }

    if ('Distributor') {
      await queryRunner.query(`
                ALTER TABLE \`distributor\` RENAME \`Distributor\`
            `)
      await queryRunner.query(`
                ALTER TABLE \`Distributor\`
                    DROP COLUMN \`other_id\`,
                    CHANGE \`debt\` \`debt\` bigint NOT NULL DEFAULT '0',
                    CHANGE \`full_name\` \`fullName\` varchar(255) NOT NULL,
                    CHANGE \`address_province\` \`addressProvince\` varchar(255) NULL,
                    CHANGE \`address_district\` \`addressDistrict\` varchar(255) NULL,
                    CHANGE \`address_ward\` \`addressWard\` varchar(255) NULL,
                    CHANGE \`address_street\` \`addressStreet\` varchar(255) NULL,
                    CHANGE \`is_active\` \`isActive\` tinyint NOT NULL DEFAULT 1
            `)
    }

    if ('InvoiceExpense') {
      await queryRunner.query(`
                CREATE TABLE \`InvoiceExpense\` (
                    \`oid\` int NOT NULL,
                    \`id\` int NOT NULL AUTO_INCREMENT,
                    \`invoiceId\` int NOT NULL,
                    \`key\` varchar(255) NOT NULL,
                    \`name\` varchar(255) NOT NULL,
                    \`money\` bigint NOT NULL DEFAULT '0',
                    INDEX \`IDX_InvoiceExpense__invoiceId\` (\`oid\`, \`invoiceId\`),
                    PRIMARY KEY (\`id\`)
                ) ENGINE = InnoDB
            `)
    }

    if ('InvoiceSurcharge') {
      await queryRunner.query(`
                CREATE TABLE \`InvoiceSurcharge\` (
                    \`oid\` int NOT NULL,
                    \`id\` int NOT NULL AUTO_INCREMENT,
                    \`invoiceId\` int NOT NULL,
                    \`key\` varchar(255) NOT NULL,
                    \`name\` varchar(255) NOT NULL,
                    \`money\` bigint NOT NULL DEFAULT '0',
                    INDEX \`IDX_InvoiceSurcharge__invoiceId\` (\`oid\`, \`invoiceId\`),
                    PRIMARY KEY (\`id\`)
                ) ENGINE = InnoDB
            `)
    }

    if ('Invoice') {
      await queryRunner.query(`
                ALTER TABLE \`invoice\` RENAME \`Invoice\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_1eb552f67f21dfd6c2b999f702\` ON \`Invoice\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_INVOICE__CREATE_TIME\` ON \`Invoice\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_INVOICE__CUSTOMER_ID\` ON \`Invoice\`
            `)
      await queryRunner.query(`
        ALTER TABLE \`Invoice\`
          DROP COLUMN \`other_id\`,
          DROP COLUMN \`surcharge_details\`,
          DROP COLUMN \`expenses_details\`,
          ADD \`shipYear\` smallint NULL,
          ADD \`shipMonth\` smallint NULL,
          ADD \`shipDate\` smallint NULL,
          ADD \`shipTime\` datetime NULL,
          CHANGE \`arrival_id\` \`arrivalId\` int NOT NULL DEFAULT '0',
          CHANGE \`delete_time\` \`deleteTime\` bigint NULL,
          CHANGE \`customer_id\` \`customerId\` int NOT NULL,
          CHANGE \`total_cost_money\` \`itemsCostMoney\` bigint NOT NULL,
          CHANGE \`total_item_money\` \`itemsActualMoney\` bigint NOT NULL,
          CHANGE \`discount_money\` \`discountMoney\` bigint NOT NULL DEFAULT '0',
          CHANGE \`discount_percent\` \`discountPercent\` smallint NOT NULL DEFAULT '0',
          CHANGE \`discount_type\` \`discountType\` enum ('%', 'VNĐ') NOT NULL DEFAULT 'VNĐ',
          CHANGE \`surcharge\` \`surcharge\` bigint NOT NULL DEFAULT '0',
          CHANGE \`expenses\` \`expense\` bigint NOT NULL DEFAULT '0',
          CHANGE \`paid\` \`paid\` bigint NOT NULL DEFAULT '0',
          CHANGE \`debt\` \`debt\` bigint NOT NULL DEFAULT '0',
          CHANGE \`total_money\` \`revenue\` bigint NOT NULL,
          CHANGE \`profit\` \`profit\` bigint NOT NULL,
          CHANGE \`create_time\` \`time\` bigint NULL
      `)
      await queryRunner.query(`
                CREATE INDEX \`IDX_Invoice__oid_time\` ON \`Invoice\` (\`oid\`, \`time\`)
            `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_Invoice__oid_customerId\` ON \`Invoice\` (\`oid\`, \`customerId\`)
      `)
      await queryRunner.query(`
        UPDATE Invoice invoice 
          SET invoice.shipTime = FROM_UNIXTIME(CEILING(invoice.time / 1000)),
            invoice.shipYear = YEAR(FROM_UNIXTIME(CEILING((invoice.time + 7*60*60*1000) / 1000))),
            invoice.shipMonth = MONTH(FROM_UNIXTIME(CEILING((invoice.time + 7*60*60*1000) / 1000))),
            invoice.shipDate = DAY(FROM_UNIXTIME(CEILING((invoice.time + 7*60*60*1000) / 1000)))
          WHERE invoice.time IS NOT NULL AND invoice.time != 0
      `)
    }

    if ('InvoiceItem') {
      await queryRunner.query(`
                ALTER TABLE \`invoice_item\` RENAME \`InvoiceItem\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_34e829a73cb24dc6b06eec7844\` ON \`InvoiceItem\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_39bb19ddb85b01a267f8ddb554\` ON \`InvoiceItem\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_c67bd177d02805fdbd027f98ec\` ON \`InvoiceItem\`
            `)

      await queryRunner.query(`
        ALTER TABLE \`InvoiceItem\` 
          DROP COLUMN \`other_id\`,
          CHANGE \`invoice_id\` \`invoiceId\` int NOT NULL,
          CHANGE \`customer_id\` \`customerId\` int NOT NULL,
          CHANGE \`reference_id\` \`referenceId\` int NOT NULL,
          CHANGE \`type\` \`type\` smallint NOT NULL,
          CHANGE \`cost_price\` \`costPrice\` bigint NULL,
          CHANGE \`expected_price\` \`expectedPrice\` bigint NULL,
          CHANGE \`discount_money\` \`discountMoney\` bigint NOT NULL DEFAULT '0',
          CHANGE \`discount_percent\` \`discountPercent\` smallint NOT NULL DEFAULT '0',
          CHANGE \`discount_type\` \`discountType\` enum ('%', 'VNĐ') NOT NULL DEFAULT 'VNĐ',
          CHANGE \`actual_price\` \`actualPrice\` bigint NOT NULL,
          CHANGE \`hint_usage\` \`hintUsage\` varchar(255) NULL
      `)

      await queryRunner.query(`
        CREATE INDEX \`IDX_InvoiceItem__referenceId\` ON \`InvoiceItem\` (\`oid\`, \`referenceId\`)
      `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_InvoiceItem__customerId_type\` 
          ON \`InvoiceItem\` (\`oid\`, \`customerId\`, \`type\`)
      `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_InvoiceItem__invoiceId\` ON \`InvoiceItem\` (\`oid\`, \`invoiceId\`)
      `)
    }

    if ('OrganizationSetting') {
      await queryRunner.query(`
        ALTER TABLE \`organization_setting\` RENAME \`OrganizationSetting\`
      `)
      await queryRunner.query(`
        ALTER TABLE \`OrganizationSetting\` DROP COLUMN \`other_id\`
      `)
      await queryRunner.query(`
        DROP INDEX \`IDX_ORG_SETTING_TYPE\` ON \`OrganizationSetting\`
      `)
      await queryRunner.query(`
        CREATE UNIQUE INDEX \`IDX_OrganizationSetting__type\` 
          ON \`OrganizationSetting\` (\`oid\`, \`type\`)
      `)
    }

    if ('Employee ===> User') {
      await queryRunner.query(`
                ALTER TABLE \`employee\` RENAME \`User\`
            `)
      await queryRunner.query(`
                ALTER TABLE \`User\`
                    DROP COLUMN \`other_id\`,
                    ADD \`isActive\` tinyint NOT NULL DEFAULT 1,
                    CHANGE \`full_name\` \`fullName\` varchar(255) NULL,
                    CHANGE \`role\` \`role\` smallint NOT NULL DEFAULT '2',
                    CHANGE \`gender\` \`gender\` smallint NULL
            `)
    }

    if ('Organization') {
      await queryRunner.query(`
                ALTER TABLE \`organization\` RENAME \`Organization\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_d11ed6c5ea801c6eda5bb7aee1\` ON \`Organization\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_5d06de67ef6ab02cbd938988bb\` ON \`Organization\`
            `)

      await queryRunner.query(`
                ALTER TABLE \`Organization\` 
                    CHANGE \`organization_name\` \`organizationName\` varchar(255) NULL,
                    CHANGE \`address_province\` \`addressProvince\` varchar(255) NULL,
                    CHANGE \`address_district\` \`addressDistrict\` varchar(255) NULL,
                    CHANGE \`address_ward\` \`addressWard\` varchar(255) NULL,
                    CHANGE \`address_street\` \`addressStreet\` varchar(255) NULL,
                    CHANGE \`create_time\` \`createTime\` bigint NULL,
                    CHANGE \`level\` \`level\` smallint NOT NULL DEFAULT '0'
            `)

      await queryRunner.query(`
                CREATE UNIQUE INDEX \`IDX_Organization__email\` ON \`Organization\` (\`email\`)
            `)
      await queryRunner.query(`
                CREATE UNIQUE INDEX \`IDX_Organization__phone\` ON \`Organization\` (\`phone\`)
            `)
    }

    if ('Procedure') {
      await queryRunner.query(`
                ALTER TABLE \`procedure\` RENAME \`Procedure\`
            `)
      await queryRunner.query(`
                ALTER TABLE \`Procedure\`
                    DROP COLUMN \`other_id\`,
                    CHANGE \`consumable_hint\` \`consumableHint\` text NULL,
                    CHANGE \`is_active\` \`isActive\` tinyint NOT NULL DEFAULT 1
            `)
    }

    if ('ProductBatch') {
      await queryRunner.query(`
                ALTER TABLE \`product_batch\` RENAME \`ProductBatch\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_37a39dd69157bacf84fdf01633\` ON \`ProductBatch\`
            `)
      await queryRunner.query(`
                ALTER TABLE \`ProductBatch\`
                    DROP COLUMN \`other_id\`,
                    CHANGE \`product_id\` \`productId\` int NOT NULL,
                    CHANGE \`expiry_date\` \`expiryDate\` bigint NULL,
                    CHANGE \`cost_price\` \`costPrice\` bigint NOT NULL DEFAULT '0',
                    CHANGE \`wholesale_price\` \`wholesalePrice\` bigint NOT NULL DEFAULT '0',
                    CHANGE \`retail_price\` \`retailPrice\` bigint NOT NULL DEFAULT '0',
                    CHANGE \`quantity\` \`quantity\` int NOT NULL DEFAULT '0',
                    CHANGE \`is_active\` \`isActive\` tinyint NOT NULL DEFAULT 1
            `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_ProductBatch__oid_productId\` 
          ON \`ProductBatch\` (\`oid\`, \`productId\`)
      `)
    }

    if ('ProductMovement') {
      await queryRunner.query(`
                ALTER TABLE \`product_movement\` RENAME \`ProductMovement\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_f5dd499805216ed53f217dbb5d\` ON \`ProductMovement\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_ce98293f52d5ce63c778847e4d\` ON \`ProductMovement\`
            `)

      await queryRunner.query(`
                ALTER TABLE \`ProductMovement\`
                    DROP COLUMN \`other_id\`,
                    CHANGE \`product_id\` \`productId\` int NOT NULL,
                    CHANGE \`product_batch_id\` \`productBatchId\` int NOT NULL,
                    CHANGE \`reference_id\` \`referenceId\` int NOT NULL,
                    CHANGE \`price\` \`price\` bigint NOT NULL DEFAULT '0',
                    CHANGE \`is_refund\` \`isRefund\` tinyint NOT NULL DEFAULT 0,
                    CHANGE \`open_quantity\` \`openQuantity\` int NOT NULL,
                    CHANGE \`close_quantity\` \`closeQuantity\` int NOT NULL,
                    CHANGE \`total_money\` \`totalMoney\` bigint NOT NULL DEFAULT '0',
                    CHANGE \`create_time\` \`createTime\` bigint NOT NULL,
                    CHANGE \`type\` \`type\` smallint NOT NULL
            `)

      await queryRunner.query(`
                CREATE INDEX \`IDX_ProductMovement__oid_productBatchId_createTime\` 
                    ON \`ProductMovement\` (\`oid\`, \`productBatchId\`, \`createTime\`)
            `)
      await queryRunner.query(`
                CREATE INDEX \`IDX_ProductMovement__oid_productId_createTime\` 
                    ON \`ProductMovement\` (\`oid\`, \`productId\`, \`createTime\`)
            `)
    }

    if ('Product') {
      await queryRunner.query(`
                ALTER TABLE \`product\` RENAME \`Product\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_6bb1fffbeca2cb0056710910c1\` ON \`Product\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_d7a4a50504b4651387dee06e91\` ON \`Product\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_4a411f49c5e353bcac9b7b00a0\` ON \`Product\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_920f1fb7e84a62bb1989f6967a\` ON \`Product\`
            `)

      await queryRunner.query(`
                ALTER TABLE \`Product\` 
                    DROP COLUMN \`other_id\`,
                    CHANGE \`brand_name\` \`brandName\` varchar(255) NOT NULL,
                    CHANGE \`hint_usage\` \`hintUsage\` varchar(255) NULL,
                    CHANGE \`is_active\` \`isActive\` tinyint NOT NULL DEFAULT 1
            `)

      await queryRunner.query(`
                CREATE INDEX \`IDX_Product__oid_isActive\` ON \`Product\` (\`oid\`, \`isActive\`)
            `)
      await queryRunner.query(`
                CREATE INDEX \`IDX_Product__oid_group\` ON \`Product\` (\`oid\`, \`group\`)
            `)
      await queryRunner.query(`
                CREATE INDEX \`IDX_Product__oid_substance\` ON \`Product\` (\`oid\`, \`substance\`)
            `)
      await queryRunner.query(`
                CREATE INDEX \`IDX_Product__oid_brandName\` ON \`Product\` (\`oid\`, \`brandName\`)
            `)
    }

    if ('ReceiptItem') {
      await queryRunner.query(`
                ALTER TABLE \`receipt_item\` RENAME \`ReceiptItem\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_2dc6dbe700bc9f6bb01d01fbd0\` ON \`ReceiptItem\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_6b1183515b9d1d6d9aed30eb0b\` ON \`ReceiptItem\`
            `)
      await queryRunner.query(`
                ALTER TABLE \`ReceiptItem\` 
                    DROP COLUMN \`other_id\`,
                    CHANGE \`product_batch_id\` \`productBatchId\` int NOT NULL,
                    CHANGE \`distributor_id\` \`distributorId\` int NOT NULL,
                    CHANGE \`receipt_id\` \`receiptId\` int NOT NULL
            `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_ReceiptItem__oid_receiptId\` 
          ON \`ReceiptItem\` (\`oid\`, \`receiptId\`)
      `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_ReceiptItem__oid_productBatchId\` 
          ON \`ReceiptItem\` (\`oid\`, \`productBatchId\`)
      `)
    }

    if ('Receipt') {
      await queryRunner.query(`
                ALTER TABLE \`receipt\` RENAME \`Receipt\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_RECEIPT__CREATE_TIME\` ON \`Receipt\`
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_RECEIPT__DISTRIBUTOR_ID\` ON \`Receipt\`
            `)
      await queryRunner.query(`
        ALTER TABLE \`Receipt\` 
          DROP COLUMN \`other_id\`,
          ADD \`shipYear\` smallint NULL,
          ADD \`shipMonth\` smallint NULL,
          ADD \`shipDate\` smallint NULL,
          ADD \`shipTime\` datetime NULL,
          CHANGE \`distributor_id\` \`distributorId\` int NOT NULL,
          CHANGE \`status\` \`status\` smallint NOT NULL,
          CHANGE \`total_item_money\` \`itemsActualMoney\` bigint NOT NULL,
          CHANGE \`discount_money\` \`discountMoney\` bigint NOT NULL DEFAULT '0',
          CHANGE \`discount_percent\` \`discountPercent\` tinyint NOT NULL DEFAULT '0',
          CHANGE \`discount_type\` \`discountType\` enum ('%', 'VNĐ') NOT NULL DEFAULT 'VNĐ',
          CHANGE \`surcharge\` \`surcharge\` bigint NOT NULL DEFAULT '0',
          CHANGE \`paid\` \`paid\` bigint NOT NULL DEFAULT '0',
          CHANGE \`debt\` \`debt\` bigint NOT NULL DEFAULT '0',
          CHANGE \`create_time\` \`time\` bigint NULL,
          CHANGE \`total_money\` \`revenue\` bigint NOT NULL
      `)
      await queryRunner.query(`
                CREATE INDEX \`IDX_Receipt__oid_time\` ON \`Receipt\` (\`oid\`, \`time\`)
            `)
      await queryRunner.query(`
        CREATE INDEX \`IDX_Receipt__oid_distributorId\` ON \`Receipt\` (\`oid\`, \`distributorId\`)
      `)
      await queryRunner.query(`
        UPDATE Receipt receipt 
          SET receipt.shipTime = FROM_UNIXTIME(CEILING(receipt.time / 1000)),
            receipt.shipYear = YEAR(FROM_UNIXTIME(CEILING((receipt.time + 7*60*60*1000) / 1000))),
            receipt.shipMonth = MONTH(FROM_UNIXTIME(CEILING((receipt.time + 7*60*60*1000) / 1000))),
            receipt.shipDate = DAY(FROM_UNIXTIME(CEILING((receipt.time + 7*60*60*1000) / 1000)))
          WHERE receipt.time IS NOT NULL AND receipt.time != 0
      `)
    }

    if ('Arrival') {
      await queryRunner.query(`
                DROP INDEX \`IDX_1ae827fce2d5aa2dee2370f043\` ON \`arrival\` 
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_ARRIVAL___OID__START_TIME\`  ON \`arrival\` 
            `)
      await queryRunner.query(`
                DROP INDEX \`IDX_ARRIVAL___OID__CUSTOMER_ID__START_TIME\`  ON \`arrival\` 
            `)
      await queryRunner.query(`
                DROP TABLE \`arrival\`
            `)
    }

    if ('Diagnosis') {
      await queryRunner.query(`
                DROP INDEX \`IDX_b7e3f5da764ed431b3acb0412d\` ON \`diagnosis\` 
            `)
      await queryRunner.query(`
                DROP TABLE \`diagnosis\`
            `)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 ~ down')
  }
}

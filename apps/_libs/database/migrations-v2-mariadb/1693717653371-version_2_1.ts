import { MigrationInterface, QueryRunner } from 'typeorm'

export class version211693717653371 implements MigrationInterface {
  name = 'version211693717653371'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // CustomerEntity
    await queryRunner.query(`
            DROP INDEX \`IDX_49fe63dd92219c89a77642ed62\` 
                ON \`customer\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_84962f02b4390444121d73c58a\` 
                ON \`customer\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_65d0c6e1354a475ef03e6071e2\` 
                ON \`customer\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`customer\` 
                DROP COLUMN \`full_name_en\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`customer\` 
                CHANGE \`full_name_vi\` \`full_name\` varchar(255) NOT NULL
        `)

    // DistributorEntity
    await queryRunner.query(`
            DROP INDEX \`IDX_e8cab0ac13371c4708272747e7\` 
                ON \`distributor\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_214fb8d03085aaaf7888fcdb06\` 
                ON \`distributor\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_31fe00a5e47aa49f7526c468e7\` 
                ON \`distributor\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`distributor\` 
                DROP COLUMN \`full_name_en\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`distributor\` 
                CHANGE \`full_name_vi\` \`full_name\` varchar(255) NOT NULL
        `)

    // ProductEntity
    await queryRunner.query(`
            ALTER TABLE \`product\` 
                ADD \`quantity\` int NOT NULL DEFAULT '0'
        `)
    await queryRunner.query(`
            ALTER TABLE \`product\` 
                MODIFY COLUMN \`unit\` text NOT NULL DEFAULT '[]'
        `)
    await queryRunner.query(`
            UPDATE product 
                INNER JOIN ( SELECT product_id, SUM(quantity) as quantity 
                    FROM product_batch 
                    GROUP BY product_id 
                ) spb 
                ON product.id = spb.product_id 
            SET product.quantity = spb.quantity
        `)

    // ProductBatchEntity
    await queryRunner.query(`
            ALTER TABLE \`product_batch\` 
                ADD \`is_active\` tinyint NOT NULL DEFAULT 1
        `)

    // ProcedureEntity
    await queryRunner.query(`
            DROP INDEX \`IDX_6fed1d3f8cff2a7e68abae8767\` 
                ON \`procedure\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`procedure\` 
                DROP COLUMN \`name_en\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`procedure\` 
                CHANGE \`name_vi\` \`name\` varchar(255) NOT NULL
        `)

    // ArrivalEntity
    await queryRunner.query(`
            DROP INDEX \`IDX_4b964e192a33979d00bec2b34d\` 
                ON \`arrival\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_0819acd372dac1668c0afbcc71\` 
                ON \`arrival\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`arrival\` 
                DROP COLUMN \`diagnosis_id\`,
                DROP COLUMN \`payment_status\`,
                DROP COLUMN \`create_time\`,
                DROP COLUMN \`total_money\`,
                DROP COLUMN \`profit\`,
                DROP COLUMN \`debt\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`arrival\` 
                ADD \`start_time\` bigint NULL
        `)
    await queryRunner.query(`
            CREATE INDEX \`IDX_ARRIVAL___OID__CUSTOMER_ID__START_TIME\` 
                ON \`arrival\` (\`oid\`, \`customer_id\`, \`start_time\`)
        `)
    await queryRunner.query(`
            CREATE INDEX \`IDX_ARRIVAL___OID__START_TIME\` 
                ON \`arrival\` (\`oid\`, \`start_time\`)
        `)
    await queryRunner.query(`
            TRUNCATE TABLE arrival
        `)

    // ReceiptEntity
    await queryRunner.query(`
            DROP INDEX \`IDX_f8b7ca556bf5b4a5ea451385a1\` 
                ON \`receipt\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`receipt\`
                ADD \`create_time\` bigint NULL,
                ADD \`ship_time\` bigint NULL
        `)
    await queryRunner.query(`
            ALTER TABLE \`receipt\` 
                DROP COLUMN \`purchase_id\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`receipt\` 
                CHANGE COLUMN payment_status status tinyint NOT NULL
        `)
    await queryRunner.query(`
            UPDATE receipt 
                SET receipt.status = 0 WHERE receipt.status = 4
        `)
    await queryRunner.query(`
            UPDATE receipt
                SET receipt.create_time = receipt.payment_time,
                    receipt.ship_time = receipt.payment_time
        `)

    // ReceiptItemEntity
    await queryRunner.query(`
            ALTER TABLE \`receipt_item\` 
                ADD \`distributor_id\` int NOT NULL
        `)
    await queryRunner.query(`
            ALTER TABLE \`receipt_item\` 
                MODIFY COLUMN \`unit\` text NOT NULL DEFAULT '{"name":"","rate":1}'
        `)

    // InvoiceEntity
    await queryRunner.query(`
            ALTER TABLE \`invoice\` 
                CHANGE COLUMN payment_status status tinyint NOT NULL DEFAULT '1'
        `)
    await queryRunner.query(`
            ALTER TABLE \`invoice\`
                ADD \`create_time\` bigint NULL,
                ADD \`ship_time\` bigint NULL,
                ADD \`surcharge_details\` text NOT NULL DEFAULT '[]',
                ADD \`expenses_details\` text NOT NULL DEFAULT '[]'
        `)
    await queryRunner.query(`
            UPDATE invoice 
                SET invoice.status = 0 WHERE invoice.status = 4
        `)
    await queryRunner.query(`
            UPDATE invoice 
                SET invoice.arrival_id = 0
        `)
    await queryRunner.query(`
            UPDATE invoice
            SET invoice.create_time = invoice.payment_time,
                invoice.ship_time = invoice.payment_time
        `)

    // InvoiceItemEntity
    await queryRunner.query(`
            ALTER TABLE \`invoice_item\` 
                MODIFY COLUMN \`unit\` text NOT NULL DEFAULT '{"name":"","rate":1}'
        `)

    // PurchaseEntity
    await queryRunner.query(`
            DROP INDEX \`IDX_dbbd540cfea3d9a0e6bc33f9b2\` 
                ON \`purchase\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_10e11701749dd3a151ed89a641\` 
                ON \`purchase\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_35dcb0db1566a6590f7472fb37\` 
                ON \`purchase\`
        `)
    await queryRunner.query(`
            DROP TABLE \`purchase\`
        `)

    // OrganizationSettingEntity
    await queryRunner.query(`
            UPDATE organization_setting
            SET organization_setting.type = 'SCREEN_RECEIPT_LIST'
            WHERE organization_setting.type = 'SCREEN_PURCHASE_RECEIPT_LIST'
        `)
    await queryRunner.query(`
            UPDATE organization_setting
            SET organization_setting.type = 'SCREEN_RECEIPT_DETAIL'
            WHERE organization_setting.type = 'SCREEN_PURCHASE_RECEIPT_DETAIL'
        `)
    await queryRunner.query(`
            UPDATE organization_setting
            SET organization_setting.type = 'SCREEN_RECEIPT_UPSERT'
            WHERE organization_setting.type = 'SCREEN_PURCHASE_RECEIPT_UPSERT'
        `)
    await queryRunner.query(`
            UPDATE organization_setting
            SET organization_setting.type = 'SCREEN_INVOICE_LIST'
            WHERE organization_setting.type = 'SCREEN_INVOICE_ARRIVAL_LIST'
        `)
    await queryRunner.query(`
            UPDATE organization_setting
            SET organization_setting.type = 'SCREEN_INVOICE_DETAIL'
            WHERE organization_setting.type = 'SCREEN_INVOICE_ARRIVAL_DETAIL'
        `)
    await queryRunner.query(`
            UPDATE organization_setting
            SET organization_setting.type = 'SCREEN_INVOICE_UPSERT'
            WHERE organization_setting.type = 'SCREEN_INVOICE_ARRIVAL_UPSERT'
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // CustomerEntity
    await queryRunner.query(`
            ALTER TABLE \`customer\` 
                ADD \`full_name_en\` varchar(255) NOT NULL
        `)
    await queryRunner.query(`
            ALTER TABLE \`customer\` 
                CHANGE \`full_name\` \`full_name_vi\` varchar(255) NOT NULL
        `)
    await queryRunner.query(`
            CREATE INDEX \`IDX_49fe63dd92219c89a77642ed62\` ON \`customer\` (\`oid\`, \`debt\`)
        `)
    await queryRunner.query(`
            CREATE INDEX \`IDX_84962f02b4390444121d73c58a\` ON \`customer\` (\`oid\`, \`phone\`)
        `)
    await queryRunner.query(`
      CREATE INDEX \`IDX_65d0c6e1354a475ef03e6071e2\` ON \`customer\` (\`oid\`, \`full_name_en\`)
    `)

    // DistributorEntity
    await queryRunner.query(`
            ALTER TABLE \`distributor\` 
                ADD \`full_name_en\` varchar(255) NOT NULL
        `)
    await queryRunner.query(`
            ALTER TABLE \`distributor\` 
                CHANGE \`full_name\` \`full_name_vi\` varchar(255) NOT NULL
        `)
    await queryRunner.query(`
            CREATE INDEX \`IDX_e8cab0ac13371c4708272747e7\` ON \`distributor\` (\`oid\`, \`debt\`)
        `)
    await queryRunner.query(`
            CREATE INDEX \`IDX_214fb8d03085aaaf7888fcdb06\` ON \`distributor\` (\`oid\`, \`phone\`)
        `)
    await queryRunner.query(`
      CREATE INDEX \`IDX_31fe00a5e47aa49f7526c468e7\` ON \`distributor\` (\`oid\`, \`full_name_en\`)
    `)

    // ProductEntity
    await queryRunner.query(`
            ALTER TABLE \`product\` 
                DROP COLUMN \`quantity\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`product\` 
                MODIFY COLUMN \`unit\` varchar(255) NULL
        `)

    // ProductBatchEntity
    await queryRunner.query(`
            ALTER TABLE \`product_batch\` 
                DROP COLUMN \`is_active\`
        `)

    // ProcedureEntity
    await queryRunner.query(`
            ALTER TABLE \`procedure\` 
                ADD \`name_en\` varchar(255) NULL
        `)
    await queryRunner.query(`
            ALTER TABLE \`procedure\` 
                CHANGE \`name\` \`name_vi\` varchar(255) NULL
        `)
    await queryRunner.query(`
            CREATE INDEX \`IDX_6fed1d3f8cff2a7e68abae8767\` ON \`procedure\` (\`oid\`, \`name_en\`)
        `)

    // ArrivalEntity
    await queryRunner.query(`
            DROP INDEX \`IDX_ARRIVAL___OID__START_TIME\` 
                ON \`arrival\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_ARRIVAL___OID__CUSTOMER_ID__START_TIME\` 
                ON \`arrival\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`arrival\` 
                DROP COLUMN \`start_time\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`arrival\`
                ADD \`debt\` int NOT NULL DEFAULT 0,
                ADD \`profit\` int NOT NULL DEFAULT 0,
                ADD \`total_money\` int NOT NULL DEFAULT 0,
                ADD \`create_time\` bigint NULL,
                ADD \`payment_status\` tinyint NOT NULL DEFAULT 0,
                ADD \`diagnosis_id\` int NULL
        `)
    await queryRunner.query(`
            CREATE INDEX \`IDX_0819acd372dac1668c0afbcc71\` 
                ON \`arrival\` (\`oid\`, \`create_time\`)
        `)
    await queryRunner.query(`
            CREATE INDEX \`IDX_4b964e192a33979d00bec2b34d\` 
                ON \`arrival\` (\`oid\`, \`customer_id\`, \`create_time\`)
        `)

    // ReceiptEntity
    await queryRunner.query(`
            ALTER TABLE \`receipt\` 
                DROP COLUMN \`ship_time\`,
                DROP COLUMN \`create_time\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`receipt\` 
                ADD \`purchase_id\` int NOT NULL
        `)
    await queryRunner.query(`
            ALTER TABLE \`receipt\` 
                CHANGE COLUMN status payment_status tinyint NOT NULL
        `)
    await queryRunner.query(`
            UPDATE receipt 
                SET receipt.payment_status = 4 WHERE receipt.payment_status = 0
        `)
    await queryRunner.query(`
            CREATE INDEX \`IDX_f8b7ca556bf5b4a5ea451385a1\` 
                ON \`receipt\` (\`oid\`, \`purchase_id\`)
        `)

    // ReceiptItemEntity
    await queryRunner.query(`
            ALTER TABLE \`receipt_item\` 
                MODIFY COLUMN \`unit\` varchar(255) NOT NULL DEFAULT '{"name":"","rate":1}'
        `)
    await queryRunner.query(`
            ALTER TABLE \`receipt_item\` 
                DROP COLUMN \`distributor_id\`
        `)

    // InvoiceEntity
    await queryRunner.query(`
            ALTER TABLE \`invoice\` 
                DROP COLUMN \`expenses_details\`,
                DROP COLUMN \`surcharge_details\`,
                DROP COLUMN \`ship_time\`,
                DROP COLUMN \`create_time\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`invoice\` 
                CHANGE COLUMN status payment_status tinyint NOT NULL
        `)
    await queryRunner.query(`
            UPDATE invoice 
                SET invoice.payment_status = 4 WHERE invoice.payment_status = 0
        `)

    // InvoiceItemEntity
    await queryRunner.query(`
            ALTER TABLE \`invoice_item\` 
                MODIFY COLUMN \`unit\` varchar(255) NOT NULL DEFAULT '{"name":"","rate":1}'
        `)

    // PurchaseEntity
    await queryRunner.query(`
      CREATE TABLE \`purchase\` (
        \`oid\` int NOT NULL,
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`other_id\` varchar(255) NULL,
        \`distributor_id\` int NOT NULL,
        \`payment_status\` tinyint NOT NULL,
        \`create_time\` bigint NULL,
        \`total_money\` bigint NOT NULL,
        \`debt\` int NOT NULL DEFAULT '0',
        INDEX \`IDX_35dcb0db1566a6590f7472fb37\` (\`oid\`, \`distributor_id\`, \`create_time\`),
        INDEX \`IDX_10e11701749dd3a151ed89a641\` (\`oid\`, \`create_time\`),
        INDEX \`IDX_dbbd540cfea3d9a0e6bc33f9b2\` (\`oid\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE = InnoDB
    `)

    // OrganizationEntity
    await queryRunner.query(`
            UPDATE organization_setting
            SET organization_setting.type = 'SCREEN_PURCHASE_RECEIPT_LIST'
            WHERE organization_setting.type = 'SCREEN_RECEIPT_LIST'
        `)
    await queryRunner.query(`
            UPDATE organization_setting
            SET organization_setting.type = 'SCREEN_PURCHASE_RECEIPT_DETAIL'
            WHERE organization_setting.type = 'SCREEN_RECEIPT_DETAIL'
        `)
    await queryRunner.query(`
            UPDATE organization_setting
            SET organization_setting.type = 'SCREEN_PURCHASE_RECEIPT_UPSERT'
            WHERE organization_setting.type = 'SCREEN_RECEIPT_UPSERT'
        `)
    await queryRunner.query(`
            UPDATE organization_setting
            SET organization_setting.type = 'SCREEN_INVOICE_ARRIVAL_LIST'
            WHERE organization_setting.type = 'SCREEN_INVOICE_LIST'
        `)
    await queryRunner.query(`
            UPDATE organization_setting
            SET organization_setting.type = 'SCREEN_INVOICE_ARRIVAL_DETAIL'
            WHERE organization_setting.type = 'SCREEN_INVOICE_DETAIL'
        `)
    await queryRunner.query(`
            UPDATE organization_setting
            SET organization_setting.type = 'SCREEN_INVOICE_ARRIVAL_UPSERT'
            WHERE organization_setting.type = 'SCREEN_INVOICE_UPSERT'
        `)
  }
}

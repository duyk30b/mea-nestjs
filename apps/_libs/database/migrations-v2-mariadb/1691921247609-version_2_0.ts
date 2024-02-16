import { MigrationInterface, QueryRunner } from 'typeorm'

export class version201691921247609 implements MigrationInterface {
  name = 'version201691921247609'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`customer\` (
                \`oid\` int NOT NULL,
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`other_id\` varchar(255) NULL,
                \`full_name_en\` varchar(255) NOT NULL,
                \`full_name_vi\` varchar(255) NOT NULL,
                \`phone\` char(10) NULL,
                \`birthday\` bigint NULL,
                \`gender\` tinyint NULL,
                \`identity_card\` varchar(255) NULL,
                \`address_province\` varchar(255) NULL,
                \`address_district\` varchar(255) NULL,
                \`address_ward\` varchar(255) NULL,
                \`address_street\` varchar(255) NULL,
                \`relative\` varchar(255) NULL,
                \`health_history\` text NULL,
                \`debt\` int NOT NULL DEFAULT '0',
                \`note\` varchar(255) NULL,
                \`is_active\` tinyint NOT NULL DEFAULT 1,
                INDEX \`IDX_49fe63dd92219c89a77642ed62\` (\`oid\`, \`debt\`),
                INDEX \`IDX_84962f02b4390444121d73c58a\` (\`oid\`, \`phone\`),
                INDEX \`IDX_65d0c6e1354a475ef03e6071e2\` (\`oid\`, \`full_name_en\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`diagnosis\` (
                \`oid\` int NOT NULL,
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`other_id\` varchar(255) NULL,
                \`arrival_id\` int NULL,
                \`reason\` varchar(255) NULL,
                \`summary\` text NULL,
                \`diagnosis\` varchar(255) NULL,
                \`pulse\` tinyint UNSIGNED NULL,
                \`temperature\` float(3, 1) NULL,
                \`blood_pressure\` varchar(10) NULL,
                \`respiratory_rate\` tinyint NULL,
                \`spo2\` tinyint NULL,
                \`height\` tinyint UNSIGNED NULL,
                \`weight\` tinyint UNSIGNED NULL,
                \`note\` varchar(255) NULL,
                INDEX \`IDX_b7e3f5da764ed431b3acb0412d\` (\`arrival_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`distributor_debt\` (
                \`oid\` int NOT NULL,
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`other_id\` varchar(255) NULL,
                \`distributor_id\` int NOT NULL,
                \`receipt_id\` int NOT NULL DEFAULT '0',
                \`type\` tinyint NOT NULL,
                \`open_debt\` int NOT NULL,
                \`money\` int NOT NULL,
                \`close_debt\` int NOT NULL,
                \`create_time\` bigint NOT NULL,
                \`note\` varchar(255) NULL,
                INDEX \`IDX_30800e79e2cab0345762b42f11\` (\`oid\`, \`distributor_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`customer_debt\` (
                \`oid\` int NOT NULL,
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`other_id\` varchar(255) NULL,
                \`customer_id\` int NOT NULL,
                \`invoice_id\` int NOT NULL DEFAULT '0',
                \`type\` tinyint NOT NULL,
                \`create_time\` bigint NOT NULL,
                \`open_debt\` int NOT NULL,
                \`money\` int NOT NULL,
                \`close_debt\` int NOT NULL,
                \`note\` varchar(255) NULL,
                INDEX \`IDX_58d7593e401ba54185a6f1617b\` (\`oid\`, \`customer_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
      CREATE TABLE \`arrival\` (
        \`oid\` int NOT NULL,
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`other_id\` varchar(255) NULL,
        \`customer_id\` int NULL,
        \`diagnosis_id\` int NULL,
        \`type\` tinyint NOT NULL DEFAULT '0',
        \`status\` tinyint NOT NULL DEFAULT '0',
        \`payment_status\` tinyint NOT NULL DEFAULT '0',
        \`create_time\` bigint NULL,
        \`end_time\` bigint NULL,
        \`total_money\` int NOT NULL DEFAULT '0',
        \`profit\` int NOT NULL DEFAULT '0',
        \`debt\` int NOT NULL DEFAULT '0',
        INDEX \`IDX_4b964e192a33979d00bec2b34d\` (\`oid\`, \`customer_id\`, \`create_time\`),
        INDEX \`IDX_0819acd372dac1668c0afbcc71\` (\`oid\`, \`create_time\`),
        INDEX \`IDX_1ae827fce2d5aa2dee2370f043\` (\`oid\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE = InnoDB
    `)
    await queryRunner.query(`
            CREATE TABLE \`invoice\` (
                \`oid\` int NOT NULL,
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`other_id\` varchar(255) NULL,
                \`arrival_id\` int NOT NULL DEFAULT '0',
                \`customer_id\` int NOT NULL,
                \`payment_status\` tinyint NOT NULL,
                \`payment_time\` bigint NULL,
                \`refund_time\` bigint NULL,
                \`total_cost_money\` int NOT NULL,
                \`total_item_money\` int NOT NULL,
                \`discount_money\` int NOT NULL DEFAULT '0',
                \`discount_percent\` int NOT NULL DEFAULT '0',
                \`discount_type\` enum ('%', 'VNĐ') NOT NULL DEFAULT 'VNĐ',
                \`surcharge\` int NOT NULL DEFAULT '0',
                \`total_money\` int NOT NULL,
                \`expenses\` int NOT NULL DEFAULT '0',
                \`profit\` int NOT NULL,
                \`debt\` int NOT NULL DEFAULT '0',
                \`note\` varchar(255) NULL,
                INDEX \`IDX_fa89aa3d5768ec2d54ffbd0b60\` (\`oid\`, \`payment_time\`),
                INDEX \`IDX_1eb552f67f21dfd6c2b999f702\` (\`oid\`, \`arrival_id\`),
                INDEX \`IDX_3655a45b4999ca5fa614e8901d\` (\`oid\`, \`customer_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`procedure\` (
                \`oid\` int NOT NULL,
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`other_id\` varchar(255) NULL,
                \`name_en\` varchar(255) NULL,
                \`name_vi\` varchar(255) NULL,
                \`group\` varchar(255) NULL,
                \`price\` int NULL,
                \`consumable_hint\` text NULL,
                \`is_active\` tinyint NOT NULL DEFAULT 1,
                INDEX \`IDX_6fed1d3f8cff2a7e68abae8767\` (\`oid\`, \`name_en\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`product\` (
                \`oid\` int NOT NULL,
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`other_id\` varchar(255) NULL,
                \`brand_name\` varchar(255) NOT NULL,
                \`substance\` varchar(255) NULL,
                \`group\` varchar(255) NULL,
                \`unit\` varchar(255) NULL,
                \`route\` varchar(255) NULL,
                \`source\` varchar(255) NULL,
                \`image\` varchar(255) NULL,
                \`hint_usage\` varchar(255) NULL,
                \`is_active\` tinyint NOT NULL DEFAULT 1,
                INDEX \`IDX_6bb1fffbeca2cb0056710910c1\` (\`oid\`, \`is_active\`),
                INDEX \`IDX_d7a4a50504b4651387dee06e91\` (\`oid\`, \`group\`),
                INDEX \`IDX_4a411f49c5e353bcac9b7b00a0\` (\`oid\`, \`substance\`),
                INDEX \`IDX_920f1fb7e84a62bb1989f6967a\` (\`oid\`, \`brand_name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`product_batch\` (
                \`oid\` int NOT NULL,
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`other_id\` varchar(255) NULL,
                \`product_id\` int NOT NULL,
                \`batch\` varchar(255) NOT NULL DEFAULT '',
                \`expiry_date\` bigint NULL,
                \`cost_price\` int NOT NULL DEFAULT '0',
                \`wholesale_price\` int NOT NULL DEFAULT '0',
                \`retail_price\` int NOT NULL DEFAULT '0',
                \`quantity\` int NOT NULL DEFAULT '0',
                INDEX \`IDX_37a39dd69157bacf84fdf01633\` (\`oid\`, \`product_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`invoice_item\` (
                \`oid\` int NOT NULL,
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`other_id\` varchar(255) NULL,
                \`invoice_id\` int NOT NULL,
                \`customer_id\` int NOT NULL,
                \`reference_id\` int NOT NULL,
                \`type\` tinyint NOT NULL,
                \`unit\` varchar(255) NOT NULL DEFAULT '{"name":"","rate":1}',
                \`cost_price\` int NULL,
                \`expected_price\` int NULL,
                \`discount_money\` int NOT NULL DEFAULT '0',
                \`discount_percent\` int NOT NULL DEFAULT '0',
                \`discount_type\` enum ('%', 'VNĐ') NOT NULL DEFAULT 'VNĐ',
                \`actual_price\` int NOT NULL,
                \`quantity\` int NOT NULL DEFAULT '0',
                INDEX \`IDX_34e829a73cb24dc6b06eec7844\` (\`oid\`, \`reference_id\`),
                INDEX \`IDX_39bb19ddb85b01a267f8ddb554\` (\`oid\`, \`customer_id\`, \`type\`),
                INDEX \`IDX_c67bd177d02805fdbd027f98ec\` (\`oid\`, \`invoice_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`organization\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`phone\` char(10) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`level\` tinyint NOT NULL DEFAULT '0',
                \`organization_name\` varchar(255) NULL,
                \`address_province\` varchar(255) NULL,
                \`address_district\` varchar(255) NULL,
                \`address_ward\` varchar(255) NULL,
                \`address_street\` varchar(255) NULL,
                \`create_time\` bigint NULL,
                UNIQUE INDEX \`IDX_5d06de67ef6ab02cbd938988bb\` (\`email\`),
                UNIQUE INDEX \`IDX_d11ed6c5ea801c6eda5bb7aee1\` (\`phone\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`employee\` (
                \`oid\` int NOT NULL,
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`other_id\` varchar(255) NULL,
                \`phone\` char(10) NULL,
                \`username\` varchar(255) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`secret\` varchar(255) NULL,
                \`role\` tinyint NOT NULL DEFAULT '2',
                \`full_name\` varchar(255) NULL,
                \`birthday\` bigint NULL,
                \`gender\` tinyint NULL,
                UNIQUE INDEX \`IDX_EMPLOYEE__OID_USERNAME\` (\`oid\`, \`username\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`distributor\` (
                \`oid\` int NOT NULL,
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`other_id\` varchar(255) NULL,
                \`full_name_en\` varchar(255) NOT NULL,
                \`full_name_vi\` varchar(255) NOT NULL,
                \`phone\` char(10) NULL,
                \`address_province\` varchar(255) NULL,
                \`address_district\` varchar(255) NULL,
                \`address_ward\` varchar(255) NULL,
                \`address_street\` varchar(255) NULL,
                \`debt\` int NOT NULL DEFAULT '0',
                \`note\` varchar(255) NULL,
                \`is_active\` tinyint NOT NULL DEFAULT 1,
                INDEX \`IDX_e8cab0ac13371c4708272747e7\` (\`oid\`, \`debt\`),
                INDEX \`IDX_214fb8d03085aaaf7888fcdb06\` (\`oid\`, \`phone\`),
                INDEX \`IDX_31fe00a5e47aa49f7526c468e7\` (\`oid\`, \`full_name_en\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`organization_setting\` (
                \`oid\` int NOT NULL,
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`other_id\` varchar(255) NULL,
                \`type\` varchar(255) NOT NULL,
                \`data\` text NOT NULL,
                UNIQUE INDEX \`IDX_ORG_SETTING_TYPE\` (\`oid\`, \`type\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
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
    await queryRunner.query(`
            CREATE TABLE \`receipt_item\` (
                \`oid\` int NOT NULL,
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`other_id\` varchar(255) NULL,
                \`receipt_id\` int NOT NULL,
                \`product_batch_id\` int NOT NULL,
                \`unit\` varchar(255) NOT NULL DEFAULT '{"name":"","rate":1}',
                \`quantity\` int NOT NULL,
                INDEX \`IDX_2dc6dbe700bc9f6bb01d01fbd0\` (\`oid\`, \`receipt_id\`),
                INDEX \`IDX_6b1183515b9d1d6d9aed30eb0b\` (\`oid\`, \`product_batch_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
            CREATE TABLE \`receipt\` (
                \`oid\` int NOT NULL,
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`other_id\` varchar(255) NULL,
                \`purchase_id\` int NOT NULL,
                \`distributor_id\` int NOT NULL,
                \`payment_status\` tinyint NOT NULL,
                \`payment_time\` bigint NULL,
                \`refund_time\` bigint NULL,
                \`total_item_money\` bigint NOT NULL,
                \`discount_money\` int NOT NULL DEFAULT '0',
                \`discount_percent\` int NOT NULL DEFAULT '0',
                \`discount_type\` enum ('%', 'VNĐ') NOT NULL DEFAULT 'VNĐ',
                \`surcharge\` int NOT NULL DEFAULT '0',
                \`total_money\` bigint NOT NULL,
                \`debt\` int NOT NULL DEFAULT '0',
                \`note\` varchar(255) NULL,
                INDEX \`IDX_ddbeebd03fdcebab9803ef6a86\` (\`oid\`, \`payment_time\`),
                INDEX \`IDX_f8b7ca556bf5b4a5ea451385a1\` (\`oid\`, \`purchase_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `)
    await queryRunner.query(`
      CREATE TABLE \`product_movement\` (
        \`oid\` int NOT NULL,
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`other_id\` varchar(255) NULL,
        \`product_id\` int NOT NULL,
        \`product_batch_id\` int NOT NULL,
        \`reference_id\` int NOT NULL,
        \`type\` tinyint NOT NULL,
        \`is_refund\` tinyint NOT NULL DEFAULT 0,
        \`open_quantity\` int NOT NULL,
        \`number\` int NOT NULL,
        \`close_quantity\` int NOT NULL,
        \`price\` int NOT NULL DEFAULT '0',
        \`total_money\` int NOT NULL DEFAULT '0',
        \`create_time\` bigint NOT NULL,
        INDEX \`IDX_f5dd499805216ed53f217dbb5d\` (\`oid\`, \`product_batch_id\`, \`create_time\`),
        INDEX \`IDX_ce98293f52d5ce63c778847e4d\` (\`oid\`, \`product_id\`, \`create_time\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE = InnoDB
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`IDX_ce98293f52d5ce63c778847e4d\` ON \`product_movement\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_f5dd499805216ed53f217dbb5d\` ON \`product_movement\`
        `)
    await queryRunner.query(`
            DROP TABLE \`product_movement\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_f8b7ca556bf5b4a5ea451385a1\` ON \`receipt\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_ddbeebd03fdcebab9803ef6a86\` ON \`receipt\`
        `)
    await queryRunner.query(`
            DROP TABLE \`receipt\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_6b1183515b9d1d6d9aed30eb0b\` ON \`receipt_item\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_2dc6dbe700bc9f6bb01d01fbd0\` ON \`receipt_item\`
        `)
    await queryRunner.query(`
            DROP TABLE \`receipt_item\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_dbbd540cfea3d9a0e6bc33f9b2\` ON \`purchase\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_10e11701749dd3a151ed89a641\` ON \`purchase\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_35dcb0db1566a6590f7472fb37\` ON \`purchase\`
        `)
    await queryRunner.query(`
            DROP TABLE \`purchase\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_ORG_SETTING_TYPE\` ON \`organization_setting\`
        `)
    await queryRunner.query(`
            DROP TABLE \`organization_setting\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_31fe00a5e47aa49f7526c468e7\` ON \`distributor\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_214fb8d03085aaaf7888fcdb06\` ON \`distributor\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_e8cab0ac13371c4708272747e7\` ON \`distributor\`
        `)
    await queryRunner.query(`
            DROP TABLE \`distributor\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_EMPLOYEE__OID_USERNAME\` ON \`employee\`
        `)
    await queryRunner.query(`
            DROP TABLE \`employee\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_d11ed6c5ea801c6eda5bb7aee1\` ON \`organization\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_5d06de67ef6ab02cbd938988bb\` ON \`organization\`
        `)
    await queryRunner.query(`
            DROP TABLE \`organization\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_c67bd177d02805fdbd027f98ec\` ON \`invoice_item\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_39bb19ddb85b01a267f8ddb554\` ON \`invoice_item\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_34e829a73cb24dc6b06eec7844\` ON \`invoice_item\`
        `)
    await queryRunner.query(`
            DROP TABLE \`invoice_item\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_37a39dd69157bacf84fdf01633\` ON \`product_batch\`
        `)
    await queryRunner.query(`
            DROP TABLE \`product_batch\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_920f1fb7e84a62bb1989f6967a\` ON \`product\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_4a411f49c5e353bcac9b7b00a0\` ON \`product\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_d7a4a50504b4651387dee06e91\` ON \`product\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_6bb1fffbeca2cb0056710910c1\` ON \`product\`
        `)
    await queryRunner.query(`
            DROP TABLE \`product\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_6fed1d3f8cff2a7e68abae8767\` ON \`procedure\`
        `)
    await queryRunner.query(`
            DROP TABLE \`procedure\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_3655a45b4999ca5fa614e8901d\` ON \`invoice\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_1eb552f67f21dfd6c2b999f702\` ON \`invoice\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_fa89aa3d5768ec2d54ffbd0b60\` ON \`invoice\`
        `)
    await queryRunner.query(`
            DROP TABLE \`invoice\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_1ae827fce2d5aa2dee2370f043\` ON \`arrival\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_0819acd372dac1668c0afbcc71\` ON \`arrival\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_4b964e192a33979d00bec2b34d\` ON \`arrival\`
        `)
    await queryRunner.query(`
            DROP TABLE \`arrival\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_58d7593e401ba54185a6f1617b\` ON \`customer_debt\`
        `)
    await queryRunner.query(`
            DROP TABLE \`customer_debt\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_30800e79e2cab0345762b42f11\` ON \`distributor_debt\`
        `)
    await queryRunner.query(`
            DROP TABLE \`distributor_debt\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_b7e3f5da764ed431b3acb0412d\` ON \`diagnosis\`
        `)
    await queryRunner.query(`
            DROP TABLE \`diagnosis\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_65d0c6e1354a475ef03e6071e2\` ON \`customer\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_84962f02b4390444121d73c58a\` ON \`customer\`
        `)
    await queryRunner.query(`
            DROP INDEX \`IDX_49fe63dd92219c89a77642ed62\` ON \`customer\`
        `)
    await queryRunner.query(`
            DROP TABLE \`customer\`
        `)
  }
}

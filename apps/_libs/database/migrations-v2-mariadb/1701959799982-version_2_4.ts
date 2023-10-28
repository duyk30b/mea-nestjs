import { MigrationInterface, QueryRunner } from 'typeorm'

export class version241701959799982 implements MigrationInterface {
  name = 'version241701959799982'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`IDX_Product__oid_isActive\` ON \`Product\`
        `)

    await queryRunner.query(`
            ALTER TABLE \`Customer\` 
                CHANGE \`isActive\` \`isActive\` smallint NOT NULL DEFAULT '1'
        `)

    await queryRunner.query(`
            ALTER TABLE \`Procedure\` 
                CHANGE \`isActive\` \`isActive\` smallint NOT NULL DEFAULT '1'
        `)

    await queryRunner.query(`
            ALTER TABLE \`Product\` 
                CHANGE \`isActive\` \`isActive\` smallint NOT NULL DEFAULT '1'
        `)

    await queryRunner.query(`
            ALTER TABLE \`ProductBatch\` 
                CHANGE \`isActive\` \`isActive\` smallint NOT NULL DEFAULT '1'
        `)

    await queryRunner.query(`
            ALTER TABLE \`ProductMovement\` 
                CHANGE \`isRefund\` \`isRefund\` smallint NOT NULL DEFAULT '0'
        `)

    await queryRunner.query(`
            ALTER TABLE \`Distributor\` 
                CHANGE \`isActive\` \`isActive\` smallint NOT NULL DEFAULT '1'
        `)

    await queryRunner.query(`
            ALTER TABLE \`User\`
                CHANGE \`isActive\` \`isActive\` smallint NOT NULL DEFAULT '1'
        `)

    await queryRunner.query(`
            ALTER TABLE \`InvoiceItem\` 
                CHANGE \`discountType\` \`discountTypeOld\` enum ('%', 'VNĐ') NOT NULL DEFAULT 'VNĐ'
        `)
    await queryRunner.query(`
            ALTER TABLE \`InvoiceItem\` 
                ADD \`discountType\` varchar(255) NOT NULL DEFAULT 'VNĐ'
        `)
    await queryRunner.query(`
            UPDATE \`InvoiceItem\` 
                SET discountType = 
                    CASE discountTypeOld 
                        WHEN '%' THEN '%' 
                        ELSE 'VNĐ' 
                    END
        `)

    await queryRunner.query(`
      ALTER TABLE \`Invoice\` 
        CHANGE \`discountType\` \`discountTypeOld\` enum ('%', 'VNĐ') NOT NULL DEFAULT 'VNĐ',
        CHANGE \`status\` \`status\` smallint NOT NULL DEFAULT '1'
    `)
    await queryRunner.query(`
            ALTER TABLE \`Invoice\` 
                ADD \`discountType\` varchar(255) NOT NULL DEFAULT 'VNĐ'
        `)
    await queryRunner.query(`
            UPDATE \`Invoice\` 
                SET discountType = 
                    CASE discountTypeOld 
                        WHEN '%' THEN '%' 
                        ELSE 'VNĐ' 
                    END
        `)

    await queryRunner.query(`
      ALTER TABLE \`Receipt\` 
        CHANGE \`discountType\` \`discountTypeOld\` enum ('%', 'VNĐ') NOT NULL DEFAULT 'VNĐ',
        CHANGE \`discountPercent\` \`discountPercent\` smallint NOT NULL DEFAULT '0'
    `)
    await queryRunner.query(`
            ALTER TABLE \`Receipt\` 
                ADD \`discountType\` varchar(255) NOT NULL DEFAULT 'VNĐ'
        `)
    await queryRunner.query(`
            UPDATE \`Receipt\` 
                SET discountType = 
                    CASE discountTypeOld 
                        WHEN '%' THEN '%' 
                        ELSE 'VNĐ' 
                    END
        `)

    await queryRunner.query(`
            ALTER TABLE \`InvoiceItem\` DROP COLUMN \`discountTypeOld\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`Invoice\` DROP COLUMN \`discountTypeOld\`
        `)
    await queryRunner.query(`
            ALTER TABLE \`Receipt\` DROP COLUMN \`discountTypeOld\`
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 ~ down')
  }
}

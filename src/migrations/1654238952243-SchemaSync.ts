import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaSync1654238952243 implements MigrationInterface {
    name = 'SchemaSync1654238952243'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coffee" ADD "description" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coffee" DROP COLUMN "description"`);
    }

}

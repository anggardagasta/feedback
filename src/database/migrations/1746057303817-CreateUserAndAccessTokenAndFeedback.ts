import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserAndAccessTokenAndFeedback1746057303817 implements MigrationInterface {
    name = 'CreateUserAndAccessTokenAndFeedback1746057303817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('ADMIN', 'USER')`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'USER', "status" "public"."user_status_enum" NOT NULL DEFAULT 'INACTIVE', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "access_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "token" character varying NOT NULL, "isValid" boolean NOT NULL DEFAULT false, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f20f028607b2603deabd8182d12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9949557d0e1b2c19e5344c171e" ON "access_token" ("userId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_70ba8f6af34bc924fc9e12adb8" ON "access_token" ("token") `);
        await queryRunner.query(`CREATE TYPE "public"."feedback_category_enum" AS ENUM('BUG', 'FEATURE', 'GENERAL')`);
        await queryRunner.query(`CREATE TYPE "public"."feedback_status_enum" AS ENUM('PENDING', 'REVIEWED', 'RESOLVED')`);
        await queryRunner.query(`CREATE TABLE "feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "content" text NOT NULL, "category" "public"."feedback_category_enum" NOT NULL DEFAULT 'GENERAL', "status" "public"."feedback_status_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4a39e6ac0cecdf18307a365cf3" ON "feedback" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_4a39e6ac0cecdf18307a365cf3"`);
        await queryRunner.query(`DROP TABLE "feedback"`);
        await queryRunner.query(`DROP TYPE "public"."feedback_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."feedback_category_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_70ba8f6af34bc924fc9e12adb8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9949557d0e1b2c19e5344c171e"`);
        await queryRunner.query(`DROP TABLE "access_token"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}

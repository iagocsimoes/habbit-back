-- AlterEnum
-- Remove values from Plan enum
ALTER TYPE "Plan" RENAME TO "Plan_old";
CREATE TYPE "Plan" AS ENUM ('PRO');
ALTER TABLE "users" ALTER COLUMN "plan" TYPE "Plan" USING ("plan"::text::"Plan");
ALTER TABLE "subscriptions" ALTER COLUMN "plan" TYPE "Plan" USING ("plan"::text::"Plan");
DROP TYPE "Plan_old";

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "subscriptions" ADD COLUMN "stripe_subscription_id" TEXT;

-- CreateTable
CREATE TABLE "plan_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "monthly_limit" INTEGER NOT NULL,
    "stripe_price_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "features" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_configs_name_key" ON "plan_configs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- Insert default PRO plan
INSERT INTO "plan_configs" ("id", "name", "display_name", "price", "currency", "monthly_limit", "features", "created_at", "updated_at")
VALUES (
    gen_random_uuid(),
    'PRO',
    'Plano PRO',
    24.90,
    'BRL',
    3000,
    '["3000 correções por mês", "Correção em tempo real", "3 idiomas (PT, EN, ES)", "Histórico completo", "5 estilos de correção"]'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

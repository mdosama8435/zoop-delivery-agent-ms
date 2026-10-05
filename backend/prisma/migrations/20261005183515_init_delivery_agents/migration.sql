-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "delivery_agents" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "service_area" VARCHAR(100) NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "delivery_agents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_agents_phone_key" ON "delivery_agents"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_agents_email_key" ON "delivery_agents"("email");

-- CreateIndex
CREATE INDEX "idx_agents_status" ON "delivery_agents"("status");

-- CreateIndex
CREATE INDEX "idx_agents_service_area" ON "delivery_agents"("service_area");

-- CreateIndex
CREATE INDEX "idx_agents_created_at" ON "delivery_agents"("created_at" DESC);

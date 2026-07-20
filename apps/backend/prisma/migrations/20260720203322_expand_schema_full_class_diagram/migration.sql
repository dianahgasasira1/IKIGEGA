-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('RETAIL', 'WHOLESALE', 'SERVICES', 'FARMING', 'MIXED', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SALE', 'PURCHASE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "MomoEventStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "RotationFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "businessType" "BusinessType" NOT NULL DEFAULT 'RETAIL',
    "primaryProducts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currentStock" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lowStockThreshold" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'unit',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "itemName" TEXT NOT NULL,
    "inventoryItemId" TEXT,
    "quantity" DECIMAL(12,2) NOT NULL DEFAULT 1,
    "amount" DECIMAL(14,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "original_audio" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "audioBlobUrl" TEXT NOT NULL,
    "originalTranscript" TEXT NOT NULL,
    "correctedTranscript" TEXT,
    "confidence" DECIMAL(4,3),
    "consentToKeep" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "original_audio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "momo_events" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT,
    "counterpartyMsisdnHash" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "MomoEventStatus" NOT NULL DEFAULT 'PENDING',
    "externalReference" TEXT NOT NULL,
    "reconciled" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "momo_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ibimina_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chairwomanId" TEXT NOT NULL,
    "contributionAmount" DECIMAL(12,2) NOT NULL,
    "rotationFrequency" "RotationFrequency" NOT NULL DEFAULT 'MONTHLY',
    "inviteCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ibimina_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributions" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voiceConfirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_readiness_statements" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "revenue" DECIMAL(14,2) NOT NULL,
    "costs" DECIMAL(14,2) NOT NULL,
    "profit" DECIMAL(14,2) NOT NULL,
    "readinessScore" DECIMAL(5,2) NOT NULL,
    "pdfUrl" TEXT,
    "shareToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_readiness_statements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "businesses_ownerId_key" ON "businesses"("ownerId");

-- CreateIndex
CREATE INDEX "inventory_items_businessId_idx" ON "inventory_items"("businessId");

-- CreateIndex
CREATE INDEX "transactions_businessId_idx" ON "transactions"("businessId");

-- CreateIndex
CREATE INDEX "transactions_timestamp_idx" ON "transactions"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "original_audio_transactionId_key" ON "original_audio"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "momo_events_transactionId_key" ON "momo_events"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "momo_events_externalReference_key" ON "momo_events"("externalReference");

-- CreateIndex
CREATE INDEX "momo_events_reconciled_idx" ON "momo_events"("reconciled");

-- CreateIndex
CREATE INDEX "momo_events_timestamp_idx" ON "momo_events"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "ibimina_groups_inviteCode_key" ON "ibimina_groups"("inviteCode");

-- CreateIndex
CREATE INDEX "ibimina_groups_chairwomanId_idx" ON "ibimina_groups"("chairwomanId");

-- CreateIndex
CREATE INDEX "contributions_groupId_idx" ON "contributions"("groupId");

-- CreateIndex
CREATE INDEX "contributions_memberId_idx" ON "contributions"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "credit_readiness_statements_shareToken_key" ON "credit_readiness_statements"("shareToken");

-- CreateIndex
CREATE INDEX "credit_readiness_statements_businessId_idx" ON "credit_readiness_statements"("businessId");

-- CreateIndex
CREATE INDEX "credit_readiness_statements_periodEnd_idx" ON "credit_readiness_statements"("periodEnd");

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "original_audio" ADD CONSTRAINT "original_audio_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "momo_events" ADD CONSTRAINT "momo_events_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ibimina_groups" ADD CONSTRAINT "ibimina_groups_chairwomanId_fkey" FOREIGN KEY ("chairwomanId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ibimina_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_readiness_statements" ADD CONSTRAINT "credit_readiness_statements_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

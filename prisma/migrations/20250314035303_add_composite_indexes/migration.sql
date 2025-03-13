-- CreateIndex
CREATE INDEX "trades_type_id_idx" ON "trades"("type", "id");

-- CreateIndex
CREATE INDEX "trades_user_id_id_idx" ON "trades"("user_id", "id");

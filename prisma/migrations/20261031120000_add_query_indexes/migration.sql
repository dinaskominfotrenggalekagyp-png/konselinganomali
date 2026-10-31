-- Index untuk kolom yang dipakai sebagai filter/urutan di halaman publik & admin.
-- Tabel masih kecil, tetapi index ini menjaga performa saat data bertambah.

CREATE INDEX "Article_published_publishedAt_idx" ON "Article"("published", "publishedAt");
CREATE INDEX "Service_isActive_category_idx" ON "Service"("isActive", "category");
CREATE INDEX "Service_isActive_name_idx" ON "Service"("isActive", "name");
CREATE INDEX "Psychologist_isActive_reviews_idx" ON "Psychologist"("isActive", "reviews");
CREATE INDEX "Assessment_isActive_title_idx" ON "Assessment"("isActive", "title");
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");
CREATE INDEX "Booking_psychologistId_date_idx" ON "Booking"("psychologistId", "date");
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

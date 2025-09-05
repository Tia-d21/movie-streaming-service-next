/*
  Warnings:

  - A unique constraint covering the columns `[userId,movieId]` on the table `WatchHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WatchHistory_userId_movieId_key" ON "public"."WatchHistory"("userId", "movieId");

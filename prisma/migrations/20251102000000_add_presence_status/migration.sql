-- CreateEnum
CREATE TYPE "PresenceStatus" AS ENUM ('IN_LAB', 'ON_CAMPUS', 'OFF_CAMPUS');

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "presenceStatus" "PresenceStatus" NOT NULL DEFAULT 'OFF_CAMPUS';

-- Seed existing rows based on current check-in state
UPDATE "UserProfile" SET "presenceStatus" = 'IN_LAB' WHERE "isCheckedIn" = true;

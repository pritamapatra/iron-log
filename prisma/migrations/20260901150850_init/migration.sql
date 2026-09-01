-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('STRENGTH', 'CARDIO');

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ExerciseType" NOT NULL,
    "muscleGroup" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_days" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequencePosition" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_day_items" (
    "id" TEXT NOT NULL,
    "routineDayId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "plannedSets" INTEGER,
    "plannedReps" INTEGER,
    "plannedWeightKg" DOUBLE PRECISION,
    "plannedDurationMin" DOUBLE PRECISION,
    "plannedDistanceKm" DOUBLE PRECISION,
    "plannedInclinePct" DOUBLE PRECISION,
    "plannedSpeedKmh" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_day_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" TEXT NOT NULL,
    "routineDayId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "set_logs" (
    "id" TEXT NOT NULL,
    "workoutSessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "setNumber" INTEGER,
    "actualWeightKg" DOUBLE PRECISION,
    "actualReps" INTEGER,
    "actualDurationMin" DOUBLE PRECISION,
    "actualDistanceKm" DOUBLE PRECISION,
    "actualInclinePct" DOUBLE PRECISION,
    "actualSpeedKmh" DOUBLE PRECISION,
    "actualCalories" DOUBLE PRECISION,
    "actualAvgHeartRate" INTEGER,
    "note" TEXT,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "set_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bca_entries" (
    "id" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "bodyFatPct" DOUBLE PRECISION NOT NULL,
    "visceralFat" DOUBLE PRECISION NOT NULL,
    "restingMetabolism" DOUBLE PRECISION NOT NULL,
    "bmi" DOUBLE PRECISION NOT NULL,
    "bodyAge" INTEGER NOT NULL,
    "subcutaneousFatTotal" DOUBLE PRECISION NOT NULL,
    "subcutaneousFatTrunk" DOUBLE PRECISION NOT NULL,
    "subcutaneousFatArm" DOUBLE PRECISION NOT NULL,
    "subcutaneousFatLeg" DOUBLE PRECISION NOT NULL,
    "skeletalMuscleTotal" DOUBLE PRECISION NOT NULL,
    "skeletalMuscleTrunk" DOUBLE PRECISION NOT NULL,
    "skeletalMuscleArm" DOUBLE PRECISION NOT NULL,
    "skeletalMuscleLeg" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bca_entries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "routine_day_items" ADD CONSTRAINT "routine_day_items_routineDayId_fkey" FOREIGN KEY ("routineDayId") REFERENCES "routine_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_day_items" ADD CONSTRAINT "routine_day_items_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_routineDayId_fkey" FOREIGN KEY ("routineDayId") REFERENCES "routine_days"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Contract" (
    "address" CHAR(40) NOT NULL,
    "lastProcessedBlock" BIGINT NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("address")
);

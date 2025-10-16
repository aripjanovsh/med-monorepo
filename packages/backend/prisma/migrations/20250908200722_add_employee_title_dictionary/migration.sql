-- CreateTable
CREATE TABLE "employee_titles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "employee_titles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_titles_title_key" ON "employee_titles"("title");

-- CreateIndex
CREATE UNIQUE INDEX "employee_titles_title_organizationId_key" ON "employee_titles"("title", "organizationId");

-- AddForeignKey
ALTER TABLE "employee_titles" ADD CONSTRAINT "employee_titles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

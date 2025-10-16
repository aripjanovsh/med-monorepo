import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { IsUniqueConstraint } from "../decorators/unique.decorator";
import { ConditionalValidationConstraint } from "../decorators/conditional-validation.decorator";

@Module({
  imports: [PrismaModule],
  providers: [IsUniqueConstraint, ConditionalValidationConstraint],
  exports: [IsUniqueConstraint, ConditionalValidationConstraint],
})
export class ValidationModule {}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "./common/prisma/prisma.service";

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  getHello(): string {
    return "Medical Clinic API is running!";
  }

  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV,
      dbStatus: this.prismaService.user.count(),
    };
  }
}

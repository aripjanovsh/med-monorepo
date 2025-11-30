import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserService } from "../user/user.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { CurrentUserData } from "@/common/decorators/current-user.decorator";
import { PrismaService } from "@/common/prisma/prisma.service";
import { plainToInstance } from "class-transformer";
import { MeResponseDto } from "./dto/me-response.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async validateUser(phone: string, password: string): Promise<any> {
    const user = await this.userService.findByPhone(phone);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.phone, loginDto.password);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = {
      id: user.id,
      phone: user.phone,
      sub: user.id,
      role: user.role,
      roles: Array.isArray(user.roleAssignments)
        ? user.roleAssignments.map((ra: any) => ra.role?.name).filter(Boolean)
        : [],
      organizationId: user.organizationId,
      employeeId: user.employee?.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        roles: Array.isArray(user.roleAssignments)
          ? user.roleAssignments.map((ra: any) => ra.role?.name).filter(Boolean)
          : [],
        organizationId: user.organizationId,
        employeeId: user.employee?.id,
      },
    };
  }

  async refreshToken(userId: string) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const payload = {
      id: user.id,
      phone: user.phone,
      sub: user.id,
      role: user.role,
      roles: user.roles || [],
      organizationId: user.organizationId,
      employeeId: user.employeeId,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(user: CurrentUserData) {
    // Get user with employee data including avatar, roles and permissions
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        employee: {
          include: {
            avatar: true,
            title: true,
            department: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        roleAssignments: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    });

    if (!userData) {
      throw new UnauthorizedException("User not found");
    }

    const { password: _, ...result } = userData;

    // Transform roles with their permissions
    const userRoles =
      userData.roleAssignments?.map((ra) => ({
        id: ra.role.id,
        name: ra.role.name,
        description: ra.role.description,
        permissions: ra.role.permissions?.map((rp) => rp.permission) ?? [],
      })) ?? [];

    // Collect unique permission names
    const permissionSet = new Set<string>();
    userRoles.forEach((role) => {
      role.permissions.forEach((permission) => {
        permissionSet.add(permission);
      });
    });
    const permissions = Array.from(permissionSet);

    return plainToInstance(MeResponseDto, {
      ...result,
      firstName: userData.employee?.firstName,
      lastName: userData.employee?.lastName,
      middleName: userData.employee?.middleName,
      email: userData.employee?.email,
      avatarId: userData.employee?.avatarId,
      avatar: userData.employee?.avatar,
      roles: userRoles.map((r) => r.name),
      employeeId: userData.employee?.id,
      userRoles,
      permissions,
    });
  }

  async updateProfile(user: CurrentUserData, dto: UpdateProfileDto) {
    if (!user.employeeId) {
      throw new UnauthorizedException("User has no employee profile");
    }

    // Update employee profile
    const updatedEmployee = await this.prisma.employee.update({
      where: { id: user.employeeId },
      data: {
        firstName: dto.firstName,
        middleName: dto.middleName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        avatarId: dto.avatarId,
      },
      include: {
        avatar: true,
        title: true,
        department: true,
      },
    });

    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      roles: user.roles,
      organizationId: user.organizationId,
      employeeId: user.employeeId,
      firstName: updatedEmployee.firstName,
      lastName: updatedEmployee.lastName,
      middleName: updatedEmployee.middleName,
      email: updatedEmployee.email,
      avatarId: updatedEmployee.avatarId,
      avatar: updatedEmployee.avatar,
    };
  }
}

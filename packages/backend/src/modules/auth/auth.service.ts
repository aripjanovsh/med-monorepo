import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserService } from "../user/user.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { CurrentUserData } from "@/common/decorators/current-user.decorator";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  getProfile(user: CurrentUserData) {
    return user;
  }
}

import { BadRequestException, Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthUser, CurrentUser, Public } from './auth.guard.js';
import { AuthService } from './auth.service.js';

type Credentials = { email?: unknown; password?: unknown };

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() body: Credentials) {
    const { email, password } = parseCredentials(body);
    if (password.length < 8) throw new BadRequestException('password must be at least 8 characters');
    return this.auth.register(email, password);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() body: Credentials) {
    const { email, password } = parseCredentials(body);
    return this.auth.login(email, password);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}

function parseCredentials(body: Credentials): { email: string; password: string } {
  if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    throw new BadRequestException('email is invalid');
  }
  if (typeof body.password !== 'string' || !body.password) {
    throw new BadRequestException('password is required');
  }
  return { email: body.email.trim().toLowerCase(), password: body.password };
}

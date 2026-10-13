import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { DB, Db } from '../db/db.module.js';
import { users } from '../db/schema.js';
import { AuthUser } from './auth.guard.js';
import { hashPassword, verifyPassword } from './password.js';

export interface AuthResult {
  token: string;
  user: AuthUser;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private readonly db: Db,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string): Promise<AuthResult> {
    const [user] = await this.db
      .insert(users)
      .values({ email, passwordHash: await hashPassword(password) })
      .onConflictDoNothing({ target: users.email })
      .returning({ id: users.id, email: users.email });
    if (!user) throw new ConflictException('Email already registered');
    return this.issue(user);
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issue({ id: user.id, email: user.email });
  }

  private async issue(user: AuthUser): Promise<AuthResult> {
    return { token: await this.jwt.signAsync({ sub: user.id, email: user.email }), user };
  }
}

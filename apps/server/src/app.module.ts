import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller.js';
import { AuthGuard } from './auth/auth.guard.js';
import { AuthService } from './auth/auth.service.js';
import { Config } from './config.js';
import { DbModule } from './db/db.module.js';
import { TodosController } from './todos/todos.controller.js';
import { TodosService } from './todos/todos.service.js';

@Module({})
export class AppModule {
  static forRoot(config: Config): DynamicModule {
    return {
      module: AppModule,
      imports: [
        DbModule.forRoot(config.databaseUrl),
        JwtModule.register({
          secret: config.jwtSecret,
          signOptions: { expiresIn: config.jwtExpiresIn as JwtSignOptions['expiresIn'] },
        }),
      ],
      controllers: [AuthController, TodosController],
      providers: [AuthService, TodosService, { provide: APP_GUARD, useClass: AuthGuard }],
    };
  }
}

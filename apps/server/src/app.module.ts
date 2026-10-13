import { DynamicModule, Module } from '@nestjs/common';
import { Config } from './config.js';
import { DbModule } from './db/db.module.js';
import { TodosController } from './todos/todos.controller.js';
import { TodosService } from './todos/todos.service.js';

@Module({})
export class AppModule {
  static forRoot(config: Config): DynamicModule {
    return {
      module: AppModule,
      imports: [DbModule.forRoot(config.databaseUrl)],
      controllers: [TodosController],
      providers: [TodosService],
    };
  }
}

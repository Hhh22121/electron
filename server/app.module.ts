import { DynamicModule, Module } from '@nestjs/common';
import { TodosController } from './todos/todos.controller.js';
import { DATA_FILE, TodosService } from './todos/todos.service.js';

@Module({})
export class AppModule {
  static forRoot(dataFile: string): DynamicModule {
    return {
      module: AppModule,
      controllers: [TodosController],
      providers: [TodosService, { provide: DATA_FILE, useValue: dataFile }],
    };
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthUser, CurrentUser } from '../auth/auth.guard.js';
import { TodosService } from './todos.service.js';

@Controller('todos')
export class TodosController {
  constructor(private readonly todos: TodosService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.todos.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() body: { title?: unknown }) {
    return this.todos.create(user.id, requireTitle(body.title));
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { title?: unknown; done?: unknown },
  ) {
    if (body.done !== undefined && typeof body.done !== 'boolean') {
      throw new BadRequestException('done must be a boolean');
    }
    const title = body.title === undefined ? undefined : requireTitle(body.title);
    return this.todos.update(user.id, id, { title, done: body.done });
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.todos.remove(user.id, id);
  }
}

function requireTitle(title: unknown): string {
  if (typeof title !== 'string' || !title.trim()) {
    throw new BadRequestException('title must be a non-empty string');
  }
  return title.trim();
}

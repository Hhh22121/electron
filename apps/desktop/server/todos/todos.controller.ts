import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { TodosService } from './todos.service.js';

@Controller('todos')
export class TodosController {
  constructor(private readonly todos: TodosService) {}

  @Get()
  findAll() {
    return this.todos.findAll();
  }

  @Post()
  create(@Body() body: { title?: unknown }) {
    return this.todos.create(requireTitle(body.title));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { title?: unknown; done?: unknown }) {
    if (body.done !== undefined && typeof body.done !== 'boolean') {
      throw new BadRequestException('done must be a boolean');
    }
    const title = body.title === undefined ? undefined : requireTitle(body.title);
    return this.todos.update(id, { title, done: body.done });
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    this.todos.remove(id);
  }
}

function requireTitle(title: unknown): string {
  if (typeof title !== 'string' || !title.trim()) {
    throw new BadRequestException('title must be a non-empty string');
  }
  return title.trim();
}

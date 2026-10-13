import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DB, Db } from '../db/db.module.js';
import { Todo, todos } from '../db/schema.js';

@Injectable()
export class TodosService {
  constructor(@Inject(DB) private readonly db: Db) {}

  findAll(): Promise<Todo[]> {
    return this.db.select().from(todos).orderBy(asc(todos.createdAt));
  }

  async create(title: string): Promise<Todo> {
    const [todo] = await this.db.insert(todos).values({ title }).returning();
    return todo;
  }

  async update(id: string, patch: Partial<Pick<Todo, 'title' | 'done'>>): Promise<Todo> {
    if (patch.title === undefined && patch.done === undefined) return this.get(id);
    const [todo] = await this.db.update(todos).set(patch).where(eq(todos.id, id)).returning();
    if (!todo) throw notFound(id);
    return todo;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.db.delete(todos).where(eq(todos.id, id)).returning({ id: todos.id });
    if (deleted.length === 0) throw notFound(id);
  }

  private async get(id: string): Promise<Todo> {
    const [todo] = await this.db.select().from(todos).where(eq(todos.id, id));
    if (!todo) throw notFound(id);
    return todo;
  }
}

function notFound(id: string) {
  return new NotFoundException(`Todo ${id} not found`);
}

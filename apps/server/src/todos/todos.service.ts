import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { DB, Db } from '../db/db.module.js';
import { Todo, todos } from '../db/schema.js';

/** All operations are scoped to the owning user; other users' todos behave as not found. */
@Injectable()
export class TodosService {
  constructor(@Inject(DB) private readonly db: Db) {}

  findAll(userId: string): Promise<Todo[]> {
    return this.db.select().from(todos).where(eq(todos.userId, userId)).orderBy(asc(todos.createdAt));
  }

  async create(userId: string, title: string): Promise<Todo> {
    const [todo] = await this.db.insert(todos).values({ userId, title }).returning();
    return todo;
  }

  async update(userId: string, id: string, patch: Partial<Pick<Todo, 'title' | 'done'>>): Promise<Todo> {
    if (patch.title === undefined && patch.done === undefined) return this.get(userId, id);
    const [todo] = await this.db.update(todos).set(patch).where(owned(userId, id)).returning();
    if (!todo) throw notFound(id);
    return todo;
  }

  async remove(userId: string, id: string): Promise<void> {
    const deleted = await this.db.delete(todos).where(owned(userId, id)).returning({ id: todos.id });
    if (deleted.length === 0) throw notFound(id);
  }

  private async get(userId: string, id: string): Promise<Todo> {
    const [todo] = await this.db.select().from(todos).where(owned(userId, id));
    if (!todo) throw notFound(id);
    return todo;
  }
}

function owned(userId: string, id: string) {
  return and(eq(todos.id, id), eq(todos.userId, userId));
}

function notFound(id: string) {
  return new NotFoundException(`Todo ${id} not found`);
}

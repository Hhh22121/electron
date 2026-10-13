import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Todo } from './todo.js';

export const DATA_FILE = 'DATA_FILE';

/** Stores todos in memory and persists them to a JSON file on every change. */
@Injectable()
export class TodosService {
  private todos: Todo[];

  constructor(@Inject(DATA_FILE) private readonly dataFile: string) {
    this.todos = this.load();
  }

  findAll(): Todo[] {
    return this.todos;
  }

  create(title: string): Todo {
    const todo: Todo = { id: randomUUID(), title, done: false, createdAt: new Date().toISOString() };
    this.todos.push(todo);
    this.save();
    return todo;
  }

  update(id: string, patch: Partial<Pick<Todo, 'title' | 'done'>>): Todo {
    const todo = this.get(id);
    if (patch.title !== undefined) todo.title = patch.title;
    if (patch.done !== undefined) todo.done = patch.done;
    this.save();
    return todo;
  }

  remove(id: string): void {
    this.get(id);
    this.todos = this.todos.filter((t) => t.id !== id);
    this.save();
  }

  private get(id: string): Todo {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) throw new NotFoundException(`Todo ${id} not found`);
    return todo;
  }

  private load(): Todo[] {
    try {
      return JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
    } catch {
      return [];
    }
  }

  private save(): void {
    fs.mkdirSync(path.dirname(this.dataFile), { recursive: true });
    fs.writeFileSync(this.dataFile, JSON.stringify(this.todos, null, 2));
  }
}

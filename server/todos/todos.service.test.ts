import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import 'reflect-metadata';
import { TodosService } from './todos.service.js';

function tmpFile() {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'todos-')), 'todos.json');
}

describe('TodosService', () => {
  it('creates, updates and removes todos', () => {
    const svc = new TodosService(tmpFile());
    const todo = svc.create('Buy milk');
    assert.equal(svc.findAll().length, 1);
    assert.equal(svc.update(todo.id, { done: true }).done, true);
    svc.remove(todo.id);
    assert.equal(svc.findAll().length, 0);
  });

  it('persists to disk and reloads', () => {
    const file = tmpFile();
    new TodosService(file).create('Persist me');
    assert.deepEqual(new TodosService(file).findAll().map((t) => t.title), ['Persist me']);
  });

  it('throws on unknown id', () => {
    assert.throws(() => new TodosService(tmpFile()).remove('nope'), /not found/);
  });
});

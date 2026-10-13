import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { INestApplication } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { DB, Db } from './db/db.module.js';

// Runs against a real Postgres: `docker compose up -d db` (creates the todo_test database).
const config = loadConfig({
  DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'postgres://todo:todo@127.0.0.1:5433/todo_test',
});

let app: INestApplication;
let base: string;

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : undefined };
}

before(async () => {
  app = await createApp(config, ['error']);
  await app.listen(0, '127.0.0.1');
  base = `${await app.getUrl()}/api`.replace('[::1]', '127.0.0.1');
});

beforeEach(async () => {
  await app.get<Db>(DB).execute(sql`TRUNCATE todos`);
});

after(async () => {
  await app.close();
});

describe('todos API', () => {
  it('creates, lists, updates and deletes a todo', async () => {
    const created = await api('POST', '/todos', { title: '  Buy milk ' });
    assert.equal(created.status, 201);
    assert.equal(created.body.title, 'Buy milk');
    assert.equal(created.body.done, false);

    const listed = await api('GET', '/todos');
    assert.deepEqual(listed.body.map((t: { id: string }) => t.id), [created.body.id]);

    const updated = await api('PATCH', `/todos/${created.body.id}`, { done: true });
    assert.equal(updated.body.done, true);

    assert.equal((await api('DELETE', `/todos/${created.body.id}`)).status, 204);
    assert.deepEqual((await api('GET', '/todos')).body, []);
  });

  it('validates input', async () => {
    assert.equal((await api('POST', '/todos', { title: '' })).status, 400);
    assert.equal((await api('PATCH', '/todos/not-a-uuid', { done: true })).status, 400);
    const { body } = await api('POST', '/todos', { title: 'x' });
    assert.equal((await api('PATCH', `/todos/${body.id}`, { done: 'yes' })).status, 400);
  });

  it('returns 404 for unknown ids', async () => {
    const id = '00000000-0000-4000-8000-000000000000';
    assert.equal((await api('PATCH', `/todos/${id}`, { done: true })).status, 404);
    assert.equal((await api('DELETE', `/todos/${id}`)).status, 404);
  });
});

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
  JWT_SECRET: 'test-secret',
});

let app: INestApplication;
let base: string;

async function api(method: string, path: string, { body, token }: { body?: unknown; token?: string } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : undefined };
}

async function register(email = 'a@example.com', password = 'password123'): Promise<string> {
  const res = await api('POST', '/auth/register', { body: { email, password } });
  assert.equal(res.status, 201);
  return res.body.token;
}

before(async () => {
  app = await createApp(config, ['error']);
  await app.listen(0, '127.0.0.1');
  base = `${await app.getUrl()}/api`.replace('[::1]', '127.0.0.1');
});

beforeEach(async () => {
  await app.get<Db>(DB).execute(sql`TRUNCATE users CASCADE`);
});

after(async () => {
  await app.close();
});

describe('auth API', () => {
  it('registers, logs in and returns the current user', async () => {
    const reg = await api('POST', '/auth/register', { body: { email: ' A@Example.com ', password: 'password123' } });
    assert.equal(reg.status, 201);
    assert.equal(reg.body.user.email, 'a@example.com');

    const login = await api('POST', '/auth/login', { body: { email: 'a@example.com', password: 'password123' } });
    assert.equal(login.status, 200);

    const me = await api('GET', '/auth/me', { token: login.body.token });
    assert.deepEqual(me.body, reg.body.user);
  });

  it('rejects duplicate emails, bad passwords and weak input', async () => {
    await register();
    assert.equal((await api('POST', '/auth/register', { body: { email: 'a@example.com', password: 'password123' } })).status, 409);
    assert.equal((await api('POST', '/auth/login', { body: { email: 'a@example.com', password: 'wrong-pass' } })).status, 401);
    assert.equal((await api('POST', '/auth/login', { body: { email: 'nobody@example.com', password: 'password123' } })).status, 401);
    assert.equal((await api('POST', '/auth/register', { body: { email: 'not-an-email', password: 'password123' } })).status, 400);
    assert.equal((await api('POST', '/auth/register', { body: { email: 'b@example.com', password: 'short' } })).status, 400);
  });

  it('requires a valid token', async () => {
    assert.equal((await api('GET', '/todos')).status, 401);
    assert.equal((await api('GET', '/todos', { token: 'garbage' })).status, 401);
  });
});

describe('todos API', () => {
  it('creates, lists, updates and deletes a todo', async () => {
    const token = await register();
    const created = await api('POST', '/todos', { token, body: { title: '  Buy milk ' } });
    assert.equal(created.status, 201);
    assert.equal(created.body.title, 'Buy milk');
    assert.equal(created.body.done, false);

    const listed = await api('GET', '/todos', { token });
    assert.deepEqual(listed.body.map((t: { id: string }) => t.id), [created.body.id]);

    const updated = await api('PATCH', `/todos/${created.body.id}`, { token, body: { done: true } });
    assert.equal(updated.body.done, true);

    assert.equal((await api('DELETE', `/todos/${created.body.id}`, { token })).status, 204);
    assert.deepEqual((await api('GET', '/todos', { token })).body, []);
  });

  it("keeps each user's todos private", async () => {
    const alice = await register('alice@example.com');
    const bob = await register('bob@example.com');
    const { body: todo } = await api('POST', '/todos', { token: alice, body: { title: 'secret' } });

    assert.deepEqual((await api('GET', '/todos', { token: bob })).body, []);
    assert.equal((await api('PATCH', `/todos/${todo.id}`, { token: bob, body: { done: true } })).status, 404);
    assert.equal((await api('DELETE', `/todos/${todo.id}`, { token: bob })).status, 404);
    assert.equal((await api('GET', '/todos', { token: alice })).body.length, 1);
  });

  it('validates input', async () => {
    const token = await register();
    assert.equal((await api('POST', '/todos', { token, body: { title: '' } })).status, 400);
    assert.equal((await api('PATCH', '/todos/not-a-uuid', { token, body: { done: true } })).status, 400);
    const { body } = await api('POST', '/todos', { token, body: { title: 'x' } });
    assert.equal((await api('PATCH', `/todos/${body.id}`, { token, body: { done: 'yes' } })).status, 400);
  });

  it('returns 404 for unknown ids', async () => {
    const token = await register();
    const id = '00000000-0000-4000-8000-000000000000';
    assert.equal((await api('PATCH', `/todos/${id}`, { token, body: { done: true } })).status, 404);
    assert.equal((await api('DELETE', `/todos/${id}`, { token })).status, 404);
  });
});

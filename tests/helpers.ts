import nock from 'nock';

/**
 * Создать путь API с префиксом /v1/
 */
export function apiPath(path: string): string {
  return `/v1/${path}`;
}

/**
 * Настроить базовый URL для тестов
 */
export function setup(baseUrl: string): string {
  return baseUrl;
}

/**
 * Создать мок для GET запроса
 */
export function mockGet(
  baseUrl: string,
  path: string,
  status: number,
  body?: string | object,
  headers?: Record<string, string>,
) {
  const scope = nock(baseUrl).get(path);
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      scope.matchHeader(key, value);
    });
  }
  return scope.reply(status, body || {});
}

/**
 * Создать мок для POST запроса
 */
export function mockPost(
  baseUrl: string,
  path: string,
  status: number,
  body?: string | object,
  headers?: Record<string, string>,
) {
  const scope = nock(baseUrl).post(path);
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      scope.matchHeader(key, value);
    });
  }
  return scope.reply(status, body || {});
}

/**
 * Создать мок для PUT запроса
 */
export function mockPut(
  baseUrl: string,
  path: string,
  status: number,
  body?: string | object,
  headers?: Record<string, string>,
) {
  const scope = nock(baseUrl).put(path);
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      scope.matchHeader(key, value);
    });
  }
  return scope.reply(status, body || {});
}

/**
 * Создать мок для DELETE запроса
 */
export function mockDelete(
  baseUrl: string,
  path: string,
  status: number,
  body?: string | object,
) {
  return nock(baseUrl)
    .delete(path)
    .reply(status, body || {});
}

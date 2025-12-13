import axios, { AxiosInstance } from 'axios';
import nock from 'nock';
import fs from 'fs';
import path from 'path';
import { ApiClient } from '../src/apiClient';
import { ApiError } from '../src/error';
import { apiPath } from './helpers';

describe('Showcase API', () => {
  let baseUrl: string;
  let client: ApiClient;
  let axiosInstance: AxiosInstance;

  beforeEach(() => {
    baseUrl = 'http://localhost:1234';
    axiosInstance = axios.create();
    client = new ApiClient(axiosInstance, baseUrl);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  function readFixture(name: string): string {
    return fs.readFileSync(
      path.join(__dirname, 'fixtures', name),
      'utf-8',
    );
  }

  test('test_get_showcase_success', async () => {
    const blog = 'blogx';

    const pathStr = apiPath(
      `blog/${blog}/showcase/?limit=10&only_visible=true`,
    );
    const raw = readFixture('api_response_showcase.json');

    nock(baseUrl)
      .get(pathStr)
      .reply(200, JSON.parse(raw), {
        'Content-Type': 'application/json',
      });

    const resp = await client.getShowcase(blog, 10, true);
    expect(resp.data.showcaseItems.length).toBeGreaterThan(0);
  });

  test('test_get_showcase_invalid_json', async () => {
    const blog = 'blogx';

    const pathStr = apiPath(`blog/${blog}/showcase/`);

    nock(baseUrl)
      .get(pathStr)
      .reply(200, 'invalid json', {
        'Content-Type': 'application/json',
      });

    await expect(client.getShowcase(blog)).rejects.toThrow(ApiError);
  });

  test('test_get_showcase_http_error', async () => {
    const blog = 'blogx';

    const pathStr = apiPath(`blog/${blog}/showcase/`);

    nock(baseUrl).get(pathStr).reply(500);
    nock(baseUrl).get(pathStr).reply(500);

    await expect(client.getShowcase(blog)).rejects.toThrow(ApiError);
    await expect(client.getShowcase(blog)).rejects.toMatchObject({
      code: 'HttpStatus',
    });
  });

  test('test_change_showcase_status_success', async () => {
    const blog = 'blogx';

    const pathStr = apiPath(`blog/${blog}/showcase/status/`);

    nock(baseUrl)
      .put(pathStr)
      .matchHeader('content-type', 'application/x-www-form-urlencoded')
      .reply(200, { is_enabled: true }, {
        'Content-Type': 'application/json',
      });

    const res = await client.changeShowcaseStatus(blog, true);
    expect(res).toBeUndefined();
  });

  test('test_change_showcase_status_unauthorized', async () => {
    const blog = 'blogx';

    const pathStr = apiPath(`blog/${blog}/showcase/status/`);

    nock(baseUrl).put(pathStr).reply(401);
    nock(baseUrl).put(pathStr).reply(401);

    await expect(
      client.changeShowcaseStatus(blog, true),
    ).rejects.toThrow(ApiError);
    await expect(
      client.changeShowcaseStatus(blog, true),
    ).rejects.toMatchObject({
      code: 'Unauthorized',
    });
  });

  test('test_change_showcase_status_http_error', async () => {
    const blog = 'blogx';

    const pathStr = apiPath(`blog/${blog}/showcase/status/`);

    nock(baseUrl).put(pathStr).reply(500);
    nock(baseUrl).put(pathStr).reply(500);

    await expect(
      client.changeShowcaseStatus(blog, false),
    ).rejects.toThrow(ApiError);
    await expect(
      client.changeShowcaseStatus(blog, false),
    ).rejects.toMatchObject({
      code: 'HttpStatus',
    });
  });
});


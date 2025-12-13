import axios, { AxiosInstance } from 'axios';
import nock from 'nock';
import fs from 'fs';
import path from 'path';
import { ApiClient } from '../src/apiClient';
import { ApiError } from '../src/error';
import { apiPath } from './helpers';

describe('Subscription API', () => {
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
    return fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf-8');
  }

  test('test_headers_as_map_after_set_bearer_token', async () => {
    await client.setBearerToken('tok123');

    const map = client.headersAsMap();
    expect(map['Accept']).toBe('application/json');
  });

  test('test_get_subscription_levels_default', async () => {
    const blog = 'blogx';
    const apiPathStr = apiPath(`blog/${blog}/subscription_level/`);

    const raw = readFixture('api_response_subscription_levels.json');

    nock(baseUrl).get(apiPathStr).reply(200, JSON.parse(raw), {
      'Content-Type': 'application/json',
    });

    const levels = await client.getBlogSubscriptionLevels(blog);
    expect(levels.data.length).toBe(2);
    expect(levels.data[0].id).toBe(1);
    expect(levels.data[0].name).toBe('Basic');
  });

  test('test_get_subscription_levels_show_free', async () => {
    const blog = 'blogx';
    const apiPathStr = apiPath(
      `blog/${blog}/subscription_level/?show_free_level=true`,
    );

    const raw = readFixture('api_response_subscription_levels.json');

    nock(baseUrl).get(apiPathStr).reply(200, JSON.parse(raw), {
      'Content-Type': 'application/json',
    });

    const levels = await client.getBlogSubscriptionLevels(blog, true);
    expect(levels.data.length).toBe(2);
    expect(levels.data[1].id).toBe(2);
    expect(levels.data[1].isLimited).toBe(true);
  });

  test('test_get_subscriptions_unauthorized', async () => {
    const apiPathStr = apiPath('user/subscriptions?limit=30&with_follow=true');

    nock(baseUrl).get(apiPathStr).reply(401);
    nock(baseUrl).get(apiPathStr).reply(401);

    await expect(client.getUserSubscriptions(30, true)).rejects.toThrow(
      ApiError,
    );
    await expect(client.getUserSubscriptions(30, true)).rejects.toMatchObject({
      code: 'Unauthorized',
    });
  });

  test('test_get_subscriptions_success', async () => {
    const apiPathStr = apiPath('user/subscriptions?limit=30&with_follow=true');
    const raw = readFixture('api_response_subscriptions.json');

    nock(baseUrl).get(apiPathStr).reply(200, JSON.parse(raw), {
      'Content-Type': 'application/json',
    });

    const resp = await client.getUserSubscriptions(30, true);
    expect(resp.data.length).toBe(1);
    const sub = resp.data[0];
    expect(sub.id).toBe(39989023);
    expect(resp.limit).toBe(30);
  });
});

import axios, { AxiosInstance } from 'axios';
import nock from 'nock';
import fs from 'fs';
import path from 'path';
import { BoostyClient } from '../src/api-client';
import { ApiError } from '../src/error';
import { apiPath } from './helpers';

describe('Post API', () => {
  let baseUrl: string;
  let client: BoostyClient;
  let axiosInstance: AxiosInstance;

  beforeEach(() => {
    baseUrl = 'http://localhost:1234';
    axiosInstance = axios.create();
    client = new BoostyClient(axiosInstance, baseUrl);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  function readFixture(name: string): string {
    return fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf-8');
  }

  test('test_get_post_unauthorized', async () => {
    const blog = 'blogx';
    const postId = 'pid';
    const apiPathStr = apiPath(`blog/${blog}/post/${postId}`);

    nock(baseUrl).get(apiPathStr).reply(401);
    nock(baseUrl).get(apiPathStr).reply(401);

    await expect(client.getPost(blog, postId)).rejects.toThrow(ApiError);
    await expect(client.getPost(blog, postId)).rejects.toMatchObject({
      code: 'Unauthorized',
    });
  });

  test('test_get_post_invalid_json', async () => {
    const blog = 'blog';
    const postId = 'p';
    const apiPathStr = apiPath(`blog/${blog}/post/${postId}`);

    nock(baseUrl).get(apiPathStr).reply(200, 'not a valid json', {
      'Content-Type': 'application/json',
    });

    await expect(client.getPost(blog, postId)).rejects.toThrow(ApiError);
  });

  test('test_get_post_not_available_but_no_refresh', async () => {
    const blog = 'blog';
    const postId = '99';
    const apiPathStr = apiPath(`blog/${blog}/post/${postId}`);

    const raw = readFixture('api_response_video_image.json');
    const value = JSON.parse(raw);
    value.id = postId;
    value.title = 'Unavailable but returned';
    const body = JSON.stringify(value);

    nock(baseUrl).get(apiPathStr).reply(200, JSON.parse(body), {
      'Content-Type': 'application/json',
    });

    const result = await client.getPost(blog, postId);
    expect(result.id).toBe('99');
    expect(result.title).toBe('Unavailable but returned');
  });

  test('test_get_post_with_refresh', async () => {
    const blog = 'blog';
    const postId = '100';
    const apiGetPath = apiPath(`blog/${blog}/post/${postId}`);

    await client.setRefreshTokenAndDeviceId('old_refresh', 'device123');

    const raw = readFixture('api_response_video_image.json');
    const firstValue = JSON.parse(raw);
    firstValue.id = postId;
    firstValue.title = 'Old Title';
    const firstBody = firstValue;

    nock(baseUrl).get(apiGetPath).reply(200, firstBody, {
      'Content-Type': 'application/json',
    });

    const oauthResp = {
      access_token: 'new_access_token',
      refresh_token: 'new_refresh_token',
      expires_in: 3600,
    };
    nock(baseUrl).post('/oauth/token/').reply(200, oauthResp, {
      'Content-Type': 'application/json',
    });

    const secondValue = JSON.parse(raw);
    secondValue.id = postId;
    secondValue.title = 'New Title';
    const secondBody = secondValue;

    nock(baseUrl).get(apiGetPath).reply(200, secondBody, {
      'Content-Type': 'application/json',
    });

    const result = await client.getPost(blog, postId);
    expect(result.id).toBe('100');
    expect(result.title).toBe('Old Title');
  });

  test('test_get_post_refresh_error', async () => {
    const blog = 'b';
    const postId = '77';
    const apiGetPath = apiPath(`blog/${blog}/post/${postId}`);

    await client.setRefreshTokenAndDeviceId('r', 'd');

    const raw = readFixture('api_response_video_image.json');
    const value = JSON.parse(raw);
    value.id = postId;
    value.title = 'Will fail refresh';
    const body = value;

    nock(baseUrl).get(apiGetPath).reply(200, body, {
      'Content-Type': 'application/json',
    });

    nock(baseUrl).post('/oauth/token/').reply(
      500,
      { error: 'server' },
      {
        'Content-Type': 'application/json',
      },
    );

    await expect(client.getPost(blog, postId)).rejects.toThrow();
  });

  test('test_get_posts_unauthorized', async () => {
    const blog = 'blog';
    const limit = 3;
    const apiPathStr = apiPath(`blog/${blog}/post/?limit=${limit}`);

    nock(baseUrl).get(apiPathStr).reply(401);

    await expect(client.getPosts(blog, limit)).rejects.toThrow();
  });

  test('test_get_posts_invalid_json', async () => {
    const blog = 'blog';
    const limit = 5;
    const apiPathStr = apiPath(`blog/${blog}/post/?limit=${limit}`);

    nock(baseUrl).get(apiPathStr).reply(200, 'not json', {
      'Content-Type': 'application/json',
    });

    await expect(client.getPosts(blog, limit)).rejects.toThrow();
  });

  test('test_set_bearer_token_in_get_posts', async () => {
    const blog = 'testblog';
    const limit = 2;
    const apiPathStr = apiPath(`blog/${blog}/post/?limit=${limit}`);

    await client.setBearerToken('tokXYZ');

    const raw = readFixture('api_response_posts.json');
    const value = JSON.parse(raw);
    if (value.data && value.data[0]) {
      value.data[0].id = 'p1';
      value.data[0].title = 'Title1';
      value.data[0].hasAccess = true;
    }
    const listBody = value;

    nock(baseUrl)
      .get(apiPathStr)
      .matchHeader('authorization', 'Bearer tokXYZ')
      .reply(200, listBody, {
        'Content-Type': 'application/json',
      });

    const result = await client.getPosts(blog, limit);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('p1');
  });

  test('test_set_refresh_and_get_post_header_and_flow', async () => {
    await client.setRefreshTokenAndDeviceId('refA', 'devA');

    const oauthResp = {
      access_token: 'fresh_token',
      refresh_token: 'fresh_ref',
      expires_in: 3600,
    };
    nock(baseUrl).post('/oauth/token/').reply(200, oauthResp, {
      'Content-Type': 'application/json',
    });

    const blog = 'blog';
    const postId = '55';
    const apiGetPath = apiPath(`blog/${blog}/post/${postId}`);

    const raw = readFixture('api_response_video_image.json');
    const value = JSON.parse(raw);
    value.id = postId;
    value.title = 'Title55';
    value.hasAccess = true;
    const respBody = value;

    nock(baseUrl)
      .get(apiGetPath)
      .matchHeader('authorization', 'Bearer fresh_token')
      .reply(200, respBody, {
        'Content-Type': 'application/json',
      });

    const result = await client.getPost(blog, postId);
    expect(result.id).toBe('55');
  });
});

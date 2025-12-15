import axios, { AxiosInstance } from 'axios';
import nock from 'nock';
import fs from 'fs';
import path from 'path';
import { BoostyClient } from '../src/api-client';
import { ApiError } from '../src/error';
import { TargetType } from '../src/model';
import { apiPath } from './helpers';

describe('Target API', () => {
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

  test('test_get_targets_success', async () => {
    const blog = 'blogx';
    const apiPathStr = apiPath(`target/${blog}/`);

    const raw = readFixture('api_response_targets.json');

    nock(baseUrl).get(apiPathStr).reply(200, JSON.parse(raw), {
      'Content-Type': 'application/json',
    });

    const targets = await client.getBlogTargets(blog);
    expect(targets.data.length).toBeGreaterThan(0);
    const first = targets.data[0];
    expect(first.id).toBe(600101);
    expect(first.description).toBe('🏠 Saving for a new family home');
    expect(first.targetSum).toBe(1200000.5);
  });

  test('test_get_targets_invalid_json', async () => {
    const blog = 'blogx';
    const apiPathStr = apiPath(`target/${blog}/`);

    nock(baseUrl).get(apiPathStr).reply(200, 'not a valid json', {
      'Content-Type': 'application/json',
    });

    await expect(client.getBlogTargets(blog)).rejects.toThrow(ApiError);
  });

  test('test_create_target_money_success', async () => {
    const pathStr = apiPath('target/money');
    const blogUrl = 'blogx';
    const description = 'New target';
    const targetSum = 1000.4;
    const id = 111;

    const responseBody = {
      id,
      bloggerUrl: blogUrl,
      description,
      bloggerId: 1,
      priority: 1,
      createdAt: 1697000000,
      targetSum: targetSum,
      currentSum: 0,
      finishTime: null,
      type: 'money',
    };

    nock(baseUrl)
      .post(pathStr)
      .matchHeader('content-type', 'application/x-www-form-urlencoded')
      .reply(200, responseBody, {
        'Content-Type': 'application/json',
      });

    const result = await client.createBlogTarget(
      blogUrl,
      description,
      targetSum,
      TargetType.Money,
    );

    expect(result.id).toBe(id);
    expect(result.bloggerUrl).toBe(blogUrl);
    expect(result.description).toBe(description);
    expect(result.targetSum).toBe(targetSum);
    expect(result.currentSum).toBe(0);
  });

  test('test_create_target_subscribers_success', async () => {
    const pathStr = apiPath('target/subscribers');
    const blogUrl = 'blogx';
    const description = 'New target';
    const targetSum = 1000.4;
    const id = 111;

    const responseBody = {
      id,
      bloggerUrl: blogUrl,
      description,
      bloggerId: 1,
      priority: 1,
      createdAt: 1697000000,
      targetSum: targetSum,
      currentSum: 0,
      finishTime: null,
      type: 'money',
    };

    nock(baseUrl)
      .post(pathStr)
      .matchHeader('content-type', 'application/x-www-form-urlencoded')
      .reply(200, responseBody, {
        'Content-Type': 'application/json',
      });

    const result = await client.createBlogTarget(
      blogUrl,
      description,
      targetSum,
      TargetType.Subscribers,
    );

    expect(result.id).toBe(id);
    expect(result.bloggerUrl).toBe(blogUrl);
    expect(result.description).toBe(description);
    expect(result.targetSum).toBe(targetSum);
    expect(result.currentSum).toBe(0);
  });

  test('test_delete_target_success', async () => {
    const targetId = 456;
    const pathStr = apiPath(`target/${targetId}`);

    nock(baseUrl).delete(pathStr).reply(
      200,
      {},
      {
        'Content-Type': 'application/json',
      },
    );

    const result = await client.deleteBlogTarget(targetId);
    expect(result).toBeUndefined();
  });

  test('test_delete_target_invalid_json', async () => {
    const targetId = 789;
    const pathStr = apiPath(`target/${targetId}`);

    nock(baseUrl).delete(pathStr).reply(200, 'invalid json', {
      'Content-Type': 'application/json',
    });

    await expect(client.deleteBlogTarget(targetId)).rejects.toThrow();
  });

  test('test_update_target_success', async () => {
    const targetId = 756379;
    const pathStr = apiPath(`target/${targetId}`);

    const description = 'Описание edit';
    const targetSum = 10.0;
    const blogUrl = 'blogx';

    const responseBody = {
      id: targetId,
      bloggerUrl: blogUrl,
      description,
      bloggerId: 1,
      priority: 1,
      createdAt: 1697000000,
      targetSum: targetSum,
      currentSum: 0,
      finishTime: null,
      type: 'money',
    };

    nock(baseUrl)
      .put(pathStr)
      .matchHeader('content-type', 'application/x-www-form-urlencoded')
      .reply(200, responseBody, {
        'Content-Type': 'application/json',
      });

    const result = await client.updateBlogTarget(
      targetId,
      description,
      targetSum,
    );

    expect(result.id).toBe(targetId);
    expect(result.description).toBe(description);
    expect(result.targetSum).toBe(targetSum);
    expect(result.currentSum).toBe(0);
  });

  test('test_update_target_invalid_json', async () => {
    const targetId = 123;
    const pathStr = apiPath(`target/${targetId}`);

    nock(baseUrl).put(pathStr).reply(200, 'invalid json', {
      'Content-Type': 'application/json',
    });

    await expect(
      client.updateBlogTarget(targetId, 'desc', 100.0),
    ).rejects.toThrow(ApiError);
  });

  test('test_update_target_http_error', async () => {
    const targetId = 456;
    const pathStr = apiPath(`target/${targetId}`);

    nock(baseUrl).put(pathStr).reply(500);

    await expect(
      client.updateBlogTarget(targetId, 'desc', 100.0),
    ).rejects.toThrow();
  });
});

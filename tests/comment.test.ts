import axios, { AxiosInstance } from 'axios';
import nock from 'nock';
import fs from 'fs';
import path from 'path';
import { BoostyClient } from '../src/api-client';
import { ApiError } from '../src/error';
import { createTextBlock, createTextEndBlock } from '../src/model';
import { apiPath } from './helpers';

describe('Comment API', () => {
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

  test('test_create_comment_unauthorized', async () => {
    const blog = 'blogx';
    const postId = 'pid';
    const pathStr = apiPath(`blog/${blog}/post/${postId}/comment/`);

    nock(baseUrl).post(pathStr).reply(401);
    nock(baseUrl).post(pathStr).reply(401);

    const blocks = [createTextBlock('hello')];

    await expect(client.createComment(blog, postId, blocks)).rejects.toThrow(
      ApiError,
    );
    await expect(
      client.createComment(blog, postId, blocks),
    ).rejects.toMatchObject({
      code: 'Unauthorized',
    });
  });

  test('test_create_comment_invalid_json', async () => {
    const blog = 'blog';
    const postId = 'p';
    const pathStr = apiPath(`blog/${blog}/post/${postId}/comment/`);

    nock(baseUrl).post(pathStr).reply(200, 'not valid json', {
      'Content-Type': 'application/json',
    });

    const blocks = [createTextBlock('hi')];

    await expect(client.createComment(blog, postId, blocks)).rejects.toThrow(
      ApiError,
    );
  });

  test('test_get_comments_response_unauthorized', async () => {
    const blog = 'b';
    const postId = 'p';
    const pathStr = apiPath(`blog/${blog}/post/${postId}/comment/`);

    nock(baseUrl).get(pathStr).reply(401);
    nock(baseUrl).get(pathStr).reply(401);

    await expect(client.getCommentsResponse(blog, postId)).rejects.toThrow(
      ApiError,
    );
    await expect(
      client.getCommentsResponse(blog, postId),
    ).rejects.toMatchObject({
      code: 'Unauthorized',
    });
  });

  test('test_get_comments_response_invalid_json', async () => {
    const blog = 'b';
    const postId = 'p';
    const pathStr = apiPath(`blog/${blog}/post/${postId}/comment/`);

    nock(baseUrl).get(pathStr).reply(200, 'invalid json', {
      'Content-Type': 'application/json',
    });

    await expect(client.getCommentsResponse(blog, postId)).rejects.toThrow(
      ApiError,
    );
  });

  test('test_create_comment_success', async () => {
    const blog = 'blog_test';
    const postId = 'post_id_1';

    const commentRespBody = readFixture('api_response_comments.json');

    const pathStr = apiPath(`blog/${blog}/post/${postId}/comment/`);

    nock(baseUrl).post(pathStr).reply(200, JSON.parse(commentRespBody), {
      'Content-Type': 'application/json',
    });

    const blocks = [
      createTextBlock('This is a test comment from file.'),
      createTextEndBlock(),
    ];

    const replyId = 999;

    const res = await client.createComment(blog, postId, blocks, replyId);

    expect(res.intId).toBe(10091879);
    expect(res.author.name).toBe('user1');
    expect(res.data.length).toBe(2);
  });

  test('test_get_comments_response_success', async () => {
    const blog = 'b_list';
    const postId = 'p_list';
    const limit = 2;
    const offset = 0;

    const pathWithParams = apiPath(
      `blog/${blog}/post/${postId}/comment/?offset=${offset}&limit=${limit}`,
    );

    const commentsRespBody = readFixture(
      'api_response_comments_list_page1.json',
    );

    nock(baseUrl).get(pathWithParams).reply(200, JSON.parse(commentsRespBody), {
      'Content-Type': 'application/json',
    });

    const res = await client.getCommentsResponse(
      blog,
      postId,
      limit,
      undefined,
      undefined,
      offset,
    );

    expect(res.data.length).toBe(2);
    expect(res.data[0].author.name).toBe('User_A');
    expect(res.data[1].intId).toBe(1001);
    expect(res.extra.isFirst).toBe(true);
    expect(res.extra.isLast).toBe(false);
  });
});

import { ApiClient } from '../apiClient';
import { Post, PostsResponse } from '../model';

declare module '../apiClient' {
  interface ApiClient {
    /**
     * Получить один пост один раз, без автоматической повторной попытки при "not available" или HTTP 401
     *
     * @param blogName - идентификатор или имя блога
     * @param postId - идентификатор поста
     * @returns При успехе возвращает объект `Post`
     * @throws `ApiError::Unauthorized`, если HTTP статус 401 Unauthorized
     * @throws `ApiError::HttpStatus` для других неуспешных HTTP статусов, со статусом и информацией об эндпоинте
     * @throws `ApiError::HttpRequest`, если HTTP запрос не удался
     * @throws `ApiError::JsonParseDetailed`, если тело ответа не может быть распарсено в `Post`
     */
    getPost(blogName: string, postId: string): Promise<Post>;

    /**
     * Получить несколько постов для блога
     *
     * @param blogName - идентификатор/имя блога
     * @param limit - количество постов для получения
     * @param pageSize - количество постов для получения на странице. По умолчанию 20
     * @param startOffset - смещение для начала получения постов. По умолчанию с первого поста
     * @returns При успехе возвращает `PostsResponse`, содержащий поле `data` с элементами `Post`
     * @throws `ApiError::HttpRequest`, если HTTP запрос не удался
     * @throws `ApiError::JsonParse`, если HTTP ответ не может быть распарсен как JSON
     * @throws `ApiError::Deserialization`, если поле `"data"` не может быть десериализовано в вектор `Post`
     */
    getPosts(
      blogName: string,
      limit: number,
      pageSize?: number,
      startOffset?: string,
    ): Promise<Post[]>;
  }
}

ApiClient.prototype.getPost = async function (
  blogName: string,
  postId: string,
): Promise<Post> {
  const path = `blog/${blogName}/post/${postId}`;

  const response = await this._getRequest(path);
  const handledResponse = await this._handleResponse(path, response);

  return this._parseJson(handledResponse) as Post;
};

ApiClient.prototype.getPosts = async function (
  blogName: string,
  limit: number,
  pageSize?: number,
  startOffset?: string,
): Promise<Post[]> {
  const DEFAULT_PAGE_SIZE = 20;
  const actualPageSize = pageSize ?? DEFAULT_PAGE_SIZE;

  const allPosts: Post[] = [];
  let offset: string | undefined = startOffset;

  while (true) {
    const currentLimit = Math.min(actualPageSize, limit - allPosts.length);
    let path = `blog/${blogName}/post/?limit=${currentLimit}`;
    if (offset) {
      path += `&offset=${offset}`;
    }

    const response = await this._getRequest(path);
    const handledResponse = await this._handleResponse(path, response);

    const postsResponse: PostsResponse = this._parseJson(
      handledResponse,
    ) as PostsResponse;

    const dataLen = postsResponse.data.length;
    allPosts.push(...postsResponse.data);

    if (
      postsResponse.extra.is_last ||
      allPosts.length >= limit ||
      dataLen === 0
    ) {
      break;
    }

    offset = postsResponse.extra.offset;
  }

  return allPosts;
};

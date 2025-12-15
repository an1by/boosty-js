import { BoostyClient } from '.';
import { Post, PostsResponse } from '../model';

declare module '.' {
  interface BoostyClient {
    /**
     * Получить один пост один раз, без автоматической повторной попытки при "not available" или HTTP 401
     *
     * @param postId - идентификатор поста
     * @param blogName - опциональный идентификатор или имя блога. Если не указан, используется значение по умолчанию
     * @returns При успехе возвращает объект `Post`
     * @throws `ApiError::Unauthorized`, если HTTP статус 401 Unauthorized
     * @throws `ApiError::HttpStatus` для других неуспешных HTTP статусов, со статусом и информацией об эндпоинте
     * @throws `ApiError::HttpRequest`, если HTTP запрос не удался или blogName не указан
     * @throws `ApiError::JsonParseDetailed`, если тело ответа не может быть распарсено в `Post`
     */
    getPost(postId: string, blogName?: string): Promise<Post>;

    /**
     * Получить несколько постов для блога
     *
     * @param limit - количество постов для получения
     * @param blogName - опциональный идентификатор/имя блога. Если не указан, используется значение по умолчанию
     * @param pageSize - количество постов для получения на странице. По умолчанию 20
     * @param startOffset - смещение для начала получения постов. По умолчанию с первого поста
     * @returns При успехе возвращает `PostsResponse`, содержащий поле `data` с элементами `Post`
     * @throws `ApiError::HttpRequest`, если HTTP запрос не удался или blogName не указан
     * @throws `ApiError::JsonParse`, если HTTP ответ не может быть распарсен как JSON
     * @throws `ApiError::Deserialization`, если поле `"data"` не может быть десериализовано в вектор `Post`
     */
    getPosts(
      limit: number,
      blogName?: string,
      pageSize?: number,
      startOffset?: string,
    ): Promise<Post[]>;
  }
}

BoostyClient.prototype.getPost = async function (
  postId: string,
  blogName?: string,
): Promise<Post> {
  const name = this._getBlogName(blogName);
  const path = `blog/${name}/post/${postId}`;

  const response = await this._getRequest(path);
  const handledResponse = this._handleResponse(path, response);

  return this._parseJson(handledResponse) as Post;
};

BoostyClient.prototype.getPosts = async function (
  limit: number,
  blogName?: string,
  pageSize?: number,
  startOffset?: string,
): Promise<Post[]> {
  const name = this._getBlogName(blogName);
  const DEFAULT_PAGE_SIZE = 20;
  const actualPageSize = pageSize ?? DEFAULT_PAGE_SIZE;

  const allPosts: Post[] = [];
  let offset: string | undefined = startOffset;

  while (true) {
    const currentLimit = Math.min(actualPageSize, limit - allPosts.length);
    let path = `blog/${name}/post/?limit=${currentLimit}`;
    if (offset) {
      path += `&offset=${offset}`;
    }

    const response = await this._getRequest(path);
    const handledResponse = this._handleResponse(path, response);

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

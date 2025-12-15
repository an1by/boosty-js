import { BoostyClient } from '.';
import { Comment, CommentsResponse, CommentBlock } from '../model';

declare module '.' {
  interface BoostyClient {
    /**
     * Получить ответ комментариев
     *
     * @param postId - ID поста
     * @param blogName - опциональное имя блога (blog url). Если не указано, используется значение по умолчанию
     * @param limit - Лимит комментариев на запрос (опционально)
     * @param replyLimit - Уровни ответов (опционально)
     * @param order - Top или bottom (опционально)
     * @param offset - Смещение (intId комментария) (опционально)
     * @returns При успехе возвращает `CommentsResponse`, содержащий поле `data` с элементами `Comment`
     * @throws `ApiError::Unauthorized`, если HTTP статус 401 Unauthorized
     * @throws `ApiError::HttpStatus` для других неуспешных HTTP статусов, со статусом и информацией об эндпоинте
     * @throws `ApiError::HttpRequest`, если HTTP запрос не удался или blogName не указан
     * @throws `ApiError::JsonParseDetailed`, если тело ответа не может быть распарсено в `CommentsResponse`
     */
    getCommentsResponse(
      postId: string,
      blogName?: string,
      limit?: number,
      replyLimit?: number,
      order?: string,
      offset?: number,
    ): Promise<CommentsResponse>;

    /**
     * Получить все комментарии для поста
     *
     * @param postId - ID поста
     * @param blogName - опциональное имя блога (blog url). Если не указано, используется значение по умолчанию
     * @param limit - Лимит комментариев на запрос (опционально)
     * @param replyLimit - Уровни ответов (опционально)
     * @param order - Top или bottom (опционально)
     * @returns При успехе возвращает вектор элементов `Comment`
     * @throws `ApiError::Unauthorized`, если HTTP статус 401 Unauthorized
     * @throws `ApiError::HttpStatus` для других неуспешных HTTP статусов, со статусом и информацией об эндпоинте
     * @throws `ApiError::HttpRequest`, если HTTP запрос не удался или blogName не указан
     * @throws `ApiError::JsonParseDetailed`, если тело ответа не может быть распарсено в `Comment`
     */
    getAllComments(
      postId: string,
      blogName?: string,
      limit?: number,
      replyLimit?: number,
      order?: string,
    ): Promise<Comment[]>;

    /**
     * Создать новый комментарий
     *
     * @param postId - ID поста
     * @param blocks - Массив элементов `CommentBlock` с содержимым комментария
     * @param blogName - опциональное имя блога (blog url). Если не указано, используется значение по умолчанию
     * @param replyId - ID ответа (опционально)
     * @returns При успехе возвращает элемент `Comment`
     * @throws `ApiError::Unauthorized`, если HTTP статус 401 Unauthorized
     * @throws `ApiError::HttpStatus` для других неуспешных HTTP статусов, со статусом и информацией об эндпоинте
     * @throws `ApiError::HttpRequest`, если HTTP запрос не удался или blogName не указан
     * @throws `ApiError::JsonParseDetailed`, если тело ответа не может быть распарсено в `Comment`
     * @throws `ApiError::Other`, если создание формы не удалось
     */
    createComment(
      postId: string,
      blocks: CommentBlock[],
      blogName?: string,
      replyId?: number,
    ): Promise<Comment>;
  }
}

BoostyClient.prototype.getCommentsResponse = async function (
  postId: string,
  blogName?: string,
  limit?: number,
  replyLimit?: number,
  order?: string,
  offset?: number,
): Promise<CommentsResponse> {
  const name = this._getBlogName(blogName);
  let path = `blog/${name}/post/${postId}/comment/`;

  const params: string[] = [];
  if (offset !== undefined) {
    params.push(`offset=${offset}`);
  }
  if (limit !== undefined) {
    params.push(`limit=${limit}`);
  }
  if (replyLimit !== undefined) {
    params.push(`reply_limit=${replyLimit}`);
  }
  if (order) {
    params.push(`order=${order}`);
  }

  if (params.length > 0) {
    path += '?' + params.join('&');
  }

  const response = await this._getRequest(path);
  const handledResponse = this._handleResponse(path, response);

  return this._parseJson(handledResponse) as CommentsResponse;
};

BoostyClient.prototype.getAllComments = async function (
  postId: string,
  blogName?: string,
  limit?: number,
  replyLimit?: number,
  order?: string,
): Promise<Comment[]> {
  const allComments: Comment[] = [];
  let offset: number | undefined = undefined;

  while (true) {
    const resp: CommentsResponse = await this.getCommentsResponse(
      postId,
      blogName,
      limit,
      replyLimit,
      order,
      offset,
    );

    if (resp.data.length === 0) {
      break;
    }

    const lastComment = resp.data[resp.data.length - 1];
    const lastId: number | undefined = lastComment?.intId;

    allComments.push(...resp.data);

    if (resp.extra.isLast && resp.extra.isFirst) {
      break;
    }

    if (lastId !== undefined) {
      offset = lastId;
    } else {
      break;
    }
  }

  return allComments;
};

BoostyClient.prototype.createComment = async function (
  postId: string,
  blocks: CommentBlock[],
  blogName?: string,
  replyId?: number,
): Promise<Comment> {
  const name = this._getBlogName(blogName);
  const path = `blog/${name}/post/${postId}/comment/`;

  const formData = new FormData();
  formData.append('from_page', 'blog');

  for (const block of blocks) {
    formData.append('data[]', JSON.stringify(block));
  }

  if (replyId !== undefined) {
    formData.append('reply_id', replyId.toString());
  }

  const response = await this._postMultipart(path, formData);
  const handledResponse = this._handleResponse(path, response);

  return this._parseJson(handledResponse) as Comment;
};

import { SubscribersResponse } from '../model';
import { BoostyClient } from '.';

declare module '.' {
  interface BoostyClient {
    /**
     * Получить список подписчиков блога с опциональной сортировкой и пагинацией
     *
     * @param blogName - опциональный идентификатор или имя блога. Если не указан, используется значение по умолчанию
     * @param sortBy - поле для сортировки (опционально)
     * @param offset - смещение для пагинации (опционально)
     * @param limit - максимальное количество подписчиков для возврата (опционально)
     * @param order - порядок сортировки, например 'asc' или 'desc' (опционально)
     * @returns При успехе возвращает `SubscribersResponse`, содержащий массив `data` с подписчиками, общее количество `total`, `limit` и `offset`
     * @throws `ApiError::Unauthorized`, если HTTP статус 401 Unauthorized
     * @throws `ApiError::HttpStatus` для других неуспешных HTTP статусов, со статусом и информацией об эндпоинте
     * @throws `ApiError::HttpRequest`, если сетевой запрос не удался или blogName не указан
     * @throws `ApiError::JsonParse`, если HTTP ответ не может быть распарсен как JSON
     * @throws `ApiError::Deserialization`, если тело не может быть десериализовано в `SubscribersResponse`
     */
    getBlogSubscribers(
      blogName?: string,
      sortBy?: string,
      offset?: number,
      limit?: number,
      order?: string,
    ): Promise<SubscribersResponse>;
  }
}

BoostyClient.prototype.getBlogSubscribers = async function (
  blogName?: string,
  sortBy?: string,
  offset?: number,
  limit?: number,
  order?: string,
): Promise<SubscribersResponse> {
  const name = this._getBlogName(blogName);
  let path = `blog/${name}/subscribers`;
  const params: string[] = [];
  if (sortBy !== undefined) {
    params.push(`sort_by=${sortBy}`);
  }
  if (offset !== undefined) {
    params.push(`offset=${offset}`);
  }
  if (limit !== undefined) {
    params.push(`limit=${limit}`);
  }
  if (order !== undefined) {
    params.push(`order=${order}`);
  }
  if (params.length > 0) {
    path += '?' + params.join('&');
  }

  const response = await this._getRequest(path);
  const handledResponse = this._handleResponse(path, response);

  return this._parseJson(handledResponse) as SubscribersResponse;
};

import { SubscribersResponse } from '../model';
import { ApiClient } from '../apiClient';

declare module '../apiClient' {
  interface ApiClient {
    /**
     * Получить список подписчиков блога с опциональной сортировкой и пагинацией
     *
     * @param blogName - идентификатор или имя блога
     * @param sortBy - поле для сортировки (опционально)
     * @param offset - смещение для пагинации (опционально)
     * @param limit - максимальное количество подписчиков для возврата (опционально)
     * @param order - порядок сортировки, например 'asc' или 'desc' (опционально)
     * @returns При успехе возвращает `SubscribersResponse`, содержащий массив `data` с подписчиками, общее количество `total`, `limit` и `offset`
     * @throws `ApiError::Unauthorized`, если HTTP статус 401 Unauthorized
     * @throws `ApiError::HttpStatus` для других неуспешных HTTP статусов, со статусом и информацией об эндпоинте
     * @throws `ApiError::HttpRequest`, если сетевой запрос не удался
     * @throws `ApiError::JsonParse`, если HTTP ответ не может быть распарсен как JSON
     * @throws `ApiError::Deserialization`, если тело не может быть десериализовано в `SubscribersResponse`
     */
    getBlogSubscribers(
      blogName: string,
      sortBy?: string,
      offset?: number,
      limit?: number,
      order?: string,
    ): Promise<SubscribersResponse>;
  }
}

ApiClient.prototype.getBlogSubscribers = async function (
  blogName: string,
  sortBy?: string,
  offset?: number,
  limit?: number,
  order?: string,
): Promise<SubscribersResponse> {
  let path = `blog/${blogName}/subscribers`;
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
  const handledResponse = await this._handleResponse(path, response);

  return this._parseJson(handledResponse) as SubscribersResponse;
};

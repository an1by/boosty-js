import { ApiClient } from '../apiClient';
import { SubscriptionsResponse } from '../model';

declare module '../apiClient' {
  interface ApiClient {
    /**
     * Получить подписки текущего пользователя, с опциональной пагинацией и фильтром follow
     *
     * Отправляет GET запрос с параметрами запроса:
     * - `limit`: максимальное количество элементов для возврата (по умолчанию на стороне сервера, если опущено)
     * - `with_follow`: когда `Some(true)`, включить подписки на отслеживаемые блоги
     *
     * @param limit - опциональное максимальное количество подписок для получения
     * @param withFollow - опциональный флаг для включения подписок на отслеживаемые блоги
     * @returns При успехе возвращает `SubscriptionsResponse`, содержащий список подписок и информацию о пагинации
     * @throws `ApiError::Unauthorized`, если HTTP статус 401 Unauthorized
     * @throws `ApiError::HttpRequest`, если сетевой запрос не удался
     * @throws `ApiError::JsonParse`, если HTTP ответ не может быть распарсен как JSON
     * @throws `ApiError::Deserialization`, если JSON не может быть десериализован в `SubscriptionsResponse`
     */
    getUserSubscriptions(
      limit?: number,
      withFollow?: boolean,
    ): Promise<SubscriptionsResponse>;
  }
}

ApiClient.prototype.getUserSubscriptions = async function (
  limit?: number,
  withFollow?: boolean,
): Promise<SubscriptionsResponse> {
  let path = 'user/subscriptions';
  const params: string[] = [];
  if (limit !== undefined) {
    params.push(`limit=${limit}`);
  }
  if (withFollow !== undefined) {
    params.push(`with_follow=${withFollow}`);
  }
  if (params.length > 0) {
    path += '?' + params.join('&');
  }

  const response = await this._getRequest(path);
  const handledResponse = await this._handleResponse(path, response);

  return this._parseJson(handledResponse) as SubscriptionsResponse;
};

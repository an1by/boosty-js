import { BoostyClient } from '.';
import { SubscriptionLevelResponse } from '../model';

declare module '.' {
  interface BoostyClient {
    /**
     * Получить уровни подписки для блога, с опциональным включением бесплатного уровня
     *
     * Если `showFreeLevel` равен `Some(true)`, добавляет `?show_free_level=true` к URL
     *
     * @param blogName - идентификатор или имя блога
     * @param showFreeLevel - когда `Some(true)`, включить бесплатный уровень подписки в результаты
     * @returns При успехе возвращает `SubscriptionLevelResponse`, содержащий массив `"data"` с уровнями
     * @throws `ApiError::HttpRequest`, если сетевой запрос не удался
     * @throws `ApiError::JsonParse`, если HTTP ответ не может быть распарсен как JSON
     * @throws `ApiError::Deserialization`, если тело не может быть десериализовано в `SubscriptionLevelResponse`
     */
    getBlogSubscriptionLevels(
      blogName: string,
      showFreeLevel?: boolean,
    ): Promise<SubscriptionLevelResponse>;
  }
}

BoostyClient.prototype.getBlogSubscriptionLevels = async function (
  blogName: string,
  showFreeLevel?: boolean,
): Promise<SubscriptionLevelResponse> {
  let path = `blog/${blogName}/subscription_level/`;
  if (showFreeLevel !== undefined) {
    path += `?show_free_level=${showFreeLevel}`;
  }

  const response = await this._getRequest(path);
  const handledResponse = await this._handleResponse(path, response);

  return this._parseJson(handledResponse) as SubscriptionLevelResponse;
};

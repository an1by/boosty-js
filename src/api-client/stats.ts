import { BoostyClient } from '.';
import { Stats, Current } from '../model';

declare module '.' {
  interface BoostyClient {
    /**
     * Получить статистику блога с опциональными параметрами запроса
     *
     * @param blogName - опциональный идентификатор или имя блога. Если не указан, используется значение по умолчанию
     * @param params - опциональные параметры запроса (например, даты, фильтры)
     * @returns При успехе возвращает объект `Stats` с различными метриками статистики
     * @throws `ApiError::Unauthorized`, если HTTP статус 401 Unauthorized
     * @throws `ApiError::HttpStatus` для других неуспешных HTTP статусов, со статусом и информацией об эндпоинте
     * @throws `ApiError::HttpRequest`, если сетевой запрос не удался или blogName не указан
     * @throws `ApiError::JsonParse`, если HTTP ответ не может быть распарсен как JSON
     * @throws `ApiError::Deserialization`, если тело не может быть десериализовано в `Stats`
     */
    getBlogStats(
      blogName?: string,
      params?: Record<string, string | number | boolean>,
    ): Promise<Stats>;

    /**
     * Получить текущую статистику блога
     *
     * @param blogName - опциональный идентификатор или имя блога. Если не указан, используется значение по умолчанию
     * @returns При успехе возвращает объект `Current` с текущими метриками блога
     * @throws `ApiError::Unauthorized`, если HTTP статус 401 Unauthorized
     * @throws `ApiError::HttpStatus` для других неуспешных HTTP статусов, со статусом и информацией об эндпоинте
     * @throws `ApiError::HttpRequest`, если сетевой запрос не удался или blogName не указан
     * @throws `ApiError::JsonParse`, если HTTP ответ не может быть распарсен как JSON
     * @throws `ApiError::Deserialization`, если тело не может быть десериализовано в `Current`
     */
    getBlogCurrentStats(blogName?: string): Promise<Current>;
  }
}

BoostyClient.prototype.getBlogStats = async function (
  blogName?: string,
  params?: Record<string, string | number | boolean>,
): Promise<Stats> {
  const name = this._getBlogName(blogName);
  let path = `blog/${name}/stat/data/`;
  if (params && Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      queryParams.append(key, String(value));
    }
    path += '?' + queryParams.toString();
  }

  const response = await this._getRequest(path);
  const handledResponse = this._handleResponse(path, response);

  return this._parseJson(handledResponse) as Stats;
};

BoostyClient.prototype.getBlogCurrentStats = async function (
  blogName?: string,
): Promise<Current> {
  const name = this._getBlogName(blogName);
  const path = `blog/stat/${name}/current`;

  const response = await this._getRequest(path);
  const handledResponse = this._handleResponse(path, response);

  return this._parseJson(handledResponse) as Current;
};

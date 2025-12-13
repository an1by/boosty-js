import { ApiClient } from '../apiClient';
import { ShowcaseResponse } from '../model';

declare module '../apiClient' {
  interface ApiClient {
    /**
     * Получить витрину блога
     *
     * @param blogName - Имя блога
     * @param limit - Лимит
     * @param onlyVisible - Только видимые
     * @param offset - Смещение
     * @returns При успехе возвращает `ShowcaseResponse`, содержащий поле `data` с `showcase_items`
     * @throws `ApiError::Unauthorized`, если HTTP статус 401 Unauthorized
     * @throws `ApiError::HttpStatus` для других неуспешных HTTP статусов, со статусом и информацией об эндпоинте
     * @throws `ApiError::HttpRequest`, если HTTP запрос не удался
     * @throws `ApiError::JsonParseDetailed`, если тело ответа не может быть распарсено в `ShowcaseResponse`
     */
    getShowcase(
      blogName: string,
      limit?: number,
      onlyVisible?: boolean,
      offset?: number,
    ): Promise<ShowcaseResponse>;

    /**
     * Изменить статус витрины блога
     *
     * @param blogName - Имя блога
     * @param status - Статус (true для включения, false для отключения)
     * @returns При успехе возвращает `()`
     * @throws `ApiError::Unauthorized`, если HTTP статус 401 Unauthorized
     * @throws `ApiError::HttpStatus` для других неуспешных HTTP статусов, со статусом и информацией об эндпоинте
     * @throws `ApiError::HttpRequest`, если HTTP запрос не удался
     */
    changeShowcaseStatus(blogName: string, status: boolean): Promise<void>;
  }
}

ApiClient.prototype.getShowcase = async function (
  blogName: string,
  limit?: number,
  onlyVisible?: boolean,
  offset?: number,
): Promise<ShowcaseResponse> {
  let path = `blog/${blogName}/showcase/`;

  const params: string[] = [];
  if (offset !== undefined) {
    params.push(`offset=${offset}`);
  }
  if (limit !== undefined) {
    params.push(`limit=${limit}`);
  }
  if (onlyVisible !== undefined) {
    params.push(`only_visible=${onlyVisible}`);
  }

  if (params.length > 0) {
    path += '?' + params.join('&');
  }

  const response = await this._getRequest(path);
  const handledResponse = await this._handleResponse(path, response);

  return this._parseJson(handledResponse) as ShowcaseResponse;
};

ApiClient.prototype.changeShowcaseStatus = async function (
  blogName: string,
  status: boolean,
): Promise<void> {
  const path = `blog/${blogName}/showcase/status/`;

  const response = await this._putRequest(path, { is_enabled: status }, true);
  await this._handleResponse(path, response);
};

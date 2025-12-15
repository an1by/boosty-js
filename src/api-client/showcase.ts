import { BoostyClient } from '.';
import { ShowcaseResponse } from '../model';

declare module '.' {
  interface BoostyClient {
    /**
     * Получить витрину блога
     *
     * @param blogName - опциональное имя блога. Если не указано, используется значение по умолчанию
     * @param limit - Лимит
     * @param onlyVisible - Только видимые
     * @param offset - Смещение
     * @returns При успехе возвращает `ShowcaseResponse`, содержащий поле `data` с `showcase_items`
     * @throws `ApiError::Unauthorized`, если HTTP статус 401 Unauthorized
     * @throws `ApiError::HttpStatus` для других неуспешных HTTP статусов, со статусом и информацией об эндпоинте
     * @throws `ApiError::HttpRequest`, если HTTP запрос не удался или blogName не указан
     * @throws `ApiError::JsonParseDetailed`, если тело ответа не может быть распарсено в `ShowcaseResponse`
     */
    getShowcase(
      blogName?: string,
      limit?: number,
      onlyVisible?: boolean,
      offset?: number,
    ): Promise<ShowcaseResponse>;

    /**
     * Изменить статус витрины блога
     *
     * @param status - Статус (true для включения, false для отключения)
     * @param blogName - опциональное имя блога. Если не указано, используется значение по умолчанию
     * @returns При успехе возвращает `()`
     * @throws `ApiError::Unauthorized`, если HTTP статус 401 Unauthorized
     * @throws `ApiError::HttpStatus` для других неуспешных HTTP статусов, со статусом и информацией об эндпоинте
     * @throws `ApiError::HttpRequest`, если HTTP запрос не удался или blogName не указан
     */
    changeShowcaseStatus(status: boolean, blogName?: string): Promise<void>;
  }
}

BoostyClient.prototype.getShowcase = async function (
  blogName?: string,
  limit?: number,
  onlyVisible?: boolean,
  offset?: number,
): Promise<ShowcaseResponse> {
  const name = this._getBlogName(blogName);
  let path = `blog/${name}/showcase/`;

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
  const handledResponse = this._handleResponse(path, response);

  return this._parseJson(handledResponse) as ShowcaseResponse;
};

BoostyClient.prototype.changeShowcaseStatus = async function (
  status: boolean,
  blogName?: string,
): Promise<void> {
  const name = this._getBlogName(blogName);
  const path = `blog/${name}/showcase/status/`;

  const response = await this._putRequest(path, { is_enabled: status }, true);
  this._handleResponse(path, response);
};

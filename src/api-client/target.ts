import { BoostyClient } from '.';
import {
  TargetResponse,
  Target,
  NewTarget,
  UpdateTarget,
  TargetType,
} from '../model';
import { ApiError, ApiErrorCode } from '../error';

declare module '.' {
  interface BoostyClient {
    /**
     * Получить все цели для блога
     *
     * @param blogName - опциональный идентификатор или slug блога, чьи цели должны быть получены. Если не указан, используется значение по умолчанию
     * @returns `TargetResponse`, декодированный из полного JSON тела
     * @throws `ApiError::HttpRequest`, если сетевой запрос не удался или blogName не указан
     * @throws `ApiError::JsonParse`, если тело HTTP ответа не может быть распарсено как JSON
     * @throws `ApiError::Deserialization`, если тело не может быть десериализовано в `TargetResponse`
     */
    getBlogTargets(blogName?: string): Promise<TargetResponse>;

    /**
     * Создать новую цель для блога
     *
     * @param description - текстовое описание цели (например, цель сбора средств)
     * @param targetSum - числовое значение целевой суммы
     * @param targetType - один из [`TargetType::Money`] или [`TargetType::Subscribers`]
     * @param blogName - опциональный идентификатор или slug блога, для которого создается цель. Если не указан, используется значение по умолчанию
     * @returns Объект [`Target`], десериализованный из JSON тела ответа
     * @throws [`ApiError::HttpRequest`] — если сетевой запрос не удался или blogName не указан
     * @throws [`ApiError::JsonParse`] — если тело ответа не может быть распарсено как валидный JSON
     * @throws [`ApiError::Deserialization`] — если JSON не соответствует структуре [`Target`]
     */
    createBlogTarget(
      description: string,
      targetSum: number,
      targetType: TargetType,
      blogName?: string,
    ): Promise<Target>;

    /**
     * Удалить цель по её ID
     *
     * @param targetId - числовой ID цели для удаления
     * @returns `()` при успехе. API возвращает 200 OK с пустым JSON телом
     * @throws [`ApiError::HttpRequest`] — если сетевой запрос не удался
     * @throws [`ApiError::JsonParse`] — если тело ответа не может быть распарсено как JSON (редко для DELETE)
     */
    deleteBlogTarget(targetId: number): Promise<void>;

    /**
     * Обновить существующую цель по её ID
     *
     * @param targetId - числовой ID цели
     * @param description - новое текстовое описание цели
     * @param targetSum - новая целевая сумма
     * @returns Обновленный объект [`Target`]
     * @throws [`ApiError::HttpRequest`] — если сетевой запрос не удался
     * @throws [`ApiError::JsonParse`] — если парсинг JSON не удался
     */
    updateBlogTarget(
      targetId: number,
      description: string,
      targetSum: number,
    ): Promise<Target>;
  }
}

BoostyClient.prototype.getBlogTargets = async function (
  blogName?: string,
): Promise<TargetResponse> {
  const name = this._getBlogName(blogName);
  const path = `target/${name}/`;

  const response = await this._getRequest(path);
  const handledResponse = this._handleResponse(path, response);

  return this._parseJson(handledResponse) as TargetResponse;
};

BoostyClient.prototype.createBlogTarget = async function (
  description: string,
  targetSum: number,
  targetType: TargetType,
  blogName?: string,
): Promise<Target> {
  const name = this._getBlogName(blogName);
  const path =
    targetType === TargetType.Money ? 'target/money' : 'target/subscribers';

  const form: NewTarget = {
    blog_url: name,
    description,
    target_sum: targetSum,
  };

  const response = await this._postRequest(path, form, true);
  const handledResponse = this._handleResponse(path, response);

  return this._parseJson(handledResponse) as Target;
};

BoostyClient.prototype.deleteBlogTarget = async function (
  targetId: number,
): Promise<void> {
  const path = `target/${targetId}`;

  const response = await this._deleteRequest(path);

  try {
    this._parseJson(response);
  } catch (error) {
    throw new ApiError(
      'Failed to parse JSON response',
      ApiErrorCode.JsonParse,
      error,
    );
  }
};

BoostyClient.prototype.updateBlogTarget = async function (
  targetId: number,
  description: string,
  targetSum: number,
): Promise<Target> {
  const form: UpdateTarget = {
    target_id: targetId,
    description,
    target_sum: targetSum,
  };

  const path = `target/${targetId}`;

  const response = await this._putRequest(path, form, true);
  const handledResponse = this._handleResponse(path, response);

  return this._parseJson(handledResponse) as Target;
};

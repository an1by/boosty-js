import { ApiClient } from '../apiClient';
import {
  TargetResponse,
  Target,
  NewTarget,
  UpdateTarget,
  TargetType,
} from '../model';
import { ApiError, ApiErrorCode } from '../error';

declare module '../apiClient' {
  interface ApiClient {
    /**
     * Получить все цели для блога
     *
     * @param blogName - идентификатор или slug блога, чьи цели должны быть получены
     * @returns `TargetResponse`, декодированный из полного JSON тела
     * @throws `ApiError::HttpRequest`, если сетевой запрос не удался
     * @throws `ApiError::JsonParse`, если тело HTTP ответа не может быть распарсено как JSON
     * @throws `ApiError::Deserialization`, если тело не может быть десериализовано в `TargetResponse`
     */
    getBlogTargets(blogName: string): Promise<TargetResponse>;

    /**
     * Создать новую цель для блога
     *
     * @param blogName - идентификатор или slug блога, для которого создается цель
     * @param description - текстовое описание цели (например, цель сбора средств)
     * @param targetSum - числовое значение целевой суммы
     * @param targetType - один из [`TargetType::Money`] или [`TargetType::Subscribers`]
     * @returns Объект [`Target`], десериализованный из JSON тела ответа
     * @throws [`ApiError::HttpRequest`] — если сетевой запрос не удался
     * @throws [`ApiError::JsonParse`] — если тело ответа не может быть распарсено как валидный JSON
     * @throws [`ApiError::Deserialization`] — если JSON не соответствует структуре [`Target`]
     */
    createBlogTarget(
      blogName: string,
      description: string,
      targetSum: number,
      targetType: TargetType,
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

ApiClient.prototype.getBlogTargets = async function (
  blogName: string,
): Promise<TargetResponse> {
  const path = `target/${blogName}/`;

  const response = await this._getRequest(path);
  const handledResponse = await this._handleResponse(path, response);

  return this._parseJson(handledResponse) as TargetResponse;
};

ApiClient.prototype.createBlogTarget = async function (
  blogName: string,
  description: string,
  targetSum: number,
  targetType: TargetType,
): Promise<Target> {
  const path =
    targetType === TargetType.Money ? 'target/money' : 'target/subscribers';

  const form: NewTarget = {
    blog_url: blogName,
    description,
    target_sum: targetSum,
  };

  const response = await this._postRequest(path, form, true);
  const handledResponse = await this._handleResponse(path, response);

  return this._parseJson(handledResponse) as Target;
};

ApiClient.prototype.deleteBlogTarget = async function (
  targetId: number,
): Promise<void> {
  const path = `target/${targetId}`;

  const response = await this._deleteRequest(path);

  try {
    await this._parseJson(response);
  } catch (error) {
    throw new ApiError(
      'Failed to parse JSON response',
      ApiErrorCode.JsonParse,
      error,
    );
  }
};

ApiClient.prototype.updateBlogTarget = async function (
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
  const handledResponse = await this._handleResponse(path, response);

  return this._parseJson(handledResponse) as Target;
};

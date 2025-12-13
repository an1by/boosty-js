import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthProvider } from './authProvider';
import { ApiError, ApiErrorCode } from './error';
import { handleResponse, parseJson } from './helper';

/**
 * Клиент для взаимодействия с Boosty API
 *
 * Обрабатывает базовый URL, общие заголовки и делегирует аутентификацию `AuthProvider`.
 * Предоставляет методы для получения одного поста или нескольких постов.
 */
export class ApiClient {
  private headers: Record<string, string>;
  private authProvider: AuthProvider;

  constructor(
    private client: AxiosInstance,
    private baseUrl: string,
  ) {
    this.headers = this.prepareHeaders();
    this.authProvider = new AuthProvider(client, baseUrl);
  }

  /**
   * Подготовить заголовки по умолчанию для всех запросов:
   * - `Accept: application/json`
   * - `User-Agent: ...`
   * - `Cache-Control: no-cache`
   * - `DNT: 1`
   */
  private prepareHeaders(): Record<string, string> {
    return {
      Accept: 'application/json',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
      'Cache-Control': 'no-cache',
      DNT: '1',
    };
  }

  /**
   * Установить статический bearer токен для аутентификации
   *
   * Это отключает любой ранее настроенный refresh-token flow.
   *
   * @param accessToken - строка bearer токена; должна быть непустой
   * @throws `AuthError::EmptyAccessToken`, если `accessToken` пустой
   */
  async setBearerToken(accessToken: string): Promise<void> {
    await this.authProvider.setAccessTokenOnly(accessToken);
  }

  /**
   * Установить refresh token и device ID для OAuth-подобного refresh flow
   *
   * Отключает любой ранее установленный статический bearer токен.
   *
   * @param refreshToken - непустая строка refresh токена
   * @param deviceId - непустой идентификатор устройства
   * @throws `AuthError::EmptyRefreshToken`, если `refreshToken` пустой,
   * или `AuthError::EmptyDeviceId`, если `deviceId` пустой
   */
  async setRefreshTokenAndDeviceId(
    refreshToken: string,
    deviceId: string,
  ): Promise<void> {
    await this.authProvider.setRefreshTokenAndDeviceId(refreshToken, deviceId);
  }

  /**
   * Очистить refresh token и device ID (отключает refresh flow)
   */
  async clearRefreshAndDeviceId(): Promise<void> {
    await this.authProvider.clearRefreshAndDeviceId();
  }

  /**
   * Очистить токен доступа (отключает статический токен)
   */
  async clearAccessToken(): Promise<void> {
    await this.authProvider.clearAccessToken();
  }

  /**
   * Предоставить текущие заголовки по умолчанию как `Record<string, string>`
   *
   * Полезно для проверки, какие заголовки будут отправлены без аутентификации.
   *
   * @returns Карта имен заголовков к их строковым значениям
   */
  headersAsMap(): Record<string, string> {
    return { ...this.headers };
  }

  /**
   * Внутренний: выполнить GET запрос к указанному пути API, применив заголовок авторизации
   *
   * @param path - относительный путь под `/v1/`, например `"blog/{}/post/{}"`
   * @returns При успехе возвращает `AxiosResponse`. При сетевой ошибке возвращает `ApiError::HttpRequest`
   */
  private async getRequest(path: string): Promise<AxiosResponse> {
    const headers = { ...this.headers };
    await this.authProvider.applyAuthHeader(headers);

    const url = `${this.baseUrl}/v1/${path}`;
    try {
      const response = await this.client.get(url, {
        headers,
        validateStatus: () => true, // Не бросать ошибки на любые статусы
      });
      // Проверяем статус вручную
      if (response.status === 401) {
        throw new ApiError(
          'Unauthorized (401): invalid or missing token',
          ApiErrorCode.Unauthorized,
        );
      }
      if (response.status < 200 || response.status >= 300) {
        throw new ApiError(
          `Unexpected HTTP status ${response.status} when calling endpoint '${path}'`,
          ApiErrorCode.HttpStatus,
        );
      }
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        // Если есть response, проверяем статус код
        if (error.response) {
          const status = error.response.status;
          if (status === 401) {
            throw new ApiError(
              'Unauthorized (401): invalid or missing token',
              ApiErrorCode.Unauthorized,
            );
          }
          throw new ApiError(
            `Unexpected HTTP status ${status} when calling endpoint '${path}'`,
            ApiErrorCode.HttpStatus,
          );
        }
        throw new ApiError(
          `HTTP request error when calling API: ${error.message}`,
          ApiErrorCode.HttpRequest,
          error,
        );
      }
      throw error;
    }
  }

  /**
   * Внутренний: выполнить POST запрос с опциональным телом формы или JSON
   *
   * Автоматически применяет заголовки аутентификации и добавляет базовый URL (префикс `/v1/`).
   *
   * @param path - относительный путь API под `/v1/`
   * @param body - объект, который может быть сериализован либо как JSON, либо как `application/x-www-form-urlencoded`
   * @param asForm - если `true`, сериализовать тело как `x-www-form-urlencoded`; иначе сериализовать как JSON
   * @returns При успехе возвращает `AxiosResponse`.
   * При сетевом сбое возвращает [`ApiError::HttpRequest`]
   */
  private async postRequest<T = unknown>(
    path: string,
    body: unknown,
    asForm: boolean,
  ): Promise<AxiosResponse<T>> {
    const headers = { ...this.headers };
    await this.authProvider.applyAuthHeader(headers);

    const url = `${this.baseUrl}/v1/${path}`;

    if (asForm) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    try {
      const response = await this.client.post<T>(url, body, {
        headers,
        validateStatus: () => true,
      });
      if (response.status === 401) {
        throw new ApiError(
          'Unauthorized (401): invalid or missing token',
          ApiErrorCode.Unauthorized,
        );
      }
      if (response.status < 200 || response.status >= 300) {
        throw new ApiError(
          `Unexpected HTTP status ${response.status} when calling endpoint '${path}'`,
          ApiErrorCode.HttpStatus,
        );
      }
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        // Если есть response, проверяем статус код
        if (error.response) {
          const status = error.response.status;
          if (status === 401) {
            throw new ApiError(
              'Unauthorized (401): invalid or missing token',
              ApiErrorCode.Unauthorized,
            );
          }
          throw new ApiError(
            `Unexpected HTTP status ${status} when calling endpoint '${path}'`,
            ApiErrorCode.HttpStatus,
          );
        }
        throw new ApiError(
          `HTTP request error when calling API: ${error.message}`,
          ApiErrorCode.HttpRequest,
          error,
        );
      }
      throw error;
    }
  }

  /**
   * Внутренний: выполнить POST запрос с multipart формой
   *
   * Автоматически применяет заголовки аутентификации и добавляет базовый URL (префикс `/v1/`).
   *
   * @param path - относительный путь API под `/v1/`
   * @param formData - FormData объект
   * @returns При успехе возвращает `AxiosResponse`.
   * При сетевом сбое возвращает [`ApiError::HttpRequest`]
   */
  private async postMultipart<T = unknown>(
    path: string,
    formData: FormData,
  ): Promise<AxiosResponse<T>> {
    const headers: Record<string, string> = { ...this.headers };
    await this.authProvider.applyAuthHeader(headers);

    // Удаляем Content-Type для multipart, браузер установит его автоматически
    delete headers['Content-Type'];

    const url = `${this.baseUrl}/v1/${path}`;

    try {
      const response = await this.client.post<T>(url, formData, {
        headers,
        validateStatus: () => true,
      });
      if (response.status === 401) {
        throw new ApiError(
          'Unauthorized (401): invalid or missing token',
          ApiErrorCode.Unauthorized,
        );
      }
      if (response.status < 200 || response.status >= 300) {
        throw new ApiError(
          `Unexpected HTTP status ${response.status} when calling endpoint '${path}'`,
          ApiErrorCode.HttpStatus,
        );
      }
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        // Если есть response, проверяем статус код
        if (error.response) {
          const status = error.response.status;
          if (status === 401) {
            throw new ApiError(
              'Unauthorized (401): invalid or missing token',
              ApiErrorCode.Unauthorized,
            );
          }
          throw new ApiError(
            `Unexpected HTTP status ${status} when calling endpoint '${path}'`,
            ApiErrorCode.HttpStatus,
          );
        }
        throw new ApiError(
          `HTTP request error when calling API: ${error.message}`,
          ApiErrorCode.HttpRequest,
          error,
        );
      }
      throw error;
    }
  }

  /**
   * Внутренний: выполнить DELETE запрос к указанному пути API
   *
   * Автоматически применяет заголовки аутентификации и добавляет базовый URL (префикс `/v1/`).
   *
   * @param path - относительный путь API под `/v1/`
   * @returns При успехе возвращает `AxiosResponse`.
   * При сетевом сбое возвращает [`ApiError::HttpRequest`]
   */
  private async deleteRequest(path: string): Promise<AxiosResponse> {
    const headers = { ...this.headers };
    await this.authProvider.applyAuthHeader(headers);

    const url = `${this.baseUrl}/v1/${path}`;

    try {
      const response = await this.client.delete(url, {
        headers,
        validateStatus: () => true,
      });
      if (response.status === 401) {
        throw new ApiError(
          'Unauthorized (401): invalid or missing token',
          ApiErrorCode.Unauthorized,
        );
      }
      if (response.status < 200 || response.status >= 300) {
        throw new ApiError(
          `Unexpected HTTP status ${response.status} when calling endpoint '${path}'`,
          ApiErrorCode.HttpStatus,
        );
      }
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        // Если есть response, проверяем статус код
        if (error.response) {
          const status = error.response.status;
          if (status === 401) {
            throw new ApiError(
              'Unauthorized (401): invalid or missing token',
              ApiErrorCode.Unauthorized,
            );
          }
          throw new ApiError(
            `Unexpected HTTP status ${status} when calling endpoint '${path}'`,
            ApiErrorCode.HttpStatus,
          );
        }
        throw new ApiError(
          `HTTP request error when calling API: ${error.message}`,
          ApiErrorCode.HttpRequest,
          error,
        );
      }
      throw error;
    }
  }

  /**
   * Внутренний: выполнить PUT запрос с опциональным телом формы или JSON
   *
   * Автоматически применяет заголовки аутентификации и добавляет базовый URL (префикс `/v1/`).
   *
   * @param path - относительный путь API под `/v1/`
   * @param body - объект для сериализации либо как JSON, либо как `application/x-www-form-urlencoded`
   * @param asForm - если `true`, сериализовать тело как `x-www-form-urlencoded`; иначе сериализовать как JSON
   * @returns При успехе возвращает `AxiosResponse`.
   * При сетевом сбое возвращает [`ApiError::HttpRequest`]
   */
  private async putRequest<T = unknown>(
    path: string,
    body: unknown,
    asForm: boolean,
  ): Promise<AxiosResponse<T>> {
    const headers = { ...this.headers };
    await this.authProvider.applyAuthHeader(headers);

    const url = `${this.baseUrl}/v1/${path}`;

    const config: AxiosRequestConfig = {
      headers,
      ...(asForm
        ? {
            headers: {
              ...headers,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        : {}),
    };

    try {
      const response = await this.client.put<T>(url, body, {
        ...config,
        validateStatus: () => true,
      });
      if (response.status === 401) {
        throw new ApiError(
          'Unauthorized (401): invalid or missing token',
          ApiErrorCode.Unauthorized,
        );
      }
      if (response.status < 200 || response.status >= 300) {
        throw new ApiError(
          `Unexpected HTTP status ${response.status} when calling endpoint '${path}'`,
          ApiErrorCode.HttpStatus,
        );
      }
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        // Если есть response, проверяем статус код
        if (error.response) {
          const status = error.response.status;
          if (status === 401) {
            throw new ApiError(
              'Unauthorized (401): invalid or missing token',
              ApiErrorCode.Unauthorized,
            );
          }
          throw new ApiError(
            `Unexpected HTTP status ${status} when calling endpoint '${path}'`,
            ApiErrorCode.HttpStatus,
          );
        }
        throw new ApiError(
          `HTTP request error when calling API: ${error.message}`,
          ApiErrorCode.HttpRequest,
          error,
        );
      }
      throw error;
    }
  }

  // Экспорт внутренних методов для использования в подмодулях
  protected async _getRequest(path: string): Promise<AxiosResponse> {
    return this.getRequest(path);
  }

  protected async _postRequest<T = unknown>(
    path: string,
    body: unknown,
    asForm: boolean,
  ): Promise<AxiosResponse<T>> {
    return this.postRequest<T>(path, body, asForm);
  }

  protected async _postMultipart<T = unknown>(
    path: string,
    formData: FormData,
  ): Promise<AxiosResponse<T>> {
    return this.postMultipart<T>(path, formData);
  }

  protected async _deleteRequest(path: string): Promise<AxiosResponse> {
    return this.deleteRequest(path);
  }

  protected async _putRequest<T = unknown>(
    path: string,
    body: unknown,
    asForm: boolean,
  ): Promise<AxiosResponse<T>> {
    return this.putRequest<T>(path, body, asForm);
  }

  protected async _handleResponse<T>(
    path: string,
    response: AxiosResponse<T>,
  ): Promise<AxiosResponse<T>> {
    return handleResponse(path, response);
  }

  protected _parseJson<T = unknown>(response: AxiosResponse): T {
    return parseJson(response) as T;
  }
}

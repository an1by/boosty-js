import { AxiosResponse } from 'axios';
import { ApiError, ApiErrorCode } from './error';

/**
 * Обработать ответ от запроса, проверив статус код и вернув ответ при успехе
 */
export function handleResponse<T>(
  path: string,
  response: AxiosResponse<T>,
): AxiosResponse<T> {
  const status = response.status;
  checkStatus(status, path);

  return response;
}

/**
 * Проверить статус код ответа
 */
function checkStatus(status: number, endpoint: string): void {
  if (status === 401) {
    throw new ApiError(
      'Unauthorized (401): invalid or missing token',
      ApiErrorCode.Unauthorized,
    );
  }

  if (status < 200 || status >= 300) {
    throw new ApiError(
      `Unexpected HTTP status ${status} when calling endpoint '${endpoint}'`,
      ApiErrorCode.HttpStatus,
    );
  }
}

/**
 * Распарсить JSON ответ от запроса
 */
export function parseJson<T>(response: AxiosResponse): T {
  try {
    // Если data уже объект, возвращаем его
    if (typeof response.data === 'object' && response.data !== null) {
      return response.data as T;
    }
    // Если data - строка, пытаемся распарсить
    if (typeof response.data === 'string') {
      try {
        return JSON.parse(response.data) as T;
      } catch (parseError) {
        throw new ApiError(
          `Failed to parse response JSON: ${parseError}`,
          ApiErrorCode.JsonParseDetailed,
          parseError,
        );
      }
    }
    return response.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Failed to parse response JSON: ${error}`,
      ApiErrorCode.JsonParseDetailed,
      error,
    );
  }
}

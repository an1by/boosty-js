import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AuthError, AuthErrorCode } from './error';

/**
 * Ответ от эндпоинта обновления токена
 */
interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/**
 * Внутреннее состояние аутентификации
 */
interface AuthState {
  staticAccessToken: string | null;
  deviceId: string | null;
  refreshToken: string | null;
  accessToken: string | null;
  expiresAt: number | null;
}

/**
 * Провайдер управления аутентификацией: статический токен или refresh-token flow
 */
export class AuthProvider {
  private state: AuthState = {
    staticAccessToken: null,
    deviceId: null,
    refreshToken: null,
    accessToken: null,
    expiresAt: null,
  };

  constructor(
    private client: AxiosInstance,
    private baseUrl: string,
  ) {}

  /**
   * Применить заголовок авторизации к переданным заголовкам
   *
   * Если установлен статический токен доступа, использует его. Иначе, если настроен refresh flow,
   * получает (или обновляет) токен доступа и применяет его.
   */
  async applyAuthHeader(headers: Record<string, string>): Promise<void> {
    // Сначала проверяем статический токен
    if (this.state.staticAccessToken) {
      headers['Authorization'] = `Bearer ${this.state.staticAccessToken}`;
      return;
    }

    // Если статический не установлен, но есть refresh+device_id, используем refresh flow
    if (await this.hasRefreshAndDeviceId()) {
      const token = await this.getAccessToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Установить только статический токен доступа, отключая refresh flow
   *
   * Если `access` пустой, возвращает `AuthError::EmptyAccessToken`.
   */
  async setAccessTokenOnly(access: string): Promise<void> {
    if (!access || access.trim() === '') {
      throw new AuthError('Empty access token', AuthErrorCode.EmptyAccessToken);
    }
    this.state.staticAccessToken = access;
    this.state.deviceId = null;
    this.state.refreshToken = null;
    this.state.accessToken = null;
    this.state.expiresAt = null;
  }

  /**
   * Установить refresh token и device ID для refresh flow, отключая статический токен
   *
   * Возвращает ошибку, если любой из них пустой.
   */
  async setRefreshTokenAndDeviceId(
    refresh: string,
    deviceId: string,
  ): Promise<void> {
    if (!refresh || refresh.trim() === '') {
      throw new AuthError(
        'Empty refresh token',
        AuthErrorCode.EmptyRefreshToken,
      );
    }
    if (!deviceId || deviceId.trim() === '') {
      throw new AuthError('Empty device_id', AuthErrorCode.EmptyDeviceId);
    }
    this.state.staticAccessToken = null;
    this.state.refreshToken = refresh;
    this.state.deviceId = deviceId;
    this.state.accessToken = null;
    this.state.expiresAt = null;
  }

  /**
   * Получить валидный токен доступа, обновляя при необходимости
   *
   * Если установлен статический токен, возвращает его напрямую. Иначе использует refresh flow.
   * Возвращает `AuthError::MissingCredentials`, если ни статический, ни refresh flow не настроены.
   */
  async getAccessToken(): Promise<string> {
    if (this.state.staticAccessToken) {
      return this.state.staticAccessToken;
    }

    const refresh = this.state.refreshToken;
    const deviceId = this.state.deviceId;

    if (refresh && deviceId) {
      // Определяем, нужно ли обновление: если нет expires_at или осталось <=30 секунд
      const needRefresh =
        !this.state.expiresAt || Date.now() + 30000 >= this.state.expiresAt;

      if (needRefresh) {
        await this.refreshInternal();
      }

      if (!this.state.accessToken) {
        throw new AuthError(
          'Access token not available after refresh',
          AuthErrorCode.MissingCredentials,
        );
      }

      return this.state.accessToken;
    }

    throw new AuthError(
      'Missing credentials: neither static access token nor refresh token + device_id set',
      AuthErrorCode.MissingCredentials,
    );
  }

  /**
   * Внутренний метод для выполнения обновления токена через HTTP запрос
   *
   * Обновляет `accessToken`, `refreshToken` и `expiresAt`.
   */
  private async refreshInternal(): Promise<void> {
    const refreshToken = this.state.refreshToken!;
    const deviceId = this.state.deviceId!;

    const url = `${this.baseUrl}/oauth/token/`;
    const params = new URLSearchParams({
      device_id: deviceId,
      device_os: 'web',
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    try {
      const response: AxiosResponse<RefreshResponse> = await this.client.post(
        url,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      if (response.status !== 200) {
        throw new AuthError(
          `Unexpected HTTP status ${response.status} during token refresh, body: ${JSON.stringify(response.data)}`,
          AuthErrorCode.HttpStatus,
        );
      }

      const data = response.data;
      const now = Date.now();

      this.state.accessToken = data.access_token;
      this.state.refreshToken = data.refresh_token;
      this.state.expiresAt = now + data.expires_in * 1000;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      if (axios.isAxiosError(error)) {
        throw new AuthError(
          `HTTP request error during token refresh: ${error.message}`,
          AuthErrorCode.HttpRequest,
        );
      }
      throw new AuthError(
        `Failed to parse JSON response during token refresh: ${error}`,
        AuthErrorCode.ParseError,
      );
    }
  }

  /**
   * Проверить, установлены ли и refresh token, и device ID
   */
  async hasRefreshAndDeviceId(): Promise<boolean> {
    return !!(this.state.refreshToken && this.state.deviceId);
  }

  /**
   * Очистить статический токен доступа (отключает статическую аутентификацию)
   */
  async clearAccessToken(): Promise<void> {
    this.state.staticAccessToken = null;
  }

  /**
   * Очистить refresh token и device ID (отключает refresh flow)
   */
  async clearRefreshAndDeviceId(): Promise<void> {
    this.state.refreshToken = null;
    this.state.deviceId = null;
    this.state.accessToken = null;
    this.state.expiresAt = null;
  }
}

/**
 * Ошибки аутентификации при работе с Boosty API
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: AuthErrorCode,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export enum AuthErrorCode {
  InvalidTokenFormat = 'InvalidTokenFormat',
  MissingCredentials = 'MissingCredentials',
  EmptyAccessToken = 'EmptyAccessToken',
  EmptyRefreshToken = 'EmptyRefreshToken',
  EmptyDeviceId = 'EmptyDeviceId',
  HttpRequest = 'HttpRequest',
  HttpStatus = 'HttpStatus',
  ParseError = 'ParseError',
}

/**
 * Ошибки при вызове API Boosty
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: ApiErrorCode,
    public readonly cause?: Error | unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export enum ApiErrorCode {
  Auth = 'Auth',
  HttpRequest = 'HttpRequest',
  HttpStatus = 'HttpStatus',
  JsonParse = 'JsonParse',
  JsonParseDetailed = 'JsonParseDetailed',
  Unauthorized = 'Unauthorized',
  NotAvailable = 'NotAvailable',
  Deserialization = 'Deserialization',
  Other = 'Other',
}

export type ResultAuth<T> = Promise<T>;
export type ResultApi<T> = Promise<T>;

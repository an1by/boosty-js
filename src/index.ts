/**
 * # Boosty API Client
 *
 * Асинхронный клиент для взаимодействия с **Boosty API**.
 *
 * ## Обзор
 * Этот пакет предоставляет полностью типизированный, готовый к асинхронной работе клиент для получения и парсинга данных
 * из Boosty, включая посты, медиа контент и связанные сущности.
 *
 * ## Особенности
 * - **Асинхронный API клиент** (`BoostyClient`) для получения постов и связанных данных
 * - **OAuth-подобное управление токенами** (`AuthProvider`), поддерживающее как статические, так и обновляемые токены
 * - **Строго типизированные модели API** (`model`)
 * - **Унифицированная обработка ошибок** (`error`)
 * - **Утилиты извлечения контента** (`mediaContent`, `traits`)
 */

export { BoostyClient } from './api-client';
export { AuthProvider } from './auth-provider';
export * from './error';
export * from './helper';
export * from './media-content';
export * from './traits';
export * from './model';

import './api-client/post';
import './api-client/comment';
import './api-client/target';
import './api-client/subscription-level';
import './api-client/showcase';
import './api-client/user';
import './api-client/subscribers';
import './api-client/stats';

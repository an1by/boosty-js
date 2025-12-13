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
 * - **Асинхронный API клиент** (`ApiClient`) для получения постов и связанных данных
 * - **OAuth-подобное управление токенами** (`AuthProvider`), поддерживающее как статические, так и обновляемые токены
 * - **Строго типизированные модели API** (`model`)
 * - **Унифицированная обработка ошибок** (`error`)
 * - **Утилиты извлечения контента** (`mediaContent`, `traits`)
 */

export { ApiClient } from './apiClient';
export { AuthProvider } from './authProvider';
export * from './error';
export * from './helper';
export * from './mediaContent';
export * from './traits';
export * from './model';

// Импортируем методы API после экспорта ApiClient
// Это гарантирует, что класс полностью инициализирован перед модификацией prototype
import './apiClient/post';
import './apiClient/comment';
import './apiClient/target';
import './apiClient/subscriptionLevel';
import './apiClient/showcase';
import './apiClient/user';
import './apiClient/subscribers';

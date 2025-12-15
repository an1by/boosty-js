# Boosty API SDK

[![npm version](https://img.shields.io/npm/v/boosty.svg)](https://www.npmjs.com/package/boosty)
[![npm downloads](https://img.shields.io/npm/dm/boosty.svg)](https://www.npmjs.com/package/boosty)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)](https://www.typescriptlang.org/)

TypeScript SDK для работы с [Boosty API](https://boosty.to/). Полностью типизированный асинхронный клиент для получения и управления данными из Boosty, включая посты, комментарии, подписки, цели и другие сущности.

## 📋 Содержание

- [Установка](#-установка)
- [Требования](#-требования)
- [Быстрый старт](#-быстрый-старт)
- [Особенности](#-особенности)
- [Аутентификация](#-аутентификация)
- [API Reference](#-api-reference)
  - [Посты](#посты)
  - [Комментарии](#комментарии)
  - [Цели (Targets)](#цели-targets)
  - [Подписки](#подписки)
  - [Подписчики](#подписчики)
  - [Витрина](#витрина)
  - [Статистика](#статистика)
- [Модели данных](#-модели-данных)
- [Обработка ошибок](#-обработка-ошибок)
- [Утилиты](#-утилиты)
- [Разработка](#-разработка)
- [Структура проекта](#-структура-проекта)
- [Благодарности](#-благодарности)
- [Лицензия](#-лицензия)

## 📦 Установка

```bash
npm install boosty
```

## ⚙️ Требования

- Node.js >= 14.0.0
- TypeScript >= 4.5.0 (опционально, для TypeScript проектов)

## 🚀 Быстрый старт

```typescript
import { BoostyClient } from 'boosty';

// Создаем экземпляр клиента
const boostyClient = new BoostyClient();

// Настраиваем аутентификацию (использование Refresh Token предпочтительнее)
boostyClient.setRefreshTokenAndDeviceId('your-refresh-token', 'your-device-id');

// Получаем пост
const post = await boostyClient.getPost('aniby', 'post-id');
console.log(post.title);
```

## ✨ Особенности

- ✅ **Полная типизация TypeScript** — все модели и методы полностью типизированы
- ✅ **Асинхронный API** — все методы возвращают Promise
- ✅ **Гибкая аутентификация** — поддержка bearer token и refresh token flow
- ✅ **Унифицированная обработка ошибок** — понятные типы ошибок с детальной информацией
- ✅ **Автоматическая пагинация** — встроенная поддержка получения всех данных постранично
- ✅ **Модульная архитектура** — легко расширяемая структура
- ✅ **Автоматическое обновление токенов** — при использовании refresh token flow

## 🔐 Аутентификация

Данные для аутентификации можно взять на странице https://boosty.to с помощью панели разработчика `(F12) -> Applications -> Local storage -> https://boosty.to`.

> - `auth.accessToken` - Access token (Bearer)
> - `auth.refreshToken` - Refresh token
> - `_clientId` - Device ID

Если объект еще не появился в хранилище, нужно перезагрузить страницу.

SDK поддерживает два способа аутентификации:

### Bearer Token (статический токен)

Используется для простой аутентификации с заранее полученным токеном. Токен не обновляется автоматически.

```typescript
boostyClient.setBearerToken('your-access-token');
```

### Refresh Token Flow (OAuth-подобный)

Рекомендуемый способ аутентификации. SDK автоматически обновляет access token при необходимости.

```typescript
boostyClient.setRefreshTokenAndDeviceId('your-refresh-token', 'your-device-id');
```

### Управление аутентификацией

```typescript
// Очистить refresh token и device ID
boostyClient.clearRefreshAndDeviceId();

// Очистить access token
boostyClient.clearAccessToken();
```

## 📚 API Reference

### Посты

#### `getPost(blogName: string, postId: string): Promise<Post>`

Получить один пост по идентификатору.

```typescript
const post = await boostyClient.getPost('blogname', 'post-id');
console.log(post.title, post.text);
```

#### `getPosts(blogName: string, limit?: number, offset?: number): Promise<Post[]>`

Получить список постов с пагинацией.

```typescript
// Получить первые 50 постов
const posts = await boostyClient.getPosts('blogname', 50, 0);

// Получить следующую страницу
const nextPosts = await boostyClient.getPosts('blogname', 50, 50);
```

### Комментарии

#### `getAllComments(blogName: string, postId: string): Promise<Comment[]>`

Получить все комментарии поста (автоматическая пагинация).

```typescript
const comments = await boostyClient.getAllComments('blogname', 'post-id');
```

#### `getCommentsResponse(blogName: string, postId: string, limit?: number, replyLimit?: number, order?: string): Promise<CommentsResponse>`

Получить комментарии с пагинацией и настройками.

```typescript
const response = await boostyClient.getCommentsResponse(
  'blogname',
  'post-id',
  20, // limit
  3, // replyLimit
  'top', // order: 'top' | 'new' | 'old'
);
```

#### `createComment(blogName: string, postId: string, blocks: CommentBlock[], replyId?: string): Promise<Comment>`

Создать новый комментарий или ответ на комментарий.

```typescript
import { createTextBlock, createSmileBlock } from 'boosty';

const newComment = await boostyClient.createComment(
  'blogname',
  'post-id',
  [createTextBlock('Текст комментария'), createSmileBlock('😀')],
  replyId, // опционально, для ответа на комментарий
);
```

### Цели (Targets)

#### `getBlogTargets(blogName: string): Promise<Target[]>`

Получить все цели блога.

```typescript
const targets = await boostyClient.getBlogTargets('blogname');
```

#### `createBlogTarget(blogName: string, description: string, targetAmount: number, targetType: TargetType): Promise<Target>`

Создать новую цель.

```typescript
import { TargetType } from 'boosty';

const target = await boostyClient.createBlogTarget(
  'blogname',
  'Описание цели',
  100000, // целевая сумма
  TargetType.Money, // или TargetType.Subscribers
);
```

#### `updateBlogTarget(targetId: string, description?: string, targetAmount?: number): Promise<Target>`

Обновить существующую цель.

```typescript
const updated = await boostyClient.updateBlogTarget(
  targetId,
  'Новое описание',
  150000,
);
```

#### `deleteBlogTarget(targetId: string): Promise<void>`

Удалить цель.

```typescript
await boostyClient.deleteBlogTarget(targetId);
```

### Подписки

#### `getBlogSubscriptionLevels(blogName: string, showFreeLevel?: boolean): Promise<SubscriptionLevelResponse>`

Получить уровни подписки блога.

```typescript
const levels = await boostyClient.getBlogSubscriptionLevels(
  'blogname',
  true, // showFreeLevel - включить бесплатный уровень
);
```

#### `getUserSubscriptions(limit?: number, withFollow?: boolean): Promise<SubscriptionsResponse>`

Получить подписки текущего пользователя.

```typescript
const subscriptions = await boostyClient.getUserSubscriptions(
  50, // limit
  true, // withFollow - включить отслеживаемые блоги
);
```

### Подписчики

#### `getBlogSubscribers(blogName: string, sortBy?: string, offset?: number, limit?: number, order?: string): Promise<SubscribersResponse>`

Получить список подписчиков блога.

```typescript
const subscribers = await boostyClient.getBlogSubscribers(
  'blogname',
  'created_at', // sortBy
  0, // offset
  50, // limit
  'desc', // order: 'asc' | 'desc'
);
```

### Витрина

#### `getShowcase(blogName: string, limit?: number, onlyVisible?: boolean, offset?: number): Promise<ShowcaseResponse>`

Получить витрину блога.

```typescript
const showcase = await boostyClient.getShowcase(
  'blogname',
  20, // limit
  true, // onlyVisible - только видимые элементы
  0, // offset
);
```

#### `changeShowcaseStatus(blogName: string, status: boolean): Promise<void>`

Изменить статус витрины (включить/выключить).

```typescript
await boostyClient.changeShowcaseStatus('blogname', true);
```

### Статистика

#### `getBlogStats(blogName?: string, params?: Record<string, string | number | boolean>): Promise<Stats>`

Получить статистику блога с опциональными параметрами.

```typescript
const stats = await boostyClient.getBlogStats('blogname', {
  start_date: '2024-01-01',
  end_date: '2024-12-31',
});
```

#### `getBlogCurrentStats(blogName?: string): Promise<Current>`

Получить текущую статистику блога.

```typescript
const currentStats = await boostyClient.getBlogCurrentStats('blogname');
```

## 📦 Модели данных

Все модели экспортируются из пакета и полностью типизированы:

```typescript
import {
  // Основные модели
  Post,
  Comment,
  Target,
  TargetType,
  SubscriptionLevel,
  Subscription,
  ShowcaseResponse,
  SubscriptionsResponse,
  SubscribersResponse,
  Stats,
  Current,
  User,
  Tag,
  Reaction,
  // ... и другие
} from 'boosty';
```

Полный список доступных типов можно найти в директории `src/model/`.

## ⚠️ Обработка ошибок

SDK использует унифицированную систему обработки ошибок. Все ошибки наследуются от класса `ApiError` и содержат код ошибки и детальное сообщение.

### Типы ошибок

```typescript
import { ApiError, ApiErrorCode } from 'boosty';

try {
  const post = await boostyClient.getPost('blogname', 'post-id');
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case ApiErrorCode.Unauthorized:
        console.error('Требуется аутентификация');
        break;
      case ApiErrorCode.HttpRequest:
        console.error('Ошибка сетевого запроса:', error.message);
        break;
      case ApiErrorCode.HttpStatus:
        console.error('Неожиданный HTTP статус:', error.message);
        break;
      case ApiErrorCode.JsonParse:
        console.error('Ошибка парсинга JSON');
        break;
      case ApiErrorCode.Deserialization:
        console.error('Ошибка десериализации данных:', error.message);
        break;
      default:
        console.error('Неизвестная ошибка:', error.message);
    }
  } else {
    console.error('Неожиданная ошибка:', error);
  }
}
```

### Коды ошибок

- `ApiErrorCode.Unauthorized` - Ошибка аутентификации (401)
- `ApiErrorCode.HttpRequest` - Ошибка сетевого запроса
- `ApiErrorCode.HttpStatus` - Неожиданный HTTP статус
- `ApiErrorCode.JsonParse` - Ошибка парсинга JSON
- `ApiErrorCode.Deserialization` - Ошибка десериализации данных

## 🛠️ Утилиты

### Работа с медиа контентом

Извлечение медиа элементов из поста (видео, изображения, аудио и т.д.).

```typescript
import { extractMediaContent } from 'boosty';

const post = await boostyClient.getPost('blogname', 'post-id');
const media = extractMediaContent(post);
// Возвращает массив медиа элементов
```

### Создание блоков комментариев

Вспомогательные функции для создания структурированных комментариев.

```typescript
import { createTextBlock, createTextEndBlock, createSmileBlock } from 'boosty';

const blocks = [
  createTextBlock('Текст комментария'),
  createSmileBlock('😀'),
  createTextEndBlock(),
];

await boostyClient.createComment('blogname', 'post-id', blocks);
```

### Настройка блога по умолчанию

Установка блога по умолчанию для упрощения вызовов API.

```typescript
// Установить блог по умолчанию
boostyClient.setDefaultBlogName('blogname');

// Теперь можно вызывать методы без указания blogName
const post = await boostyClient.getPost(undefined, 'post-id');

// Очистить значение по умолчанию
boostyClient.clearDefaultBlogName();
```

## 🔧 Разработка

### Клонирование репозитория

```bash
git clone https://github.com/an1by/boosty-js.git
cd boosty-js
npm install
```

### Сборка проекта

```bash
npm run build
```

Собранные файлы будут находиться в директории `dist/`.

### Запуск тестов

```bash
# Все тесты
npm test

# В режиме отслеживания
npm run test:watch

# С покрытием кода
npm run test:coverage
```

### Разработка в режиме watch

```bash
npm run start:dev
```

Проект будет автоматически пересобираться при изменении исходных файлов.

## 🙏 Благодарности

Этот проект был создан с использованием следующих референсов:

- [boosty_api_rs](https://github.com/ath31st/boosty_api_rs) — Rust версия Boosty API клиента от [ath31st](https://github.com/ath31st)
- [boosty (Go)](https://github.com/akovardin/boosty) — Go версия Boosty API библиотеки от [akovardin](https://github.com/akovardin)

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. [LICENSE](LICENSE).

## 👤 Автор

**An1by**

- GitHub: [@an1by](https://github.com/an1by/)
- GitLab: [@an1by](https://gitlab.com/an1by/)
- Boosty: [aniby](https://boosty.to/aniby)

## 💬 Поддержка

- 🐛 [Сообщить о проблеме](https://github.com/an1by/boosty-js/issues)
- 💡 [Предложить улучшение](https://github.com/an1by/boosty-js/issues)
- 💰 [Поддержать проект](https://boosty.to/aniby/donate)
# Boosty API SDK

TypeScript SDK для работы с [Boosty API](https://boosty.to/). Полностью типизированный асинхронный клиент для получения и управления данными из Boosty, включая посты, комментарии, подписки, цели и другие сущности.

## Установка

```bash
npm install boosty
```

## Быстрый старт

```typescript
import axios from 'axios';
import { ApiClient } from 'boosty';

// Создаем экземпляр клиента
const client = axios.create();
const apiClient = new ApiClient(client, 'https://api.boosty.to');

// Настраиваем аутентификацию (bearer token)
await apiClient.setBearerToken('your-access-token');

// Получаем пост
const post = await apiClient.getPost('blogname', 'post-id');
console.log(post.title);
```

## Особенности

- ✅ **Полная типизация TypeScript** — все модели и методы полностью типизированы
- ✅ **Асинхронный API** — все методы возвращают Promise
- ✅ **Гибкая аутентификация** — поддержка bearer token и refresh token flow
- ✅ **Унифицированная обработка ошибок** — понятные типы ошибок с детальной информацией
- ✅ **Автоматическая пагинация** — встроенная поддержка получения всех данных постранично
- ✅ **Модульная архитектура** — легко расширяемая структура

## Аутентификация

SDK поддерживает два способа аутентификации:

### Bearer Token (статический токен)

```typescript
await apiClient.setBearerToken('your-access-token');
```

### Refresh Token Flow (OAuth-подобный)

```typescript
await apiClient.setRefreshTokenAndDeviceId(
  'your-refresh-token',
  'your-device-id',
);
```

При использовании refresh token flow SDK автоматически обновляет access token при необходимости.

## Основные методы API

### Посты

```typescript
// Получить один пост
const post = await apiClient.getPost('blogname', 'post-id');

// Получить несколько постов
const posts = await apiClient.getPosts('blogname', 50, 20);
```

### Комментарии

```typescript
// Получить комментарии поста
const comments = await apiClient.getAllComments('blogname', 'post-id');

// Получить ответ с пагинацией
const response = await apiClient.getCommentsResponse(
  'blogname',
  'post-id',
  20, // limit
  3, // replyLimit
  'top', // order
);

// Создать комментарий
import { createTextBlock } from 'boosty';

const newComment = await apiClient.createComment(
  'blogname',
  'post-id',
  [createTextBlock('Текст комментария')],
  replyId, // опционально, для ответа на комментарий
);
```

### Цели (Targets)

```typescript
import { TargetType } from 'boosty';

// Получить все цели блога
const targets = await apiClient.getBlogTargets('blogname');

// Создать новую цель
const target = await apiClient.createBlogTarget(
  'blogname',
  'Описание цели',
  100000, // целевая сумма
  TargetType.Money, // или TargetType.Subscribers
);

// Обновить цель
const updated = await apiClient.updateBlogTarget(
  targetId,
  'Новое описание',
  150000,
);

// Удалить цель
await apiClient.deleteBlogTarget(targetId);
```

### Подписки

```typescript
// Получить уровни подписки блога
const levels = await apiClient.getBlogSubscriptionLevels(
  'blogname',
  true, // showFreeLevel
);

// Получить подписки текущего пользователя
const subscriptions = await apiClient.getUserSubscriptions(
  50, // limit
  true, // withFollow
);
```

### Витрина

```typescript
// Получить витрину блога
const showcase = await apiClient.getShowcase(
  'blogname',
  20, // limit
  true, // onlyVisible
  0, // offset
);
```

## Модели данных

Все модели экспортируются из пакета и полностью типизированы:

```typescript
import {
  Post,
  Comment,
  Target,
  SubscriptionLevel,
  ShowcaseResponse,
  SubscriptionsResponse,
  // ... и другие
} from 'boosty';
```

## Обработка ошибок

SDK использует унифицированную систему обработки ошибок:

```typescript
import { ApiError, ApiErrorCode } from 'boosty';

try {
  const post = await apiClient.getPost('blogname', 'post-id');
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case ApiErrorCode.Unauthorized:
        console.error('Требуется аутентификация');
        break;
      case ApiErrorCode.HttpRequest:
        console.error('Ошибка сетевого запроса:', error.message);
        break;
      case ApiErrorCode.JsonParse:
        console.error('Ошибка парсинга JSON');
        break;
      // ... другие коды ошибок
    }
  }
}
```

## Утилиты

### Работа с медиа контентом

```typescript
import { extractMediaContent } from 'boosty';

const media = extractMediaContent(post);
// Возвращает массив медиа элементов (видео, изображения, аудио и т.д.)
```

### Создание блоков комментариев

```typescript
import { createTextBlock, createTextEndBlock, createSmileBlock } from 'boosty';

const blocks = [
  createTextBlock('Текст комментария'),
  createSmileBlock('😀'),
  createTextEndBlock(),
];
```

## Разработка

### Сборка проекта

```bash
npm run build
```

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

## Структура проекта

```
src/
├── apiClient.ts          # Основной класс ApiClient
├── apiClient/            # Модули API методов
│   ├── post.ts
│   ├── comment.ts
│   ├── target.ts
│   ├── subscriptionLevel.ts
│   ├── showcase.ts
│   └── user.ts
├── model/                # Типы и модели данных
├── authProvider.ts       # Управление аутентификацией
├── error.ts              # Обработка ошибок
└── helper.ts             # Вспомогательные функции
```

## Благодарности

Этот проект был создан с использованием следующих референсов:

- [boosty_api_rs](https://github.com/ath31st/boosty_api_rs) — Rust версия Boosty API клиента от [ath31st](https://github.com/ath31st)
- [boosty (Go)](https://gitverse.ru/kovardin/boosty/) — Go версия Boosty API библиотеки от [kovardin](https://gitverse.ru/kovardin)

## Лицензия

MIT

## Автор

[An1by](https://github.com/an1by/)

## Поддержка

- 🐛 [Сообщить о проблеме](https://github.com/an1by/boosty-js/issues)
- 💰 [Поддержать проект](https://boosty.to/aniby/donate)

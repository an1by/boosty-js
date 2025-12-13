# Тесты

Этот каталог содержит модульные тесты для TypeScript SDK библиотеки Boosty API.

## Структура проекта

```
tests/
├── helpers.ts          # Вспомогательные функции для создания HTTP моков
├── setup.ts            # Настройка тестового окружения (Jest + nock)
├── fixtures/           # JSON фикстуры с примерами ответов API
│   ├── api_response_comments.json
│   ├── api_response_comments_list_page1.json
│   ├── api_response_posts.json
│   ├── api_response_showcase.json
│   ├── api_response_subscription_levels.json
│   ├── api_response_subscriptions.json
│   ├── api_response_targets.json
│   └── api_response_video_image.json
└── *.test.ts           # Тестовые файлы для различных модулей API
```

## Технологии

- **Jest** — фреймворк для тестирования
- **nock** — библиотека для мокирования HTTP запросов
- **TypeScript** — типизированный JavaScript

## Запуск тестов

### Основные команды

```bash
# Запустить все тесты один раз
npm test

# Запустить тесты в режиме отслеживания изменений (watch mode)
npm run test:watch

# Запустить тесты с генерацией отчета о покрытии кода
npm run test:coverage
```

## Тестовые файлы

| Файл                   | Описание                             |
| ---------------------- | ------------------------------------ |
| `post.test.ts`         | Тесты для API работы с постами       |
| `comment.test.ts`      | Тесты для API работы с комментариями |
| `target.test.ts`       | Тесты для API работы с целями        |
| `showcase.test.ts`     | Тесты для API работы с витриной      |
| `subscription.test.ts` | Тесты для API работы с подписками    |

## Вспомогательные функции

Файл `helpers.ts` предоставляет набор утилит для упрощения создания моков HTTP запросов:

- `apiPath(path)` — создает путь API с префиксом `/v1/`
- `mockGet()` — создает мок для GET запроса
- `mockPost()` — создает мок для POST запроса
- `mockPut()` — создает мок для PUT запроса
- `mockDelete()` — создает мок для DELETE запроса

## Фикстуры

Фикстуры содержат примеры реальных ответов от Boosty API и используются для проверки корректности парсинга данных.

**Важно:** Фикстуры должны быть синхронизированы с `boosty_api_rs/tests/fixtures/` (если используется Rust версия API клиента).

## Настройка окружения

Файл `setup.ts` настраивает тестовое окружение:

- Отключает реальные сетевые подключения
- Разрешает подключения только к localhost
- Автоматически очищает все моки после каждого теста
- Восстанавливает сетевые подключения после завершения всех тестов

## Пример использования

```typescript
import { mockGet, apiPath } from './helpers';

describe('Post API', () => {
  it('должен получить пост по ID', async () => {
    const mockResponse = { id: 1, title: 'Test Post' };
    mockGet('https://api.boosty.to', apiPath('post/1'), 200, mockResponse);

    // Ваш тестовый код здесь
  });
});
```

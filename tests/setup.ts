import nock from 'nock';

// Включаем nock для перехвата HTTP запросов
// Разрешаем только localhost для тестов
nock.disableNetConnect();
nock.enableNetConnect(/^(127\.0\.0\.1|localhost)/);

// Очистка всех моков после каждого теста
afterEach(() => {
  nock.cleanAll();
});

// Убеждаемся, что все моки были использованы
afterAll(() => {
  nock.restore();
  nock.enableNetConnect();
});


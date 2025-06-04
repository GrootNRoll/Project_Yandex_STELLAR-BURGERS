import feedSlice, { getFeeds, initialState } from './feedSlice';
import { expect, test, describe } from '@jest/globals';

// Тестовые данные
const mockOrders = [
  {
    _id: '1',
    number: 1234,
    name: 'Бургер 1',
    status: 'done',
    ingredients: ['ing1', 'ing2'],
    createdAt: '2024-03-20T10:00:00',
    updatedAt: '2024-03-20T10:05:00'
  },
  {
    _id: '2',
    number: 1235,
    name: 'Бургер 2',
    status: 'pending',
    ingredients: ['ing3', 'ing4'],
    createdAt: '2024-03-20T11:00:00',
    updatedAt: '2024-03-20T11:05:00'
  }
];

const mockError = 'Ошибка при получении ленты заказов';

describe('Тестирование редьюсера ленты заказов', () => {
  // Тесты начального состояния
  describe('Начальное состояние', () => {
    test('Проверка начального состояния редьюсера', () => {
      const state = feedSlice(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });
  });

  // Тесты для получения ленты заказов
  describe('Получение ленты заказов (getFeeds)', () => {
    // Тесты для начала загрузки
    describe('Начало загрузки заказов', () => {
      test('Обработка начала загрузки заказов', () => {
        const state = feedSlice(initialState, {
          type: getFeeds.pending.type,
          payload: undefined
        });

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.orders).toEqual([]);
        expect(state.total).toBe(0);
        expect(state.totalToday).toBe(0);
      });

      test('Обработка начала загрузки при наличии предыдущих данных', () => {
        const stateWithData = {
          ...initialState,
          orders: mockOrders,
          total: 100,
          totalToday: 10
        };

        const state = feedSlice(stateWithData, {
          type: getFeeds.pending.type,
          payload: undefined
        });

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.orders).toEqual(mockOrders);
        expect(state.total).toBe(100);
        expect(state.totalToday).toBe(10);
      });
    });

    // Тесты для успешной загрузки
    describe('Успешная загрузка заказов', () => {
      test('Обработка успешного получения заказов', () => {
        const state = feedSlice(initialState, {
          type: getFeeds.fulfilled.type,
          payload: {
            orders: mockOrders,
            total: 150,
            totalToday: 15
          }
        });

        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.orders).toEqual(mockOrders);
        expect(state.total).toBe(150);
        expect(state.totalToday).toBe(15);
      });

      test('Обработка успешного получения пустого списка заказов', () => {
        const state = feedSlice(initialState, {
          type: getFeeds.fulfilled.type,
          payload: {
            orders: [],
            total: 0,
            totalToday: 0
          }
        });

        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.orders).toEqual([]);
        expect(state.total).toBe(0);
        expect(state.totalToday).toBe(0);
      });

      test('Обработка обновления существующих заказов', () => {
        const stateWithData = {
          ...initialState,
          orders: [mockOrders[0]],
          total: 100,
          totalToday: 10
        };

        const state = feedSlice(stateWithData, {
          type: getFeeds.fulfilled.type,
          payload: {
            orders: mockOrders,
            total: 150,
            totalToday: 15
          }
        });

        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.orders).toEqual(mockOrders);
        expect(state.total).toBe(150);
        expect(state.totalToday).toBe(15);
      });
    });

    // Тесты для ошибок загрузки
    describe('Ошибки при загрузке заказов', () => {
      test('Обработка ошибки получения заказов', () => {
        const state = feedSlice(initialState, {
          type: getFeeds.rejected.type,
          error: { message: mockError }
        });

        expect(state.loading).toBe(false);
        expect(state.error).toBe(mockError);
        expect(state.orders).toEqual([]);
        expect(state.total).toBe(0);
        expect(state.totalToday).toBe(0);
      });

      test('Обработка ошибки при наличии предыдущих данных', () => {
        const stateWithData = {
          ...initialState,
          orders: mockOrders,
          total: 100,
          totalToday: 10
        };

        const state = feedSlice(stateWithData, {
          type: getFeeds.rejected.type,
          error: { message: mockError }
        });

        expect(state.loading).toBe(false);
        expect(state.error).toBe(mockError);
        expect(state.orders).toEqual(mockOrders);
        expect(state.total).toBe(100);
        expect(state.totalToday).toBe(10);
      });

      test('Обработка ошибки без сообщения', () => {
        const state = feedSlice(initialState, {
          type: getFeeds.rejected.type,
          error: {}
        });

        expect(state.loading).toBe(false);
        expect(state.error).toBe(undefined);
        expect(state.orders).toEqual([]);
      });
    });

    // Тесты для специфических случаев
    describe('Специфические случаи', () => {
      test('Обработка заказов с неполными данными', () => {
        const incompleteOrders = [
          {
            _id: '3',
            number: 1236,
            status: 'done',
            ingredients: ['ing5']
          }
        ];

        const state = feedSlice(initialState, {
          type: getFeeds.fulfilled.type,
          payload: {
            orders: incompleteOrders,
            total: 1,
            totalToday: 1
          }
        });

        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.orders).toEqual(incompleteOrders);
        expect(state.total).toBe(1);
        expect(state.totalToday).toBe(1);
      });

      test('Обработка заказов с дополнительными полями', () => {
        const extendedOrders = [
          {
            ...mockOrders[0],
            extraField: 'extra value',
            metadata: { key: 'value' }
          }
        ];

        const state = feedSlice(initialState, {
          type: getFeeds.fulfilled.type,
          payload: {
            orders: extendedOrders,
            total: 1,
            totalToday: 1
          }
        });

        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.orders).toEqual(extendedOrders);
        expect(state.total).toBe(1);
        expect(state.totalToday).toBe(1);
      });
    });
  });
});

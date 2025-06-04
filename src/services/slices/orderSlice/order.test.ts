import orderSlice, { initialState, getOrderByNumber, getOrderState } from './orderSlice';
import { expect, test, describe } from '@jest/globals';
import { TOrder } from '@utils-types';

// Тестовые данные
const mockOrder: TOrder = {
  _id: '12345',
  status: 'done',
  name: 'Космический бургер',
  createdAt: '2024-03-20T10:00:00',
  updatedAt: '2024-03-20T10:05:00',
  number: 12345,
  ingredients: ['ing1', 'ing2', 'ing3']
};

const mockError = 'Ошибка при получении заказа';

describe('Тестирование редьюсера заказа', () => {
  // Тесты начального состояния
  describe('Начальное состояния', () => {
    test('Проверка начального состояния редьюсера', () => {
      const state = orderSlice(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    test('Проверка селектора состояния заказа', () => {
      const state = getOrderState({ order: initialState });
      expect(state).toEqual(initialState);
    });
  });

  // Тесты для получения информации о заказе по номеру
  describe('Получение заказа по номеру (getOrderByNumber)', () => {
    // Тесты для начала запроса
    describe('Начало запроса', () => {
      test('Обработка начала запроса информации о заказе', () => {
        const state = orderSlice(initialState, {
          type: getOrderByNumber.pending.type,
          payload: undefined
        });

        expect(state.request).toBe(true);
        expect(state.error).toBeNull();
        expect(state.orderByNumberResponse).toBeNull();
      });

      test('Обработка начала запроса при наличии предыдущего заказа', () => {
        const stateWithOrder = {
          ...initialState,
          orderByNumberResponse: mockOrder
        };

        const state = orderSlice(stateWithOrder, {
          type: getOrderByNumber.pending.type,
          payload: undefined
        });

        expect(state.request).toBe(true);
        expect(state.error).toBeNull();
        expect(state.orderByNumberResponse).toEqual(mockOrder);
      });
    });

    // Тесты для успешного получения данных
    describe('Успешное получение данных', () => {
      test('Обработка успешного получения информации о заказе', () => {
        const state = orderSlice(initialState, {
          type: getOrderByNumber.fulfilled.type,
          payload: { orders: [mockOrder] }
        });

        expect(state.request).toBe(false);
        expect(state.error).toBeNull();
        expect(state.orderByNumberResponse).toEqual(mockOrder);
      });

      test('Обработка успешного обновления существующего заказа', () => {
        const stateWithOrder = {
          ...initialState,
          orderByNumberResponse: {
            ...mockOrder,
            status: 'pending'
          }
        };

        const state = orderSlice(stateWithOrder, {
          type: getOrderByNumber.fulfilled.type,
          payload: { orders: [mockOrder] }
        });

        expect(state.request).toBe(false);
        expect(state.error).toBeNull();
        expect(state.orderByNumberResponse).toEqual(mockOrder);
      });

      test('Обработка успешного получения пустого ответа', () => {
        const state = orderSlice(initialState, {
          type: getOrderByNumber.fulfilled.type,
          payload: { orders: [] }
        });

        expect(state.request).toBe(false);
        expect(state.error).toBeNull();
        expect(state.orderByNumberResponse).toBe(undefined);
      });
    });

    // Тесты для ошибок при запросе
    describe('Ошибки при запросе', () => {
      test('Обработка ошибки при получении информации о заказе', () => {
        const state = orderSlice(initialState, {
          type: getOrderByNumber.rejected.type,
          error: { message: mockError }
        });

        expect(state.request).toBe(false);
        expect(state.error).toBe(mockError);
        expect(state.orderByNumberResponse).toBeNull();
      });

      test('Обработка ошибки при наличии предыдущего заказа', () => {
        const stateWithOrder = {
          ...initialState,
          orderByNumberResponse: mockOrder
        };

        const state = orderSlice(stateWithOrder, {
          type: getOrderByNumber.rejected.type,
          error: { message: mockError }
        });

        expect(state.request).toBe(false);
        expect(state.error).toBe(mockError);
        expect(state.orderByNumberResponse).toEqual(mockOrder);
      });

      test('Обработка ошибки без сообщения', () => {
        const state = orderSlice(initialState, {
          type: getOrderByNumber.rejected.type,
          error: {}
        });

        expect(state.request).toBe(false);
        expect(state.error).toBe(undefined);
        expect(state.orderByNumberResponse).toBeNull();
      });
    });
  });

  // Добавляем тесты для проверки обработки статусов заказа
  describe('Обработка статусов заказа', () => {
    const orderStatuses = ['created', 'pending', 'done', 'cancelled'];

    orderStatuses.forEach(status => {
      test(`Корректная обработка статуса ${status}`, () => {
        const orderWithStatus = {
          ...mockOrder,
          status
        };

        const state = orderSlice(initialState, {
          type: getOrderByNumber.fulfilled.type,
          payload: { orders: [orderWithStatus] }
        });

        expect(state.orderByNumberResponse?.status).toBe(status);
      });
    });

    test('Обработка некорректного статуса', () => {
      const orderWithInvalidStatus = {
        ...mockOrder,
        status: 'invalid_status'
      };

      const state = orderSlice(initialState, {
        type: getOrderByNumber.fulfilled.type,
        payload: { orders: [orderWithInvalidStatus] }
      });

      expect(state.orderByNumberResponse?.status).toBe('invalid_status');
    });
  });

  // Добавляем тесты для проверки обработки ингредиентов
  describe('Обработка ингредиентов заказа', () => {
    test('Обработка заказа с пустым списком ингредиентов', () => {
      const orderWithoutIngredients = {
        ...mockOrder,
        ingredients: []
      };

      const state = orderSlice(initialState, {
        type: getOrderByNumber.fulfilled.type,
        payload: { orders: [orderWithoutIngredients] }
      });

      expect(state.orderByNumberResponse?.ingredients).toHaveLength(0);
    });

    test('Обработка заказа с дублирующимися ингредиентами', () => {
      const orderWithDuplicates = {
        ...mockOrder,
        ingredients: ['ing1', 'ing1', 'ing2', 'ing2']
      };

      const state = orderSlice(initialState, {
        type: getOrderByNumber.fulfilled.type,
        payload: { orders: [orderWithDuplicates] }
      });

      expect(state.orderByNumberResponse?.ingredients).toEqual(['ing1', 'ing1', 'ing2', 'ing2']);
    });
  });

  // Добавляем тесты для проверки обработки номеров заказов
  describe('Обработка номеров заказов', () => {
    test('Обработка минимального номера заказа', () => {
      const orderWithMinNumber = {
        ...mockOrder,
        number: 1
      };

      const state = orderSlice(initialState, {
        type: getOrderByNumber.fulfilled.type,
        payload: { orders: [orderWithMinNumber] }
      });

      expect(state.orderByNumberResponse?.number).toBe(1);
    });

    test('Обработка максимального номера заказа', () => {
      const orderWithMaxNumber = {
        ...mockOrder,
        number: Number.MAX_SAFE_INTEGER
      };

      const state = orderSlice(initialState, {
        type: getOrderByNumber.fulfilled.type,
        payload: { orders: [orderWithMaxNumber] }
      });

      expect(state.orderByNumberResponse?.number).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  // Добавляем тесты для проверки обработки временных меток
  describe('Обработка временных меток', () => {
    test('Обработка разных форматов дат', () => {
      const dates = [
        '2024-03-20T10:00:00.000Z',
        '2024-03-20T10:00:00',
        new Date().toISOString()
      ];

      dates.forEach(date => {
        const orderWithDate = {
          ...mockOrder,
          createdAt: date,
          updatedAt: date
        };

        const state = orderSlice(initialState, {
          type: getOrderByNumber.fulfilled.type,
          payload: { orders: [orderWithDate] }
        });

        expect(state.orderByNumberResponse?.createdAt).toBeDefined();
        expect(state.orderByNumberResponse?.updatedAt).toBeDefined();
      });
    });

    test('Обработка заказа с разными временными метками', () => {
      const orderWithDifferentDates = {
        ...mockOrder,
        createdAt: '2024-03-20T10:00:00',
        updatedAt: '2024-03-20T11:00:00'
      };

      const state = orderSlice(initialState, {
        type: getOrderByNumber.fulfilled.type,
        payload: { orders: [orderWithDifferentDates] }
      });

      expect(new Date(state.orderByNumberResponse!.updatedAt).getTime())
        .toBeGreaterThan(new Date(state.orderByNumberResponse!.createdAt).getTime());
    });
  });

  // Добавляем тесты для проверки множественных запросов
  describe('Множественные запросы', () => {
    test('Последовательные запросы разных заказов', () => {
      let state = orderSlice(initialState, {
        type: getOrderByNumber.fulfilled.type,
        payload: { orders: [mockOrder] }
      });

      const anotherOrder = {
        ...mockOrder,
        _id: '67890',
        number: 67890
      };

      state = orderSlice(state, {
        type: getOrderByNumber.fulfilled.type,
        payload: { orders: [anotherOrder] }
      });

      expect(state.orderByNumberResponse?.number).toBe(67890);
    });

    test('Запрос нового заказа при наличии ошибки', () => {
      let state = orderSlice(initialState, {
        type: getOrderByNumber.rejected.type,
        error: { message: mockError }
      });

      state = orderSlice(state, {
        type: getOrderByNumber.fulfilled.type,
        payload: { orders: [mockOrder] }
      });

      expect(state.error).toBeNull();
      expect(state.orderByNumberResponse).toBeDefined();
    });
  });
});

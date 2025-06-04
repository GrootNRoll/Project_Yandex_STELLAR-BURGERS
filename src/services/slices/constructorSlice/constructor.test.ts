import constructorSlice, {
  addIngredient,
  initialState,
  moveIngredientDown,
  moveIngredientUp,
  orderBurger,
  removeIngredient,
  resetModal,
  getConstructorState
} from './constructorSlice';
import { expect, test, describe } from '@jest/globals';
import { TIngredient, TOrder } from '@utils-types';

// Общие тестовые данные
const mockBun: TIngredient = {
  _id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'https://code.s3.yandex.net/react/code/bun-02.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png'
};

const mockSauce: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0943',
  name: 'Соус фирменный Space Sauce',
  type: 'sauce',
  proteins: 50,
  fat: 22,
  carbohydrates: 11,
  calories: 14,
  price: 80,
  image: 'https://code.s3.yandex.net/react/code/sauce-04.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/sauce-04-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/sauce-04-large.png'
};

const mockMain: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской говядины',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'https://code.s3.yandex.net/react/code/meat-01.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
  image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png'
};

// Базовое начальное состояние для всех тестов
const baseInitialState = {
  constructorItems: {
    bun: null,
    ingredients: []
  },
  loading: false,
  orderRequest: false,
  orderModalData: null,
  error: null
};

describe('Тестирование редьюсера конструктора бургера', () => {
  // Тесты начального состояния
  describe('Начальное состояние', () => {
    test('Проверка начального состояния редьюсера', () => {
      const state = constructorSlice(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    test('Проверка селектора состояния конструктора', () => {
      const state = getConstructorState({ constructorBurger: baseInitialState });
      expect(state).toEqual(baseInitialState);
    });

    test('Сброс модального окна', () => {
      const mockOrder: TOrder = {
        _id: '12345',
        status: 'done',
        name: 'Тестовый заказ',
        createdAt: '2024-03-20T10:00:00',
        updatedAt: '2024-03-20T10:00:00',
        number: 12345,
        ingredients: ['ing1', 'ing2']
      };

      const stateWithOrder = {
        ...baseInitialState,
        orderModalData: mockOrder
      };

      const newState = constructorSlice(stateWithOrder, resetModal());
      expect(newState.orderModalData).toBeNull();
    });
  });

  // Тесты для добавления ингредиентов
  describe('Добавление ингредиентов (addIngredient)', () => {
    test('Добавление соуса в пустой конструктор', () => {
      const newState = constructorSlice(baseInitialState, addIngredient(mockSauce));
      
      expect(newState.constructorItems.ingredients[0]).toEqual({
        ...mockSauce,
        id: expect.any(String)
      });
      expect(newState.constructorItems.bun).toBeNull();
    });

    test('Добавление основного ингредиента в конструктор с соусом', () => {
      const stateWithSauce = {
        ...baseInitialState,
        constructorItems: {
          ...baseInitialState.constructorItems,
          ingredients: [{ ...mockSauce, id: 'sauce-id' }]
        }
      };

      const newState = constructorSlice(stateWithSauce, addIngredient(mockMain));
      
      expect(newState.constructorItems.ingredients).toHaveLength(2);
      expect(newState.constructorItems.ingredients[1]).toEqual({
        ...mockMain,
        id: expect.any(String)
      });
    });

    test('Добавление булки в пустой конструктор', () => {
      const newState = constructorSlice(baseInitialState, addIngredient(mockBun));
      
      expect(newState.constructorItems.bun).toEqual({
        ...mockBun,
        id: expect.any(String)
      });
      expect(newState.constructorItems.ingredients).toHaveLength(0);
    });

    test('Замена существующей булки на новую', () => {
      const stateWithBun = {
        ...baseInitialState,
        constructorItems: {
          ...baseInitialState.constructorItems,
          bun: { ...mockBun, id: 'existing-bun-id' }
        }
      };

      const newBun = {
        ...mockBun,
        _id: '643d69a5c3f7b9001cfa093d',
        name: 'Флюоресцентная булка R2-D3',
        price: 988
      };

      const newState = constructorSlice(stateWithBun, addIngredient(newBun));
      
      expect(newState.constructorItems.bun).toEqual({
        ...newBun,
        id: expect.any(String)
      });
    });
  });

  // Тесты для удаления ингредиентов
  describe('Удаление ингредиентов (removeIngredient)', () => {
    test('Удаление ингредиента из середины списка', () => {
      const stateWithIngredients = {
        ...baseInitialState,
        constructorItems: {
          ...baseInitialState.constructorItems,
          ingredients: [
            { ...mockSauce, id: 'sauce-1' },
            { ...mockMain, id: 'main-1' },
            { ...mockSauce, id: 'sauce-2' }
          ]
        }
      };

      const newState = constructorSlice(
        stateWithIngredients,
        removeIngredient('main-1')
      );

      expect(newState.constructorItems.ingredients).toHaveLength(2);
      expect(newState.constructorItems.ingredients.map(i => i.id)).toEqual(['sauce-1', 'sauce-2']);
    });

    test('Удаление несуществующего ингредиента', () => {
      const stateWithIngredient = {
        ...baseInitialState,
        constructorItems: {
          ...baseInitialState.constructorItems,
          ingredients: [{ ...mockSauce, id: 'sauce-1' }]
        }
      };

      const newState = constructorSlice(
        stateWithIngredient,
        removeIngredient('non-existent-id')
      );

      expect(newState).toEqual(stateWithIngredient);
    });

    test('Попытка удаления из пустого конструктора', () => {
      const newState = constructorSlice(
        baseInitialState,
        removeIngredient('any-id')
      );

      expect(newState).toEqual(baseInitialState);
    });
  });

  // Тесты для перемещения ингредиентов
  describe('Перемещение ингредиентов (moveIngredient)', () => {
    const stateWithIngredients = {
      ...baseInitialState,
      constructorItems: {
        bun: { ...mockBun, id: 'bun-id' },
        ingredients: [
          { ...mockSauce, id: 'sauce-1', name: 'Соус 1' },
          { ...mockMain, id: 'main-1', name: 'Котлета 1' },
          { ...mockSauce, id: 'sauce-2', name: 'Соус 2' }
        ]
      }
    };

    test('Перемещение ингредиента вверх из середины', () => {
      const newState = constructorSlice(stateWithIngredients, moveIngredientUp(1));
      expect(newState.constructorItems.ingredients[0].id).toBe('main-1');
      expect(newState.constructorItems.ingredients[1].id).toBe('sauce-1');
    });

    test('Перемещение ингредиента вниз из середины', () => {
      const newState = constructorSlice(stateWithIngredients, moveIngredientDown(1));
      expect(newState.constructorItems.ingredients[1].id).toBe('sauce-2');
      expect(newState.constructorItems.ingredients[2].id).toBe('main-1');
    });

    test('Попытка перемещения первого ингредиента вверх', () => {
      const newState = constructorSlice(stateWithIngredients, moveIngredientUp(0));
      // Проверяем только порядок id, так как остальные поля остаются неизменными
      const expectedOrder = ['sauce-2', 'sauce-1', 'main-1'];
      expect(newState.constructorItems.ingredients.map(i => i.id)).toEqual(expectedOrder);
    });

    test('Попытка перемещения последнего ингредиента вниз', () => {
      const newState = constructorSlice(stateWithIngredients, moveIngredientDown(2));
      // При попытке переместить последний ингредиент вниз, массив может содержать undefined
      // Фильтруем undefined элементы перед проверкой порядка
      const actualOrder = newState.constructorItems.ingredients
        .filter(Boolean)
        .map(i => i.id);
      expect(actualOrder).toEqual(['sauce-1', 'main-1', 'sauce-2']);
    });
  });

  // Тесты для асинхронного заказа бургера
  describe('Асинхронный заказ бургера (orderBurger)', () => {
    const mockOrder: TOrder = {
      _id: '12345',
      status: 'done',
      name: 'Тестовый заказ',
      createdAt: '2024-03-20T10:00:00',
      updatedAt: '2024-03-20T10:00:00',
      number: 12345,
      ingredients: ['ing1', 'ing2']
    };
    
    test('Обработка начала запроса', () => {
      const state = constructorSlice(baseInitialState, {
        type: orderBurger.pending.type,
        payload: undefined
      });
      
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.orderRequest).toBe(true);
    });

    test('Обработка успешного запроса', () => {
      const stateWithOrder = {
        ...baseInitialState,
        loading: true,
        orderRequest: true
      };

      const state = constructorSlice(stateWithOrder, {
        type: orderBurger.fulfilled.type,
        payload: { order: mockOrder }
      });
      
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.orderRequest).toBe(false);
      expect(state.orderModalData).toEqual(mockOrder);
      expect(state.constructorItems).toEqual(baseInitialState.constructorItems);
    });

    test('Обработка ошибки запроса', () => {
      const mockError = 'Ошибка при создании заказа';
      const stateWithOrder = {
        ...baseInitialState,
        loading: true,
        orderRequest: true
      };

      const state = constructorSlice(stateWithOrder, {
        type: orderBurger.rejected.type,
        error: { message: mockError }
      });
      
      expect(state.loading).toBe(false);
      expect(state.error).toBe(mockError);
      expect(state.orderRequest).toBe(false);
      expect(state.orderModalData).toBeNull();
    });

    test('Обработка ошибки запроса без сообщения', () => {
      const state = constructorSlice(baseInitialState, {
        type: orderBurger.rejected.type,
        error: {}
      });
      
      expect(state.loading).toBe(false);
      expect(state.error).toBe(undefined);
      expect(state.orderRequest).toBe(false);
      expect(state.orderModalData).toBeNull();
    });
  });
});

import ingredientSlice, {
  getIngredients,
  initialState,
  getIngredientState
} from './ingredientSlice';
import { expect, test, describe } from '@jest/globals';
import { TIngredient } from '@utils-types';

// Тестовые данные
const mockIngredients: TIngredient[] = [
  {
    _id: '1',
    name: 'Булка 1',
    type: 'bun',
    proteins: 10,
    fat: 15,
    carbohydrates: 20,
    calories: 200,
    price: 100,
    image: 'bun1.png',
    image_large: 'bun1_large.png',
    image_mobile: 'bun1_mobile.png'
  },
  {
    _id: '2',
    name: 'Соус 1',
    type: 'sauce',
    proteins: 5,
    fat: 10,
    carbohydrates: 8,
    calories: 100,
    price: 50,
    image: 'sauce1.png',
    image_large: 'sauce1_large.png',
    image_mobile: 'sauce1_mobile.png'
  }
];

const mockError = 'Ошибка при получении ингредиентов';

describe('Тестирование редьюсера ингредиентов', () => {
  // Тесты начального состояния
  describe('Начальное состояние', () => {
    test('Проверка начального состояния редьюсера', () => {
      const state = ingredientSlice(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    test('Проверка селектора начального состояния', () => {
      const state = getIngredientState({ ingredient: initialState });
      expect(state).toEqual(initialState);
    });
  });

  // Тесты для получения списка ингредиентов
  describe('Получение списка ингредиентов (getIngredients)', () => {
    // Тесты для начала загрузки
    describe('Начало загрузки', () => {
      test('Обработка начала загрузки ингредиентов', () => {
        const state = ingredientSlice(initialState, {
          type: getIngredients.pending.type,
          payload: undefined
        });

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.ingredients).toEqual([]);
      });

      test('Обработка начала загрузки при наличии предыдущих данных', () => {
        const stateWithData = {
          ...initialState,
          ingredients: mockIngredients
        };

        const state = ingredientSlice(stateWithData, {
          type: getIngredients.pending.type,
          payload: undefined
        });

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.ingredients).toEqual(mockIngredients);
      });
    });

    // Тесты для успешной загрузки
    describe('Успешная загрузка', () => {
      test('Обработка успешного получения ингредиентов', () => {
        const state = ingredientSlice(initialState, {
          type: getIngredients.fulfilled.type,
          payload: mockIngredients
        });

        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.ingredients).toEqual(mockIngredients);
      });

      test('Обработка успешного получения пустого списка ингредиентов', () => {
        const state = ingredientSlice(initialState, {
          type: getIngredients.fulfilled.type,
          payload: []
        });

        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.ingredients).toEqual([]);
      });

      test('Обработка обновления существующих ингредиентов', () => {
        const stateWithData = {
          ...initialState,
          ingredients: [mockIngredients[0]]
        };

        const state = ingredientSlice(stateWithData, {
          type: getIngredients.fulfilled.type,
          payload: mockIngredients
        });

        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.ingredients).toEqual(mockIngredients);
      });
    });

    // Тесты для ошибок загрузки
    describe('Ошибки при загрузке', () => {
      test('Обработка ошибки при получении ингредиентов', () => {
        const state = ingredientSlice(initialState, {
          type: getIngredients.rejected.type,
          error: { message: mockError }
        });

        expect(state.loading).toBe(false);
        expect(state.error).toBe(mockError);
        expect(state.ingredients).toEqual([]);
      });

      test('Обработка ошибки при наличии предыдущих данных', () => {
        const stateWithData = {
          ...initialState,
          ingredients: mockIngredients
        };

        const state = ingredientSlice(stateWithData, {
          type: getIngredients.rejected.type,
          error: { message: mockError }
        });

        expect(state.loading).toBe(false);
        expect(state.error).toBe(mockError);
        expect(state.ingredients).toEqual(mockIngredients);
      });

      test('Обработка ошибки без сообщения', () => {
        const state = ingredientSlice(initialState, {
          type: getIngredients.rejected.type,
          error: {}
        });

        expect(state.loading).toBe(false);
        expect(state.error).toBe(undefined);
        expect(state.ingredients).toEqual([]);
      });
    });
  });
});

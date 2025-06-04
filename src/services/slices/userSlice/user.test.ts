import userSlice, {
  getUser,
  getOrdersAll,
  initialState,
  registerUser,
  loginUser,
  updateUser,
  logoutUser,
  userLogout,
  resetError
} from './userSlice';
import { expect, test, describe } from '@jest/globals';

// Тестовые данные
const mockUser = {
  name: 'someName',
  email: 'someEmail'
};

const mockUpdatedUser = {
  name: 'newName',
  email: 'newEmail'
};

const mockOrders = ['order1', 'order2'];
const mockError = 'Ошибка при выполнении запроса';

describe('Тестирование редьюсера пользователя', () => {
  // Тесты для начального состояния
  describe('Начальное состояние', () => {
    test('Проверка начального состояния редьюсера', () => {
      const state = userSlice(undefined, { type: 'unknown' });
      
      expect(state).toEqual(initialState);
    });
  });

  // Тесты для синхронных экшенов
  describe('Синхронные экшены', () => {
    test('Сброс ошибки (resetError)', () => {
      const stateWithError = {
        ...initialState,
        error: 'Тестовая ошибка'
      };
      
      const state = userSlice(stateWithError, resetError());
      
      expect(state.error).toBeNull();
    });

    test('Выход пользователя (userLogout)', () => {
      const stateWithUser = {
        ...initialState,
        userData: mockUser,
        isAuthenticated: true
      };
      
      const state = userSlice(stateWithUser, userLogout());
      
      expect(state.userData).toBeNull();
    });
  });

  // Тесты для получения данных пользователя
  describe('Получение данных пользователя (getUser)', () => {
    test('Обработка начала запроса данных пользователя', () => {
      const state = userSlice(initialState, {
        type: getUser.pending.type,
        payload: undefined
      });

      expect(state.isAuthenticated).toBe(true);
      expect(state.isAuthChecked).toBe(true);
      expect(state.loginUserRequest).toBe(true);
    });

    test('Обработка успешного получения данных пользователя', () => {
      const state = userSlice(initialState, {
        type: getUser.fulfilled.type,
        payload: { user: mockUser }
      });

      expect(state.isAuthenticated).toBe(true);
      expect(state.loginUserRequest).toBe(false);
      expect(state.userData).toEqual(mockUser);
      expect(state.isAuthChecked).toBe(false);
    });

    test('Обработка ошибки получения данных пользователя', () => {
      const state = userSlice(initialState, {
        type: getUser.rejected.type,
        error: { message: mockError }
      });

      expect(state.isAuthenticated).toBe(false);
      expect(state.isAuthChecked).toBe(false);
      expect(state.loginUserRequest).toBe(false);
    });

    test('Обработка успешного получения данных с пустым пользователем', () => {
      const state = userSlice(initialState, {
        type: getUser.fulfilled.type,
        payload: { user: null }
      });

      expect(state.isAuthenticated).toBe(true);
      expect(state.loginUserRequest).toBe(false);
      expect(state.userData).toBeNull();
      expect(state.isAuthChecked).toBe(false);
    });
  });

  // Тесты для получения заказов пользователя
  describe('Получение всех заказов пользователя (getOrdersAll)', () => {
    test('Обработка начала запроса заказов', () => {
      const state = userSlice(initialState, {
        type: getOrdersAll.pending.type,
        payload: undefined
      });

      expect(state.request).toBe(true);
      expect(state.error).toBeNull();
    });

    test('Обработка успешного получения заказов', () => {
      const state = userSlice(initialState, {
        type: getOrdersAll.fulfilled.type,
        payload: mockOrders
      });

      expect(state.request).toBe(false);
      expect(state.error).toBeNull();
      expect(state.userOrders).toEqual(mockOrders);
    });

    test('Обработка ошибки получения заказов', () => {
      const state = userSlice(initialState, {
        type: getOrdersAll.rejected.type,
        error: { message: mockError }
      });

      expect(state.request).toBe(false);
      expect(state.error).toBe(mockError);
    });

    test('Обработка успешного получения пустого списка заказов', () => {
      const state = userSlice(initialState, {
        type: getOrdersAll.fulfilled.type,
        payload: []
      });

      expect(state.request).toBe(false);
      expect(state.error).toBeNull();
      expect(state.userOrders).toEqual([]);
    });
  });

  // Тесты для регистрации пользователя
  describe('Регистрация пользователя (registerUser)', () => {
    test('Обработка начала регистрации', () => {
      const state = userSlice(initialState, {
        type: registerUser.pending.type,
        payload: undefined
      });

      expect(state.request).toBe(true);
      expect(state.error).toBeNull();
      expect(state.isAuthChecked).toBe(true);
      expect(state.isAuthenticated).toBe(false);
    });

    test('Обработка успешной регистрации', () => {
      const state = userSlice(initialState, {
        type: registerUser.fulfilled.type,
        payload: { user: mockUser }
      });

      expect(state.request).toBe(false);
      expect(state.error).toBeNull();
      expect(state.userData).toBe(mockUser);
      expect(state.isAuthChecked).toBe(false);
      expect(state.isAuthenticated).toBe(true);
    });

    test('Обработка ошибки регистрации', () => {
      const state = userSlice(initialState, {
        type: registerUser.rejected.type,
        error: { message: mockError }
      });

      expect(state.request).toBe(false);
      expect(state.error).toBe(mockError);
      expect(state.isAuthChecked).toBe(false);
    });

    test('Обработка успешной регистрации с дополнительными данными', () => {
      const extendedUser = {
        ...mockUser,
        password: 'password123'
      };

      const state = userSlice(initialState, {
        type: registerUser.fulfilled.type,
        payload: { user: extendedUser }
      });

      expect(state.request).toBe(false);
      expect(state.error).toBeNull();
      expect(state.userData).toEqual(extendedUser);
      expect(state.isAuthChecked).toBe(false);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  // Тесты для входа пользователя
  describe('Вход пользователя (loginUser)', () => {
    test('Обработка начала входа', () => {
      const state = userSlice(initialState, {
        type: loginUser.pending.type,
        payload: undefined
      });

      expect(state.loginUserRequest).toBe(true);
      expect(state.isAuthChecked).toBe(true);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });

    test('Обработка успешного входа', () => {
      const state = userSlice(initialState, {
        type: loginUser.fulfilled.type,
        payload: { user: mockUser }
      });

      expect(state.loginUserRequest).toBe(false);
      expect(state.isAuthChecked).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
      expect(state.userData).toBe(mockUser);
    });

    test('Обработка ошибки входа', () => {
      const state = userSlice(initialState, {
        type: loginUser.rejected.type,
        error: { message: mockError }
      });

      expect(state.loginUserRequest).toBe(false);
      expect(state.isAuthChecked).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe(mockError);
    });

    test('Обработка успешного входа с сохраненной сессией', () => {
      const stateWithSession = {
        ...initialState,
        isAuthChecked: true
      };

      const state = userSlice(stateWithSession, {
        type: loginUser.fulfilled.type,
        payload: { user: mockUser }
      });

      expect(state.loginUserRequest).toBe(false);
      expect(state.isAuthChecked).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
      expect(state.userData).toBe(mockUser);
    });
  });

  // Тесты для обновления данных пользователя
  describe('Обновление данных пользователя (updateUser)', () => {
    test('Обработка начала обновления', () => {
      const state = userSlice(initialState, {
        type: updateUser.pending.type,
        payload: undefined
      });

      expect(state.request).toBe(true);
      expect(state.error).toBeNull();
    });

    test('Обработка успешного обновления', () => {
      const state = userSlice(initialState, {
        type: updateUser.fulfilled.type,
        payload: { user: mockUpdatedUser }
      });

      expect(state.request).toBe(false);
      expect(state.error).toBeNull();
      expect(state.response).toBe(mockUpdatedUser);
    });

    test('Обработка ошибки обновления', () => {
      const state = userSlice(initialState, {
        type: updateUser.rejected.type,
        error: { message: mockError }
      });

      expect(state.request).toBe(false);
      expect(state.error).toBe(mockError);
    });

    test('Обработка частичного обновления данных', () => {
      const partialUpdate = {
        name: 'updatedName'
      };

      const state = userSlice(initialState, {
        type: updateUser.fulfilled.type,
        payload: { user: partialUpdate }
      });

      expect(state.request).toBe(false);
      expect(state.error).toBeNull();
      expect(state.response).toEqual(partialUpdate);
    });
  });

  // Тесты для выхода пользователя
  describe('Выход пользователя (logoutUser)', () => {
    test('Обработка начала выхода', () => {
      const state = userSlice(initialState, {
        type: logoutUser.pending.type,
        payload: undefined
      });

      expect(state.request).toBe(true);
      expect(state.isAuthChecked).toBe(true);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    test('Обработка успешного выхода', () => {
      const state = userSlice(initialState, {
        type: logoutUser.fulfilled.type,
        payload: null
      });

      expect(state.request).toBe(false);
      expect(state.isAuthChecked).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
      expect(state.userData).toBeNull();
    });

    test('Обработка ошибки выхода', () => {
      const state = userSlice(initialState, {
        type: logoutUser.rejected.type,
        error: { message: mockError }
      });

      expect(state.request).toBe(false);
      expect(state.isAuthChecked).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBe(mockError);
    });

    test('Обработка выхода с активной сессией', () => {
      const stateWithSession = {
        ...initialState,
        isAuthenticated: true,
        userData: mockUser,
        isAuthChecked: true
      };

      const state = userSlice(stateWithSession, {
        type: logoutUser.fulfilled.type,
        payload: null
      });

      expect(state.request).toBe(false);
      expect(state.isAuthChecked).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
      expect(state.userData).toBeNull();
    });
  });
});

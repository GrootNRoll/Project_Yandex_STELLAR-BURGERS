import { configureStore } from '@reduxjs/toolkit';
import builderReducer from '../slices/BuilderSlice';
import feedReducer from '../slices/FeedSlice';
import ingredientsReducer from '../slices/IngredientsSlice';
import orderReducer from '../slices/OrderSslice';
import userReducer from '../slices/UserSlice';

import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';

const rootReducer = {
  builder: builderReducer,
  feed: feedReducer,
  ingredients: ingredientsReducer,
  order: orderReducer,
  user: userReducer
}; // Заменить на импорт настоящего редьюсера

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useDispatch: () => AppDispatch = () => dispatchHook();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;

export default store;

import { configureStore } from "@reduxjs/toolkit";
import quizReducer from "./slices/quizSlice";
import modalReducer from "./slices/modalSlice";
import coinsReducer from "./slices/coinsSlice";

export const store = configureStore({
  reducer: {
    quiz: quizReducer,
    modal: modalReducer,
    coins: coinsReducer,
  },
});

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

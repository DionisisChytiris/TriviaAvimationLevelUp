import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppDispatch } from "../store";

interface CoinsState {
  coins: number;
}

const initialState: CoinsState = {
  coins: 0,
};

const coinsSlice = createSlice({
  name: "coins",
  initialState,
  reducers: {
    setCoins: (state, action: PayloadAction<number>) => {
      state.coins = action.payload;
    },
    incrementCoins: (state, action: PayloadAction<number | undefined>) => {
      state.coins += action.payload ?? 1;
    },
    decrementCoins: (state, action: PayloadAction<number>) => {
      state.coins -= action.payload;
    },
    resetCoins: (state) => {
      state.coins = 0;
    },
  },
});

// actions
export const { setCoins, incrementCoins, decrementCoins, resetCoins } =
  coinsSlice.actions;

// async thunks for persistence
export const loadCoins = () => async (dispatch: AppDispatch) => {
  try {
    const stored = await AsyncStorage.getItem("coins");
    if (stored !== null) {
      dispatch(setCoins(Number(stored)));
    }
  } catch (err) {
    console.error("Failed to load coins", err);
  }
};

export const saveCoins = (coins: number) => async () => {
  try {
    await AsyncStorage.setItem("coins", coins.toString());
  } catch (err) {
    console.error("Failed to save coins", err);
  }
};

// reducer
export default coinsSlice.reducer;

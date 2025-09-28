import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModalInfo {
  title: string;
  subtitle?: string;
  rewardCoins?: number;
  success: boolean;
}

interface ModalState {
  visible: boolean;
  info?: ModalInfo;
  highlightedLevel?: number;
}

const initialState: ModalState = {
  visible: false,
  info: undefined,
  highlightedLevel: undefined,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    showModal: (
      state,
      action: PayloadAction<{
        title: string;
        subtitle?: string;
        rewardCoins?: number;
        success: boolean;
        highlightedLevel?: number;
      }>
    ) => {
      state.visible = true;
      state.info = {
        title: action.payload.title,
        subtitle: action.payload.subtitle,
        rewardCoins: action.payload.rewardCoins,
        success: action.payload.success,
      };
      state.highlightedLevel = action.payload.highlightedLevel;
    },
    hideModal: (state) => {
      state.visible = false;
      state.info = undefined;
      state.highlightedLevel = undefined;
    },
  },
});

export const { showModal, hideModal } = modalSlice.actions;
export default modalSlice.reducer;

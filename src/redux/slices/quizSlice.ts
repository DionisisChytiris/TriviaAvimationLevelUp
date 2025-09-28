import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModalInfo {
  title: string;
  subtitle?: string;
  rewardCoins?: number;
  success: boolean;
}

interface QuizState {
  currentLevel: number;
  currentQuestionIndex: number;
  lastColoredLevel: number;
  showModal: boolean;
  modalInfo?: ModalInfo;
  highlightedLevel?: number;
}

const initialState: QuizState = {
  currentLevel: 0,
  currentQuestionIndex: 0,
  lastColoredLevel: 1,
  showModal: false,
  modalInfo: undefined,
  highlightedLevel: undefined,
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    nextQuestion: (state) => {
      state.currentQuestionIndex += 1;
    },
    setLevel: (state, action: PayloadAction<number>) => {
      state.currentLevel = action.payload;
      state.lastColoredLevel = action.payload;
    },
    resetQuiz: () => initialState,

    // 🔹 Modal reducers
    openModal: (
      state,
      action: PayloadAction<{ info: ModalInfo; highlightedLevel?: number }>
    ) => {
      state.showModal = true;
      state.modalInfo = action.payload.info;
      state.highlightedLevel = action.payload.highlightedLevel;
    },
    closeModal: (state) => {
      state.showModal = false;
      state.modalInfo = undefined;
      state.highlightedLevel = undefined;
    },
  },
});

export const {
  nextQuestion,
  setLevel,
  resetQuiz,
  openModal,
  closeModal,
} = quizSlice.actions;
export default quizSlice.reducer;

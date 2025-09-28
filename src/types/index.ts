// types/index.ts

export type Question = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
};

export type ModalInfo = {
  title?: string;
  subtitle?: string;
  rewardCoins?: number;
  success?: boolean;
};

export type QuizState = {
  currentLevel: number; // 1..10
  currentQuestionIndex: number; // 0..9
  coins: number;
  showModal: boolean;
  modalInfo?: ModalInfo;
  isProcessingAnswer?: boolean;
  highlightedLevel?: number | undefined;
  // the single level that remains coloured when there is no new highlightedLevel (e.g. after a wrong answer)
  lastColoredLevel?: number;
};
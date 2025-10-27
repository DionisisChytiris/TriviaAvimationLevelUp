import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import {
  nextQuestion,
  setLevel,
  resetQuiz,
  toggleCoinAnim,
} from "../redux/slices/quizSlice";
import { showModal, hideModal } from "../redux/slices/modalSlice";
import { incrementCoins } from "../redux/slices/coinsSlice";

export const useQuiz = () => {
  const dispatch = useDispatch();
  const quiz = useSelector((state: RootState) => state.quiz);
  const modal = useSelector((state: RootState) => state.modal);
  const coins = useSelector((state: RootState) => state.coins);

  const answerQuestion = (wasCorrect: boolean) => {
    if (wasCorrect) {
      const reward =
        quiz.currentLevel === 2
          ? 10
          : quiz.currentLevel === 5
          ? 20
          : quiz.currentLevel === 9
          ? 50
          : 0; // ✅ fallback reward

      setTimeout(() => {
        dispatch(setLevel(quiz.currentLevel + 1));
        dispatch(incrementCoins(reward));
        if (reward) {
          dispatch(toggleCoinAnim(true));

          // 🕒 stop animation after 1.5 seconds
          setTimeout(() => {
            dispatch(toggleCoinAnim(false));
          }, 1500);
        }
      }, 3000);

      setTimeout(() => {
        dispatch(
          showModal({
            title: `Level ${quiz.currentLevel + 1}`,
            //   title: `Level ${quiz.currentLevel + 1} reached`,
            subtitle: reward ? `You earned ${reward} coins` : undefined,
            rewardCoins: reward,
            success: true,
          })
        );
      }, 600);
    } else {
      dispatch(
        showModal({
          title: "Wrong answer",
          subtitle: "Keep your progress",
          success: false,
        })
      );
    }
  };

  const closeModalNow = () => {
    dispatch(hideModal());
    dispatch(nextQuestion());
  };

  const restartQuiz = () => {
    // Keep coins by default; just reset quiz progress and close any open modal
    dispatch(hideModal());
    dispatch(resetQuiz());
  };

  return { quiz, modal, coins, answerQuestion, closeModalNow, restartQuiz };
};

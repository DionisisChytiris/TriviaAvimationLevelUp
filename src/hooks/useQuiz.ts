import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { nextQuestion, setLevel } from "../redux/slices/quizSlice";
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
        quiz.currentLevel === 3
          ? 10
          : quiz.currentLevel === 6
          ? 20
          : quiz.currentLevel === 10
          ? 50
          : 5; // ✅ fallback reward

      setTimeout(() => {
        dispatch(setLevel(quiz.currentLevel + 1));
        dispatch(incrementCoins(reward));
      }, 2000);

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

  return { quiz, modal, coins, answerQuestion, closeModalNow };
};

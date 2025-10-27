import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import theme from "./src/lib/theme";
import { useQuiz } from "./src/hooks/useQuiz";
import questions from "./src/data/questions";
import LevelModal from "./src/components/LevelModal";
import CoinAnimation from "./src/components/CoinAnimation";
import { toggleCoinAnim } from "./src/redux/slices/quizSlice";

function OptionButton({
  text,
  onPress,
  status = "idle",
  disabled = false,
}: {
  text: string;
  onPress: () => void;
  status?: "idle" | "correct" | "wrong" | "disabled";
  disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    if (!disabled) {
      setIsPressed(true); // mark as pressed
      Animated.spring(scale, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      setIsPressed(false); // reset variant style
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const variantStyle =
    status === "correct"
      ? styles.optionCorrect
      : status === "wrong"
      ? styles.optionWrong
      : status === "disabled"
      ? styles.optionDisabled
      : undefined;

  const textStyle =
    status === "correct" || status === "wrong"
      ? styles.optionTextOnColored
      : styles.optionText;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.optionButton,
          variantStyle,
          isPressed && styles.pressedVariant,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={textStyle}>{text}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const Quiz = () => {
  const { quiz, modal, coins, answerQuestion, closeModalNow, restartQuiz } =
    useQuiz();

    const dispatch = useDispatch();
     const coinAnimVisible = useSelector((state) => state.quiz.coinAnimVisible);
  const isFinished = quiz.currentQuestionIndex >= questions.length;
  const q = questions[quiz.currentQuestionIndex];

  // Track selected answer to show correct/wrong coloring
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  useEffect(() => {
    // Reset selection when question changes
    setSelectedIdx(null);
  }, [quiz.currentQuestionIndex]);

  // Animated progress for questions
  const progress = useRef(
    new Animated.Value((quiz.currentQuestionIndex + 1) / questions.length)
  ).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: (quiz.currentQuestionIndex + 1) / questions.length,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width uses layout
    }).start();
  }, [quiz.currentQuestionIndex, progress]);
  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // Card enter animation when question changes
  const cardAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    cardAnim.setValue(0);
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [quiz.currentQuestionIndex, cardAnim]);
  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  // Animated coins count-up
  const coinAnim = useRef(new Animated.Value(coins.coins)).current;
  const [coinDisplay, setCoinDisplay] = useState(coins.coins);
  useEffect(() => {
    const id = coinAnim.addListener(({ value }) => {
      setCoinDisplay(Math.round(value));
    });
    return () => {
      coinAnim.removeListener(id);
    };
  }, [coinAnim]);
  useEffect(() => {
    Animated.timing(coinAnim, {
      toValue: coins.coins,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [coins.coins, coinAnim]);

  useEffect(() => {
    if (modal.visible) {
      const timer = setTimeout(() => {
        closeModalNow();
      }, 4000); // auto-hide after 4s

      return () => clearTimeout(timer); // cleanup if modal closes earlier
    }
  }, [modal.visible, closeModalNow]);

  useEffect(() => {
    // could add loadCoins() here if needed
  }, []);

  // const [coinAnimVisible, setCoinAnimVisible] = useState(false);

  if (isFinished) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.endContainer}>
          <Text style={styles.endTitle}>All questions completed!</Text>
          <Text style={styles.endSubtitle}>
            Great job finishing the quiz. You can restart anytime to play again.
          </Text>
          <TouchableOpacity
            style={styles.endButton}
            onPress={restartQuiz}
            activeOpacity={0.85}
          >
            <Text style={styles.endButtonText}>Restart quiz</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.level}>
            Level {quiz.currentLevel} / {questions.length}
          </Text>
          <Text style={styles.progressSmall}>
            {quiz.currentQuestionIndex + 1} of {questions.length} questions
          </Text>
        </View>
        <View style={styles.coinsBox}>
          <Text style={styles.coinsLabel}>Coins</Text>
          <Text style={styles.coinsValue}>💰 {coinDisplay}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[styles.progressFill, { width: progressWidth }]}
        />
      </View>

      {/* Question Card */}
      <Animated.View
        style={[
          styles.card,
          { opacity: cardAnim, transform: [{ translateY: cardTranslateY }] },
        ]}
      >
        <Text style={styles.questionText}>{q?.text}</Text>

        {/* <TouchableOpacity
          onPress={() => setCoinAnimVisible(true)}
          style={{ marginTop: 40 }}
        >
          <CoinAnimation
            isVisible={coinAnimVisible}
            onAnimationComplete={() => setCoinAnimVisible(false))}
          />
          <Text>Coin Animation</Text>
        </TouchableOpacity> */}
        <View style={{zIndex: 9999}}>

          <CoinAnimation
            isVisible={coinAnimVisible}
            onAnimationComplete={() => dispatch(toggleCoinAnim(false))}
          />
        </View>

        <View style={styles.optionsList}>
          {q?.options.map((opt, idx) => {
            const isSelected = selectedIdx !== null && selectedIdx === idx;
            const isAnswered = selectedIdx !== null;
            let status: "idle" | "correct" | "wrong" | "disabled" = "idle";
            if (isAnswered) {
              if (isSelected) {
                status = selectedIdx === q?.correctIndex ? "correct" : "wrong";
              } else {
                status = "disabled";
              }
            }
            return (
              <OptionButton
                key={idx}
                text={opt}
                status={status}
                disabled={isAnswered}
                onPress={() => {
                  if (selectedIdx !== null) return;
                  setSelectedIdx(idx);
                  // Small delay to show color before modal/advance logic
                  setTimeout(() => {
                    answerQuestion(idx === q.correctIndex);
                  }, 350);
                }}
              />
            );
          })}
        </View>
      </Animated.View>

      {/* <TouchableOpacity
        onPress={() => setCoinAnimVisible(true)}
        style={{ marginTop: 40 }}
      >
        <CoinAnimation
          isVisible={coinAnimVisible}
          onAnimationComplete={() => setCoinAnimVisible(false)}
        />
        <Text>Coin Animation</Text>
      </TouchableOpacity> */}

      {/* Modal */}
      <LevelModal
        visible={modal.visible}
        currentLevel={quiz.currentLevel}
        highlightedLevel={quiz.currentLevel}
        lastColoredLevel={quiz.lastColoredLevel}
        modalInfo={modal.info}
        onClose={closeModalNow}
      />
    </SafeAreaView>
  );
};

// Wrap with Provider
export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <Quiz />
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  level: {
    fontSize: theme.type.h2,
    fontWeight: "700",
    color: theme.colors.text,
  },
  progressSmall: {
    fontSize: theme.type.small,
    color: theme.colors.muted,
  },
  coinsBox: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.sm,
    alignItems: "center",
  },
  coinsLabel: {
    fontSize: theme.type.small,
    color: theme.colors.muted,
  },
  coinsValue: {
    fontSize: theme.type.h2,
    fontWeight: "700",
    color: theme.colors.coin,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceVariant,
    overflow: "hidden",
    marginBottom: theme.spacing.md,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  questionText: {
    fontSize: theme.type.h1,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  optionsList: {
    marginTop: theme.spacing.sm,
  },
  optionButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surfaceVariant,
    marginBottom: theme.spacing.sm,
  },
  pressedVariant: {
    backgroundColor: "#ddd", // 👈 change this to your desired variant style
  },
  optionCorrect: {
    backgroundColor: theme.colors.success,
  },
  optionWrong: {
    backgroundColor: theme.colors.danger,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionText: {
    color: theme.colors.text,
    fontSize: theme.type.body,
    textAlign: "center",
    fontWeight: "600",
  },
  optionTextOnColored: {
    color: theme.colors.onPrimary,
    fontSize: theme.type.body,
    textAlign: "center",
    fontWeight: "700",
  },
  endContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  endTitle: {
    fontSize: theme.type.h1,
    fontWeight: "800",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  endSubtitle: {
    fontSize: theme.type.body,
    color: theme.colors.muted,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  endButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
  },
  endButtonText: {
    color: theme.colors.onPrimary,
    fontWeight: "700",
    fontSize: theme.type.body,
  },
});

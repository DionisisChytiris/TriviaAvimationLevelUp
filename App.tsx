import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import theme from "./src/lib/theme";
import { useQuiz } from "./src/hooks/useQuiz";
import questions from "./src/data/questions";
import LevelModal from "./src/components/LevelModal";

const Quiz = () => {
  const { quiz, modal, coins, answerQuestion, closeModalNow } = useQuiz();

  const q = questions[quiz.currentQuestionIndex];

  // useEffect(() => {
  //   if (modal.visible) {
  //     const timer = setTimeout(() => {
  //       closeModalNow();
  //     }, 4000); // auto-hide after 4s

  //     return () => clearTimeout(timer); // cleanup if modal closes earlier
  //   }
  // }, [modal.visible, closeModalNow]);

  useEffect(() => {
    // could add loadCoins() here if needed
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
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
          <Text style={styles.coinsValue}>💰 {coins.coins}</Text>
        </View>
      </View>

      {/* Question Card */}
      <View style={styles.card}>
        <Text style={styles.questionText}>{q?.text}</Text>

        <View style={styles.optionsList}>
          {q?.options.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.optionButton}
              onPress={() => answerQuestion(idx === q.correctIndex)}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
    <Provider store={store}>
      <Quiz />
    </Provider>
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
    marginBottom: theme.spacing.md,
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
  optionText: {
    color: theme.colors.text,
    fontSize: theme.type.body,
  },
});

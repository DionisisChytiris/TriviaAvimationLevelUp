// components/LevelModal.tsx
import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../lib/theme";

type Props = {
  visible: boolean;
  currentLevel: number; // current applied level (unchanged until modal hides)
  highlightedLevel?: number | undefined; // show only this level as highlighted while modal is visible
  // the single level that remains coloured when there is no new highlightedLevel (e.g. after a wrong answer)
  lastColoredLevel?: number;
  modalInfo?:
    | {
        title?: string;
        subtitle?: string;
        rewardCoins?: number;
        success?: boolean;
      }
    | undefined;
  onClose: () => void;
};

const windowHeight = Dimensions.get("window").height;

export const LevelModal: React.FC<Props> = ({
  visible,
  currentLevel,
  highlightedLevel,
  lastColoredLevel,
  modalInfo,
  onClose,
}) => {
  const levels = Array.from({ length: 10 }, (_, i) => 10 - i); // 10 down to 1 for top-to-bottom layout

  // Animated value for highlighted level scale
  const highlightScale = useRef(new Animated.Value(0.4)).current;
  const highlightOpacity = useRef(new Animated.Value(0)).current;
  // small delay controller
  const startAnimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prevHighlightedLevel = useRef<number | null>(null);

  useEffect(() => {
    if (startAnimTimer.current) {
      clearTimeout(startAnimTimer.current);
      startAnimTimer.current = null;
    }

    if (visible && highlightedLevel) {
      if (highlightedLevel > (prevHighlightedLevel.current ?? 0)) {
        // New level → play animation
        highlightScale.setValue(0.4);
        highlightOpacity.setValue(0);

        startAnimTimer.current = setTimeout(() => {
          Animated.parallel([
            Animated.timing(highlightOpacity, {
              toValue: 1,
              duration: 300,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(highlightScale, {
                toValue: 1.18,
                duration: 320,
                easing: Easing.out(Easing.back(2)),
                useNativeDriver: true,
              }),
              Animated.timing(highlightScale, {
                toValue: 1,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]),
          ]).start();

          // remember the new level
          prevHighlightedLevel.current = highlightedLevel;
        }, 380);
      } else {
        // Same level or wrong answer → show blue background instantly
        highlightScale.setValue(1);
        highlightOpacity.setValue(1);
      }
    } else {
      // Modal hidden → reset
      highlightScale.setValue(0.8);
      highlightOpacity.setValue(0);
    }

    return () => {
      if (startAnimTimer.current) clearTimeout(startAnimTimer.current);
    };
  }, [visible, highlightedLevel, highlightOpacity, highlightScale]);

  const getRewardForLevel = (level: number) => {
    switch (level) {
      case 3:
        return "+10 💰";
      case 6:
        return "+20 💰";
      case 10:
        return "+50 💰";
      default:
        return null;
    }
  };


  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons
                name={modalInfo?.success ? "trophy" : "close-circle"}
                size={36}
                color={
                  modalInfo?.success ? theme.colors.coin : theme.colors.danger
                }
              />
              <View style={{ marginLeft: theme.spacing.sm }}>
                <Text style={styles.title}>
                  {modalInfo?.title ?? "Level progress"}
                </Text>
                {modalInfo?.subtitle ? <Text style={styles.subtitle}>{modalInfo.subtitle}</Text> : null}
              </View>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={onClose}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View> */}
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onClose}
            style={styles.closeBtn}
          >
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>

          <View style={styles.levelsWrap}>
            <ScrollView
              contentContainerStyle={styles.levelsInner}
              showsVerticalScrollIndicator={false}
            >
              {levels.map((level) => {
                const isHighlighted = highlightedLevel === level;

                // Color logic:
                // - If highlightedLevel is present: color ONLY that level (and animate it)
                // - If no highlightedLevel: color ONLY the single lastColoredLevel so previous progress is shown as a single level
                const shouldBeColored =
                  isHighlighted ||
                  (!highlightedLevel && lastColoredLevel === level);

                const hasReward = !!getRewardForLevel(level);

                const backgroundStyle = shouldBeColored
                  ? styles.levelHighlighted
                  : hasReward
                  ? styles.levelReward
                  : styles.levelInactive;

                if (isHighlighted) {
                  return (
                    <Animated.View
                      key={level}
                      style={[
                        styles.levelRow,
                        backgroundStyle,
                        {
                          transform: [{ scale: highlightScale }],
                          opacity: highlightOpacity,
                        },
                      ]}
                    >
                       {getRewardForLevel(level) ? (
                      <Text
                        style={[
                          styles.rewardText,
                          shouldBeColored
                            ? styles.levelTextHighlighted
                            : styles.levelTextInactive,
                        ]}
                      >
                        {getRewardForLevel(level)}
                      </Text>
                    ) : (
                      <Text
                        style={[styles.levelText, styles.levelTextHighlighted]}
                      >
                        Level {level}
                      </Text>
                    )}
                    </Animated.View>
                  );
                }

                return (
                  <View key={level} style={[styles.levelRow, backgroundStyle]}>
                    {/* <Text
                      style={[
                        styles.levelText,
                        shouldBeColored
                          ? styles.levelTextHighlighted
                          : styles.levelTextInactive,
                      ]}
                    >
                      Level {level}
                    </Text> */}
                    {getRewardForLevel(level) ? (
                      <Text
                        style={[
                          styles.rewardText,
                          shouldBeColored
                            ? styles.levelTextHighlighted
                            : styles.levelTextInactive,
                        ]}
                      >
                        {getRewardForLevel(level)}
                      </Text>
                    ) : (
                      <Text
                        style={[
                          styles.levelText,
                          shouldBeColored
                            ? styles.levelTextHighlighted
                            : styles.levelTextInactive,
                        ]}
                      >
                        Level {level}
                      </Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* {modalInfo?.rewardCoins ? (
            <View style={styles.rewardWrap}>
              <View style={styles.coinCircle}>
                <Text style={styles.coinPlus}>+</Text>
                <Text style={styles.coinNumber}>{modalInfo.rewardCoins}</Text>
              </View>
              <Text style={styles.rewardLabel}>Coins</Text>
            </View>
          ) : null}

          <View style={styles.footerNote}>
            <Text style={styles.noteText}>This modal will close automatically.</Text>
          </View> */}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(4,16,34,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  container: {
    width: "80%",
    height: "82%",
    maxWidth: 520,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: theme.type.h2,
    fontWeight: "700",
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.type.small,
    color: theme.colors.muted,
  },
  closeBtn: {
    position: "absolute",
    top: -50,
    right: -20,
    padding: theme.spacing.sm,
  },
  closeText: {
    color: "white",
    // color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 20,
  },
  levelsWrap: {
    flex: 1,
    marginVertical: theme.spacing.sm,
  },
  levelsInner: {
    justifyContent: "flex-end",
    paddingBottom: theme.spacing.md,
  },
  levelRow: {
    height: Math.max(44, Math.round((windowHeight - 360) / 12)),
    // height: 50,
    borderRadius: theme.radii.sm,
    marginVertical: theme.spacing.xs,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  },
  levelHighlighted: {
    backgroundColor: theme.colors.primary,
  },
  levelInactive: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  levelText: {
    fontWeight: "700",
    textAlign: "center",
  },
  levelTextHighlighted: {
    color: theme.colors.onPrimary,
    zIndex: 999
  },
  levelReward: {
    backgroundColor: 'rgba(0,200,83,0.2)',
  },
  levelTextInactive: {
    color: theme.colors.text,
  },
  rewardWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  coinCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.coin,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.sm,
  },
  coinPlus: {
    color: theme.colors.onPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
  coinNumber: {
    color: theme.colors.onPrimary,
    fontWeight: "800",
    fontSize: 18,
    marginTop: -4,
  },
  rewardLabel: {
    fontSize: theme.type.body,
    color: theme.colors.text,
  },
  footerNote: {
    marginTop: theme.spacing.md,
    alignItems: "center",
  },
  noteText: {
    fontSize: theme.type.small,
    color: theme.colors.muted,
  },
  rewardText: {
    fontSize: theme.type.small,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default LevelModal;

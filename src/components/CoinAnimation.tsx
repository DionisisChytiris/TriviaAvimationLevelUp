import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CoinAnimationProps {
  isVisible: boolean;
  onAnimationComplete: () => void;
}

const CoinAnimation: React.FC<CoinAnimationProps> = ({ isVisible, onAnimationComplete }) => {
  const { width, height } = Dimensions.get('window');

  // Single progress value (0 -> 1) to drive the whole animation reliably
  const progress = useRef(new Animated.Value(0)).current

  // Compute final offsets once per render so interpolations can reference them
  const endX = width / 2 - 36 // move from center towards right (padding)
//   const endY = -(height / 2 - 64) // move upward towards top (negative because origin is center)
  const endY = -(height /4) // move upward towards top (negative because origin is center)

  useEffect(() => {
    if (!isVisible) {
      // Reset progress when not visible so next run starts clean
      progress.setValue(0)
      return
    }

    // Debug: log that animation started
    // This will appear in Metro / device logs so you can confirm the component mounted
    // and that the animation progressed.
    // eslint-disable-next-line no-console
    // console.log('[CoinAnimation] start')

    // add a debug listener to track progress value
    const listenerId = progress.addListener(({ value }) => {
      // eslint-disable-next-line no-console
    //   console.log('[CoinAnimation] progress', value)
    })

    Animated.timing(progress, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start(() => {
      // notify parent when done
      onAnimationComplete()
      // NOTE: do NOT reset progress to 0 here. Reset is handled when
      // `isVisible` becomes false so we avoid an instantaneous jump
      // back to the start position while the parent may still be
      // processing the completion. Cleanup listener after completion.
      try { progress.removeListener(listenerId) } catch (e) {}
    })
    // cleanup listener if effect re-runs or component unmounts
    return () => {
      try { progress.removeListener(listenerId) } catch (e) {}
    }
  }, [isVisible, progress, onAnimationComplete])

  if (!isVisible) return null;

  // Derive transforms from progress interpolation
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, endX] as any });
  const translateY = progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, endY - 20, endY] as any });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.86] as any });

  // Coin fades at the end
  const coinOpacity = progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] as any });
  // Tail lags behind: use smaller output ranges so tails follow earlier part of motion
  const tail1X = progress.interpolate({ inputRange: [0, 1], outputRange: [0, endX * 0.45] as any });
  const tail1Y = progress.interpolate({ inputRange: [0, 1], outputRange: [0, endY * 0.45] as any });
  const tail2X = progress.interpolate({ inputRange: [0, 1], outputRange: [0, endX * 0.22] as any });
  const tail2Y = progress.interpolate({ inputRange: [0, 1], outputRange: [0, endY * 0.22] as any });

  const tail1Opacity = progress.interpolate({ inputRange: [0, 0.35, 0.9, 1], outputRange: [0, 0.45, 0.35, 0] as any });
  const tail2Opacity = progress.interpolate({ inputRange: [0, 0.45, 0.85, 1], outputRange: [0, 0.32, 0.35, 0] as any });

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {/* Debug ring to confirm mounting (can be removed later) */}
      {/* <Animated.View style={[styles.debugRing, { opacity: progress.interpolate({ inputRange: [0, 0.02, 0.04], outputRange: [0, 0.9, 0] as any }) }]} /> */}

      {/* Tail farther back */}
      <Animated.View
        style={[
          styles.tailBase,
          {
            width: 28,
            height: 28,
            marginLeft: -14,
            marginTop: -14,
            opacity: tail2Opacity,
            transform: [{ translateX: tail2X }, { translateY: tail2Y }],
            backgroundColor: '#FFD70055'
          },
        ]}
      />

      {/* Tail closer to coin */}
      <Animated.View
        style={[
          styles.tailBase,
          {
            width: 40,
            height: 40,
            marginLeft: -20,
            marginTop: -20,
            opacity: tail1Opacity,
            transform: [{ translateX: tail1X }, { translateY: tail1Y }],
            backgroundColor: '#FFD70088'
          },
        ]}
      />

      {/* Coin */}
      <Animated.View
        style={[
          styles.coinContainer,
          {
            transform: [{ translateX }, { translateY }, { scale }],
            opacity: coinOpacity,
          },
        ]}
      >
        <MaterialCommunityIcons name="currency-usd" size={60} color="#FFD700" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'yellow'
  },
  coinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    marginLeft: -30,
    marginTop: -30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tailBase: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    borderRadius: 999,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  debugRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 6,
    height: 6,
    marginLeft: -3,
    marginTop: -3,
    borderRadius: 6,
    backgroundColor: '#FF0000AA',
  },
});

export default CoinAnimation;
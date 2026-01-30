import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  SafeAreaView,
  Easing,
  PanResponder
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {LinearGradient} from 'expo-linear-gradient';
import theme from '../../Utills/AppTheme';

const { width, height } = Dimensions.get('window');

export const ToastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  DEFAULT: 'default',
  PREMIUM: 'premium', // New premium type with gold accent
  PROGRESS: 'progress' // New type for progress notifications
};

export const ToastPositions = {
  TOP: 'top',
  BOTTOM: 'bottom',
  CENTER: 'center'
};

export const ToastAnimationTypes = {
  SLIDE: 'slide',
  FADE: 'fade',
  SCALE: 'scale',
  BOUNCE: 'bounce'
};

const ToastComponent = ({
  visible,
  message,
  type = ToastTypes.DEFAULT,
  duration = 3000,
  onHide,
  title,
  position = ToastPositions.TOP,
  animationType = ToastAnimationTypes.SLIDE,
  showProgress = false,
  progress = 0,
  actionText,
  onActionPress,
  hideOnSwipe = true,
  hideOnTap = true,
  customIcon,
  customBackground,
  customStyle,
  multiline = false,
  maxLines = 2,
  showCloseButton = true,
  elevation = 8,
  borderRadius = 'md',
  showIcon = true
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [slideAnim] = useState(new Animated.Value(position === ToastPositions.BOTTOM ? 100 : -100));
  const [bounceAnim] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(0));
  const progressIntervalRef = useRef(null);
  
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => hideOnSwipe,
      onMoveShouldSetPanResponder: () => hideOnSwipe,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 50) {
          hideToast();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      startShowAnimation();
      
      if (showProgress && progress > 0) {
        animateProgress();
      } else if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, progress]);

  useEffect(() => {
    if (showProgress) {
      progressAnim.setValue(progress);
    }
  }, [progress]);

  const startShowAnimation = () => {
    pan.setValue({ x: 0, y: 0 });
    
    switch (animationType) {
      case ToastAnimationTypes.FADE:
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic)
        }).start();
        break;
      
      case ToastAnimationTypes.SCALE:
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          })
        ]).start();
        break;
      
      case ToastAnimationTypes.BOUNCE:
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: 1,
            tension: 300,
            friction: 5,
            useNativeDriver: true,
          })
        ]).start();
        break;
      
      default: // SLIDE
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
          })
        ]).start();
    }
  };

  const animateProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic)
    }).start();
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      animationType === ToastAnimationTypes.SLIDE ? 
        Animated.timing(slideAnim, {
          toValue: position === ToastPositions.BOTTOM ? 100 : -100,
          duration: 250,
          useNativeDriver: true,
        }) :
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 250,
          useNativeDriver: true,
        })
    ]).start(() => {
      onHide && onHide();
    });
  };

  if (!visible) return null;

  const getToastStyle = () => {
    const styles = {
      success: {
        backgroundColor: theme.COLORS.success,
        borderColor: theme.COLORS.successDark,
        icon: 'check-circle',
        gradient: ['#10B981', '#34D399'],
        iconColor: theme.COLORS.white,
        textColor: theme.COLORS.white,
        progressColor: theme.COLORS.successLight
      },
      error: {
        backgroundColor: theme.COLORS.error,
        borderColor: theme.COLORS.errorDark,
        icon: 'alert-circle',
        gradient: ['#DC2626', '#EF4444'],
        iconColor: theme.COLORS.white,
        textColor: theme.COLORS.white,
        progressColor: theme.COLORS.errorLight
      },
      warning: {
        backgroundColor: theme.COLORS.warning,
        borderColor: theme.COLORS.warningDark,
        icon: 'alert',
        gradient: ['#F59E0B', '#FBBF24'],
        iconColor: theme.COLORS.white,
        textColor: theme.COLORS.white,
        progressColor: theme.COLORS.warningLight
      },
      info: {
        backgroundColor: theme.COLORS.info,
        borderColor: theme.COLORS.infoDark,
        icon: 'information',
        gradient: ['#3B82F6', '#60A5FA'],
        iconColor: theme.COLORS.white,
        textColor: theme.COLORS.white,
        progressColor: theme.COLORS.infoLight
      },
      premium: {
        backgroundColor: theme.COLORS.primary,
        borderColor: theme.COLORS.goldPrimary,
        icon: 'crown',
        gradient: theme.COLORS.gradient.luxury,
        iconColor: theme.COLORS.goldPrimary,
        textColor: theme.COLORS.white,
        progressColor: theme.COLORS.goldPrimary
      },
      default: {
        backgroundColor: theme.COLORS.primary,
        borderColor: theme.COLORS.primaryDark,
        icon: 'bell',
        gradient: theme.COLORS.gradient.bluePrimary,
        iconColor: theme.COLORS.white,
        textColor: theme.COLORS.white,
        progressColor: theme.COLORS.primaryLight
      },
      progress: {
        backgroundColor: theme.COLORS.primary,
        borderColor: theme.COLORS.primaryDark,
        icon: 'progress-clock',
        gradient: theme.COLORS.gradient.blueDeep,
        iconColor: theme.COLORS.white,
        textColor: theme.COLORS.white,
        progressColor: theme.COLORS.goldPrimary
      }
    };

    return styles[type] || styles.default;
  };

  const getPositionStyle = () => {
    switch (position) {
      case ToastPositions.BOTTOM:
        return {
          top: undefined,
          bottom: Platform.OS === 'ios' ? theme.SIZES.padding.xxl : theme.SIZES.padding.xl,
        };
      case ToastPositions.CENTER:
        return {
          top: height / 2 - 50,
          bottom: undefined,
        };
      default: // TOP
        return {
          top: Platform.OS === 'ios' ? theme.SIZES.padding.xxl : theme.SIZES.padding.xl,
          bottom: undefined,
        };
    }
  };

  const getAnimationStyle = () => {
    switch (animationType) {
      case ToastAnimationTypes.FADE:
        return {
          opacity: fadeAnim,
          transform: [{ translateY: 0 }]
        };
      case ToastAnimationTypes.SCALE:
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        };
      case ToastAnimationTypes.BOUNCE:
        const bounceValue = bounceAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, -15, 0]
        });
        return {
          opacity: fadeAnim,
          transform: [{ translateY: bounceValue }]
        };
      default: // SLIDE
        return {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { translateX: pan.x }
          ]
        };
    }
  };

  const getBorderRadius = () => {
    const radiusMap = {
      xs: theme.SIZES.radius.xs,
      sm: theme.SIZES.radius.sm,
      md: theme.SIZES.radius.md,
      lg: theme.SIZES.radius.lg,
      xl: theme.SIZES.radius.xl,
      full: theme.SIZES.radius.full
    };
    return radiusMap[borderRadius] || theme.SIZES.radius.md;
  };

  const getElevation = () => {
    const elevationMap = {
      0: theme.SHADOWS.none,
      1: theme.SHADOWS.xs,
      2: theme.SHADOWS.sm,
      4: theme.SHADOWS.md,
      8: theme.SHADOWS.lg,
      12: theme.SHADOWS.xl
    };
    return elevationMap[elevation] || theme.SHADOWS.lg;
  };

  const toastStyle = getToastStyle();
  const positionStyle = getPositionStyle();
  const animationStyle = getAnimationStyle();
  const borderRadiusValue = getBorderRadius();
  const shadowStyle = getElevation();

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <SafeAreaView style={[styles.safeArea, positionStyle]} pointerEvents="box-none">
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.container,
          {
            borderRadius: borderRadiusValue,
            borderColor: customBackground ? 'transparent' : toastStyle.borderColor,
            borderWidth: type === 'premium' ? 2 : 1,
            ...shadowStyle,
            ...animationStyle,
          },
          position === ToastPositions.CENTER && styles.centerContainer,
          customStyle
        ]}
      >
        {customBackground ? (
          customBackground
        ) : (
          <LinearGradient
            colors={toastStyle.gradient}
            style={[styles.gradient, { borderRadius: borderRadiusValue - 1 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.content}>
              {showIcon && (
                <Icon 
                  name={customIcon || toastStyle.icon} 
                  size={24} 
                  color={toastStyle.iconColor} 
                  style={styles.icon} 
                />
              )}
              
              <View style={styles.textContainer}>
                {title && (
                  <Text style={[styles.title, { color: toastStyle.textColor }]}>
                    {title}
                  </Text>
                )}
                <Text 
                  style={[styles.message, { color: toastStyle.textColor }]}
                  numberOfLines={multiline ? undefined : maxLines}
                >
                  {message}
                </Text>
              </View>
              
              <View style={styles.rightActions}>
                {actionText && onActionPress && (
                  <TouchableOpacity onPress={onActionPress} style={styles.actionButton}>
                    <Text style={[styles.actionText, { color: toastStyle.textColor }]}>
                      {actionText}
                    </Text>
                  </TouchableOpacity>
                )}
                
                {showCloseButton && (
                  <TouchableOpacity 
                    onPress={hideToast} 
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon name="close" size={20} color={toastStyle.textColor} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {showProgress && (
              <Animated.View 
                style={[
                  styles.progressBar,
                  { 
                    width: progressWidth,
                    backgroundColor: toastStyle.progressColor 
                  }
                ]} 
              />
            )}
          </LinearGradient>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

// Toast Hook for easy usage
export const useToast = () => {
  const [toastState, setToastState] = useState({
    visible: false,
    message: '',
    type: ToastTypes.DEFAULT,
    duration: 3000,
    title: null,
    position: ToastPositions.TOP,
    animationType: ToastAnimationTypes.SLIDE,
    showProgress: false,
    progress: 0,
    actionText: null,
    onActionPress: null,
    customIcon: null,
    customBackground: null,
    customStyle: null
  });

  const showToast = (config) => {
    setToastState({
      visible: true,
      message: config.message,
      type: config.type || ToastTypes.DEFAULT,
      duration: config.duration || 3000,
      title: config.title || null,
      position: config.position || ToastPositions.TOP,
      animationType: config.animationType || ToastAnimationTypes.SLIDE,
      showProgress: config.showProgress || false,
      progress: config.progress || 0,
      actionText: config.actionText || null,
      onActionPress: config.onActionPress || null,
      customIcon: config.customIcon || null,
      customBackground: config.customBackground || null,
      customStyle: config.customStyle || null
    });
  };

  const hideToast = () => {
    setToastState(prev => ({ ...prev, visible: false }));
  };

  const updateProgress = (progress) => {
    setToastState(prev => ({ ...prev, progress }));
  };

  return {
    showToast,
    hideToast,
    updateProgress,
    Toast: () => (
      <ToastComponent
        {...toastState}
        onHide={hideToast}
      />
    ),
    toastState
  };
};

// Quick Toast Methods
export const showSuccessToast = (message, title = 'Success', duration = 3000) => ({
  visible: true,
  message,
  title,
  type: ToastTypes.SUCCESS,
  duration
});

export const showErrorToast = (message, title = 'Error', duration = 4000) => ({
  visible: true,
  message,
  title,
  type: ToastTypes.ERROR,
  duration
});

export const showPremiumToast = (message, title = 'Premium', duration = 3000) => ({
  visible: true,
  message,
  title,
  type: ToastTypes.PREMIUM,
  duration
});

export const showProgressToast = (message, title = 'Loading...', initialProgress = 0) => ({
  visible: true,
  message,
  title,
  type: ToastTypes.PROGRESS,
  duration: 0, // Infinite until manually hidden
  showProgress: true,
  progress: initialProgress
});

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  container: {
    marginHorizontal: theme.SIZES.padding.md,
    overflow: 'hidden',
    minHeight: theme.SIZES.button.md,
  },
  centerContainer: {
    position: 'absolute',
    left: theme.SIZES.padding.md,
    right: theme.SIZES.padding.md,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.SIZES.padding.md,
    minHeight: theme.SIZES.button.md,
  },
  textContainer: {
    flex: 1,
    marginRight: theme.SIZES.padding.sm,
  },
  title: {
    ...theme.FONTS.label,
    fontSize: theme.SIZES.font.sm,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    ...theme.FONTS.bodySmall,
    fontSize: theme.SIZES.font.sm,
    lineHeight: theme.SIZES.font.sm * 1.4,
  },
  icon: {
    marginRight: theme.SIZES.padding.sm,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: theme.SIZES.padding.sm,
    paddingVertical: theme.SIZES.padding.xs,
    marginRight: theme.SIZES.padding.xs,
    borderRadius: theme.SIZES.radius.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    ...theme.FONTS.captionBold,
    fontSize: theme.SIZES.font.xs,
  },
  closeButton: {
    padding: theme.SIZES.padding.xs,
  },
  progressBar: {
    height: 3,
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderBottomLeftRadius: theme.SIZES.radius.xs,
  },
});

// Toast Provider for global usage
export const ToastProvider = ({ children }) => {
  const { Toast } = useToast();
  
  return (
    <>
      {children}
      <Toast />
    </>
  );
};

export default ToastComponent;
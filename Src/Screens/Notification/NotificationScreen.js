import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import useNotifications from "../../Hooks/useNotifications";
import NotificationService from "../../Services/NotificationService";
import CommonHeader from "../../Components/CommonHeader/CommonHeader";

const { width } = Dimensions.get("window");

const NotificationScreen = () => {
  const swipeableRefs = useRef(new Map());
  
  const {
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const handleDeleteAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to delete all notifications? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await deleteAllNotifications();
          },
          style: "destructive"
        },
      ]
    );
  };

  const handleDeleteSingle = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Delete Notification",
      "Remove this notification?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Close swipeable before deleting
            const swipeable = swipeableRefs.current.get(id);
            if (swipeable) {
              swipeable.close();
            }
            await deleteNotification(id);
          },
          style: "destructive"
        },
      ]
    );
  };

  const handleMarkAsRead = async (item) => {
    if (!item.isRead) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await markAsRead(item.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await markAllAsRead();
    }
  };

  const getNotificationIcon = (title, isRead) => {
    if (title?.toLowerCase().includes('welcome')) {
      return { name: 'hand-wave', color: '#4CAF50', bg: '#E8F5E9' };
    } else if (title?.toLowerCase().includes('gold') || title?.toLowerCase().includes('silver')) {
      return { name: 'gold', color: '#FFA000', bg: '#FFF8E1' };
    } else if (title?.toLowerCase().includes('scheme')) {
      return { name: 'account-cash', color: '#7E57C2', bg: '#EDE7F6' };
    } else {
      return { name: 'bell-outline', color: '#6200ee', bg: '#F3E5F5' };
    }
  };

  const NotificationItem = ({
    item,
    swipeableRefs,
    handleDeleteSingle,
    handleMarkAsRead,
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const isRead = item.isRead;
    const icon = getNotificationIcon(item.title, isRead);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Swipeable
          ref={(ref) => {
            if (ref) {
              swipeableRefs.current.set(item.id, ref);
            } else {
              swipeableRefs.current.delete(item.id);
            }
          }}
          renderRightActions={(progress, dragX) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleDeleteSingle(item.id)}
            >
              <LinearGradient
                colors={["#ff6b6b", "#ee5253"]}
                style={styles.deleteSwipe}
              >
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={24}
                  color="#fff"
                />
                <Text style={styles.deleteText}>Delete</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          overshootRight={false}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleMarkAsRead(item)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <LinearGradient
              colors={
                isRead
                  ? ["#ffffff", "#fafafa"]
                  : ["#F8F4FF", "#F0E6FF"]
              }
              style={[styles.card, !isRead && styles.unreadCard]}
            >
              <View style={styles.cardContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: icon.bg },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={icon.name}
                    size={24}
                    color={icon.color}
                  />
                </View>

                <View style={styles.textContainer}>
                  <View style={styles.titleContainer}>
                    <Text style={[styles.title, !isRead && styles.unreadTitle]}>
                      {item.title}
                    </Text>
                    {!isRead && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>NEW</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.message} numberOfLines={2}>
                    {item.message}
                  </Text>
                  <View style={styles.metaContainer}>
                    <Ionicons name="time-outline" size={12} color="#999" />
                    <Text style={styles.date}>
                      {NotificationService.formatNotificationDate(
                        item.createdAt
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.stickyHeader}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{notifications.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{unreadCount}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{notifications.length - unreadCount}</Text>
            <Text style={styles.statLabel}>Read</Text>
          </View>
        </View>
      </BlurView>

      {notifications.length > 0 && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, unreadCount === 0 && styles.disabledBtn]}
            onPress={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={unreadCount === 0 ? ['#E0E0E0', '#BDBDBD'] : ['#4CAF50', '#45A049']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <Ionicons name="checkmark-done-outline" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Mark All Read</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleDeleteAll}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#FF5252', '#FF1744']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Delete All</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <CommonHeader title="Notifications" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CommonHeader title="Notifications" />
      
      {renderHeader()}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            swipeableRefs={swipeableRefs}
            handleDeleteSingle={handleDeleteSingle}
            handleMarkAsRead={handleMarkAsRead}
          />
        )}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={refresh}
            colors={["#6200ee"]}
            tintColor="#6200ee"
            progressBackgroundColor="#fff"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#F3E5F5', '#EDE7F6']}
              style={styles.emptyIconContainer}
            >
              <MaterialCommunityIcons name="bell-off-outline" size={64} color="#6200ee" />
            </LinearGradient>
            <Text style={styles.emptyText}>All Caught Up!</Text>
            <Text style={styles.emptySubText}>
              You have no notifications at the moment
            </Text>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={Platform.OS === 'android'}
      />
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  stickyHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  blurContainer: {
    overflow: 'hidden',
    borderTopWidth: 0,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
  },

  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    gap: 10,
  },

  actionBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },

  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  disabledBtn: {
    opacity: 0.6,
  },

  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 6,
  },

  card: {
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  unreadCard: {
    borderWidth: 1,
    borderColor: '#6200ee',
  },

  cardContent: {
    flexDirection: 'row',
    gap: 16,
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textContainer: {
    flex: 1,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },

  unreadTitle: {
    fontWeight: '700',
    color: '#000',
  },

  unreadBadge: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },

  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },

  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  date: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },

  deleteSwipe: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: '90%',
    marginVertical: 6,
    marginRight: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#ff6b6b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 16,
  },

  listContent: {
    paddingVertical: 12,
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },

  emptySubText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
});
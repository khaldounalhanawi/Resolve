/**
 * HomeScreen
 * 
 * Main screen for daily metric logging.
 * Displays all metrics with slider inputs for quick data entry.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Swipeable } from 'react-native-gesture-handler';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../contexts/AuthContext';
import { MetricInputCard, AddMetricModal, EditMetricModal } from '../components';
import { COLORS, SUGGESTED_METRICS } from '../constants';
import { getTodayISO, formatWeekdayDate } from '../utils/dateUtils';

export function HomeScreen() {
  const { userId } = useAuth();
  const today = getTodayISO();
  
  // Convex queries
  const user = useQuery(api.users.getUser, userId ? { userId } : 'skip');
  const metrics = useQuery(api.metrics.getUserMetrics, userId ? { userId } : 'skip');
  const entries = useQuery(api.entries.getUserEntriesByDate, userId ? { userId, date: today } : 'skip');
  
  // Convex mutations
  const createMetric = useMutation(api.metrics.createMetric);
  const updateMetricMutation = useMutation(api.metrics.updateMetric);
  const deleteMetric = useMutation(api.metrics.deleteMetric);
  const upsertEntry = useMutation(api.entries.upsertEntry);
  const accumulateEntry = useMutation(api.entries.accumulateEntry);
  const generateUploadUrl = useMutation(api.users.generateAvatarUploadUrl);
  const saveAvatar = useMutation(api.users.saveUserAvatar);
  
  const [isAddModalVisible, setIsAddModalVisible] = React.useState(false);
  const [editingMetric, setEditingMetric] = React.useState<any>(null);
  
  // Calculate metrics with today's values
  const metricsWithValues = useMemo(() => {
    if (!metrics || !entries) return [];
    
    return metrics.map(metric => {
      const todayEntry = entries.find(e => e.metricId === metric._id);
      return {
        metric,
        value: todayEntry?.value ?? (metric.aggregationType === 'accumulate' ? 0 : metric.minValue),
        hasEntry: todayEntry !== undefined,
      };
    });
  }, [metrics, entries]);

  const handleAddSuggestedMetrics = async () => {
    if (!userId) return;
    for (const suggestion of SUGGESTED_METRICS) {
      await createMetric({ 
        userId, 
        ...suggestion,
        color: suggestion.color || COLORS.primary 
      });
    }
  };

  const handleLogValue = async (metricId: any, value: number) => {
    if (!userId) return;
    
    const metric = metrics?.find(m => m._id === metricId);
    if (!metric) return;

    if (metric.aggregationType === 'accumulate') {
      await accumulateEntry({ userId, metricId, date: today, value });
    } else {
      await upsertEntry({ userId, metricId, date: today, value });
    }
  };

  const handleUpdateMetric = async (metricId: any, data: any) => {
    await updateMetricMutation({ metricId, ...data });
  };

  const handleRemoveMetric = async (metricId: any) => {
    await deleteMetric({ metricId });
  };

  const handleAddMetric = async (data: any) => {
    if (!userId) return;
    await createMetric({ 
      userId, 
      ...data,
      color: data.color || COLORS.primary
    });
  };

  const handleAvatarPress = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photo library to change your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (result.canceled || !userId) return;
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      const upload = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': result.assets[0].mimeType ?? 'image/jpeg' },
        body: blob,
      });
      const { storageId } = await upload.json();
      await saveAvatar({ userId, storageId });
    } catch (e) {
      Alert.alert('Error', 'Failed to upload avatar. Please try again.');
    }
  };

  const renderRightActions = (metricId: string) => (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleRemoveMetric(metricId)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const isLoading = !metrics || !entries || !user;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (metrics && metrics.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Welcome to Resolve! 🎯</Text>
        <Text style={styles.emptyText}>
          Start tracking your daily metrics to discover patterns and reach your goals.
        </Text>
        <TouchableOpacity
          style={styles.setupButton}
          onPress={handleAddSuggestedMetrics}
        >
          <Text style={styles.setupButtonText}>Add Suggested Metrics</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
            <Image
              source={user?.avatarUrl ? { uri: user.avatarUrl } : require('../../assets/logo.png')}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
            <Text style={styles.subGreeting} numberOfLines={2}>Are you ready for a brand new day?</Text>
            <Text style={styles.date}>{formatWeekdayDate(today)}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <Text style={styles.sectionTitle}>Categories</Text>
        {metricsWithValues.map(({ metric, value, hasEntry }) => (
          <Swipeable
            key={metric._id}
            renderRightActions={renderRightActions(metric._id)}
            activeOffsetX={[-20, 20]}
            overshootLeft={false}
            overshootRight={false}
          >
            <MetricInputCard
              metric={metric}
              currentValue={value}
              hasEntry={hasEntry}
              onSave={(newValue) => handleLogValue(metric._id, newValue)}
              onEdit={() => setEditingMetric(metric)}
            />
          </Swipeable>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Add New Category</Text>
        </TouchableOpacity>
      </ScrollView>

      <AddMetricModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAdd={handleAddMetric}
      />

      <EditMetricModal
        visible={!!editingMetric}
        metric={editingMetric}
        onClose={() => setEditingMetric(null)}
        onUpdate={handleUpdateMetric}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 75,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 32,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  setupButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  setupButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: COLORS.background,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    flex: 1,
    flexShrink: 1,
  },
  avatarContainer: {
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 2,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: COLORS.gray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 16,
  },
  deleteAction: {
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 16,
    marginBottom: 12,
  },
  deleteButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

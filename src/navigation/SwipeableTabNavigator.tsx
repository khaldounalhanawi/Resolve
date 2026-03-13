/**
 * Swipeable Tab Navigator
 * 
 * Custom tab navigator that supports swipe gestures between screens
 * while maintaining bottom tab bar navigation.
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { HomeScreen, CalendarScreen, AnalyticsScreen } from '../screens';
import { COLORS } from '../constants';

const initialLayout = { width: Dimensions.get('window').width };

export function SwipeableTabNavigator() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'home', title: 'Today', icon: '📝' },
    { key: 'calendar', title: 'Calendar', icon: '📅' },
    { key: 'analytics', title: 'Analytics', icon: '📊' },
  ]);

  const renderScene = SceneMap({
    home: HomeScreen,
    calendar: CalendarScreen,
    analytics: AnalyticsScreen,
  });

  const renderTabBar = (props: any) => {
    return (
      <View style={styles.tabBar}>
        {props.navigationState.routes.map((route: any, i: number) => {
          const isActive = index === i;
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={() => setIndex(i)}
            >
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                {route.icon}
              </Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {route.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
      swipeEnabled={true}
    />
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingBottom: 20,
    paddingTop: 8,
    height: 75,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    opacity: 0.5,
    marginBottom: 2,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
});

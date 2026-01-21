import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [storageData, setStorageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllStorageData();
  }, []);

  const loadAllStorageData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);

      const formattedData = {};
      result.forEach(([key, value]) => {
        try {
          formattedData[key] = JSON.parse(value);
        } catch {
          formattedData[key] = value;
        }
      });

      setStorageData(formattedData);
    } catch (error) {
      console.error('Error loading AsyncStorage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AsyncStorage Debug 🧪</Text>

      {storageData && Object.keys(storageData).length > 0 ? (
        Object.entries(storageData).map(([key, value]) => (
          <View key={key} style={styles.card}>
            <Text style={styles.key}>{key}</Text>
            <Text style={styles.value}>
              {typeof value === 'object'
                ? JSON.stringify(value, null, 2)
                : String(value)}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>No data found in AsyncStorage</Text>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b14545',
    padding: 16,
  },
  center: {
    flex: 1,
    backgroundColor: '#b14545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  key: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b14545',
    marginBottom: 6,
  },
  value: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  empty: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 40,
  },
});

// screens/HistoryScreen.js
import React, { useCallback, useState } from 'react';
import { View, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { fetchHistory } from '../api/history';
import { useFocusEffect } from '@react-navigation/native';  
import { toast } from 'react-toastify';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const getHistory = async () => {
        setLoading(true);
        try {
          const data = await fetchHistory();
          setHistory(data);
        } catch (err) {
          setError(err);
          toast.error('Не удалось загрузить историю. Попробуйте позже.');
        } finally {
          setLoading(false);
        }
      };

      getHistory();
    }, [])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('HistoryDetail', { id: item.id })}
    >
      <Card style={styles.card}>
        <View style={styles.cardContent}>
          <Image source={{ uri: `http://localhost:5000/api/photo?path=${item.image_path}` }} style={styles.thumbnail} />
          <View style={styles.textContainer}>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
            <Text style={styles.result}>
              {item.is_correct ? 'Распознавание успешно' : 'Распознавание ошибочно'}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <Text>Ошибка загрузки данных.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: '#f5f5f5',
    },
    list: {
      paddingBottom: 20,
    },
    card: {
      marginBottom: 10,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 10,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    thumbnail: {
      width: 70,
      height: 70,
      borderRadius: 8,
      marginRight: 10,
    },
    textContainer: {
      flex: 1,
    },
    date: {
      fontSize: 12,
      color: 'gray',
      marginBottom: 5,
    },
    result: {
      fontSize: 14,
      color: '#333',
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  
  export default HistoryScreen;
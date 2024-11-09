// screens/HistoryScreen.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { fetchHistory } from '../api/history';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getHistory = async () => {
      try {
        // const data = [
        //   {
        //     id: 1,
        //     image_url: "https://your-server.com/images/detail1.jpg",
        //     processed_at: "2024-04-01T10:00:00Z",
        //     result: "Пропорции детали соответствуют стандарту.",
        //   },
        //   {
        //     id: 2,
        //     image_url: "https://your-server.com/images/detail2.jpg",
        //     processed_at: "2024-04-02T12:30:00Z",
        //     result: "Есть отклонения в размерах.",
        //   }
        // ];
        const data = await fetchHistory();
        setHistory(data);
      } catch (err) {
        setError(err);
        Alert.alert('Ошибка', 'Не удалось загрузить историю. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    getHistory();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('HistoryDetail', { id: item.id })}
    >
      <Card style={styles.card}>
        <View style={styles.cardContent}>
          <Image source={{ uri: item.image_path }} style={styles.thumbnail} />
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
// screens/HistoryDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { fetchHistoryDetail } from '../api/history';

const HistoryDetailScreen = ({ route }) => {
  const { id } = route.params;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const styles = StyleSheet.create({
    container: {
      padding: 10,
      backgroundColor: '#f5f5f5',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 10,
    },
    image: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: 10,
    },
    noImageText: {
      fontSize: 14,
      color: 'gray',
      marginBottom: 10,
    },
    infoContainer: {
      marginTop: 10,
    },
    date: {
      fontSize: 14,
      color: 'gray',
      marginBottom: 5,
    },
    result: {
      fontSize: 16,
      color: detail.is_correct ? 'green' : 'red',
      fontWeight: 'bold',
      marginBottom: 10,
    },
    correctText: {
      fontSize: 14,
      color: '#333',
      marginBottom: 5,
    },
    additionalInfo: {
      marginTop: 15,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#ddd',
    },
    additionalTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#000'
    },
    additionalText: {
      fontSize: 14,
      color: '#555',
      marginBottom: 5,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  useEffect(() => {
    const getDetail = async () => {
      try {
        const data = await fetchHistoryDetail(id);
        setDetail(data);
      } catch (err) {
        setError(err);
        Alert.alert('Ошибка', 'Не удалось загрузить детали анализа. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    getDetail();
  }, [id]);

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
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Распознанная фотография</Text>
        {detail.recognized_image_path ? (
          <Image source={{ uri: detail.recognized_image_path }} style={styles.image} />
        ) : (
          <Text style={styles.noImageText}>Распознанное изображение отсутствует</Text>
        )}

        <Text style={styles.title}>Исходная фотография</Text>
        <Image source={{ uri: detail.image_path }} style={styles.image} />

        <View style={styles.infoContainer}>
          <Text style={styles.date}>Дата: {new Date(detail.created_at).toLocaleString()}</Text>
          <Text style={styles.result}>
            {detail.is_correct ? 'Распознавание успешно' : 'Распознавание ошибочно'}
          </Text>
          {!detail.is_correct && (
            <>
              <Text style={styles.correctText}>Верный артикул: {detail.correct_part_number}</Text>
              <Text style={styles.correctText}>Верный порядковый номер: {detail.correct_order_number}</Text>
            </>
          )}
        </View>

        {detail.detail && (
          <View style={styles.additionalInfo}>
            <Text style={styles.additionalTitle}>Дополнительная информация о детали:</Text>
            <Text style={styles.additionalText}>Артикул: {detail.detail.part_number}</Text>
            <Text style={styles.additionalText}>Порядковый номер: {detail.detail.order_number}</Text>
            <Text style={styles.additionalText}>Название: {detail.detail.name}</Text>
            <Text style={styles.additionalText}>Номер заказа: {detail.detail.order_id}</Text>
            <Text style={styles.additionalText}>Станция и блок: {detail.detail.station_block}</Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
};


export default HistoryDetailScreen;
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

  useEffect(() => {
    const getDetail = async () => {
      try {
        // const data = await fetchHistoryDetail(id);
        const data = {
          id: 1,
          image_url: "https://your-server.com/images/detail1.jpg",
          processed_at: "2024-04-01T10:00:00Z",
          result: "Пропорции детали соответствуют стандарту.",
          additional_info: {
            dimension_x: "20.5 мм",
            dimension_y: "15.2 мм",
            dimension_z: "10.0 мм",
            weight: "50 г",
            material: "Алюминий",
            tolerance: "±0.1 мм",
            comments: "Деталь соответствует всем параметрам и готова к использованию."
          }
        };
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
        <View style={styles.cardContent}>
          <Image source={{ uri: detail.image_url }} style={styles.thumbnail} />
          <View style={styles.textContainer}>
            <Text style={styles.date}>{new Date(detail.processed_at).toLocaleString()}</Text>
            <Text style={styles.result}>{detail.result}</Text>
          </View>
        </View>
        {detail.additional_info && (
          <View style={styles.additionalInfo}>
            <Text style={styles.additionalTitle}>Дополнительная информация:</Text>
            {Object.keys(detail.additional_info).map((key) => (
              <Text key={key} style={styles.additionalText}>
                {`${key}: ${detail.additional_info[key]}`}
              </Text>
            ))}
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

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
    marginBottom: 10,
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

export default HistoryDetailScreen;

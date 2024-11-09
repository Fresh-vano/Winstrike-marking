import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { fetchStats } from '../api/stats';
import { LineChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const StatsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStats = async () => {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (err) {
        setError(err);
        Alert.alert('Ошибка', 'Не удалось загрузить статистику. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, []);

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

  // Подготовка данных для графиков
  const lineChartData = {
    labels: stats.analysis_over_time.map(item => item.date),
    datasets: [
      {
        data: stats.analysis_over_time.map(item => item.count),
      },
    ],
  };
  const pieChartData = Object.keys(stats.result_distribution).map((key, index) => ({
    name: key,
    population: stats.result_distribution[key],
    color: getColor(index),
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Общая статистика</Text>
          <Text style={styles.statText}>Всего загрузок: {stats.total_uploads}</Text>
          <Text style={styles.statText}>Верно распознано: {stats.total_true}</Text>
          <Text style={styles.statText}>Неверно распознано: {stats.total_false}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Анализы за неделю</Text>
          <LineChart
            data={lineChartData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Распределение по станциям</Text>
          {Object.keys(stats.result_distribution).length === 0 ? (
            <Text style={styles.statText1}>Нет данных</Text>
            ) : (
                <PieChart
                  data={pieChartData}
                  width={screenWidth - 40} // Ограничиваем ширину графика
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const getColor = (index) => {
  const colors = ['#f44336', '#2196f3', '#ffeb3b', '#4caf50', '#9c27b0', '#ff9800'];
  return colors[index % colors.length];
};

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#6200ee',
  },
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  statText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  statText1: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    alignSelf: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: 'center', // Центрируем график
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StatsScreen;

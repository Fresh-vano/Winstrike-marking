// screens/AddDetailScreen.js
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, Button, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { addDetail } from '../api/details'; // Создадим API вызов для добавления детали
import Toast from 'react-native-toast-message';

const AddDetailScreen = ({ navigation }) => {
  const [partNumber, setPartNumber] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [name, setName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [stationBlock, setStationBlock] = useState('');

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
      color: '#333333',
      textAlign: 'center',
    },
    input: {
      height: 40,
      borderWidth: 1,
      padding: 10,
      marginVertical: 10,
    },
    buttonContainer: {
      marginTop: 20,
    },
  });

  const handleSave = async () => {
    try {
      // Вызов API для добавления новой детали
      await addDetail({
        part_number: partNumber,
        order_number: parseInt(orderNumber),
        name: name,
        order_id: orderId,
        station_block: stationBlock,
      }).then(res => {
          setPartNumber('');
          setOrderNumber('');
          setName('');
          setOrderId('');
          setStationBlock('');
      });
      Toast.show({
        type: 'success',
        text1: 'Деталь успешно добавлена'
      });
    } catch (err) {
        Toast.show({
            type: 'error',
            text1: 'Не удалось сохранить данные. Попробуйте снова.'
          });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Добавить новую деталь</Text>
        <TextInput
          placeholder="Введите артикул"
          value={partNumber}
          onChangeText={setPartNumber}
          style={styles.input}
        />
        <TextInput
          placeholder="Введите порядковый номер"
          value={orderNumber}
          onChangeText={setOrderNumber}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Введите название"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Введите номер заказа"
          value={orderId}
          onChangeText={setOrderId}
          style={styles.input}
        />
        <TextInput
          placeholder="Введите станцию и блок"
          value={stationBlock}
          onChangeText={setStationBlock}
          style={styles.input}
        />
        <View style={styles.buttonContainer}>
          <Button title="Сохранить" onPress={handleSave} />
        </View>
      </Card>
    </ScrollView>
  );
};

export default AddDetailScreen;

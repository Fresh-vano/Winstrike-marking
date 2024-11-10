// screens/HistoryDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, Button, Modal, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { fetchHistoryDetail, updateRecognition  } from '../api/history';
import { toast } from 'react-toastify';

const HistoryDetailScreen = ({ route }) => {
    const { id } = route.params;
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [correctPartNumber, setCorrectPartNumber] = useState('');
    const [correctOrderNumber, setCorrectOrderNumber] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [updating, setUpdating] = useState(false);

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
      color: '#333333',
      textAlign: 'center',
      marginVertical: 10,
    },
    image: {
        width: '100%',           
        height: 300,          
        borderRadius: 8,
        marginBottom: 10,
        resizeMode: 'contain',   
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
      color: !loading && detail.is_correct ? 'green' : 'red',
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
    correctionContainer: {
        marginTop: 20,
    },
    input1: {
        height: 40,
        // marginTop: 10,
        borderWidth: 1,
        padding: 10,
    },
    input2: {
        height: 40,
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        padding: 10,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalImage: {
        width: '90%',
        height: '90%',
        resizeMode: 'contain',
      },
      closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        padding: 10,
        borderRadius: 20,
        color:'white'
      },
  });

  const getDetail = async () => {
    try {
      const data = await fetchHistoryDetail(id);
      setDetail(data);
      if (!data.is_correct) {
        setCorrectPartNumber(data.correct_part_number || '');
        setCorrectOrderNumber(data.correct_order_number ? data.correct_order_number.toString() : '');
      }
    } catch (err) {
      setError(err);
      toast.error('Не удалось загрузить детали анализа. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDetail();
  }, [id]);

  const saveCorrectValues = async () => {
    setUpdating(true); // начинаем процесс обновления
    try {
      await updateRecognition(id, {
        correct_part_number: correctPartNumber,
        correct_order_number: correctOrderNumber,
      });
      toast.success('Данные успешно обновлены');
      await getDetail(); // обновляем детали после сохранения
    } catch (error) {
      toast.error('Не удалось сохранить данные. Попробуйте снова.');
    } finally {
      setUpdating(false); // завершаем процесс обновления
    }
  };

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

  const openModal = (imageUri) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        {detail.recognized_image_path ? (
            <>
                <Text style={styles.title}>Распознанная фотография</Text>
                <TouchableOpacity onPress={() => openModal(`${REACT_APP_API_URL}/photo?path=${detail.recognized_image_path}`)}>
                    <Image source={{ uri: `${REACT_APP_API_URL}/photo?path=${detail.recognized_image_path}` }} style={styles.image} />
                </TouchableOpacity>
            </>
        ) : <></>}

        <Text style={styles.title}>Исходная фотография</Text>
        <TouchableOpacity onPress={() => openModal(`${REACT_APP_API_URL}/photo?path=${detail.image_path}`)}>
          <Image source={{ uri: `${REACT_APP_API_URL}/photo?path=${detail.image_path}` }} style={styles.image} />
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.date}>Дата: {new Date(detail.created_at).toLocaleString()}</Text>
          <Text style={styles.result}>
            {detail.is_correct ? 'Распознавание успешно' : 'Распознавание ошибочно'}
          </Text>
          <Text style={styles.correctText}>Время распознавания: {detail.recognition_duration?.toFixed(3)} сек.</Text>
          <Text style={styles.correctText}>Распознаный артикул: {detail.recognized_part_number}</Text>
          <Text style={styles.correctText}>Распознаный порядковый номер: {detail.recognized_order_number}</Text>
          {!detail.is_correct && (
            <>
              <Text style={styles.correctText}>Верный артикул: {detail.correct_part_number || "не указан"}</Text>
              <Text style={styles.correctText}>Верный порядковый номер: {detail.correct_order_number || "не указан"}</Text>
            </>
          )}
        </View>

        {!detail.is_correct && !detail.correct_part_number && !detail.correct_order_number && (
          <View style={styles.correctionContainer}>
            <TextInput
              placeholder="Введите верный артикул"
              mode="outlined"
              value={correctPartNumber}
              onChangeText={setCorrectPartNumber}
              style={styles.input1}
            />
            <TextInput
              placeholder="Введите верный порядковый номер"
              mode="outlined"
              value={correctOrderNumber}
              onChangeText={setCorrectOrderNumber}
              style={styles.input2}
            />
            <Button title="Сохранить" onPress={saveCorrectValues} style={styles.saveButton}/>
          </View>
        )}

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

      {updating && <ActivityIndicator size="small" color="#6200ee" />}

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <Image source={{ uri: selectedImage }} style={styles.modalImage} />
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default HistoryDetailScreen;
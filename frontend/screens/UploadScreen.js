// screens/UploadScreen.js
import React, { useState } from 'react';
import { View, Image, StyleSheet, Alert, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { Button, Text, IconButton, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

const screenWidth = Dimensions.get('window').width;

const UploadScreen = () => {
  const [images, setImages] = useState([]);
  const theme = useTheme();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Разрешение требуется', 'Мы нуждаемся в доступе к вашей галерее.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImages((prevImages) => [...prevImages, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Разрешение требуется', 'Мы нуждаемся в доступе к вашей камере.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImages((prevImages) => [...prevImages, result.assets[0].uri]);
    }
  };

  const deleteImage = (uri) => {
    setImages((prevImages) => prevImages.filter((image) => image !== uri));
  };

  const sendForProcessing = () => {
    if (images.length === 0) {
      Alert.alert('Нет изображений', 'Пожалуйста, загрузите или сфотографируйте деталь.');
      return;
    }
    Alert.alert('Отправлено', 'Изображения отправлены на обработку.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Загрузите или сфотографируйте деталь</Text>
      <View style={styles.imageList}>
        {images.map((item) => (
            <View key={item} style={styles.imageWrapper}>
            <Image source={{ uri: item }} style={styles.thumbnail} />
            <IconButton
                icon="close-circle"
                size={20}
                color={theme.colors.error}
                onPress={() => deleteImage(item)}
                style={styles.deleteIcon}
            />
            </View>
        ))}
      </View>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="image"
          onPress={pickImage}
          style={[styles.button, { backgroundColor: '#6CACE4' }]}
          labelStyle={styles.buttonText}
        >
          Выбрать из галереи
        </Button>
        <Button
          mode="contained"
          icon="camera"
          onPress={takePhoto}
          style={[styles.button, { backgroundColor: '#6CACE4' }]}
          labelStyle={styles.buttonText}
        >
          Сделать фото
        </Button>
      </View>
      <Button
        mode="contained"
        onPress={sendForProcessing}
        disabled={images.length === 0}
        style={[styles.sendButton, { backgroundColor: images.length > 0 ? theme.colors.primary : '#ccc' }]}
        labelStyle={styles.buttonText}
      >
        Отправить на обработку
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '5%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 10,
    minHeight: 100, // Задает минимальную высоту блока
  alignItems: 'center', // Центрирует содержимое по вертикали
  },
  imageWrapper: {
    position: 'relative',
    marginHorizontal: 5,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  deleteIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  buttonContainer: {
    flexDirection: screenWidth < 600 ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    flexGrow: 1,
    marginHorizontal: 10,
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 15,
    width: screenWidth < 600 ? '80%' : 'auto',
    marginBottom: screenWidth < 600 ? 10 : 0,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  sendButton: {
    width: '80%',
    paddingVertical: 8,
    borderRadius: 25,
  },
});

export default UploadScreen;

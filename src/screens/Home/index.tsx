import { useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';

import { api } from '../../services/api';

import { styles } from './styles';

import { Tip } from '../../components/Tip';
import { Item, ItemProps } from '../../components/Item';
import { Button } from '../../components/Button';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Loading } from '../../components/Loading';

export function Home() {
  const [selectedImageUri, setSelectedImageUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<ItemProps[]>([])

  async function handleSelectImage() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if(status !== ImagePicker.PermissionStatus.GRANTED) {
        return Alert.alert("É necessário conceder permissão para acessar seu álbum");
      }

      setIsLoading(true);

      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4,4],
        quality: 1
      });

      if(response.canceled) {
        return setIsLoading(false);
      }

      if(!response.canceled) {
        const imgManupulated = await ImageManipulator.manipulateAsync(
          response.assets[0].uri,
          [{ resize: {width: 900 } }],
          {
            compress: 1,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true
          }
        )

        setSelectedImageUri(imgManupulated.uri)
        foodDetect(imgManupulated.base64)

      }

    } catch(error) {
      console.log(error)
    }
   }

  async function foodDetect(imageBase64: string | undefined) {

    const requestBody = {
      "inputs": [
        {
          "data": {
            "image": {
              "base64": imageBase64
            }
          }
        }
      ],
      "user_app_id": {
        "user_id": process.env.EXPO_PUBLIC_API_USER_ID,
        "app_id": process.env.EXPO_PUBLIC_API_APP_ID,
      }
    };

     const response = await fetch("https://api.clarifai.com/v2/models/general-image-recognition/versions/aa7f35c01e0642fda5cf400f543e7c40/outputs", {
      method: 'POST',
      headers: {
          'Authorization': 'Key ' + '9e2cf934dda74f459bb9c6c3bc029799'
      },
      body: JSON.stringify(requestBody),
      })

      if(response.ok ) {
        const results = await response.json();

        const photo = results.outputs[0].data.concepts.map((concept: any ) => {
          return {
            name: concept.name,
            percentage: `${Math.round(concept.value * 100)}%`
          }
        })

        setItems(photo)
        console.log(photo)
        setIsLoading(false)
      } else {
         console.log('Request failed with status: ' + response.status);
      }
  }
  

  return (
    <View style={styles.container}>
      <Button onPress={handleSelectImage} disabled={isLoading} />

      {
        selectedImageUri ?
          <Image
            source={{ uri: selectedImageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          :
          <Text style={styles.description}>
            Selecione a foto para analizar.
          </Text>
      }

      <View style={styles.bottom}>
       { 
        isLoading ? <Loading /> : 
       <>
        <Tip message="Resultados:" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 24 }}>
          <View style={styles.items}>
            
          {
            items.map((item) => (
              <Item  key={item.name} data={item} />
            ))
          }
        
          </View>
        </ScrollView>
        </>
        }
      </View>
    </View>
  );
}
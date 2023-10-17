import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { styles } from './styles';

type Props = {
  message: string;
}

export function Tip({ message }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        {message}
      </Text>
    </View>
  );
}
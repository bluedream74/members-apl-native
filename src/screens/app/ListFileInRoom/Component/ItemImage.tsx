import {colors} from '@stylesCommon';
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import FastImage from 'react-native-fast-image';

const width_screen = Dimensions.get('window').width;

const ItemImage = React.memo((props: any) => {
  const {item} = props;
  const [loading, setLoading] = useState<any>(null);

  const onLoadStart = useCallback(() => {
    setLoading(true);
  }, []);

  const onLoad = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      <FastImage
        style={styles.image}
        source={{
          uri: item?.source,
          priority: FastImage.priority.high,
        }}
        resizeMode="cover"
        onLoadStart={() => onLoadStart()}
        onLoad={() => onLoad()}
      />
      {loading ? (
        <View style={styles.viewLoading}>
          <ActivityIndicator color={colors.primary} size="small" />
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: width_screen / 5 - 3,
    height: width_screen / 5 - 3,
    margin: 1,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width_screen / 5 - 3,
    height: width_screen / 5 - 3,
  },
  viewLoading: {
    flex: 1,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export {ItemImage};

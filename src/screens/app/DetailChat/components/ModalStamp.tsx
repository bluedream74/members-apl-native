import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {verticalScale, moderateScale, scale} from 'react-native-size-matters';
import {chatStamp2, chatStamp3, chatStamp4} from '@images';

const ModalStamp = React.memo((props: any) => {
  const {onChose} = props;
  //Các image Stamp được đánh tên và trọng số trùng với id VD: chatStamp2 => tương ứng với id là 2
  const Data = [
    {
      id: 2,
      url: chatStamp2,
    },
    {
      id: 3,
      url: chatStamp3,
    },
    {
      id: 4,
      url: chatStamp4,
    },
  ];

  return (
    <>
      <View style={styles.container}>
        {Data.map((item: any) => {
          return (
            <TouchableOpacity
              key={item?.id}
              onPress={() => {
                onChose(item?.id);
              }}>
              <Image source={item?.url} style={styles.image} />
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: Dimensions.get('window').width,
    backgroundColor: '#FFFFFF',
    paddingVertical: verticalScale(4),
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
  },
  image: {
    width: moderateScale(80),
    height: moderateScale(80),
  },
});

export {ModalStamp};

import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {verticalScale, scale, moderateScale} from 'react-native-size-matters';
import {useSelector} from 'react-redux';
import {colors, stylesCommon} from '@stylesCommon';
import FastImage from 'react-native-fast-image';
import {defaultAvatar} from '@images';

const width = Dimensions.get('window').width;

const ModalTagName = React.memo((props: any) => {
  const {choseUser} = props;
  const [dataLocal, setDataLocal] = useState<any[]>([]);
  const listUserChat = useSelector((state: any) => state.chat?.listUserChat);

  useEffect(() => {
    const dataAddAll = [
      {
        id: 'All',
        last_name: '@all このグループ全員に',
        first_name: '通知が送信されます',
        value: 'all',
      },
      ...(listUserChat ?? []).map((item: any) => {
        return {
          ...item,
          nameUser: `${item?.last_name}${item?.first_name}`,
        };
      }),
    ];
    setDataLocal(dataAddAll);
  }, [listUserChat]);

  const onChoseUser = (item: any) => {
    if (item?.id === 'All') {
      const valueName = `${item?.value}`;
      const id = item?.id;
      choseUser(valueName?.replace(' ', ''), ' ', id, item);
    } else {
      const valueName = `${item?.last_name}${item?.first_name}`;
      const id = item?.id;
      choseUser(valueName?.replace(' ', ''), 'さん', id, item);
    }
  };

  const renderItem = ({item}: any) => (
    <TouchableOpacity style={styles.viewItem} onPress={() => onChoseUser(item)}>
      <>
        {item?.id === 'All' ? (
          <>
            <FastImage source={defaultAvatar} style={styles.imageIconTag} />
            <Text style={styles.txtTitle} numberOfLines={2}>
              <Text style={styles.txtTitle} numberOfLines={2}>
                {item?.last_name}
                {item?.first_name}
              </Text>
            </Text>
          </>
        ) : (
          <>
            <FastImage
              source={
                item?.icon_image
                  ? {
                      uri: item?.icon_image,
                      priority: FastImage.priority.high,
                      cache: FastImage.cacheControl.immutable,
                    }
                  : defaultAvatar
              }
              style={styles.image}
            />
            {item?.id < 0 ? (
              <Text style={styles.txtTitle} numberOfLines={2}>
                {item?.name}
              </Text>
            ) : (
              <Text style={styles.txtTitle} numberOfLines={2}>
                {item?.last_name}
                {item?.first_name}
              </Text>
            )}
          </>
        )}
      </>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dataLocal}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: width,
    maxHeight: verticalScale(200),
    backgroundColor: '#FFFFFF',
    paddingBottom: verticalScale(8),
  },
  viewLoading: {
    width: '100%',
    alignItems: 'center',
    paddingTop: verticalScale(8),
  },
  viewItem: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    marginTop: verticalScale(8),
    alignItems: 'center',
  },
  image: {
    width: moderateScale(35),
    height: moderateScale(35),
    borderRadius: moderateScale(35 / 2),
  },
  imageIconTag: {
    width: moderateScale(35),
    height: moderateScale(35),
  },
  txtTitle: {
    ...stylesCommon.fontWeight500,
    fontSize: moderateScale(13),
    marginTop: verticalScale(5),
    color: colors.backgroundTab,
    marginLeft: scale(5),
    maxWidth: '90%',
  },
});

export {ModalTagName};

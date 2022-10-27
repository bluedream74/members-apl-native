import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {verticalScale, scale, moderateScale} from 'react-native-size-matters';
import {getListUser} from '@services';
import {colors, stylesCommon} from '@stylesCommon';
import FastImage from 'react-native-fast-image';
import {defaultAvatar} from '@images';

const width = Dimensions.get('window').width;

const ModalTagName = React.memo((props: any) => {
  const {idRoomChat, choseUser} = props;
  const [listUser, setListUser] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getListUserApi();
  }, []);

  const getListUserApi = async () => {
    try {
      const result = await getListUser({room_id: idRoomChat, all: true});
      const guest = result?.data?.guests?.map((item: any) => {
        return {
          ...item,
          id: Number(item?.id) * -1,
        };
      });
      setListUser(result?.data?.users?.data?.concat(guest));
      setLoading(false);
    } catch {
      (error: any) => {
        setLoading(false);
      };
    }
  };

  const onChoseUser = (item: any) => {
    const valueName =
      item?.id < 0 ? `${item?.name}` : `${item?.last_name}${item?.first_name}`;
    const id = item?.id;
    choseUser(valueName?.replace(' ', ''), id, item);
  };

  const renderItem = ({item}: any) => (
    <TouchableOpacity style={styles.viewItem} onPress={() => onChoseUser(item)}>
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
          {item?.first_name}
          {item?.last_name}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading === true ? (
        <View style={styles.viewLoading}>
          <ActivityIndicator size="small" color={colors.darkGrayText} />
        </View>
      ) : (
        <FlatList
          data={listUser}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}
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
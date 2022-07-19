import React, {useCallback, useEffect, useState} from 'react';
import {TouchableOpacity, StyleSheet, View, Image, Text} from 'react-native';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import {colors, stylesCommon} from '@stylesCommon';
import {
  iconNext,
  defaultAvatar,
  iconPin,
  iconFile,
  iconPdf,
  iconDoc,
  iconXls,
} from '@images';
import {useNavigation} from '@react-navigation/native';
import {ROUTE_NAME} from '@routeName';
import FastImage from 'react-native-fast-image';
import {convertString, HITSLOP} from '@util';
import {pinFlag, GlobalService} from '@services';

import {saveIdRoomChat, getRoomList} from '@redux';
import {showMessage} from 'react-native-flash-message';
import {useSelector, useDispatch} from 'react-redux';

const Item = React.memo((props: any) => {
  const idCompany = useSelector((state: any) => state.chat.idCompany);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const {item, index} = props;
  const [pin, setStatusPin] = useState<any>(null);

  useEffect(() => {
    if (item?.pin_flag) {
      setStatusPin(Number(item?.pin_flag));
    }
  }, [item?.pin_flag]);

  const navigateDetail = async () => {
    await dispatch(saveIdRoomChat(item?.id));
    navigation.navigate(ROUTE_NAME.DETAIL_CHAT, {
      idRoomChat: item?.id,
      idMessageSearchListChat: null,
    });
  };

  const renderImgaeFile = useCallback((typeFile: any) => {
    switch (typeFile) {
      case '2':
        return iconPdf;
      case '5':
        return iconDoc;
      case '3':
        return iconXls;
      default:
        return iconFile;
    }
  }, []);

  const onGhimRoomChat = async () => {
    try {
      GlobalService.showLoading();
      const response = await pinFlag(item?.id, pin == 0 ? 1 : 0);
      showMessage({
        message: response?.data?.message,
        type: 'success',
      });
      await dispatch(getRoomList({key: '', company_id: idCompany, page: 1}));
    } catch {
      GlobalService.hideLoading();
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={navigateDetail}>
      <View style={styles.viewContent}>
        <View style={styles.viewImage}>
          {item?.one_one_check?.length > 0 ? (
            <View style={styles.image}>
              <FastImage
                style={styles.image}
                source={
                  item?.one_one_check?.length > 0 &&
                  item?.one_one_check[0]?.icon_image
                    ? {
                        uri: item?.one_one_check[0]?.icon_image,
                        priority: FastImage.priority.high,
                        cache: FastImage.cacheControl.immutable,
                      }
                    : defaultAvatar
                }
              />
              {item?.online_status === true ? (
                <View style={styles.viewActive}>
                  <View style={styles.active} />
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.image}>
              <FastImage
                style={styles.image}
                source={
                  item?.icon_image
                    ? {
                        uri: item?.icon_image,
                        priority: FastImage.priority.high,
                        cache: FastImage.cacheControl.immutable,
                      }
                    : defaultAvatar
                }
              />
              {item?.online_status === true ? (
                <View style={styles.viewActive}>
                  <View style={styles.active} />
                </View>
              ) : null}
            </View>
          )}
        </View>
        <View style={styles.viewTxt}>
          <>
            <Text style={styles.txtContent} numberOfLines={1}>
              {item?.name && item?.name?.length > 0
                ? item?.name
                : `${item?.one_one_check[0]?.last_name} ${item?.one_one_check[0]?.first_name}`}
            </Text>
            {item?.lastMessageJoin?.attachment_files?.length > 0 ? (
              <View style={styles.viewRow}>
                {item?.lastMessageJoin?.attachment_files?.map((item: any) => (
                  <View key={item?.id}>
                    {item?.type == 4 ? (
                      <FastImage
                        source={{
                          uri: item?.path,
                          priority: FastImage.priority.high,
                          cache: FastImage.cacheControl.immutable,
                        }}
                        style={styles.imageSmall}
                      />
                    ) : (
                      <Image
                        source={renderImgaeFile(item?.type)}
                        style={styles.imageFile}
                      />
                    )}
                  </View>
                ))}
              </View>
            ) : null}
            {item?.lastMessageJoin?.message &&
            item?.lastMessageJoin?.message !== 'null' ? (
              <Text style={styles.txtTitle} numberOfLines={2}>
                {item?.lastMessageJoin?.msg_type == 9
                  ? `${item?.lastMessageJoin?.guest?.name}さんが参加しました`
                  : convertString(
                      item?.lastMessageJoin?.message?.split('<br>').join('\n'),
                    )}
              </Text>
            ) : null}
          </>
        </View>
        <View style={styles.viewImageNext}>
          <TouchableOpacity hitSlop={HITSLOP} onPress={onGhimRoomChat}>
            <Image
              source={iconPin}
              style={{tintColor: pin == 1 ? '#EA5A31' : colors.border}}
            />
          </TouchableOpacity>
          <Image source={iconNext} />
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingLeft: scale(10),
    paddingRight: scale(8),
  },
  viewContent: {
    paddingBottom: verticalScale(12),
    flexDirection: 'row',
  },
  linearGradient: {
    width: '100%',
    height: 1,
  },
  viewImage: {
    width: '20%',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  viewTxt: {
    width: '65%',
    justifyContent: 'center',
    paddingRight: scale(10),
  },
  viewImageNext: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  txtTitle: {
    ...stylesCommon.fontWeight500,
    fontSize: moderateScale(12),
    color: colors.border,
    marginTop: scale(5),
  },
  txtContent: {
    ...stylesCommon.fontWeight600,
    fontSize: moderateScale(14),
    marginTop: verticalScale(3),
    color: colors.backgroundTab,
  },
  txtContentLogout: {
    color: '#EA5A31',
    ...stylesCommon.fontWeight500,
    fontSize: moderateScale(16),
  },
  image: {
    width: moderateScale(51),
    height: moderateScale(51),
    borderRadius: moderateScale(51) / 2,
  },
  viewActive: {
    width: moderateScale(14),
    height: moderateScale(14),
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(14 / 2),
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  active: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(12 / 2),
    backgroundColor: colors.active,
  },
  viewRow: {
    flexDirection: 'row',
    marginTop: verticalScale(10),
  },
  imageSmall: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(4),
    marginHorizontal: moderateScale(2),
  },
  imageFile: {
    width: moderateScale(25),
    height: moderateScale(25),
  },
});

export {Item};

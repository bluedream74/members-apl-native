import {colors, stylesCommon} from '@stylesCommon';
import React, {useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {
  like,
  happy,
  heart,
  great,
  smile,
  sad,
  menuCopy,
  menuDelete,
  menuEdit,
  menuPinChat,
  menuReply,
  icon1,
  icon2,
  icon3,
  icon4,
  icon5,
  icon6,
  iconBookmark,
  iconPin,
} from '@images';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';
import {useSelector} from 'react-redux';

const MenuFeature = React.memo((props: any) => {
  const {onActionMenu, onActionReaction, userId, msg_type} = props;
  const user_id = useSelector((state: any) => state.auth.userInfo.id);
  const dataFeature = [
    {
      id: 7,
      sourceImage: menuCopy,
      name: 'コピー',
      style: {
        width: scale(18),
        height: scale(22),
      },
      isShow: msg_type == 1 ? false : true,
    },
    {
      id: 8,
      sourceImage: menuEdit,
      name: '編集',
      style: {
        width: scale(22),
        height: scale(22),
      },
      isShow:
        userId == user_id && msg_type !== 1 && msg_type !== 2 ? true : false,
    },
    {
      id: 9,
      sourceImage: menuReply,
      name: '返信',
      style: {
        width: scale(22),
        height: scale(22),
      },
      isShow: true,
    },
    {
      id: 12,
      sourceImage: menuPinChat,
      name: 'ブックマーク',
      style: {
        width: scale(21),
        height: scale(21),
        tintColor: '#FFFFFF',
      },
      isShow: true,
    },
    {
      id: 11,
      sourceImage: menuDelete,
      name: '削除',
      style: {
        width: scale(22),
        height: scale(22),
      },
      isShow: userId == user_id ? true : false,
    },
    {
      id: 10,
      sourceImage: iconPin,
      name: 'ピン留め',
      style: {
        width: scale(22),
        height: scale(22),
        tintColor: '#FFFFFF',
      },
      isShow: msg_type !== 1 ? true : false,
    },
  ];

  const dataEmoji = [
    {
      id: 1,
      sourceImage: icon1,
      style: {
        width: scale(25),
        height: scale(22),
      },
    },
    {
      id: 2,
      sourceImage: icon2,
    },
    {
      id: 3,
      sourceImage: icon3,
    },
    {
      id: 4,
      sourceImage: icon4,
    },
    {
      id: 5,
      sourceImage: icon5,
    },
    {
      id: 6,
      sourceImage: icon6,
      style: {
        width: scale(22),
        height: scale(25),
      },
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.viewFeature}>
        {dataFeature.map((item: any, index: any) => {
          return (
            <View key={item?.id}>
              {item?.isShow === true ? (
                <TouchableOpacity
                  style={styles.itemFeature}
                  onPress={() => onActionMenu(item?.id)}>
                  <Image
                    source={item?.sourceImage}
                    style={item?.style ? item?.style : styles.imageFeature}
                  />
                  <Text style={styles.txtNameFeature} numberOfLines={1}>
                    {item?.name}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })}
      </View>
      <View style={styles.line} />
      <View style={styles.viewFeature}>
        {dataEmoji.map((item: any, index: any) => {
          return (
            <View key={item?.id}>
              <TouchableOpacity
                style={styles.itemFeature}
                key={item?.id}
                onPress={() => onActionReaction(item?.id)}>
                <Image
                  source={item?.sourceImage}
                  style={item?.style ? item?.style : styles.imageEmoji}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(13),
    backgroundColor: colors.backgroundTab,
    borderRadius: moderateScale(8),
  },
  viewFeature: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageFeature: {
    tintColor: '#FFFFFF',
    width: scale(20),
    height: scale(20),
  },
  itemFeature: {
    marginHorizontal: scale(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtNameFeature: {
    marginTop: verticalScale(5),
    color: '#FFFFFF',
    ...stylesCommon.fontWeight500,
    fontSize: verticalScale(12),
  },
  line: {
    height: verticalScale(1),
    backgroundColor: '#FFFFFF',
    marginVertical: verticalScale(8),
  },
  imageEmoji: {
    width: scale(25),
    height: scale(25),
  },
});

export {MenuFeature};

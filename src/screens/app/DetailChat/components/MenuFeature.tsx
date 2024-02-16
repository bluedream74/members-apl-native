import {colors, stylesCommon} from '@stylesCommon';
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {
  menuCopy,
  menuPartCopy,
  menuDelete,
  menuEdit,
  menuPinChat,
  menuReply,
  icon1,
  icon2,
  icon3,
  icon4,
  icon6,
  understand,
  bow,
  congrats,
  iconPin,
  iconQuote,
} from '@images';
import {verticalScale, moderateScale} from 'react-native-size-matters';
import {useSelector} from 'react-redux';

const MenuFeature = React.memo((props: any) => {
  const {onActionMenu, onActionReaction, userId, msgType} = props;
  const user_id = useSelector((state: any) => state.auth.userInfo.id);
  const dataFeature = [
    {
      id: 7,
      sourceImage: menuCopy,
      name: 'コピー',
      style: {
        width: 14,
        height: 18,
      },
      isShow: msgType === 1 ? false : true,
    },
    {
      id: 14,
      sourceImage: menuPartCopy,
      name: '部分コピー',
      style: {
        width: 14,
        height: 18,
      },
      isShow: msgType === 0 ? true : false,
    },
    {
      id: 8,
      sourceImage: menuEdit,
      name: '編集',
      style: {
        width: 18,
        height: 18,
      },
      isShow: userId === user_id && msgType !== 1 && msgType !== 2 ? true : false,
    },
    {
      id: 9,
      sourceImage: menuReply,
      name: '返信',
      style: {
        width: 18,
        height: 18,
      },
      isShow: true,
    },
    {
      id: 12,
      sourceImage: menuPinChat,
      name: 'ブックマーク',
      style: {
        width: 17,
        height: 17,
        tintColor: '#FFFFFF',
      },
      isShow: true,
    },
    {
      id: 11,
      sourceImage: menuDelete,
      name: '削除',
      style: {
        width: 18,
        height: 18,
      },
      isShow: userId === user_id ? true : false,
    },
    {
      id: 10,
      sourceImage: iconPin,
      name: 'ピン留め',
      style: {
        width: 18,
        height: 18,
        tintColor: '#FFFFFF',
      },
      isShow: msgType !== 1 ? true : false,
    },
    {
      id: 13,
      sourceImage: iconQuote,
      name: '引用',
      style: {
        width: 18,
        height: 18,
        tintColor: '#FFFFFF',
      },
      isShow: true,
    },
  ];

  const dataEmoji = [
    {
      id: 1,
      sourceImage: icon1,
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
      id: 6,
      sourceImage: icon6,
    },
    {
      id: 7,
      sourceImage: understand,
    },
    {
      id: 8,
      sourceImage: bow,
    },
    {
      id: 9,
      sourceImage: congrats,
    },
  ];

  const showDataFeature = dataFeature.filter(
    (item: any) => item?.isShow === true,
  );

  return (
    <View style={styles.container}>
      <View style={[styles.viewFeature, {marginBottom: 10}]}>
        {showDataFeature
          .slice(0, showDataFeature.length / 2 + (showDataFeature.length % 2))
          .map((item: any) => {
            return (
              <View key={item?.id}>
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
              </View>
            );
          })}
      </View>
      <View style={styles.viewFeature}>
        {showDataFeature
          .slice(
            showDataFeature.length / 2 + (showDataFeature.length % 2),
            showDataFeature.length,
          )
          .map((item: any) => {
            return (
              <View key={item?.id}>
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
              </View>
            );
          })}
      </View>
      <View style={styles.line} />
      <View style={styles.viewFeature}>
        {dataEmoji.map((item: any) => {
          return (
            <View key={item?.id}>
              <TouchableOpacity
                style={styles.reactionFeature}
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
    paddingHorizontal: 13,
    backgroundColor: colors.backgroundTab,
    borderRadius: moderateScale(8),
  },
  viewFeature: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  imageFeature: {
    tintColor: '#FFFFFF',
    width: 20,
    height: 20,
  },
  itemFeature: {
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
  },
  reactionFeature: {
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtNameFeature: {
    marginTop: verticalScale(5),
    color: '#FFFFFF',
    ...stylesCommon.fontWeight500,
    fontSize: verticalScale(8),
  },
  line: {
    height: verticalScale(1),
    backgroundColor: '#FFFFFF',
    marginVertical: verticalScale(8),
  },
  imageEmoji: {
    width: 24,
    height: 24,
    marginRight: 2,
  },
});

export {MenuFeature};

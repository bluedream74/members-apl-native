import React from 'react';
import {TouchableOpacity, StyleSheet, View, Image, Text} from 'react-native';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import {colors, stylesCommon} from '@stylesCommon';
import {iconRemove, defaultAvatar, iconPin} from '@images';
import {useNavigation} from '@react-navigation/native';
import {ROUTE_NAME} from '@routeName';

const Item = React.memo((props: any) => {
  const navigation = useNavigation<any>();
  const {item, deleteUser} = props;

  return (
    <View style={styles.container}>
      <View style={styles.viewContent}>
        <View style={styles.viewImage}>
          <View style={styles.image}>
            <Image
              source={
                item?.icon_image ? {uri: item?.icon_image} : defaultAvatar
              }
              style={styles.image}
            />
            {item?.login_status === 1 && (
              <View style={styles.viewActive}>
                <View style={styles.active} />
              </View>
            )}
          </View>
        </View>
        <View style={styles.viewTxt}>
          <>
            {item?.id < 0 ? null : (
              <Text style={styles.txtContent} numberOfLines={1}>
                {item?.mail}
              </Text>
            )}
            {item?.id < 0 ? (
              <Text style={styles.txtTitle} numberOfLines={2}>
                {item?.name}
              </Text>
            ) : (
              <Text style={styles.txtTitle} numberOfLines={2}>
                {item?.last_name} {item?.first_name}
              </Text>
            )}
          </>
        </View>
        <TouchableOpacity
          onPress={() => {
            deleteUser(item);
          }}
          style={[
            styles.viewImageNext,
            {
              justifyContent:
                item?.pin_flag == 1 ? 'space-between' : 'flex-end',
            },
          ]}>
          {item?.pin_flag == 1 && <Image source={iconPin} />}
          <Image source={iconRemove} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: verticalScale(14),
  },
  viewContent: {
    flexDirection: 'row',
  },
  linearGradient: {
    width: '100%',
    height: 1,
  },
  viewImage: {
    width: '23%',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  viewTxt: {
    width: '62%',
    justifyContent: 'center',
  },
  viewImageNext: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  txtContent: {
    ...stylesCommon.fontWeight500,
    fontSize: moderateScale(12),
    color: colors.border,
  },
  txtTitle: {
    ...stylesCommon.fontWeight500,
    fontSize: moderateScale(16),
    marginTop: verticalScale(5),
    color: colors.backgroundTab,
  },
  txtContentLogout: {
    color: '#EA5A31',
    ...stylesCommon.fontWeight600,
    fontSize: moderateScale(16),
  },
  image: {
    width: moderateScale(51),
    height: moderateScale(51),
    borderRadius: moderateScale(51 / 2),
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
});

export {Item};

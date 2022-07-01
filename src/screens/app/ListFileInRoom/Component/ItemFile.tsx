import {colors, stylesCommon} from '@stylesCommon';
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  moderateVerticalScale,
  scale,
  moderateScale,
  verticalScale,
} from 'react-native-size-matters';
import {iconListFile} from '@images';
const width_screen = Dimensions.get('window').width;

const ItemFile = React.memo((props: any) => {
  const {item} = props;

  return (
    <View style={styles.container}>
      <View style={styles.viewImage}>
        <Image source={iconListFile} />
      </View>
      <View style={styles.viewContent}>
        <Text numberOfLines={2} style={styles.txtTitle}>
          Filename.zip
        </Text>
        <Text style={styles.txtSize}>893 KB</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: width_screen,
    flexDirection: 'row',
    paddingHorizontal: scale(22),
    marginTop: verticalScale(20),
    alignItems: 'center',
  },
  viewImage: {
    width: moderateVerticalScale(70),
    height: moderateVerticalScale(70),
    borderRadius: moderateVerticalScale(70) / 2,
    backgroundColor: '#DFDFDF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  viewContent: {
    flex: 1,
  },
  txtTitle: {
    ...stylesCommon.fontWeight600,
    color: colors.darkGrayText,
    fontSize: moderateScale(16),
  },
  txtSize: {
    ...stylesCommon.fontWeight600,
    color: colors.darkGrayText,
    fontSize: moderateScale(16),
  },
});

export {ItemFile};

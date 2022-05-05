import React from 'react';
import {TouchableOpacity, StyleSheet, View, Image, Text} from 'react-native';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import {colors, stylesCommon} from '@stylesCommon';
import {iconNext} from '@images';

const ViewItem = React.memo((props: any) => {
  const {sourceImage, title, content, hideBorder, hideNext, isLogout, onClick} =
    props;
  return (
    <TouchableOpacity style={styles.container} onPress={onClick}>
      <View style={styles.viewContent}>
        <View style={styles.viewImage}>
          <Image source={sourceImage} />
        </View>
        <View style={styles.viewTxt}>
          {!isLogout ? (
            <>
              <Text style={styles.txtTitle}>{title}</Text>
              <Text style={styles.txtContent}>{content}</Text>
            </>
          ) : (
            <Text style={styles.txtContentLogout}>{content}</Text>
          )}
        </View>
        <View style={styles.viewImageNext}>
          {!hideNext && <Image source={iconNext} />}
        </View>
      </View>
      {!hideBorder && (
        <LinearGradient
          colors={colors.colorGradient}
          style={styles.linearGradient}
          start={{x: 1, y: 0}}
          end={{x: 0, y: 0}}
        />
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: scale(18),
  },
  viewContent: {
    paddingVertical: verticalScale(16),
    flexDirection: 'row',
  },
  linearGradient: {
    width: '100%',
    height: 1,
  },
  viewImage: {
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewTxt: {
    width: '65%',
    justifyContent: 'center',
  },
  viewImageNext: {
    width: '15%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  txtTitle: {
    ...stylesCommon.fontWeight500,
    fontSize: moderateScale(12),
    color: colors.border,
  },
  txtContent: {
    ...stylesCommon.fontWeight500,
    fontSize: moderateScale(16),
    marginTop: verticalScale(5),
    color: colors.backgroundTab,
  },
  txtContentLogout: {
    color: '#EA5A31',
    ...stylesCommon.fontWeight500,
    fontSize: moderateScale(16),
  },
});

export {ViewItem};

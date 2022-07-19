import React from 'react';
import {StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {defaultAvatar} from '@images';
import {moderateScale, scale} from 'react-native-size-matters';

const ViewUserSeen = React.memo((props: any) => {
  const {item, index} = props;
  return (
    <>
      {index <= 6 ? (
        <FastImage
          style={styles.container}
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
      ) : null}
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    width: moderateScale(11),
    height: moderateScale(11),
    borderRadius: moderateScale(11) / 2,
    marginHorizontal: scale(2),
  },
});

export {ViewUserSeen};

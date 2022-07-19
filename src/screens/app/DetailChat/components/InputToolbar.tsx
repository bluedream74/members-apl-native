import React from 'react';
import {Image, StyleSheet, Platform, View, Text} from 'react-native';
import {InputToolbar, Actions, Composer, Send} from 'react-native-gifted-chat';
import {iconSend, iconEmoji} from '@images';
import {isIphoneX} from 'react-native-iphone-x-helper';
import {colors} from '@stylesCommon';
import {verticalScale, scale, moderateScale} from 'react-native-size-matters';

export const renderSend = (props: any) => {
  return (
    <Send
      {...props}
      // disabled={!props.text.trim()}
      containerStyle={styles.sendBtn}>
      {props.text?.length > 0 ? (
        <Image
          source={iconSend}
          style={styles.iconStyle}
          resizeMode="contain"
        />
      ) : (
        <Image
          source={iconEmoji}
          style={styles.iconEmojiStyle}
          resizeMode="contain"
        />
      )}
    </Send>
  );
};

export const renderInputToolbar = (props: any) => {
  return (
    <>
      <InputToolbar
        {...props}
        containerStyle={styles.toolBar}
        primaryStyle={{alignItems: 'center'}}
      />
    </>
  );
};

export const renderComposer = (props: any) => (
  <Composer
    {...props}
    textInputStyle={styles.inputMessage}
    placeholder="メッセージ."
    multiline={true}
  />
);

const styles = StyleSheet.create({
  sendBtn: {
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 50,
  },
  iconStyle: {
    width: 20,
    height: 20,
    alignSelf: 'center',
    flex: 1,
  },
  toolBar: {
    backgroundColor: colors.background,
    borderTopWidth: 0,
    marginBottom: Platform.OS === 'ios' ? (isIphoneX() ? 0 : 0) : 6,
    paddingTop: 8,
  },
  inputMessage: {
    color: '#222B45',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(8),
    paddingLeft: scale(10),
    paddingTop: Platform.OS === 'ios' ? verticalScale(12) : undefined,
    marginRight: scale(10),
    minHeight: verticalScale(39),
    paddingRight: scale(43),
    borderWidth: 1,
    borderColor: '#989898',
  },
  iconEmojiStyle: {
    width: 29,
    height: 29,
    alignSelf: 'center',
    flex: 1,
  },
});

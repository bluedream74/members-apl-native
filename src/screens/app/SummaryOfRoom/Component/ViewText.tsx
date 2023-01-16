import React, {useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView, Keyboard,
  Button
} from "react-native";
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';
import {stylesCommon, colors} from '@stylesCommon';
import { addUserMessage, getSummaryOfRoom, saveSummaryOfRoom } from "@services";
import {getBottomSpace, getStatusBarHeight} from 'react-native-iphone-x-helper';
import {AppButton} from '@component';
import { ROUTE_NAME } from "@routeName";
import { useNavigation } from "@react-navigation/native";
import { showMessage } from "react-native-flash-message";

const ViewText = React.memo((props: any) => {
  const {id} = props;
  const navigation = useNavigation<any>();

  const [summary, setSummary] = useState<string>('');
  useEffect(() => {
    const params = {
      id: id,
    };
    getData(params);
  }, []);

  const getData = async (params: any) => {
    try {
      const res = await getSummaryOfRoom(params?.id);
      setSummary(res.data.summary);
    } catch {}
  };

  const [textinputheight, setTextinuptheight] = useState('80%');

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setTextinuptheight('60%');
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setTextinuptheight('80%');
      },
    );
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const saveSummary = useCallback(async () => {
    try {
      const params = {
        id: id,
        summary: summary,
      };
      const res = await saveSummaryOfRoom(params);
      if (res.data.result === 'OK') {
        showMessage({
          message: res?.data?.message,
          type: 'success',
        });
        // navigation.navigate(ROUTE_NAME.INFO_ROOM_CHAT, {idRoomChat: id});
      } else {
        showMessage({
          message: res?.data?.message,
          type: 'danger',
        });
      }

    } catch (error: any) {}
  }, [summary]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <TextInput
        style={{
          margin: 12,
          borderWidth: 1,
          padding: 10,
          height: textinputheight,
        }}
        editable
        multiline
        numberOfLines={50}
        maxLength={3000}
        onChangeText={(text: any) => {
          setSummary(text);
        }}
        value={summary}
      />
      <Button
        title="保存"
        onPress={saveSummary}
        disabled={summary?.length === 0}
      />
      <View style={{height: 60}} />
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(4),
  },
  txtEmpty: {
    textAlign: 'center',
    marginTop: verticalScale(20),
    color: colors.darkGrayText,
    ...stylesCommon.fontWeight600,
    fontSize: moderateScale(18),
  },
  viewHeaderImage: {
    width: '100%',
    marginTop: getStatusBarHeight(),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    alignItems: 'center',
  },
  iconDowload: {
    tintColor: '#FFFFFF',
    width: 25,
    height: 25,
  },
  iconClose: {
    tintColor: '#FFFFFF',
  },
  icon: {
    width: moderateScale(15),
    height: moderateScale(15),
    tintColor: colors.border,
  },
  textTitleInput: {
    color: '#595757',
    fontSize: 14,
    ...stylesCommon.fontWeight500,
    marginTop: 15,
    marginBottom: 10,
  },
  viewBottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: getBottomSpace() + 20,
    paddingHorizontal: scale(16),
    paddingTop: 10,
  },
  button: {},
});

export {ViewText};

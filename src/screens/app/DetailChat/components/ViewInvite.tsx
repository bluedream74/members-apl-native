import {colors, stylesCommon} from '@stylesCommon';
import React, {useState, useEffect, useCallback} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {moderateScale, verticalScale, scale} from 'react-native-size-matters';
import {AppButton} from '@component';
import {addUserMessage} from '@services';
import {useSelector} from 'react-redux';
import {AppSocket} from '@util';
import {showMessage} from 'react-native-flash-message';

const ViewInvite = React.memo((props: any) => {
  const {getSocket} = AppSocket;
  const socket = getSocket();
  const user_id = useSelector((state: any) => state.auth.userInfo.id);
  const {data, idRoomChat, idMessage} = props;
  const [approved_status, setApproved_status] = useState<any>(
    data?.approved_status,
  );

  const onAddUser = useCallback(async value => {
    try {
      const params = {
        approved_status: value,
        guest_user_id: data?.id,
        room_id: idRoomChat,
      };
      const res = await addUserMessage(params);
      socket.emit('message_ind', {
        user_id: user_id,
        room_id: idRoomChat * -1,
        task_id: null,
        to_info: null,
        level: null,
        message_id: null,
        message_type: 8,
        method: value == 1 ? 0 : 2,
        attachment_files: null,
        stamp_no: null,
        text: String(data?.id * -1),
        text2: null,
        time: null,
      });
      setApproved_status(value);
    } catch (error: any) {}
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.viewHeader}>
        <Text style={styles.txtTitle} numberOfLines={2}>
          チャット参加承認依頼
        </Text>
      </View>
      <View style={styles.viewContent}>
        <Text style={styles.txtTitle}>お名前</Text>
        <Text style={styles.txtContent}>{data?.name}</Text>
        {approved_status == 0 ? (
          <Text style={styles.txtTitle}>参加を承認しますか?</Text>
        ) : (
          <Text style={styles.txtTitle}>
            {approved_status == 1 ? '参加を承認しました' : '参加を拒否しました'}
          </Text>
        )}
        {approved_status === 0 ? (
          <View style={styles.viewButton}>
            <AppButton
              title="拒否"
              onPress={() => onAddUser(2)}
              styleButton={styles.buttonInactive}
            />
            <AppButton
              title="承認"
              onPress={() => onAddUser(1)}
              styleButton={styles.buttonActive}
            />
          </View>
        ) : null}
      </View>
      <View style={styles.viewBottom} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(8),
  },
  viewHeader: {
    flex: 1,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    backgroundColor: '#DDDDDD',
    borderTopLeftRadius: moderateScale(8),
    borderTopRightRadius: moderateScale(8),
  },
  txtTitle: {
    ...stylesCommon.fontWeight600,
    fontSize: moderateScale(14),
    color: colors.darkGrayText,
  },
  viewContent: {
    flex: 1,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(16),
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#DDDDDD',
  },
  viewBottom: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(13),
    backgroundColor: '#DDDDDD',
    borderBottomLeftRadius: moderateScale(8),
    borderBottomRightRadius: moderateScale(8),
    alignItems: 'center',
  },
  txtTime: {
    marginLeft: scale(7),
    color: colors.darkGrayText,
    fontSize: moderateScale(12),
  },
  txtContent: {
    color: colors.primary,
    fontSize: moderateScale(12),
    marginVertical: verticalScale(6),
  },
  viewButton: {
    flexDirection: 'row',
    marginTop: verticalScale(10),
    justifyContent: 'space-between',
  },
  buttonActive: {
    width: '48%',
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(6),
  },
  buttonInactive: {
    width: '48%',
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(6),
    backgroundColor: colors.border,
  },
});

export {ViewInvite};

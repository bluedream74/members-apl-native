import React, {useCallback, useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {styles} from './styles';
import {Header, AppInput, AppButton} from '@component';
import {iconClose} from '@images';
import {useNavigation} from '@react-navigation/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {updateInfoRoomchat, GlobalService, getListUser} from '@services';
import {AppSocket} from '@util';
import {useSelector} from 'react-redux';

const EditRoomChat = (props: any) => {
  const navigation = useNavigation<any>();
  const {route} = props;
  const {getSocket} = AppSocket;
  const socket = getSocket();
  const {idRoomChat, dataDetail, type} = route?.params;
  const user_id = useSelector((state: any) => state.auth.userInfo.id);
  const [name, setName] = useState<any>(dataDetail?.name);
  const [content, setContent] = useState<any>(dataDetail?.summary_column);
  const [listUser, setListUser] = useState([]);

  const convertDataUser = useCallback(() => {
    //@ts-ignore
    let data = [];
    if (listUser && listUser?.length > 0) {
      listUser?.map((item: any) => data.push(item?.id));
    }
    //@ts-ignore
    return data;
  }, [listUser]);

  const onBack = useCallback(() => {
    navigation.goBack();
  }, []);

  const onChangeName = useCallback(
    (value: string) => {
      setName(value);
    },
    [name],
  );

  const onChangeContent = useCallback(
    (value: string) => {
      setContent(value);
    },
    [content],
  );

  const getListUserOfRoom = async () => {
    try {
      const result = await getListUser({room_id: idRoomChat});
      setListUser(result?.data?.users?.data);
    } catch (error) {}
  };

  useEffect(() => {
    getListUserOfRoom();
  }, []);

  const renderNameRoom = () => {
    if (listUser?.length == 1) {
      return null;
    } else {
      return '新規グループ';
    }
  };

  const handleSubmit = async () => {
    try {
      const body = {
        room_id: idRoomChat,
        description: content,
        name: name ? name : renderNameRoom(),
      };
      GlobalService.showLoading();
      const response = await updateInfoRoomchat(body);
      socket.emit('ChatGroup_update_ind', {
        user_id: user_id,
        room_id: idRoomChat,
        member_info: {
          type: 5,
          ids: convertDataUser(),
        },
        method: 2,
        room_name: name ? name : renderNameRoom(),
      });
      onBack();
      GlobalService.hideLoading();
    } catch {
      GlobalService.hideLoading();
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={type === 'name' ? 'グループ名' : '概要'}
        imageCenter
        iconRightFirst={iconClose}
        onRightFirst={onBack}
      />
      <View style={styles.viewContent}>
        <View style={styles.linearGradient}>
          <KeyboardAwareScrollView
            alwaysBounceVertical={false}
            style={styles.viewForm}
            showsVerticalScrollIndicator={false}>
            {type === 'name' && (
              <>
                <Text style={styles.txtTitle}>グループ名</Text>
                <AppInput
                  placeholder="名称"
                  onChange={onChangeName}
                  value={name}
                  maxLength={150}
                />
              </>
            )}
            {type === 'content' && (
              <>
                <Text style={styles.txtTitle}>概要</Text>
                <AppInput
                  placeholder="概要"
                  onChange={onChangeContent}
                  value={content}
                  multiline={true}
                  styleContainer={styles.multiline}
                  styleInput={styles.multiline}
                />
              </>
            )}
            <AppButton
              title={type === 'name' ? 'グループ名を変更' : '概要を変更'}
              onPress={handleSubmit}
              styleButton={styles.button}
              disabled={dataDetail?.type === 4 || dataDetail?.is_admin !== 1}
            />
          </KeyboardAwareScrollView>
        </View>
      </View>
    </View>
  );
};

export {EditRoomChat};

import React, {useState, useCallback} from 'react';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';
import {styles} from './styles';
import {Header, AppInput, ModalConfirm, ModalRemoveUser} from '@component';
import {iconAddUser, iconAddListChat} from '@images';
import {Item} from './components/Item';
import {useFocusEffect} from '@react-navigation/native';
import {AppSocket} from '@util';

import {getRoomList, getDetailMessageSocketSuccess} from '@redux';
import {useDispatch, useSelector} from 'react-redux';
import {getListUser, GlobalService, removeUser} from '@services';

import {useNavigation} from '@react-navigation/native';
import {ROUTE_NAME} from '@routeName';

const ListUser = (props: any) => {
  const dispatch = useDispatch();
  const user_id = useSelector((state: any) => state.auth.userInfo.id);
  const {getSocket} = AppSocket;
  const socket = getSocket();
  const {route} = props;
  const {idRoomChat, dataDetail} = route?.params;
  const navigation = useNavigation<any>();
  const [listUser, setListUser] = useState([]);
  const [nameUser, setNameUser] = useState<any>(null);
  const [idUser, setIdUser] = useState(null);
  const [modal, setModal] = useState<boolean>(false);

  const renderItem = ({item}: any) => (
    <Item
      item={item}
      deleteUser={(value: any) => {
        setIdUser(value?.id);
        setNameUser(`${value?.last_name}${value?.first_name}`);
        onCancelModal();
      }}
    />
  );

  const deleteUser = async () => {
    try {
      GlobalService.showLoading();
      const body = {
        room_id: idRoomChat,
        user_id: idUser,
      };
      const result = await removeUser(body);
      socket.emit('message_ind', {
        user_id: user_id,
        room_id: idRoomChat,
        task_id: null,
        to_info: null,
        level: result?.data?.data?.msg_level,
        message_id: result?.data?.data?.id,
        message_type: result?.data?.data?.msg_type,
        method: result?.data?.data?.method,
        // attachment_files: res?.data?.attachmentFiles,
        stamp_no: result?.data?.data?.stamp_no,
        relation_message_id: result?.data?.data?.reply_to_message_id,
        text: result?.data?.data?.message,
        text2: null,
        time: result?.data?.data?.created_at,
      });
      socket.emit('ChatGroup_update_ind', {
        user_id: user_id,
        room_id: idRoomChat,
        member_info: {
          type: 1,
          ids: [user_id],
        },
        method: 12,
        room_name: null,
        task_id: null,
      });
      dispatch(getDetailMessageSocketSuccess([result?.data?.data]));
      getListUserOfRoom();
      GlobalService.hideLoading();
    } catch (error) {
      GlobalService.hideLoading();
    }
  };

  const onCreate = useCallback(() => {
    navigation.navigate(ROUTE_NAME.CREATE_ROOM_CHAT, {
      typeScreen: 'ADD_NEW_USER',
      idRoomchat: idRoomChat,
    });
  }, []);

  const getListUserOfRoom = async () => {
    try {
      const result = await getListUser({room_id: idRoomChat});
      setListUser(result?.data?.users?.data);
    } catch (error) {}
  };

  useFocusEffect(
    useCallback(() => {
      getListUserOfRoom();
    }, []),
  );

  const onCancelModal = useCallback(() => {
    setModal(!modal);
  }, [modal]);

  const onConfirm = useCallback(() => {
    onCancelModal();
    deleteUser();
  }, [modal, idUser]);

  return (
    <View style={styles.container}>
      <Header
        title="メンバー"
        imageCenter
        onRightFirst={onCreate}
        iconRightFirst={iconAddUser}
        back
        styleIconRightFirst={styles.colorIcon}
      />
      <View style={styles.viewContent}>
        <FlatList
          data={listUser}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <ModalRemoveUser
        visible={modal}
        onCancel={onCancelModal}
        titleHeader="グループから削除する"
        onConfirm={onConfirm}
        nameUser={nameUser}
      />
    </View>
  );
};

export {ListUser};

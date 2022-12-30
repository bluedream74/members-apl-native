import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {styles} from './styles';
import {Header, ModalConfirm, ModalLink} from '@component';
import {
  defaultAvatar,
  iconCamera,
  iconDelete,
  iconEdit,
  iconDetailRow,
  iconUser,
  iconLogout,
  iconPin,
  iconUpload,
  iconDocument,
  iconDeleteRoom,
} from '@images';
import {ViewItem} from './components/ViewItem';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {ROUTE_NAME} from '@routeName';
import {detailRoomchat, pinFlag, leaveRoomChat, GlobalService} from '@services';
import {showMessage} from 'react-native-flash-message';
import ImagePicker from 'react-native-image-crop-picker';
import {verticalScale} from 'react-native-size-matters';
import {
  updateImageRoomChat,
  deleteImageRoomChat,
  getListUser,
  deleteRoom,
} from '@services';
import {colors} from '@stylesCommon';
import FastImage from 'react-native-fast-image';
import {AppSocket} from '@util';
import {useSelector} from 'react-redux';

const InfoRoomChat = (props: any) => {
  const {route} = props;
  const {idRoomChat} = route?.params;
  const user_id = useSelector((state: any) => state.auth.userInfo.id);
  const user = useSelector((state: any) => state.auth.userInfo);
  const navigation = useNavigation<any>();
  const {getSocket} = AppSocket;
  const socket = getSocket();
  const [dataDetail, setData] = useState<any>(null);
  const [activePin, setActivePin] = useState<any>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [modalDelete, setModalDelete] = useState<boolean>(false);
  const [modalLink, setModalLink] = useState<boolean>(false);
  const [image, setImage] = useState<any>(null);
  const [listUser, setListUser] = useState([]);

  let count_user =
    dataDetail?.name?.length > 0
      ? (dataDetail?.name.match(/、/g) || []).length
      : 0;

  const convertDataUser = useCallback(() => {
    //@ts-ignore
    let data = [];
    if (listUser && listUser?.length > 0) {
      listUser?.map((item: any) => data.push(item?.id));
    }
    //@ts-ignore
    return data;
  }, [listUser]);

  const uploadImageApi = useCallback(async () => {
    try {
      const data = new FormData();
      const imageUpload = {
        uri:
          Platform.OS === 'ios'
            ? image?.path.replace('file://', '')
            : image?.path,
        type: 'image/jpeg',
        name: image?.filename ? image?.filename : image?.path,
      };
      data.append('file', imageUpload);
      data.append('room_id', idRoomChat);
      const res = await updateImageRoomChat(data);
      await showMessage({
        message: res?.data?.message,
        type: 'success',
      });
      // socket.emit('ChatGroup_update_ind', {
      //   user_id: user_id,
      //   room_id: idRoomChat,
      //   member_info: {
      //     type: 5,
      //     ids: convertDataUser(),
      //   },
      // });
      getDetail();
      setImage(null);
    } catch (error) {}
  }, [image, idRoomChat]);

  useEffect(() => {
    if (image) {
      uploadImageApi();
    }
  }, [image]);

  const getDetail = async () => {
    try {
      const response = await detailRoomchat(idRoomChat);
      setData(response?.data?.room);
    } catch {}
  };

  const onCancelModal = useCallback(() => {
    setModal(!modal);
  }, [modal]);

  const onCancelModalDelete = useCallback(() => {
    setModalDelete(!modalDelete);
  }, [modalDelete]);

  const onCancelModalLink = useCallback(() => {
    setModalLink(!modalLink);
  }, [modalLink]);

  const getListUserOfRoom = async () => {
    try {
      const result = await getListUser({room_id: idRoomChat});
      setListUser(result?.data?.users?.data);
    } catch (error) {}
  };

  useFocusEffect(
    useCallback(() => {
      getDetail();
      getListUserOfRoom();
    }, []),
  );

  useEffect(() => {
    if (dataDetail?.pin_flag == 0) {
      setActivePin(false);
    } else {
      setActivePin(true);
    }
  }, [dataDetail?.pin_flag]);

  const onGhimRoomChat = async () => {
    try {
      const response = await pinFlag(
        idRoomChat,
        dataDetail?.pin_flag == 0 ? 1 : 0,
      );
      showMessage({
        message: response?.data?.message,
        type: 'success',
      });
      getDetail();
    } catch {}
  };

  const onLeave = useCallback(async () => {
    try {
      onCancelModal();
      const body = {
        room_id: idRoomChat,
      };
      const response = await leaveRoomChat(body);
      navigation.pop(2);
    } catch {}
  }, [idRoomChat, modal]);

  const onDelete = useCallback(async () => {
    try {
      onCancelModalDelete();
      const response = await deleteRoom(idRoomChat);
      navigation.pop(2);
    } catch {}
  }, [idRoomChat, modalDelete]);

  const upLoadImage = () => {
    ImagePicker.openPicker({
      cropping: false,
      width: verticalScale(126),
      height: verticalScale(126),
    })
      .then(async (image: any) => {
        setImage(image);
      })
      .catch(err => {});
  };

  const deleteAvatar = async () => {
    try {
      GlobalService.showLoading();
      const res = await deleteImageRoomChat({
        room_id: idRoomChat,
      });
      await showMessage({
        message: res?.data?.message,
        type: 'success',
      });
      // socket.emit('ChatGroup_update_ind', {
      //   user_id: user_id,
      //   room_id: idRoomChat,
      //   member_info: {
      //     type: 5,
      //     ids: convertDataUser(),
      //   },
      // });
      getDetail();
      GlobalService.hideLoading();
    } catch (error: any) {
      GlobalService.hideLoading();
    }
  };

  const renderName = (name: any) => {
    if (count_user > 0) {
      let dataName = '';
      const dataAdd = listUser?.forEach((item: any) => {
        dataName = dataName + `${item?.last_name}${item?.first_name},`;
      });
      const nameUser = `,${user?.last_name}${user?.first_name}`;
      const name = dataName?.replace(/.$/, '') + nameUser;
      return name;
    } else {
      return name;
    }
  };

  console.log(dataDetail);

  return (
    <View style={styles.container}>
      <Header
        title={
          dataDetail?.name && dataDetail?.name?.length > 0
            ? renderName(dataDetail?.name)
            : `${
                dataDetail?.one_one_check &&
                dataDetail?.one_one_check?.length > 0
                  ? dataDetail?.one_one_check[0]?.last_name
                  : ''
              } ${
                dataDetail?.one_one_check &&
                dataDetail?.one_one_check[0]?.length > 0
                  ? dataDetail?.one_one_check[0]?.first_name
                  : ''
              }`
        }
        back
        imageCenter
      />
      <View style={styles.container}>
        {dataDetail ? (
          <ScrollView>
            <View style={styles.viewHeader}>
              <View style={styles.viewAvatar}>
                {dataDetail?.one_one_check?.length > 0 ? (
                  <>
                    {dataDetail?.one_one_check[0]?.icon_image ? (
                      <FastImage
                        source={{
                          uri: dataDetail?.one_one_check[0]?.icon_image,
                          priority: FastImage.priority.high,
                          cache: FastImage.cacheControl.immutable,
                        }}
                        style={styles.avatar}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image source={defaultAvatar} style={styles.avatar} />
                    )}
                  </>
                ) : (
                  <>
                    {dataDetail?.icon_image ? (
                      <FastImage
                        source={{
                          uri: dataDetail?.icon_image,
                          priority: FastImage.priority.high,
                          cache: FastImage.cacheControl.immutable,
                        }}
                        style={styles.avatar}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image source={defaultAvatar} style={styles.avatar} />
                    )}
                  </>
                )}

                <TouchableOpacity
                  style={styles.buttonGhim}
                  onPress={onGhimRoomChat}>
                  <Image
                    source={iconPin}
                    style={[
                      activePin === false ? styles.inActive : styles.active,
                    ]}
                  />
                </TouchableOpacity>

                {!dataDetail?.one_one_check && dataDetail?.is_admin === 1 ? (
                  <TouchableOpacity
                    style={styles.buttonCamera}
                    onPress={upLoadImage}>
                    <Image source={iconCamera} />
                  </TouchableOpacity>
                ) : null}

                {!dataDetail?.one_one_check && dataDetail?.is_admin === 1 ? (
                  <TouchableOpacity
                    style={styles.buttonDelete}
                    onPress={deleteAvatar}>
                    <Image source={iconDelete} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
            {dataDetail?.type === 4 || dataDetail?.is_admin !== 1 ? null : (
              <ViewItem
                sourceImage={iconEdit}
                title="チャットグループ名"
                content={renderName(dataDetail?.name)}
                onClick={() => {
                  navigation.navigate(ROUTE_NAME.EDIT_ROOM_CHAT, {
                    idRoomChat: idRoomChat,
                    dataDetail: {
                      ...dataDetail,
                      name: renderName(dataDetail?.name),
                    },
                    type: 'name',
                  });
                }}
              />
            )}
            {dataDetail?.type === 4 || dataDetail?.is_admin !== 1 ? null : (
              <ViewItem
                sourceImage={iconDetailRow}
                title="概要"
                content={dataDetail?.summary_column}
                onClick={() => {
                  navigation.navigate(ROUTE_NAME.EDIT_ROOM_CHAT, {
                    idRoomChat: idRoomChat,
                    dataDetail: dataDetail,
                    type: 'content',
                  });
                }}
              />
            )}
            {dataDetail?.type === 4 ? null : (
              <ViewItem
                sourceImage={iconUpload}
                content="チャット招待リンク"
                onClick={() => {
                  onCancelModalLink();
                }}
              />
            )}
            <ViewItem
              sourceImage={iconDocument}
              content="メディア・ファイル・URL"
              onClick={() => {
                navigation.navigate(ROUTE_NAME.LIST_FILE_IN_ROOM, {
                  idRoom_chat: idRoomChat,
                });
              }}
            />
            {dataDetail?.type === 4 ? null : (
              <ViewItem
                sourceImage={iconUser}
                content="メンバー"
                onClick={() => {
                  navigation.navigate(ROUTE_NAME.LIST_USER, {
                    idRoomChat: idRoomChat,
                    dataDetail: dataDetail,
                    is_admin: dataDetail?.is_admin,
                  });
                }}
              />
            )}
            {dataDetail?.type === 4 ? null : (
              <ViewItem
                sourceImage={iconLogout}
                content="グループを退出"
                isLogout
                hideNext
                onClick={onCancelModal}
              />
            )}
            {dataDetail?.is_admin == 1 && listUser?.length > 1 ? (
              <ViewItem
                sourceImage={iconDelete}
                content="グループを削除"
                hideNext
                isLogout
                hideBorder
                onClick={onCancelModalDelete}
              />
            ) : null}
          </ScrollView>
        ) : (
          <View style={styles.marginTop}>
            <ActivityIndicator size="small" color={colors.border} />
          </View>
        )}
      </View>
      <ModalConfirm
        visible={modal}
        onCancel={onCancelModal}
        titleHeader="グループを退出する"
        contentHeader = "退出すると新しいメッセージが届かなくなります。"
        onConfirm={onLeave}
      />
      <ModalLink
        visible={modalLink}
        onCancel={onCancelModalLink}
        titleHeader="チャット招待リンク"
        idRoomChat={idRoomChat}
      />
      <ModalConfirm
        visible={modalDelete}
        onCancel={onCancelModalDelete}
        titleHeader="このグループを削除しますか?"
        onConfirm={onDelete}
      />
    </View>
  );
};

export {InfoRoomChat};

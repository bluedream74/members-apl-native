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
} from '@images';
import {ViewItem} from './components/ViewItem';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {ROUTE_NAME} from '@routeName';
import {detailRoomchat, pinFlag, leaveRoomChat, GlobalService} from '@services';
import {showMessage} from 'react-native-flash-message';
import ImagePicker from 'react-native-image-crop-picker';
import {verticalScale} from 'react-native-size-matters';
import {updateImageRoomChat, deleteImageRoomChat} from '@services';
import {colors} from '@stylesCommon';
import FastImage from 'react-native-fast-image';

const InfoRoomChat = (props: any) => {
  const {route} = props;
  const {idRoomChat} = route?.params;
  const navigation = useNavigation<any>();

  const [dataDetail, setData] = useState<any>(null);
  const [activePin, setActivePin] = useState<any>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [modalLink, setModalLink] = useState<boolean>(false);
  const [image, setImage] = useState<any>(null);

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

  const onCancelModalLink = useCallback(() => {
    setModalLink(!modalLink);
  }, [modalLink]);

  useFocusEffect(
    useCallback(() => {
      getDetail();
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
  }, [idRoomChat]);

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
      getDetail();
      GlobalService.hideLoading();
    } catch (error: any) {
      GlobalService.hideLoading();
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={
          dataDetail?.one_one_check?.length > 0
            ? dataDetail?.one_one_check[0]?.full_name
            : dataDetail?.name
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
                        source={{uri: dataDetail?.one_one_check[0]?.icon_image}}
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
                        source={{uri: dataDetail?.icon_image}}
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

                {dataDetail?.is_host === 1 && !dataDetail?.one_one_check ? (
                  <TouchableOpacity
                    style={styles.buttonCamera}
                    onPress={upLoadImage}>
                    <Image source={iconCamera} />
                  </TouchableOpacity>
                ) : null}

                {dataDetail?.is_host === 1 && !dataDetail?.one_one_check ? (
                  <TouchableOpacity
                    style={styles.buttonDelete}
                    onPress={deleteAvatar}>
                    <Image source={iconDelete} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
            {dataDetail?.one_one_check?.length > 0 ? null : (
              <ViewItem
                sourceImage={iconEdit}
                title="チャットグループ名"
                content={dataDetail?.name}
                onClick={() => {
                  navigation.navigate(ROUTE_NAME.EDIT_ROOM_CHAT, {
                    idRoomChat: idRoomChat,
                    dataDetail: dataDetail,
                    type: 'name',
                  });
                }}
                disabled={dataDetail?.is_host !== 1}
              />
            )}
            {dataDetail?.one_one_check?.length > 0 ? null : (
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
                disabled={dataDetail?.is_host !== 1}
              />
            )}
            <ViewItem
              sourceImage={iconUpload}
              content="チャット招待リンク"
              onClick={() => {
                onCancelModalLink();
              }}
            />
            <ViewItem
              sourceImage={iconUser}
              content="メンバー"
              onClick={() => {
                navigation.navigate(ROUTE_NAME.LIST_USER, {
                  idRoomChat: idRoomChat,
                  dataDetail: dataDetail,
                });
              }}
              hideBorder
            />
            {dataDetail?.is_host !== 1 ? (
              <ViewItem
                sourceImage={iconLogout}
                content="グループを退出"
                isLogout
                hideBorder
                hideNext
                onClick={onCancelModal}
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
        titleHeader="本当にログアウトしますか？"
        onConfirm={onLeave}
      />
      <ModalLink
        visible={modalLink}
        onCancel={onCancelModalLink}
        titleHeader="チャット招待リンク"
        idRoomChat={idRoomChat}
      />
    </View>
  );
};

export {InfoRoomChat};

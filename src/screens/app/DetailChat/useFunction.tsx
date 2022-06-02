import {defaultAvatar} from '@images';
import moment from 'moment';
import React, {useMemo, useEffect, useState, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getDetailListChat,
  deleteMessage,
  pinMessage,
  getDetailMessageSocketSuccess,
  saveMessageReply,
  saveMessageEdit,
  editMessageAction,
} from '@redux';
import {
  deleteMessageApi,
  GlobalService,
  detailRoomchat,
  sendMessageApi,
  pinMessageApi,
  replyMessageApi,
  editMessageApi,
  sendReactionApi,
  sendLabelApi,
} from '@services';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {ROUTE_NAME} from '@routeName';
import {AppSocket} from '@util';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import {Platform} from 'react-native';
import {showMessage} from 'react-native-flash-message';

export const useFunction = (props: any) => {
  const {socket} = AppSocket;

  const navigation = useNavigation<any>();
  const user_id = useSelector((state: any) => state.auth.userInfo.id);
  const listChat = useSelector((state: any) => state.chat?.detailChat);
  const pagging = useSelector((state: any) => state.chat?.pagingDetail);
  const message_pinned = useSelector(
    (state: any) => state.chat?.message_pinned,
  );
  const message_edit = useSelector((state: any) => state.chat?.messageEdit);
  const messageReply = useSelector((state: any) => state.chat?.messageReply);

  const dispatch = useDispatch();
  const {route} = props;
  const {idRoomChat} = route?.params;
  const [visible, setVisible] = useState(false);
  const [dataDetail, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pickFile, setPickFile] = useState(false);

  const navigateToDetail = () => {
    navigation.navigate(ROUTE_NAME.INFO_ROOM_CHAT, {idRoomChat: idRoomChat});
  };

  const convertDataMessage = useCallback((message: any) => {
    return {
      _id: message?.id,
      text: message?.message,
      createdAt: message?.created_at,
      user: {
        _id: message?.from_id,
        avatar: message?.user_send?.icon_image,
      },
      reaction: message?.reactions,
      msg_type: message?.msg_type,
      reply_to_message_text: message?.reply_to_message_text,
      attachment_files: message?.attachment_files,
      reply_to_message_files: message?.reply_to_message_files,
      stamp_icon: message?.stamp_icon,
    };
  }, []);

  const getConvertedMessages = useCallback((msgs: any) => {
    return msgs?.map((item: any) => {
      return convertDataMessage(item);
    });
  }, []);

  const chatUser = useMemo(() => {
    return {
      _id: user_id,
    };
  }, []);

  const getListChat = () => {
    const data = {
      id: idRoomChat,
      page: page,
    };
    dispatch(getDetailListChat(data));
  };

  useEffect(() => {
    getListChat();
  }, [page]);

  const getDetail = async () => {
    try {
      const response = await detailRoomchat(idRoomChat);
      setData(response?.data?.room);
    } catch {}
  };

  useFocusEffect(
    useCallback(() => {
      getDetail();
    }, []),
  );

  const onShowMenu = useCallback(() => {
    setVisible(!visible);
  }, [visible]);

  const deleteMsg = useCallback(
    async (id: any) => {
      try {
        GlobalService.showLoading();
        const res = await deleteMessageApi(id, idRoomChat);
        socket.emit('message_ind', {
          user_id: user_id,
          room_id: idRoomChat,
          task_id: null,
          to_info: null,
          level: res?.data?.message_id?.msg_level,
          message_id: res?.data?.message_id?.id,
          message_type: res?.data?.message_id?.type,
          method: 2,
          // attachment_files: res?.data?.attachmentFiles,
          stamp_no: res?.data?.message_id?.stamp_no,
          relation_message_id: res?.data?.message_id?.reply_to_message_id,
          text: res?.data?.message_id?.message,
          text2: null,
          time: res?.data?.message_id?.created_at,
        });
        dispatch(deleteMessage(id));
        GlobalService.hideLoading();
      } catch (error: any) {
        GlobalService.hideLoading();
      }
    },
    [idRoomChat],
  );

  const sendMessage = useCallback(
    async mes => {
      if (messageReply) {
        try {
          const data = new FormData();
          data.append('room_id', idRoomChat);
          data.append('from_id', user_id);
          data.append('message', mes[0]?.text);
          data.append('reply_to_message_id', messageReply?.id);
          const res = await replyMessageApi(data);
          socket.emit('message_ind', {
            user_id: mes[0]?.user?._id,
            room_id: idRoomChat,
            task_id: null,
            to_info: null,
            level: res?.data?.data?.msg_level,
            message_id: res?.data?.data?.id,
            message_type: res?.data?.data?.type,
            method: res?.data?.data?.method,
            attachment_files: res?.data?.attachmentFiles,
            stamp_no: res?.data?.data?.stamp_no,
            relation_message_id: res?.data?.data?.reply_to_message_id,
            text: res?.data?.data?.message,
            text2: null,
            time: res?.data?.data?.created_at,
          });
          dispatch(saveMessageReply(null));
          dispatch(getDetailMessageSocketSuccess([res?.data?.data]));
        } catch (error: any) {}
      } else if (message_edit) {
        try {
          const param = {
            room_id: idRoomChat,
            message: mes[0]?.text,
          };
          const res = await editMessageApi(message_edit?.id, param);
          socket.emit('message_ind', {
            user_id: mes[0]?.user?._id,
            room_id: idRoomChat,
            task_id: null,
            to_info: null,
            level: res?.data?.data?.msg_level,
            message_id: res?.data?.data?.id,
            message_type: res?.data?.data?.type,
            method: res?.data?.data?.method,
            attachment_files: res?.data?.attachmentFiles,
            stamp_no: res?.data?.data?.stamp_no,
            relation_message_id: res?.data?.data?.reply_to_message_id,
            text: res?.data?.data?.message,
            text2: null,
            time: res?.data?.data?.created_at,
          });
          dispatch(saveMessageEdit(null));
          dispatch(
            editMessageAction({id: res?.data?.data.id, data: res?.data?.data}),
          );
        } catch (error: any) {}
      } else {
        try {
          const data = new FormData();
          data.append('room_id', idRoomChat);
          data.append('from_id', mes[0]?.user?._id);
          data.append('message', mes[0]?.text);
          const res = await sendMessageApi(data);
          socket.emit('message_ind', {
            user_id: mes[0]?.user?._id,
            room_id: idRoomChat,
            task_id: null,
            to_info: null,
            level: res?.data?.data?.msg_level,
            message_id: res?.data?.data?.id,
            message_type: res?.data?.data?.type,
            method: res?.data?.data?.method,
            attachment_files: res?.data?.attachmentFiles,
            stamp_no: res?.data?.data?.stamp_no,
            relation_message_id: res?.data?.data?.reply_to_message_id,
            text: res?.data?.data?.message,
            text2: null,
            time: res?.data?.data?.created_at,
          });
          dispatch(getDetailMessageSocketSuccess([res?.data?.data]));
        } catch (error: any) {}
      }
    },
    [messageReply, message_edit],
  );

  const updateGimMessage = useCallback(
    async (id, status) => {
      try {
        const res = await pinMessageApi(id, status);
        if (status === 0) {
          dispatch(pinMessage(null));
        } else {
          getListChat();
        }
      } catch (error: any) {}
    },
    [message_pinned?.id],
  );

  const onLoadMore = useCallback(() => {
    if (page !== pagging?.last_page) {
      setPage(prevPage => prevPage + 1);
    } else {
      null;
    }
  }, [page, pagging]);

  const replyMessage = useCallback((data: any) => {
    dispatch(saveMessageReply(data));
  }, []);

  const removeReplyMessage = useCallback(() => {
    dispatch(saveMessageReply(null));
  }, []);

  const editMessage = useCallback((data: any) => {
    dispatch(saveMessageEdit(data));
  }, []);

  const removeEditMessage = useCallback(() => {
    dispatch(saveMessageEdit(null));
  }, []);

  const reactionMessage = useCallback(async (data, id) => {
    const body = {
      message_id: id,
      reaction_no: data,
    };
    const res = await sendReactionApi(body);
    socket.emit('message_ind', {
      user_id: user_id,
      room_id: idRoomChat,
      task_id: null,
      to_info: null,
      level: res?.data?.data?.msg_level,
      message_id: res?.data?.data?.id,
      message_type: 3,
      method: res?.data?.data?.method,
      attachment_files: res?.data?.attachmentFiles,
      stamp_no: res?.data?.data?.stamp_no,
      relation_message_id: res?.data?.data?.reply_to_message_id,
      text: res?.data?.data?.message,
      text2: null,
      time: res?.data?.data?.created_at,
    });
    dispatch(
      editMessageAction({id: res?.data?.data.id, data: res?.data?.data}),
    );
  }, []);

  useEffect(() => {
    if (message_edit) {
      dispatch(saveMessageReply(null));
    } else if (messageReply) {
      dispatch(saveMessageEdit(null));
    }
  }, [message_edit, messageReply]);

  const navigatiteToListReaction = useCallback(idMsg => {
    navigation.navigate(ROUTE_NAME.LIST_REACTION, {
      id: idMsg,
      room_id: idRoomChat,
    });
  }, []);

  const cancelModal = useCallback(() => {
    setPickFile(!pickFile);
  }, [pickFile]);

  const chosePhoto = () => {
    ImagePicker.openPicker({
      multiple: true,
    }).then(async images => {
      const data = new FormData();
      if (images?.length > 3) {
        cancelModal();
        showMessage({
          message: 'Maximum of 3 photos',
          type: 'danger',
        });
      } else {
        cancelModal();
        try {
          if (images?.length > 0) {
            GlobalService.showLoading();
            images?.forEach((item: any) => {
              const isHEIC =
                item?.sourceURL?.endsWith('.heic') ||
                item?.sourceURL?.endsWith('.HEIC');
              data.append('attachment[]', {
                fileName: item?.path?.replace(/^.*[\\\/]/, ''),
                name: item?.path?.replace(/^.*[\\\/]/, ''),
                width: item?.width,
                uri: item?.path,
                path: item?.path,
                size: item?.size,
                type:
                  Platform.OS === 'ios'
                    ? `image/${
                        isHEIC
                          ? item?.path?.split('.')[0] + '.JPG'
                          : item?.path?.split('.').pop()
                      }}`
                    : item?.mime,
                height: item?.height,
              });
            });
          }
          data.append('msg_type', 2);
          data.append('room_id', idRoomChat);
          data.append('from_id', user_id);
          const res = await sendMessageApi(data);
          socket.emit('message_ind', {
            user_id: user_id,
            room_id: idRoomChat,
            task_id: null,
            to_info: null,
            level: res?.data?.data?.msg_level,
            message_id: res?.data?.data?.id,
            message_type: res?.data?.data?.type,
            method: res?.data?.data?.method,
            attachment_files: res?.data?.attachmentFiles,
            stamp_no: res?.data?.data?.stamp_no,
            relation_message_id: res?.data?.data?.reply_to_message_id,
            text: res?.data?.data?.message,
            text2: null,
            time: res?.data?.data?.created_at,
          });
          dispatch(getDetailMessageSocketSuccess([res?.data?.data]));
          GlobalService.hideLoading();
        } catch (error: any) {
          GlobalService.hideLoading();
        }
      }
    });
  };

  const choseFile = () => {
    DocumentPicker.pickMultiple({
      presentationStyle: 'fullScreen',
      copyTo: 'cachesDirectory',
    }).then(async result => {
      const data = new FormData();
      cancelModal();
      try {
        if (result?.length > 0) {
          GlobalService.showLoading();
          result?.forEach((item: any) => {
            data.append('attachment[]', {
              name:
                Platform.OS === 'ios'
                  ? item?.uri?.replace('file://', '')
                  : item?.fileCopyUri,
              type: item?.type,
              uri:
                Platform.OS === 'ios'
                  ? item?.uri?.replace('file://', '')
                  : item?.fileCopyUri,
            });
          });
        }
        data.append('msg_type', 2);
        data.append('room_id', idRoomChat);
        data.append('from_id', user_id);
        const res = await sendMessageApi(data);
        socket.emit('message_ind', {
          user_id: user_id,
          room_id: idRoomChat,
          task_id: null,
          to_info: null,
          level: res?.data?.data?.msg_level,
          message_id: res?.data?.data?.id,
          message_type: res?.data?.data?.type,
          method: res?.data?.data?.method,
          attachment_files: res?.data?.attachmentFiles,
          stamp_no: res?.data?.data?.stamp_no,
          relation_message_id: res?.data?.data?.reply_to_message_id,
          text: res?.data?.data?.message,
          text2: null,
          time: res?.data?.data?.created_at,
        });
        dispatch(getDetailMessageSocketSuccess([res?.data?.data]));
        GlobalService.hideLoading();
      } catch (error) {
        GlobalService.hideLoading();
      }
    });
  };

  const sendLabel = async (stamp_no: any) => {
    try {
      const data = new FormData();
      data.append('room_id', idRoomChat);
      data.append('from_id', user_id);
      data.append('msg_level', 0);
      data.append('msg_type', 1);
      data.append('method', 0);
      data.append('stamp_no', stamp_no);
      const res = await sendLabelApi(data);
      socket.emit('message_ind', {
        user_id: user_id,
        room_id: idRoomChat,
        task_id: null,
        to_info: null,
        level: res?.data?.data?.msg_level,
        message_id: res?.data?.data?.id,
        message_type: res?.data?.data?.type,
        method: res?.data?.data?.method,
        attachment_files: res?.data?.attachmentFiles,
        stamp_no: res?.data?.data?.stamp_no,
        relation_message_id: res?.data?.data?.reply_to_message_id,
        text: res?.data?.data?.message,
        text2: null,
        time: res?.data?.data?.created_at,
      });
      dispatch(getDetailMessageSocketSuccess([res?.data?.data]));
    } catch (error: any) {}
  };

  return {
    chatUser,
    idRoomChat,
    visible,
    onShowMenu,
    getConvertedMessages,
    listChat,
    deleteMsg,
    dataDetail,
    sendMessage,
    navigateToDetail,
    message_pinned,
    updateGimMessage,
    onLoadMore,
    replyMessage,
    messageReply,
    removeReplyMessage,
    editMessage,
    removeEditMessage,
    message_edit,
    reactionMessage,
    navigatiteToListReaction,
    pickFile,
    cancelModal,
    chosePhoto,
    choseFile,
    sendLabel,
  };
};

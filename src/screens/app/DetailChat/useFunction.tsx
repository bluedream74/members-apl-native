import {defaultAvatar} from '@images';
import moment from 'moment';
import React, {useMemo, useEffect, useState, useCallback, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getDetailListChat,
  deleteMessage,
  pinMessage,
  getDetailMessageSocketSuccess,
  saveMessageReply,
  saveMessageEdit,
  editMessageAction,
  fetchResultMessageActionListRoom,
  isGetInfoRoom,
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
  getListUser,
  addBookmark,
} from '@services';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {ROUTE_NAME} from '@routeName';
import {AppSocket} from '@util';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import {Platform, Keyboard, Alert} from 'react-native';
import {showMessage} from 'react-native-flash-message';

export const useFunction = (props: any) => {
  const {getSocket} = AppSocket;
  const socket = getSocket();

  const giftedChatRef = useRef<any>(null);
  const navigation = useNavigation<any>();
  const user_id = useSelector((state: any) => state.auth.userInfo.id);
  const listChat = useSelector((state: any) => state.chat?.detailChat);
  const pagging = useSelector((state: any) => state.chat?.pagingDetail);

  const message_pinned = useSelector(
    (state: any) => state.chat?.message_pinned,
  );
  const message_edit = useSelector((state: any) => state.chat?.messageEdit);
  const messageReply = useSelector((state: any) => state.chat?.messageReply);
  const idMessageSearch = useSelector(
    (state: any) => state.chat?.id_messageSearch,
  );
  const isGetInfoRoom = useSelector((state: any) => state.chat?.isGetInfoRoom);
  const GetUnreadMessageCount = useSelector((state: any) => state.chat?.GetUnreadMessageCount);

  const dispatch = useDispatch();
  const {route} = props;
  const {idRoomChat, idMessageSearchListChat} = route?.params;
  const [visible, setVisible] = useState(false);
  const [dataDetail, setData] = useState<any>(null);
  const [page, setPage] = useState<any>(1);
  const [pickFile, setPickFile] = useState(false);
  const [modalStamp, setShowModalStamp] = useState(false);
  const [text, setText] = useState('');
  const [showTagModal, setShowTag] = useState(false);
  const [listUser, setListUser] = useState([]);
  const [ids, setIds] = useState<any>([]);

  useEffect(() => {
    if (idMessageSearchListChat) {
      setTimeout(() => {
        const body = {
          id_room: idRoomChat,
          id_message: idMessageSearchListChat,
        };
        dispatch(fetchResultMessageActionListRoom(body));
      }, 1000);
    }
  }, [idMessageSearchListChat]);

  const navigateToMessage = useCallback(
    idMessageSearch => {
      const index = listChat.findIndex(
        (element: any) => element?.id == idMessageSearch,
      );
      if (index && index >= 0) {
        giftedChatRef.current?._messageContainerRef?.current?.scrollToIndex({
          animated: true,
          index: index,
        });
      }
    },
    [listChat],
  );

  useEffect(() => {
    if (idMessageSearch) {
      setPage(pagging?.current_page);
      navigateToMessage(idMessageSearch);
    }
  }, [idMessageSearch]);

  const navigateToDetail = useCallback(() => {
    navigation.navigate(ROUTE_NAME.INFO_ROOM_CHAT, {idRoomChat: idRoomChat});
  }, [idRoomChat]);

  const convertDataMessage = useCallback((message: any, index: any) => {
    return {
      _id: message?.id,
      text: message?.message,
      createdAt: message?.created_at,
      user: {
        _id: message?.from_id,
        avatar: message?.user_send?.icon_image,
        name: message?.user_send
          ? `${message?.user_send?.last_name}${message?.user_send?.first_name}`
          : null,
      },
      reaction: message?.reactions,
      msg_type: message?.msg_type,
      reply_to_message_text: message?.reply_to_message_text,
      attachment_files: message?.attachment_files,
      reply_to_message_files: message?.reply_to_message_files,
      reply_to_message_stamp: message?.reply_to_message_stamp,
      stamp_icon: message?.stamp_icon,
      stamp_no: message?.stamp_no,
      index: index,
      users_seen: message?.users_seen,
      task: message?.task,
      guest: message?.guest,
      task_link: message?.task_link,
    };
  }, []);

  const getConvertedMessages = useCallback((msgs: any) => {
    return msgs?.map((item: any, index: any) => {
      return convertDataMessage(item, index);
    });
  }, []);

  const chatUser = useMemo(() => {
    return {
      _id: user_id,
    };
  }, []);

  const getListChat = useCallback(() => {
    const data = {
      id: idRoomChat,
      page: page,
    };
    dispatch(getDetailListChat(data));
  }, [page, idRoomChat]);

  useEffect(() => {
    getListChat();
  }, [page]);

  const getDetail = async () => {
    try {
      const response = await detailRoomchat(idRoomChat);
      setData(response?.data?.room);
      dispatch(isGetInfoRoom(false));
    } catch {}
  };

  useEffect(() => {
    if (isGetInfoRoom === true) {
      getDetail();
    }
  }, [isGetInfoRoom]);

  useFocusEffect(
    useCallback(() => {
      getDetail();
    }, []),
  );

  useEffect(() => {
    if (message_edit || messageReply) {
      setShowModalStamp(false);
    }
  }, [message_edit, messageReply]);

  useEffect(() => {
    if (!message_edit) {
      setText('');
    }
  }, [message_edit]);

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
          message_type: res?.data?.message_id?.msg_type,
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

  const showHideModalTagName = useCallback(() => {
    setShowTag(!showTagModal);
  }, [showTagModal]);

  const sendMessage = useCallback(
    async mes => {
      setShowTag(false);
      setShowModalStamp(false);
      if (messageReply) {
        try {
          const data = new FormData();
          data.append('room_id', idRoomChat);
          data.append('from_id', user_id);
          data.append('message', mes[0]?.text?.split('\n').join('<br>'));
          data.append('reply_to_message_id', messageReply?.id);
          ids?.forEach((item: any) => {
            data.append('ids[]', item);
          });
          const res = await replyMessageApi(data);
          socket.emit('message_ind', {
            user_id: mes[0]?.user?._id,
            room_id: idRoomChat,
            task_id: null,
            to_info: null,
            level: res?.data?.data?.msg_level,
            message_id: res?.data?.data?.id,
            message_type: res?.data?.data?.msg_type,
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
            message: mes[0]?.text?.split('\n').join('<br>'),
            ids: ids,
          };
          const res = await editMessageApi(message_edit?.id, param);
          socket.emit('message_ind', {
            user_id: mes[0]?.user?._id,
            room_id: idRoomChat,
            task_id: null,
            to_info: null,
            level: res?.data?.data?.msg_level,
            message_id: res?.data?.data?.id,
            message_type: res?.data?.data?.msg_type,
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
          data.append('message', mes[0]?.text?.split('\n').join('<br>'));
          ids?.forEach((item: any) => {
            data.append('ids[]', item);
          });
          const res = await sendMessageApi(data);
          socket.emit('message_ind', {
            user_id: mes[0]?.user?._id,
            room_id: idRoomChat,
            task_id: null,
            to_info: null,
            level: res?.data?.data?.msg_level,
            message_id: res?.data?.data?.id,
            message_type: res?.data?.data?.msg_type,
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
      giftedChatRef.current?._messageContainerRef?.current?.scrollToIndex({
        animated: true,
        index: 0,
      });
      setIds([]);
    },
    [messageReply, message_edit, ids],
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
      setPage((prevPage: any) => prevPage + 1);
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
    setText(data?.text);
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
      message_id: null,
      message_type: 3,
      method: 0,
      attachment_files: res?.data?.attachmentFiles,
      stamp_no: data,
      relation_message_id: res?.data?.data?.id,
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
            message_type: res?.data?.data?.msg_type,
            method: res?.data?.data?.method,
            attachment_files: res?.data?.attachmentFiles,
            stamp_no: res?.data?.data?.stamp_no,
            relation_message_id: res?.data?.data?.reply_to_message_id,
            text: res?.data?.data?.message,
            text2: null,
            time: res?.data?.data?.created_at,
          });
          dispatch(getDetailMessageSocketSuccess([res?.data?.data]));
          giftedChatRef.current?._messageContainerRef?.current?.scrollToIndex({
            animated: true,
            index: 0,
          });
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
              name: item?.name,
              type: item?.type,
              uri:
                Platform.OS === 'ios'
                  ? decodeURIComponent(item?.uri?.replace('file://', ''))
                  : decodeURIComponent(item?.fileCopyUri),
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
          message_type: res?.data?.data?.msg_type,
          method: res?.data?.data?.method,
          attachment_files: res?.data?.attachmentFiles,
          stamp_no: res?.data?.data?.stamp_no,
          relation_message_id: res?.data?.data?.reply_to_message_id,
          text: res?.data?.data?.message,
          text2: null,
          time: res?.data?.data?.created_at,
        });
        dispatch(getDetailMessageSocketSuccess([res?.data?.data]));
        giftedChatRef.current?._messageContainerRef?.current?.scrollToIndex({
          animated: true,
          index: 0,
        });
        GlobalService.hideLoading();
      } catch (error) {
        GlobalService.hideLoading();
      }
    });
  };

  const sendLabel = async (stamp_no: any) => {
    setShowTag(false);
    setShowModalStamp(false);
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
        message_type: res?.data?.data?.msg_type,
        method: res?.data?.data?.method,
        attachment_files: res?.data?.attachmentFiles,
        stamp_no: res?.data?.data?.stamp_no,
        relation_message_id: res?.data?.data?.reply_to_message_id,
        text: res?.data?.data?.message,
        text2: null,
        time: res?.data?.data?.created_at,
      });
      dispatch(getDetailMessageSocketSuccess([res?.data?.data]));
      giftedChatRef.current?._messageContainerRef?.current?.scrollToIndex({
        animated: true,
        index: 0,
      });
    } catch (error: any) {}
  };

  const searchMessage = useCallback(() => {
    navigation.navigate(ROUTE_NAME.SEARCH_MESSAGE, {idRoomChat: idRoomChat});
  }, [idRoomChat]);

  const showModalStamp = useCallback(() => {
    setShowModalStamp(!modalStamp);
  }, [modalStamp]);

  useEffect(() => {
    if (modalStamp === true) {
      removeReplyMessage();
      removeEditMessage();
    }
  }, [modalStamp]);

  // const setTextInput = React.useCallback(
  //   value => {
  //     setText(value);
  //   },
  //   [text],
  // );

  const getUserListChat = useCallback(async () => {
    try {
      const result = await getListUser({room_id: idRoomChat});
      setListUser(result?.data?.users?.data);
    } catch {
      (error: any) => {};
    }
  }, [idRoomChat]);

  useEffect(() => {
    getUserListChat();
  }, [showTagModal]);

  const bookmarkMessage = useCallback((data: any) => {
    try {
      GlobalService.showLoading();
      const rest = addBookmark(data);
      GlobalService.hideLoading();
      showMessage({
        message: 'ブックマークが正常に追加されました',
        type: 'success',
      });
    } catch {
      (error: any) => {
        GlobalService.hideLoading();
      };
    }
  }, []);

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
    searchMessage,
    showModalStamp,
    modalStamp,
    giftedChatRef,
    text,
    // setTextInput,
    showHideModalTagName,
    setShowTag,
    showTagModal,
    listUser,
    setText,
    bookmarkMessage,
    setIds,
    ids,
  };
};

import React, {useMemo, useEffect, useState, useCallback, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getDetailListChat,
  deleteMessage,
  pinMessage,
  getDetailMessageSocketSuccess,
  saveMessageReply,
  saveMessageEdit,
  saveMessageQuote,
  editMessageAction,
  fetchResultMessageActionListRoom,
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
  callApiChatBot,
} from '@services';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {ROUTE_NAME} from '@routeName';
import {AppSocket} from '@util';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import {Platform, Text} from 'react-native';
import {showMessage} from 'react-native-flash-message';
import {convertArrUnique} from '@util';

export const useFunction = (props: any) => {
  const {getSocket} = AppSocket;
  const socket = getSocket();

  const giftedChatRef = useRef<any>(null);
  const navigation = useNavigation<any>();
  const me = useSelector((state: any) => state.auth.userInfo);
  const user_id = useSelector((state: any) => state.auth.userInfo.id);
  const listChat = useSelector((state: any) => state.chat?.detailChat);
  const pagging = useSelector((state: any) => state.chat?.pagingDetail);

  const message_pinned = useSelector(
    (state: any) => state.chat?.message_pinned,
  );
  const message_edit = useSelector((state: any) => state.chat?.messageEdit);
  const messageReply = useSelector((state: any) => state.chat?.messageReply);
  const messageQuote = useSelector((state: any) => state.chat?.messageQuote);
  const idMessageSearch = useSelector(
    (state: any) => state.chat?.id_messageSearch,
  );
  const isGetInfoRoom = useSelector((state: any) => state.chat?.isGetInfoRoom);

  const dispatch = useDispatch();
  const {route} = props;
  const {idRoomChat, idMessageSearchListChat} = route?.params;
  const [visible, setVisible] = useState(false);
  const [dataDetail, setData] = useState<any>(null);
  const [page, setPage] = useState<any>(1);
  const [pickFile, setPickFile] = useState(false);
  const [modalStamp, setShowModalStamp] = useState(false);
  const [text, setText] = useState('');
  const [formattedText, setFormattedText] = useState<(string | JSX.Element)[]>(
    [],
  );
  const [showTagModal, setShowTag] = useState(false);
  const [listUser, setListUser] = useState([]);
  const [ids, setIds] = useState<any>([]);
  const [newIndexArray, setIndex] = useState<any>(null);
  const [listUserRoot, setListUserRoot] = useState([]);
  const [listUserSelect, setListUserSelect] = useState<any>([]);
  const [mentionedUsers, setMentionedUsers] = useState<any>([]);

  useEffect(() => {
    //Logic xem xét khi vào màn này có phải dạng message được tìm kiếm không
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
    //Logic khi có id message tìm kiếm thì tiến hành scroll đển tin nhắn đó
    if (idMessageSearch) {
      setPage(pagging?.current_page);
      navigateToMessage(idMessageSearch);
    }
  }, [idMessageSearch]);

  const navigateToDetail = useCallback(() => {
    navigation.navigate(ROUTE_NAME.INFO_ROOM_CHAT, {idRoomChat: idRoomChat});
  }, [idRoomChat]);

  const convertDataMessage = useCallback((message: any, index: any) => {
    //Hàm xử lý lại dữ liệu message khi nhận từ api trả về
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
      reply_to_message_id: message?.reply_to_message_id,
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
      message_quote: message?.message_quote,
      quote_message_id: message?.quote_message_id,
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
    if (message_edit || messageReply || messageQuote) {
      setShowModalStamp(false);
    }
  }, [message_edit, messageReply, messageQuote]);

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
      } else if (messageQuote) {
        try {
          const data = new FormData();
          data.append('room_id', idRoomChat);
          data.append('from_id', user_id);
          data.append('message', mes[0]?.text?.split('\n').join('<br>'));
          data.append('message_quote', messageQuote?.text);
          data.append('quote_message_id', messageQuote?.id);
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
            text2: messageQuote?.text,
            time: res?.data?.data?.created_at,
          });
          dispatch(saveMessageQuote(null));
          dispatch(getDetailMessageSocketSuccess([res?.data?.data]));
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
          // callApiChatBotRequest(
          //   res?.data?.data?.message,
          //   res?.data?.data?.id,
          //   `${res?.data?.data?.user_send?.first_name}${res?.data?.data?.user_send?.last_name}`,
          // );
        } catch (error: any) {}
      }
      // Khi call api gửi tin nhắn xong sẽ auto scroll xuống tin nhắn cuối cùng
      giftedChatRef.current?._messageContainerRef?.current?.scrollToIndex({
        animated: true,
        index: 0,
      });
      setIds([]);
    },
    [messageReply, message_edit, ids, messageQuote],
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
  const quoteMessage = useCallback((data: any) => {
    dispatch(saveMessageQuote(data));
  }, []);
  const removeQuoteMessage = useCallback(() => {
    dispatch(saveMessageQuote(null));
  }, []);

  const editMessage = useCallback((data: any) => {
    // setText(data?.text);
    formatText(data?.text + ' ', false);
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
      dispatch(saveMessageQuote(null));
    } else if (messageReply) {
      dispatch(saveMessageEdit(null));
      dispatch(saveMessageQuote(null));
    } else if (messageQuote) {
      dispatch(saveMessageEdit(null));
      dispatch(saveMessageReply(null));
    }
  }, [message_edit, messageReply, messageQuote]);

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
      removeQuoteMessage();
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
      const guest = result?.data?.guests?.map((item: any) => {
        return {
          ...item,
          id: Number(item?.id) * -1,
          last_name: item?.name,
          first_name: '',
        };
      });
      setListUser(result?.data?.users?.data?.concat(guest));
      setListUserRoot(result?.data?.users?.data);
    } catch {
      (error: any) => {};
    }
  }, [idRoomChat]);

  useEffect(() => {
    getUserListChat();
  }, [showTagModal]);

  useEffect(() => {
    setTimeout(() => {
      if (formattedText[0]?.props?.children === '') {
        formattedText.shift();
        setFormattedText([...formattedText]);
      }
    }, 10);
  }, [formattedText]);

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
  const formatText = (inputText: string, fromTagFlg: boolean) => {
    if (inputText.length === 0) {
      setFormattedText([]);
      return;
    }
    const words = inputText.split(' ');
    const formattedText1: (string | JSX.Element)[] = [];
    words.forEach((word, index) => {
      const isLastWord = index === words.length - 1;
      if (!word.startsWith('@') || !mentionedUsers.includes(word)) {
        const nonmention = (
          <Text
            key={word + index}
            style={{
              alignSelf: 'flex-start',
              color: 'black',
            }}>
            {word}
          </Text>
        );
        return isLastWord
          ? formattedText1.push(nonmention)
          : formattedText1.push(nonmention, ' ');
      } else {
        const mention = (
          <Text
            key={word + index}
            style={{
              alignSelf: 'flex-start',
              color: '#3366CC',
              fontWeight: 'bold',
            }}>
            {word}
          </Text>
        );
        if (word === '@') {
          formattedText1.push(mention);
        } else {
          if (word.startsWith('@') && !word.includes(' ') && !fromTagFlg) {
            isLastWord
              ? formattedText1.push(mention)
              : formattedText1.push(mention, ' ');
          } else {
            isLastWord
              ? formattedText1.push(mention, ' ')
              : formattedText1.push(mention, ' ');
          }
        }
      }
    });
    if (checkDeletedMension(formattedText1)) {
      formattedText1.unshift(' '); //i put space in beggining because text color cant be changed without this.
    }
    setFormattedText(formattedText1);
  };
  const checkDeletedMension = (formattedText1: any[]) => {
    let result = false;
    formattedText1.forEach((element, index) => {
      if (
        element?.props?.children?.startsWith('@') &&
        element?.props?.children?.length > 1 &&
        element?.props?.children?.length <
          formattedText[index]?.props?.children.length
      ) {
        result = true;
      }
    });
    return result;
  };
  const getText = (formattedtext: (string | JSX.Element)[]) => {
    let context: string = '';
    formattedtext.forEach((element, index) => {
      let word = '';
      if (typeof element === 'string') {
        word = element;
      } else {
        word = element.props.children;
      }
      if (word !== '@') {
        if (word.slice(-1) === '@') {
          context = context + word.slice(0, -1) + ' ';
        } else {
          context = context + word;
        }
      }
    });
    return context;
  };

  const callApiChatBotRequest = async (
    message: any,
    messageId: any,
    useName: any,
  ) => {
    try {
      let sendInfo: any = [];
      const numberOfMember = listUserRoot.length;
      if (numberOfMember < 2) {
        return null;
      } else if (numberOfMember === 2) {
        sendInfo = listUserRoot;
      } else if (numberOfMember > 2) {
        sendInfo = listUserSelect;
      }
      let formData = new FormData();
      formData.append('from_user_name', useName);
      formData.append(
        'mention_members',
        JSON.stringify(convertArrUnique(sendInfo, 'id')),
      );
      formData.append('message', message);
      formData.append('message_id', messageId);
      const res = await callApiChatBot(formData);
    } catch (error) {}
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
    searchMessage,
    showModalStamp,
    modalStamp,
    giftedChatRef,
    text,
    showHideModalTagName,
    setShowTag,
    showTagModal,
    listUser,
    setText,
    bookmarkMessage,
    setIds,
    ids,
    newIndexArray,
    setIndex,
    quoteMessage,
    messageQuote,
    listUserSelect,
    setListUserSelect,
    formattedText,
    setFormattedText,
    mentionedUsers,
    setMentionedUsers,
    formatText,
    getText,
    me,
    navigateToMessage,
  };
};

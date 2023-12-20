import React, {useMemo, useEffect, useState, useCallback, useRef} from 'react';
import {store} from '../../../redux/store';
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
  fetchResultMessageActionRedLine,
  saveIdMessageSearch,
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
  saveTask,
  updateTask,
} from '@services';
import {useNavigation} from '@react-navigation/native';
import {ROUTE_NAME} from '@routeName';
import {AppSocket} from '@util';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import {Platform, Text} from 'react-native';
import {showMessage} from 'react-native-flash-message';
import {convertArrUnique} from '@util';
import moment from 'moment/moment';
import {Keyboard, KeyboardEvent} from 'react-native';

export const useFunction = (props: any) => {
  const {getSocket} = AppSocket;
  const socket = getSocket();

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const {route} = props;
  const {idRoomChat, idMessageSearchListChat} = route?.params;

  const giftedChatRef = useRef<any>(null);

  const me = useSelector((state: any) => state.auth.userInfo);
  const user_id = useSelector((state: any) => state.auth.userInfo.id);
  const listChat = useSelector((state: any) => state.chat?.detailChat);
  const paging = useSelector((state: any) => state.chat?.pagingDetail);
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
  const redLineId = useSelector((state: any) => state.chat?.redLineId);

  const [visible, setVisible] = useState(false);
  const [dataDetail, setData] = useState<any>(null);
  const [page, setPage] = useState<number | null>(1);
  const [topPage, setTopPage] = useState<number | null>(1);
  const [bottomPage, setBottomPage] = useState<number | null>(1);
  const [pageLoading, setPageLoading] = useState(true);
  const [pickFile, setPickFile] = useState(false);
  const [chosenFiles, setchosenFiles] = useState<any>([]);
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
  const [showRedLine, setShowRedLine] = useState<boolean>(true);
  const [indexRedLine, setIndexRedLine] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [showUserList, setShowUserList] = useState<boolean>(false);
  const [selected, setSelected] = useState<any>([]);
  const [inputText, setInputText] = useState<string>('');
  const [inputIndex, setInputIndex] = useState<number>(-1);
  const [textSelection, setTextSelection] = useState<any>({start: 0, end: 0});
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [irregularMessageIds, setIrregularMessageIds] = useState<any>([]);

  // メッセージが存在するページをfetch
  const fetchMessageSearch = useCallback(
    idMessage => {
      setTimeout(() => {
        const body = {
          id_room: idRoomChat,
          id_message: idMessage,
        };
        dispatch(fetchResultMessageActionListRoom(body));
      }, 1000);
    },
    [idRoomChat, dispatch],
  );

  // 返信・引用のオリジナルメッセージのタップ
  const navigateToMessage = useCallback(
    idMessage => {
      dispatch(saveIdMessageSearch(idMessage));
      setPageLoading(true);
    },
    [dispatch],
  );

  const navigateToDetail = useCallback(() => {
    navigation.navigate(ROUTE_NAME.INFO_ROOM_CHAT, {idRoomChat: idRoomChat});
  }, [idRoomChat, navigation]);

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
      attachment_files: message?.attachment_files,
      reply_to_message_files: message?.reply_to_message_files,
      reply_to_message_stamp: message?.reply_to_message_stamp,
      stamp_icon: message?.stamp_icon,
      reply_to_message_id: message?.reply_to_message_id,
      reply_to_message_user: message?.reply_to_message_user,
      reply_to_message_user_id: message?.reply_to_message_user_id,
      stamp_no: message?.stamp_no,
      index: index,
      users_seen: message?.users_seen,
      task: message?.task,
      task_message: message?.task_message,
      task_link: message?.task_link,
      message_quote: message?.message_quote,
      updated_at: message?.updated_at,
      quote_message_id: message?.quote_message_id,
      quote_message_user: message?.quote_message_user,
      quote_message_user_id: message?.quote_message_user_id,
    };
  }, []);

  const generateDatabaseDateTime = useCallback(date => {
    return date.toLocaleString().replace('T', ' ').substring(0, 19);
  }, []);

  const makeTemporallyDataMessage = useCallback(
    (tempData: any) => {
      let dateNow = new Date();
      const currentDatetime = generateDatabaseDateTime(dateNow);
      return [
        {
          id: 9999999999,
          room_id: tempData.room_id,
          from_id: tempData.from_id,
          user_send: {},
          message: tempData.message,
          type: null,
          msg_level: 0,
          msg_type: 0,
          message_quote: null,
          quote_message_id: null,
          quote_message_user: null,
          method: 0,
          stamp_no: null,
          stamp_icon: '',
          medthod: 0,
          created_at: currentDatetime,
          updated_at: currentDatetime,
          reactions: [],
          del_flag: '0',
          reply_to_message_id: tempData.reply_to_message_id,
          reply_to_message_text: null,
          reply_to_message_user: null,
          reply_to_message_user_id: null,
          reply_to_message_files: [],
          reply_to_message_stamp: {stamp_no: null, stamp_icon: null},
          task: null,
          task_message: null,
          task_link: null,
          attachment_files: [],
          users_seen: [],
        },
      ];
    },
    [generateDatabaseDateTime],
  );

  const getConvertedMessages = useCallback(
    (msgs: any) => {
      const messages = msgs?.filter((el: any) => !irregularMessageIds.includes(el?.id));
      return messages?.map((item: any, index: any) => {
        return convertDataMessage(item, index);
      });
    },
    [convertDataMessage, irregularMessageIds],
  );

  const chatUser = useMemo(() => {
    return {
      _id: user_id,
    };
  }, [user_id]);

  const getListChat = useCallback(
    async nextPage => {
      const data = {
        id: idRoomChat,
        page: nextPage,
      };
      await dispatch(getDetailListChat(data));
      setPage(nextPage);
    },
    [idRoomChat, dispatch],
  );

  const getDetail = useCallback(async () => {
    try {
      const response = await detailRoomchat(idRoomChat);
      setData(response?.data?.room);
      dispatch(isGetInfoRoom(false));
    } catch {}
  }, [idRoomChat, dispatch, isGetInfoRoom]);

  const onShowMenu = useCallback(() => {
    setVisible(!visible);
  }, [visible]);

  const deleteMsg = useCallback(
    async (id: any) => {
      try {
        setShowRedLine(false);
        GlobalService.showLoading();
        const res = await deleteMessageApi(id, idRoomChat);
        socket.emit('message_ind2', {
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
    [idRoomChat, dispatch, socket, user_id],
  );

  const showHideModalTagName = useCallback(() => {
    setShowTag(!showTagModal);
  }, [showTagModal]);

  const updateGimMessage = useCallback(
    async (id, status) => {
      try {
        await pinMessageApi(id, status);
        if (status === 0) {
          dispatch(pinMessage(null));
        } else {
          getListChat(page);
        }
      } catch (error: any) {}
    },
    [dispatch, getListChat, page],
  );

  const getCurrentPage = useCallback(() => {
    const res = store.getState();
    const currentPage = res.chat.pagingDetail.current_page;
    if (!page) {
      setPage(currentPage);
    }
    if (!topPage) {
      setTopPage(currentPage);
    }
    if (!bottomPage) {
      setBottomPage(currentPage);
    }
    return currentPage;
  }, [page, topPage, bottomPage]);

  const onLoadMore = useCallback(() => {
    const currentPage = getCurrentPage();
    const nextPage = topPage ? topPage + 1 : currentPage + 1;
    if (nextPage > paging?.last_page) {
      return;
    }
    setPage(nextPage);
    setTopPage(nextPage);
    setPageLoading(true);
  }, [topPage, paging, getCurrentPage]);

  const onLoadMoreDown = useCallback(() => {
    const currentPage = getCurrentPage();
    if (currentPage === 1 || bottomPage === 1) {
      return;
    }
    const nextPage = bottomPage
      ? Math.max(bottomPage - 1, 1)
      : Math.max(currentPage - 1, 1);
    setPage(nextPage);
    setBottomPage(nextPage);
    setPageLoading(true);
  }, [bottomPage, getCurrentPage]);

  const replyMessage = useCallback(
    (data: any) => {
      dispatch(saveMessageReply(data));
    },
    [dispatch],
  );

  const removeReplyMessage = useCallback(() => {
    dispatch(saveMessageReply(null));
  }, [dispatch]);

  const quoteMessage = useCallback(
    (data: any) => {
      dispatch(saveMessageQuote(data));
    },
    [dispatch],
  );

  const removeQuoteMessage = useCallback(() => {
    dispatch(saveMessageQuote(null));
  }, [dispatch]);

  const checkDeletedMension = useCallback(
    (formattedText1: any[]) => {
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
    },
    [formattedText],
  );

  /**
   * format method
   * @param inputText
   * @param fromTagFlg
   */
  const formatText = useCallback(
    (input: string, fromTagFlg: boolean) => {
      if (input.length === 0) {
        setFormattedText([]);
        return;
      }
      const words = input.split(' ');
      const newWords: string[] = [];
      words.forEach(word => {
        if (word.match('.+\n.+')) {
          const splitNewWord = word.split('\n');
          splitNewWord.forEach((s, index) => {
            if (index > 0) {
              newWords.push('\n');
            }
            newWords.push(s);
          });
        } else if (word.match('.+\n')) {
          const splitNewWord = word.split('\n');
          splitNewWord.forEach(s => {
            if (s !== '') {
              newWords.push(s);
            } else {
              newWords.push('\n');
            }
          });
        } else if (word.match('\n.+')) {
          newWords.push(word);
        } else if (word.match('　')) {
          const splitNewWord = word.split('　');
          splitNewWord.forEach((s, index) => {
            if (index > 0) {
              newWords.push(' ');
            }
            newWords.push(s);
          });
        } else {
          newWords.push(word);
        }
      });
      const formattedText1: (string | JSX.Element)[] = [];
      words.forEach((word, index) => {
        const isLastWord = index === words.length - 1;
        const includingList = mentionedUsers.filter((el: string) => {
          var re = new RegExp('^' + el + '', 'gi');
          var result = re.test(word);
          if (result) {
            return true;
          }
          return false;
        });
        if (!word.startsWith('@') || includingList.length === 0) {
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
    },
    [checkDeletedMension, mentionedUsers],
  );

  const getText = (formattedtext: (string | JSX.Element)[]) => {
    let context: string = '';
    formattedtext.forEach(element => {
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

  const editMessage = useCallback(
    (data: any) => {
      // setText(data?.text);
      formatText(data?.text + ' ', false);
      dispatch(saveMessageEdit(data));
    },
    [dispatch, formatText],
  );

  const removeEditMessage = useCallback(() => {
    dispatch(saveMessageEdit(null));
  }, [dispatch]);

  const reactionMessage = useCallback(
    async (data, id) => {
      setShowRedLine(false);
      const body = {
        message_id: id,
        reaction_no: data,
      };
      const res = await sendReactionApi(body);
      socket.emit('message_ind2', {
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
        editMessageAction({id: res?.data?.data?.id, data: res?.data?.data}),
      );
    },
    [dispatch, idRoomChat, socket, user_id],
  );

  const navigatiteToListReaction = useCallback(
    idMsg => {
      navigation.navigate(ROUTE_NAME.LIST_REACTION, {
        id: idMsg,
        room_id: idRoomChat,
      });
    },
    [idRoomChat, navigation],
  );

  const cancelModal = useCallback(() => {
    setPickFile(!pickFile);
  }, [pickFile]);

  const chosePhoto = () => {
    setShowRedLine(false);
    ImagePicker.openPicker({
      multiple: true,
    }).then(async images => {
      if (images?.length > 3) {
        cancelModal();
        showMessage({
          message: 'Maximum of 3 photos',
          type: 'danger',
        });
      } else {
        cancelModal();
        const mergedFiles = images.concat(chosenFiles);
        setchosenFiles(mergedFiles);
      }
    });
  };

  const choseFile = () => {
    setShowRedLine(false);
    DocumentPicker.pickMultiple({
      presentationStyle: 'fullScreen',
      copyTo: 'cachesDirectory',
    }).then(async file => {
      cancelModal();
      const mergedFiles = file.concat(chosenFiles);
      setchosenFiles(mergedFiles);
    });
  };

  const sendFile = useCallback(async () => {
    try {
      if (chosenFiles?.length > 0) {
        GlobalService.showLoading();
        // send files
        for (const item of chosenFiles) {
          let data = new FormData();
          if (item?.sourceURL || item?.path) {
            // in case of image
            let isHEIC =
              item?.sourceURL?.endsWith('.heic') ||
              item?.sourceURL?.endsWith('.HEIC') ||
              item?.path?.endsWith('.HEIC') ||
              item?.path?.endsWith('.HEIC');
            data.append('attachment[]', {
              fileName: item?.path?.replace(/^.*[\\/]/, ''),
              name: item?.path?.replace(/^.*[\\/]/, ''),
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
            data.append('msg_type', 2);
            data.append('room_id', idRoomChat);
            data.append('from_id', user_id);
            let res = await sendMessageApi(data);
            socket.emit('message_ind2', {
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
          } else {
            // in case of file
            data.append('attachment[]', {
              name: item?.name,
              type: item?.type,
              uri:
                Platform.OS === 'ios'
                  ? decodeURIComponent(item?.uri?.replace('file://', ''))
                  : decodeURIComponent(item?.fileCopyUri),
            });
            data.append('msg_type', 2);
            data.append('room_id', idRoomChat);
            data.append('from_id', user_id);
            const res = await sendMessageApi(data);
            socket.emit('message_ind2', {
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
          }

          giftedChatRef.current?._messageContainerRef?.current?.scrollToIndex({
            animated: true,
            index: 0,
          });
          GlobalService.hideLoading();
        }
        setchosenFiles([]);
      }
    } catch (error: any) {
      GlobalService.hideLoading();
    }
  }, [chosenFiles, dispatch, idRoomChat, socket, user_id]);

  const sendLabel = async (stamp_no: any) => {
    setShowTag(false);
    setShowModalStamp(false);
    setShowRedLine(false);
    try {
      const data = new FormData();
      data.append('room_id', idRoomChat);
      data.append('from_id', user_id);
      data.append('msg_level', 0);
      data.append('msg_type', 1);
      data.append('method', 0);
      data.append('stamp_no', stamp_no);
      const res = await sendLabelApi(data);
      socket.emit('message_ind2', {
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
  }, [idRoomChat, navigation]);

  const showModalStamp = useCallback(() => {
    setShowModalStamp(!modalStamp);
  }, [modalStamp]);

  const getUserListChat = useCallback(async () => {
    try {
      if (!idRoomChat) {
        throw new Error('idRoomChat is undefined.');
      }
      const result = await getListUser({room_id: idRoomChat, all: 1});
      setListUser(result?.data?.users?.data);
      setListUserRoot(result?.data?.users?.data);
    } catch (error) {
      console.error(error);
    }
  }, [idRoomChat]);

  const bookmarkMessage = useCallback(async (data: any) => {
    try {
      GlobalService.showLoading();
      await addBookmark(data);
      GlobalService.hideLoading();
      showMessage({
        message: 'ブックマークが正常に追加されました',
        type: 'success',
      });
    } catch {
      GlobalService.hideLoading();
    }
  }, []);

  const callApiChatBotRequest = useCallback(
    async (message: any, messageId: any, useName: any) => {
      try {
        const numberOfMember = listUserRoot.length;
        let listUserRootOnlyOne: {userId: number; userName: string}[] = [];
        if (numberOfMember < 1) {
          return null;
        } else if (numberOfMember === 1) {
          // in case of only 2 people in room(me and you only),  absolutely send bot notification to other.
          listUserRootOnlyOne = [
            {
              userId: listUserRoot[0].id,
              userName: listUserRoot[0].last_name + listUserRoot[0].first_name,
            },
          ];
          setListUserSelect(listUserRootOnlyOne);
        } else if (numberOfMember > 1) {
          // Nothing Done.
        }
        const formData = new FormData();
        formData.append('from_user_name', useName);
        formData.append(
          'mention_members',
          numberOfMember === 1
            ? JSON.stringify(convertArrUnique(listUserRootOnlyOne, 'userId'))
            : JSON.stringify(convertArrUnique(listUserSelect, 'userId')),
        );
        formData.append('message', message);
        formData.append('message_id', messageId);
        formData.append('room_id', idRoomChat);
        await callApiChatBot(formData);
      } catch (error) {}
    },
    [idRoomChat, listUserRoot, listUserSelect],
  );

  const sendMessage = useCallback(
    async mes => {
      setShowTag(false);
      setShowModalStamp(false);
      setShowRedLine(false);
      if (messageReply) {
        try {
          // 現在表示中のルームIDと返信元のルームIDが違う場合はエラー
          if (messageReply?.roomId !== idRoomChat) {
            showMessage({
              message: 'ルームIDが違います',
              type: 'danger',
            });
            return;
          }
          const data = new FormData();
          data.append('room_id', idRoomChat);
          data.append('from_id', user_id);
          data.append('message', mes[0]?.text?.split('\n').join('<br>'));
          data.append('reply_to_message_id', messageReply?.id);
          ids?.forEach((item: any) => {
            data.append('ids[]', item);
          });
          // at first show temporally data
          const tempData = {
            room_id: idRoomChat,
            from_id: user_id,
            message: mes[0]?.text?.split('\n').join('<br>'),
            reply_to_message_id: messageReply?.id,
          };
          dispatch(saveMessageReply(null));
          dispatch(
            getDetailMessageSocketSuccess(makeTemporallyDataMessage(tempData)),
          );
          const res = await replyMessageApi(data);
          socket.emit('message_ind2', {
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
          // next show real data
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
          socket.emit('message_ind2', {
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
            time2: res?.data?.data?.updated_at,
          });
          dispatch(saveMessageEdit(null));
          dispatch(
            editMessageAction({id: res?.data?.data?.id, data: res?.data?.data}),
          );
        } catch (error: any) {}
      } else if (messageQuote) {
        try {
          // 現在表示中のルームIDと引用元のルームIDが違う場合はエラー
          if (messageQuote?.roomId !== idRoomChat) {
            showMessage({
              message: 'ルームIDが違います',
              type: 'danger',
            });
            return;
          }
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
          socket.emit('message_ind2', {
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
          if (mes[0]?.text) {
            const data = new FormData();
            data.append('room_id', idRoomChat);
            data.append('from_id', mes[0]?.user?._id);
            data.append('message', mes[0]?.text?.split('\n').join('<br>'));
            ids?.forEach((item: any) => {
              data.append('ids[]', item);
            });
            const res = await sendMessageApi(data);
            socket.emit('message_ind2', {
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
            callApiChatBotRequest(
              res?.data?.data?.message,
              res?.data?.data?.id,
              `${res?.data?.data?.user_send?.last_name}${res?.data?.data?.user_send?.first_name}`,
            );
          }
        } catch (error: any) {}
      }
      if (listUser.length === 0) {
        getUserListChat();
      }
      socket.emit('notification_ind2', {
        user_id: mes[0]?.user?._id,
        room_id: idRoomChat,
        room_name: null,
        join_users: null,
        user_name: res?.data?.data?.user_send?.last_name + res?.data?.data?.user_send?.first_name,
        user_icon_url: res?.data?.data?.icon_image,
        client_name: null,
        message_text: res?.data?.data?.message,
        attachment: res?.data?.attachmentFiles,
        stamp_no: res?.data?.data?.stamp_no,
        to_info: listUser.map(el => el.id),
      });
      // send files
      if (chosenFiles?.length > 0) {
        await sendFile();
      }
      // Khi call api gửi tin nhắn xong sẽ auto scroll xuống tin nhắn cuối cùng
      giftedChatRef.current?._messageContainerRef?.current?.scrollToIndex({
        animated: true,
        index: 0,
      });
      setIds([]);
      // prevent from becoming blue character after sending mention message.
      const formattedText1: (string | JSX.Element)[] = [];
      formattedText1.push(' ');
      setFormattedText(formattedText1);
      formattedText1.shift();
      setFormattedText(formattedText1);
      // メッセージが送信完了の後、メッセージ入力のstateがemptyになる。
      setInputText('');
    },
    [
      messageReply,
      message_edit,
      ids,
      messageQuote,
      idRoomChat,
      chosenFiles,
      callApiChatBotRequest,
      dispatch,
      makeTemporallyDataMessage,
      sendFile,
      socket,
      user_id,
    ],
  );

  const onDecoSelected = (tagName: string) => {
    let newText = '';
    let tag = '[' + tagName + ']';
    if (tagName === 'hr') {
      newText =
        inputText.substring(0, textSelection.end) +
        tag +
        inputText.substring(textSelection.end);
    } else {
      // insert closing tags
      let closingTag = '[/' + tagName + ']';
      newText =
        inputText.substring(0, textSelection.end) +
        closingTag +
        inputText.substring(textSelection.end);
      // insert opening tags
      let openingTag = '[' + tagName + ']';
      newText =
        newText.substring(0, textSelection.start) +
        openingTag +
        newText.substring(textSelection.start);
    }

    setInputText(newText);
    setFormattedText([newText]);
  };

  const onCreateTask = useCallback(() => {
    setShowUserList(!showUserList);
  }, [showUserList]);

  const onSaveTask = useCallback(async input => {
    const data = {
      project_id: 1,
      item_id: 1,
      task_name: input.taskName,
      actual_start_date: moment().format('YYYY/MM/DD'),
      actual_start_time: '00:00:00',
      actual_end_date: moment(input.date).format('YYYY/MM/DD'),
      actual_end_time: input.time,
      plans_end_date: input.date,
      plans_end_time: input.time,
      plans_time: 0,
      actual_time: 0,
      plans_cnt: 0,
      actual_cnt: 0,
      cost: 0,
      task_person_id: input.selected,
      description: input.taskDescription,
      cost_flg: 0,
      remaindar_flg: 0,
      repeat_flag: 0,
      gcalendar_flg: input.isGoogleCalendar,
      all_day_flg: input.isAllDay,
      chat_room_id: input.chat_room_id,
    };
    const res = await saveTask(data);
    if (res.data?.errors) {
      showMessage({
        message: res.data?.errors
          ? JSON.stringify(res.data?.errors)
          : 'Network Error',
        type: 'danger',
      });
    } else {
      showMessage({
        message: '保存しました。',
        type: 'success',
      });
    }
    setShowTaskForm(false);
  }, []);

  const onUpdateTask = useCallback(async data => {
    await updateTask(data);
    setShowTaskForm(false);
  }, []);

  const deleteFile = useCallback(
    async sourceURL => {
      const chosenFilesDeleted = chosenFiles.filter(item => {
        if (
          item.sourceURL &&
          item.sourceURL !== sourceURL &&
          item.uri !== sourceURL &&
          item.path !== sourceURL &&
          typeof item !== 'undefined'
        ) {
          return item;
        }
      });
      setchosenFiles(chosenFilesDeleted);
    },
    [chosenFiles],
  );

  const customBack = useCallback(() => {
    navigation.navigate(ROUTE_NAME.LISTCHAT_SCREEN, {
      idRoomChat: idRoomChat,
    });
  }, [navigation, idRoomChat]);

  useEffect(() => {
    function onKeyboardDidShow(e: KeyboardEvent) {
      // Remove type here if not using TypeScript
      setKeyboardHeight(e.endCoordinates.height);
    }
    function onKeyboardDidHide() {
      setKeyboardHeight(0);
    }
    const showSubscription = Keyboard.addListener(
      'keyboardDidShow',
      onKeyboardDidShow,
    );
    const hideSubscription = Keyboard.addListener(
      'keyboardDidHide',
      onKeyboardDidHide,
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!pageLoading) {
      return;
    }
    if (!idMessageSearch) {
      // 通常画面遷移/onLoadMore/onLoadMoreDown
      if (!paging?.current_page || page !== paging?.current_page) {
        getListChat(page);
        getDetail();
      }
      setPageLoading(false);
    } else if (idMessageSearch > 0) {
      const index = listChat.findIndex(
        (element: any) => element?.id === idMessageSearch,
      );
      if (index && index >= 0) {
        try {
          giftedChatRef.current?._messageContainerRef?.current?.scrollToIndex({
            animated: true,
            index: Math.max(index - 1, 0),
          });
          dispatch(saveIdMessageSearch(0));
          setPageLoading(false);
        } catch (error) {
          console.log(error);
        }
      } else {
        // メッセージが存在するページをloadしていない場合、fetch
        fetchMessageSearch(idMessageSearch);
      }
    }
  }, [
    route,
    page,
    pageLoading,
    dispatch,
    fetchMessageSearch,
    getDetail,
    getListChat,
    idMessageSearch,
    listChat,
    paging?.current_page,
  ]);

  // 他画面からの遷移、メッセージへスクロール
  useEffect(() => {
    if (idMessageSearchListChat > 0) {
      setTimeout(() => {
        dispatch(saveIdMessageSearch(idMessageSearchListChat));
        setPageLoading(true);
      }, 1000);
    }
  }, [idMessageSearchListChat, dispatch]);

  // 未読メッセージが存在するページをfetch
  useEffect(() => {
    if (redLineId) {
      const index = listChat.findIndex(
        (element: any) => element?.id === redLineId,
      );
      if (index > 0) {
        setIndexRedLine(index);
      }
      setTimeout(() => {
        const body = {
          id_room: idRoomChat,
          id_message: redLineId,
        };
        dispatch(fetchResultMessageActionRedLine(body));
      }, 1000);
    } else {
    }
  }, [redLineId, dispatch, idRoomChat, listChat]);

  // WebSocket
  useEffect(() => {
    if (isGetInfoRoom) {
      getDetail();
    }
  }, [isGetInfoRoom, getDetail]);

  // check if messages belongs to this room
  useEffect(() => {
    const res = store.getState();
    const currentPage = res.chat.pagingDetail?.current_page;
    if (idMessageSearch > 0 && page !== currentPage) {
      setPage(currentPage);
      setTopPage(currentPage);
      setBottomPage(currentPage);
      dispatch(saveIdMessageSearch(0));
    }
    if (idRoomChat && listChat.length > 0) {
      const irregular_message_ids: number[] = listChat.map((el: any) => {
        return idRoomChat !== el.room_id;
      });
      if (irregular_message_ids.length > 0) {
        setIrregularMessageIds(irregular_message_ids);
      }
    }
  }, [listChat, pageLoading, dispatch, idMessageSearch, idRoomChat, page]);

  // showTagModal
  useEffect(() => {
    if (showTagModal) {
      getUserListChat();
    }
  }, [showTagModal, getUserListChat]);

  // 画面にFocusがあたった/外れた、他依存の際に発火
  // 必要な処理か不明なので無効化
  // useFocusEffect(
  //   useCallback(() => {
  //     if (idRoomChat) {
  //       getDetail();
  //     }
  //   }, []),
  // );

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
  }, [message_edit, messageReply, messageQuote, dispatch]);

  useEffect(() => {
    if (modalStamp === true) {
      removeReplyMessage();
      removeEditMessage();
      removeQuoteMessage();
    }
  }, [modalStamp, removeEditMessage, removeQuoteMessage, removeReplyMessage]);

  useEffect(() => {
    setTimeout(() => {
      if (formattedText[0]?.props?.children === '') {
        formattedText.shift();
        setFormattedText([...formattedText]);
      }
    }, 10);
  }, [formattedText]);

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
    onLoadMoreDown,
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
    listUserRoot,
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
    showRedLine,
    redLineId,
    navigateToMessage,
    indexRedLine,
    onCreateTask,
    setShowTaskForm,
    showTaskForm,
    onSaveTask,
    onUpdateTask,
    setShowUserList,
    showUserList,
    selected,
    setSelected,
    setInputText,
    inputText,
    textSelection,
    setTextSelection,
    onDecoSelected,
    keyboardHeight,
    customBack,
    chosenFiles,
    deleteFile,
    setInputIndex,
    inputIndex,
  };
};

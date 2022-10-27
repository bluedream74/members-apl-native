import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {styles} from './styles';
import {Header, AppInput} from '@component';
import {iconSearch, iconAddListChat} from '@images';
import {Item} from './component/Item';
import {useFocusEffect} from '@react-navigation/native';
import {debounce} from 'lodash';
import {Menu} from 'react-native-material-menu';
import {MenuOption} from './component/MenuOption';
import {
  getRoomList,
  getUserInfo,
  saveIdRoomChat,
  saveMessageReply,
  resetDataChat,
  getUnreadMessageCount,
} from '@redux';
import {useDispatch, useSelector} from 'react-redux';
import {ModalSearchMessage} from './component/ModalSearchMessage';
import {useNavigation} from '@react-navigation/native';
import {ROUTE_NAME} from '@routeName';
import {AppNotification} from '@util';
import {colors} from '@stylesCommon';
import notifee, {EventType} from '@notifee/react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

const ListChat = () => {
  const refInput = useRef<any>(null);
  //Khởi tạo Firebase noti
  let {initFB} = AppNotification;
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const listRoom = useSelector((state: any) => state.chat.roomList);
  const paging = useSelector((state: any) => state.chat.pagingListRoom);

  const idCompany = useSelector((state: any) => state.chat.idCompany);
  const user = useSelector((state: any) => state.auth.userInfo);
  const [key, setKey] = useState<string>('');
  const [page, setPage] = useState(1);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showSearchMessage, setShowSearchMessage] = useState<boolean>(false);
  const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
  let unreadMessageCount = useSelector((state: any) =>
    state.chat?.unReadMessageCount === null
      ? 0
      : state.chat?.unReadMessageCount,
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(saveIdRoomChat(null));
      dispatch(saveMessageReply(null));
      dispatch(resetDataChat());
      dispatch(getRoomList({key: key, company_id: idCompany, page: 1}));
    }, []),
  );

  //Logic tính tổng các tin nhắn chưa đọc
  var countMessage = listRoom?.reduce(function (total: any, course: any) {
    return total + course.message_unread;
  }, 0);

  useEffect(() => {
    setIsLoadMore(false);
  }, [listRoom]);

  //Đây là hàm logic lắng nghe tổng các tin nhắn chưa đọc, nếu có kết quả thì set lại badge noti
  useEffect(() => {
    if (countMessage > 0) {
      notifee.setBadgeCount(countMessage);
    } else {
      notifee.setBadgeCount(0);
    }
  }, [countMessage]);

  useEffect(() => {
    initFB();
    if (user?.id) {
      dispatch(getUserInfo(user?.id));
    }
  }, []);

  useEffect(() => {
    try {
      if (page > 1) {
        dispatch(getRoomList({key: key, company_id: idCompany, page: page}));
      }
    } catch (err) {
    } finally {
      // setIsLoadMore(false);
    }
  }, [page]);

  const debounceText = useCallback(
    debounce(
      text =>
        dispatch(getRoomList({key: text, company_id: idCompany, page: page})),
      500,
    ),
    [],
  );

  const onRefresh = useCallback(() => {
    setPage(1);
    dispatch(getRoomList({key: key, company_id: idCompany, page: 1}));
  }, [page, idCompany]);

  const onChangeText = (text: any) => {
    setKey(text);
    debounceText(text);
  };
  const renderItem = ({item, index}: any) => {
    return <Item item={item} index={index} />;
  };

  const onCreate = useCallback(() => {
    navigation.navigate(ROUTE_NAME.CREATE_ROOM_CHAT, {typeScreen: 'CREATE'});
  }, []);

  const handleLoadMore = () => {
    if (page === paging?.last_page) {
      null;
    } else {
      setPage(prevPage => prevPage + 1);
      setIsLoadMore(true);
    }
  };

  const onShowOption = useCallback(() => {
    setShowMenu(!showMenu);
  }, [showMenu]);

  const onSearchRoom = useCallback(() => {
    setShowMenu(false);
    setTimeout(() => {
      refInput?.current?.focusInput();
    }, 500);
  }, []);

  const onSearchMessage = useCallback(() => {
    setShowMenu(false);
    setTimeout(() => {
      setShowSearchMessage(true);
    }, 500);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowSearchMessage(!showSearchMessage);
  }, [showSearchMessage]);

  return (
    <View style={styles.container}>
      <Header
        title="チャットグループ一覧"
        imageCenter
        onRightFirst={onCreate}
        iconRightFirst={iconAddListChat}
        styleIconRightFirst={styles.colorIcon}
      />
      <View style={styles.viewContent}>
        <AppInput
          ref={refInput}
          placeholder="グループ名、メッセージ内容を検索"
          onChange={onChangeText}
          value={key}
          styleContainer={styles.containerSearch}
          styleInput={styles.input}
          icon={iconSearch}
          styleIcon={styles.icon}
          showObtion={true}
          onShowOption={onShowOption}
        />
        {/* Popup điều hướng khi chọn search tin nhắn hoặc tên phòng */}
        <View style={styles.viewOption}>
          <Menu
            style={styles.containerMenu}
            visible={showMenu}
            onRequestClose={onShowOption}
            key={1}>
            <MenuOption
              onSearchRoom={onSearchRoom}
              onSearchMessage={onSearchMessage}
            />
          </Menu>
        </View>
        <FlatList
          data={listRoom}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.txtEmpty}>データなし</Text>}
          onEndReachedThreshold={0.01}
          onEndReached={handleLoadMore}
          ListFooterComponent={
            <>
              {isLoadMore === true ? (
                <View style={styles.viewLoadmore}>
                  <ActivityIndicator color={colors.primary} size="small" />
                </View>
              ) : null}
            </>
          }
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={onRefresh} />
          }
        />
      </View>
      <ModalSearchMessage
        visible={showSearchMessage}
        onClose={onCloseModal}
        keySearch={key}
      />
    </View>
  );
};

export {ListChat};
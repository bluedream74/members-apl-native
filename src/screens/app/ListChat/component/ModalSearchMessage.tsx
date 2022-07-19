import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
  Text,
} from 'react-native';
import {Header, AppInput} from '@component';
import {stylesCommon, colors} from '@stylesCommon';
import {scale, moderateScale, verticalScale} from 'react-native-size-matters';
import {iconSearch} from '@images';
import {ItemSearchMessage} from './ItemSearch';
import {debounce} from 'lodash';
import {searchMessageListRoom} from '@services';
import {useNavigation} from '@react-navigation/native';
import {ROUTE_NAME} from '@routeName';
import {useSelector} from 'react-redux';

const width = Dimensions.get('window').width;

const ModalSearchMessage = React.memo((prop: any) => {
  const navigation = useNavigation<any>();
  const {visible, onClose, keySearch} = prop;
  const idCompany = useSelector((state: any) => state.chat.idCompany);

  const [key, setKey] = useState<string>('');
  const [listMessage, setList] = useState([]);
  const [total, setTotal] = useState(null);
  const [lastPage, setLastPage] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (visible === false) {
      setList([]);
      setKey('');
      setTotal(null);
      setLastPage(null);
      setPage(1);
    } else {
      setKey(keySearch);
    }
  }, [visible]);

  useEffect(() => {
    const params = {
      page: page,
      key: keySearch,
      idCompany: idCompany,
    };
    callApiSearch(params);
  }, [keySearch]);

  const onClickItem = (value: any) => {
    onClose();
    navigation.navigate(ROUTE_NAME.DETAIL_CHAT, {
      idRoomChat: value?.room_id,
      idMessageSearchListChat: value?.id,
    });
  };

  const renderItem = ({item}: any) => (
    <ItemSearchMessage item={item} onClickItem={() => onClickItem(item)} />
  );

  const callApiSearch = async (params: any) => {
    try {
      if (params?.key?.length > 0) {
        const res = await searchMessageListRoom(params);
        setTotal(res?.data?.search_messages?.paging?.total);
        setLastPage(res?.data?.search_messages?.paging?.last_page);
        setList(
          params?.page === 1
            ? res?.data?.search_messages?.data
            : listMessage.concat(res?.data?.search_messages?.data),
        );
      } else {
        setLastPage(null);
        setList([]);
        setPage(1);
        setTotal(null);
      }
    } catch (error: any) {}
  };

  const debounceText = useCallback(
    debounce(text => {
      setPage(1);
      const params = {
        page: 1,
        key: text,
        idCompany: idCompany,
      };
      callApiSearch(params);
    }, 500),
    [idCompany],
  );

  const onChangeText = (text: any) => {
    setKey(text);
    debounceText(text);
  };

  useEffect(() => {
    if (page > 1) {
      const params = {
        page: page,
        key: key,
        idCompany: idCompany,
      };
      callApiSearch(params);
    }
  }, [page]);

  const handleLoadMore = useCallback(() => {
    if (page !== lastPage) {
      setPage(prevPage => prevPage + 1);
    } else {
      null;
    }
  }, [page, lastPage]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={() => {}}
      animationType="fade">
      <View style={styles.containerModal}>
        <Header title="メッセージ検索" back imageCenter customBack={onClose} />
        <View style={styles.viewContent}>
          <AppInput
            placeholder="メッセージ内容を検索"
            onChange={onChangeText}
            value={key}
            styleContainer={styles.containerSearch}
            styleInput={styles.input}
            icon={iconSearch}
            styleIcon={styles.icon}
          />
          {total ? (
            <View style={styles.viewRow}>
              <Text style={styles.txtTitleTotal}>結果: </Text>
              <Text style={styles.txtTotal}>{total} メッセージ</Text>
            </View>
          ) : null}
          <FlatList
            data={listMessage}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={<Text style={styles.txtEmpty}>データなし</Text>}
            onEndReachedThreshold={0.01}
            onEndReached={handleLoadMore}
          />
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  containerModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  viewContent: {
    ...stylesCommon.viewContainer,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    // paddingHorizontal: scale(16),
  },
  containerSearch: {
    marginTop: verticalScale(20),
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(13),
    width: width - scale(32),
    marginLeft: scale(16),
  },
  input: {
    paddingVertical: verticalScale(10),
    fontSize: moderateScale(14),
    ...stylesCommon.fontWeight500,
  },
  icon: {
    width: moderateScale(15),
    height: moderateScale(15),
    tintColor: colors.border,
  },
  txtEmpty: {
    textAlign: 'center',
    marginTop: verticalScale(20),
    color: colors.darkGrayText,
    ...stylesCommon.fontWeight600,
    fontSize: moderateScale(18),
  },
  colorIcon: {
    tintColor: colors.darkGrayText,
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(3),
    width: width - scale(32),
  },
  txtTitleTotal: {
    color: colors.darkGrayText,
    ...stylesCommon.fontWeight600,
    fontSize: moderateScale(16),
  },
  txtTotal: {
    color: colors.primary,
    ...stylesCommon.fontWeight500,
    fontSize: moderateScale(14),
  },
});

export {ModalSearchMessage};

import React, {useState, useCallback, useEffect} from 'react';
import {View, Text, FlatList} from 'react-native';
import {styles} from './styles';
import {Header} from '@component';
import {useSelector} from 'react-redux';
import {GlobalService, getListTask, finishTask} from '@services';
import {useFocusEffect} from '@react-navigation/native';
import {Accordion} from './component/Accordion';
import {ModalTask} from '../../DetailChat/components/ModalTask';
import {ModalUserList} from '../../DetailChat/components/ModalUserList';
import {useFunction} from './useFunction';
import { showMessage } from "react-native-flash-message";

const Task = (props: any) => {
  // custom hook logic
  const {setShowTaskForm, showTaskForm, onUpdateTask, selected, setSelected, reload} = useFunction(props);
  const idCompany = useSelector((state: any) => state.chat.idCompany);
  const {route} = props;
  const {idRoom_chat} = route?.params;
  const [listTask, setList] = useState([]);
  const [specificItem, setSpecificItem] = useState(null);
  const [total, setTotal] = useState(null);
  const [lastPage, setLastPage] = useState(1);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false)
  const stat = {
    STATUS_NOT_START: 0,
    STATUS_IN_PROGRESS: 1,
    STATUS_DONE: 2,
    STATUS_CONFIRMATION: 3,
    STATUS_BEFORE: 4,
  };

  const callApiSearch = async (params: any) => {
    try {
      GlobalService.showLoading();
      const res = await getListTask(params);
      setTotal(res?.data?.tasks?.total);
      setLastPage(res?.data?.tasks?.last_page);
      setList(
        params?.page === 1
          ? res?.data?.tasks?.data
          : listTask.concat(res?.data?.tasks?.data),
      );
      GlobalService.hideLoading();
    } catch (error: any) {
      GlobalService.hideLoading();
    }
  };

  useFocusEffect(
    useCallback(() => {
      const params = {
        page: 1,
        idCompany: idCompany,
        idRoomChat: idRoom_chat,
      };
      callApiSearch(params);
    }, []),
  );

  useEffect(() => {
    if (page > 1) {
      const params = {
        page: page,
        idCompany: idCompany,
        idRoomChat: idRoom_chat,
      };
      callApiSearch(params);
    }
  }, [page]);

  useEffect(() => {
    setTimeout(() => {
      const params = {
        page: page,
        idCompany: idCompany,
        idRoomChat: idRoom_chat,
      };
      callApiSearch(params);
    }, 500);
  }, [reload]);

  const handleLoadMore = useCallback(() => {
    console.log('hosotanidebug333');
    console.log(page);
    console.log(lastPage);
    if (page < lastPage) {
      setPage(prevPage => prevPage + 1);
    }
  }, [page, lastPage]);
  const onFinishTask = useCallback(async input => {
    const data = {
      ...input,
      stat: stat.STATUS_DONE,
    };
    const res = await finishTask(data);
    console.log(res);
    if (res.data?.errors) {
      showMessage({
        message: res.data?.errors ? JSON.stringify(res.data?.errors) : 'Network Error',
        type: 'danger',
      });
    } else {
      showMessage({
        message: '保存しました。',
        type: 'success',
      });
    }
  }, []);

  const renderItem = ({item}: any) => (
    <Accordion
      item={item}
      onFinishTask={onFinishTask}
      setShowTaskForm={setShowTaskForm}
      showTaskForm={showTaskForm}
      setSpecificItem={setSpecificItem}
      specificItem={specificItem}
    />
  );

  return (
    <View style={styles.container}>
      <View style={showTaskForm ? [styles.blackout] : []} />
      <View style={showTaskForm ? [styles.displayNone] : []}>
        <Header title="タスク一覧" back imageCenter />
        <View style={styles.viewContent}>
          <FlatList
            data={listTask}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={<Text style={styles.txtEmpty}>データなし</Text>}
            onEndReachedThreshold={0.01}
            onEndReached={handleLoadMore}
            contentContainerStyle={{paddingBottom: 300}}
          />
        </View>
      </View>
      <ModalTask
        visible={showTaskForm}
        onCancel={() => setShowTaskForm(false)}
        onUpdateTask={onUpdateTask}
        idRoomChat={idRoom_chat}
        item={specificItem}
        selected={selected}
        setSelected={setSelected}
      />
    </View>
  );
};

export {Task};

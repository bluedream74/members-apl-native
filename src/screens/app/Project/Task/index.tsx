import React, {useState, useCallback, useEffect} from 'react';
import {View, Text, FlatList} from 'react-native';
import {styles} from './styles';
import {Header} from '@component';
import {useSelector} from 'react-redux';
import {GlobalService, getListTask, finishTask} from '@services';
import {useFocusEffect} from '@react-navigation/native';
import {Accordion} from './component/Accordion';
import {ModalTask} from '../../DetailChat/components/ModalTask';
import {useFunction} from '../../DetailChat/useFunction';

const Task = (props: any) => {
  // custom hook logic
  const {idRoomChat, setShowTaskForm, showTaskForm, onUpdateTask} =
    useFunction(props);
  const idCompany = useSelector((state: any) => state.chat.idCompany);
  const [listTask, setList] = useState([]);
  const [specificItem, setSpecificItem] = useState(null);
  const [total, setTotal] = useState(null);
  const [lastPage, setLastPage] = useState(1);
  const [page, setPage] = useState(1);
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
        task_linked_myself: 1,
      };
      callApiSearch(params);
    }, []),
  );

  useEffect(() => {
    if (page > 1) {
      const params = {
        page: page,
        idCompany: idCompany,
        task_linked_myself: 1,
      };
      callApiSearch(params);
    }
  }, [page]);

  const handleLoadMore = useCallback(() => {
    if (page < lastPage) {
      setPage(prevPage => prevPage + 1);
    } else {
      null;
    }
  }, [page, lastPage]);
  const onFinishTask = useCallback(async input => {
    const data = {
      ...input,
      stat: stat.STATUS_DONE,
    };
    await finishTask(data);
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
            contentContainerStyle={{paddingBottom: 100}}
          />
        </View>
      </View>
      <ModalTask
        visible={showTaskForm}
        onCancel={() => setShowTaskForm(false)}
        onUpdateTask={onUpdateTask}
        idRoomChat={idRoomChat}
        item={specificItem}
      />
    </View>
  );
};

export {Task};

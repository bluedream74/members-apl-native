import React, {useState, useCallback, useEffect} from 'react';
import {View, Text, FlatList, RefreshControl} from 'react-native';
import {styles} from './styles';
import {Header} from '@component';
import {useSelector} from 'react-redux';
import {GlobalService, getListTask, finishTask} from '@services';
import {Accordion} from './component/Accordion';
import {ModalTask} from '../../DetailChat/components/ModalTask';
import {useFunction} from './useFunction';
import {showMessage} from 'react-native-flash-message';

const taskStatus = {
  STATUS_NOT_START: 0,
  STATUS_IN_PROGRESS: 1,
  STATUS_DONE: 2,
  STATUS_CONFIRMATION: 3,
  STATUS_BEFORE: 4,
};

const Task = (props: any) => {
  const {
    setShowTaskForm,
    showTaskForm,
    onUpdateTask,
    selected,
    setSelected,
    reload,
    setReload,
  } = useFunction();
  const idCompany = useSelector((state: any) => state.chat.idCompany);
  const {route} = props;
  const {idRoom_chat} = route?.params;
  const [listTask, setList] = useState<any[]>([]);
  const [specificItem, setSpecificItem] = useState<any>(null);
  const [lastPage, setLastPage] = useState(1);
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState<number | null>(null);

  const callApiSearch = useCallback(
    async (params: any) => {
      try {
        GlobalService.showLoading();
        const res = await getListTask(params);
        setLastPage(res?.data?.tasks?.last_page);
        setList(
          params?.page === 1
            ? res?.data?.tasks?.data
            : listTask.concat(res?.data?.tasks?.data),
        );
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      } finally {
        GlobalService.hideLoading();
      }
    },
    [listTask],
  );

  useEffect(() => {
    if (page && page !== currentPage) {
      setCurrentPage(page);
      const params = {
        page: page,
        idCompany: idCompany,
        idRoomChat: idRoom_chat,
      };
      callApiSearch(params);
    }
  }, [page, currentPage, callApiSearch, idCompany, idRoom_chat]);

  const handleLoadMore = useCallback(() => {
    if (page < lastPage) {
      setPage(prevPage => prevPage + 1);
    }
  }, [page, lastPage]);

  const onRefresh = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const onFinishTask = useCallback(
    async input => {
      if (reload) {
        return;
      }
      setReload(true);
      const data = {
        ...input,
        stat: taskStatus.STATUS_DONE,
      };
      const res = await finishTask(data);
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
        setPage(1);
        setCurrentPage(null);
      }
      setReload(false);
    },
    [reload, setReload],
  );

  const renderItem = ({item}: any) => (
    <Accordion
      key={item.id}
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
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={onRefresh} />
            }
          />
        </View>
      </View>
      <ModalTask
        visible={showTaskForm}
        onCancel={() => setShowTaskForm(false)}
        onUpdateTask={onUpdateTask}
        onUpdateTaskCallback={() => {
          setPage(1);
          setCurrentPage(null);
        }}
        idRoomChat={idRoom_chat}
        item={specificItem}
        selected={selected}
        setSelected={setSelected}
      />
    </View>
  );
};

export {Task};

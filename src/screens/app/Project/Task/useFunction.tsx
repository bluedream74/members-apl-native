import React, {useState, useCallback} from 'react';
import {
  saveTask,
  updateTask,
} from '@services';
import {showMessage} from 'react-native-flash-message';

export const useFunction = (props: any) => {
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [showUserList, setShowUserList] = useState<boolean>(false);
  const [selected, setSelected] = useState<any>([]);
  const [reload, setReload] = useState<boolean>(false);
  const onCreateTask = useCallback(() => {
    setShowUserList(!showUserList);
  }, []);
  const onSaveTask = useCallback(async input => {
    setShowTaskForm(false);
    const data = {
      project_id: 1,
      item_id: 1,
      task_name: input.taskName,
      actual_start_date: null,
      actual_end_date: input.date,
      plans_end_date: input.date,
      plans_end_time: input.time + ':00',
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
  const onUpdateTask = useCallback(async data => {
    setShowTaskForm(false);
    setReload(!reload);
    const res = await updateTask(data);
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
    //
  }, []);

  return {
    onCreateTask,
    setShowTaskForm,
    showTaskForm,
    onSaveTask,
    onUpdateTask,
    setShowUserList,
    showUserList,
    selected,
    setSelected,
    reload,
  };
};

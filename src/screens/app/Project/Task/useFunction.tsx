import {useState, useCallback} from 'react';
import {updateTask} from '@services';
import {showMessage} from 'react-native-flash-message';

export const useFunction = () => {
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [showUserList, setShowUserList] = useState<boolean>(false);
  const [selected, setSelected] = useState<any>([]);
  const [reload, setReload] = useState<boolean>(false);

  const onCreateTask = useCallback(() => {
    setShowUserList(!showUserList);
  }, [showUserList]);

  const onUpdateTask = useCallback(
    async data => {
      if (reload) {
        return;
      }
      setReload(true);
      setShowTaskForm(false);
      const res = await updateTask(data);
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
      setReload(false);
    },
    [reload],
  );

  return {
    onCreateTask,
    setShowTaskForm,
    showTaskForm,
    onUpdateTask,
    setShowUserList,
    showUserList,
    selected,
    setSelected,
    reload,
    setReload,
  };
};

import {useDispatch, useSelector} from 'react-redux';
import {getRoomList} from '@redux';

export const useUnreadMessage = () => {
  const dispatch = useDispatch();
  const idCompany = useSelector((state: any) => state.chat.idCompany);
  const type_Filter = useSelector((state: any) => state.chat.type_Filter);
  const categoryID_Filter = useSelector(
    (state: any) => state.chat.categoryID_Filter,
  );

  const updateUnreadMessageCount = () => {
    // update list chat unread message count
    dispatch(
      getRoomList({
        key: null,
        company_id: idCompany,
        page: 1,
        type: type_Filter,
        category_id: categoryID_Filter,
      }),
    );
  };

  return {updateUnreadMessageCount} as const;
};

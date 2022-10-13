import {typeChat} from './type';
import {INITIAL_STATE_CHAT} from './state';
import {convertArrUnique} from '@util';

export default function chatReducer(state = INITIAL_STATE_CHAT, action: any) {
  switch (action.type) {
    case typeChat.SAVE_ID_COMPANY:
      return {
        ...state,
        idCompany: action.payload,
      };
    case typeChat.GET_ROOM_LIST_SUCCESS:
      let pageList = action.payload.paging?.current_page;
      return {
        ...state,
        roomList:
          pageList === 1
            ? action.payload.data
            : state.roomList.concat(action.payload.data),
        pagingListRoom: action.payload.paging,
      };
    case typeChat.GET_DETAIL_LIST_CHAT_SUCCESS:
      let page = action.payload.room_messages.paging?.current_page;
      return {
        ...state,
        detailChat:
          page === 1
            ? convertArrUnique(action.payload.room_messages.data, 'id')
            : convertArrUnique(
                state.detailChat.concat(action.payload.room_messages.data),
                'id',
              ),
        pagingDetail: action.payload.room_messages.paging,
        message_pinned: action.payload.message_pinned,
      };
    case typeChat.DELETE_MESSAGE:
      const {detailChat} = state;
      let data = [...detailChat];
      const index = data.findIndex(
        (element: any) => element?.id == action.payload,
      );
      if (index > -1) {
        data.splice(index, 1);
      }
      return {
        ...state,
        detailChat: data,
      };
    case typeChat.EDIT_MESSAGE:
      const array = [...state.detailChat];
      const indexEdit = array.findIndex(
        (element: any) => element?.id == action.payload.id,
      );
      if (indexEdit > -1) {
        array[indexEdit] = action.payload.data;
      }
      return {
        ...state,
        detailChat: array,
      };
    case typeChat.PIN_MESSAGE:
      return {
        ...state,
        message_pinned: action.payload,
      };
    case typeChat.SAVE_ID_ROOMCHAT:
      return {
        ...state,
        id_roomChat: action.payload,
      };
    case typeChat.GET_DETAIL_MESSAGE_SOCKET_SUCCESS:
      return {
        ...state,
        detailChat: action.payload.concat(state.detailChat),
      };
    case typeChat.SAVE_MESSAGE_REPLY:
      return {
        ...state,
        messageReply: action.payload,
      };
    case typeChat.SAVE_MESSAGE_EDIT:
      return {
        ...state,
        messageEdit: action.payload,
      };
    case typeChat.RESET_DATA:
      return {
        ...state,
        detailChat: [],
        pagingDetail: null,
        id_messageSearch: null,
      };
    case typeChat.RESULT_SEARCH_MESSAGE:
      return {
        ...state,
        detailChat: action.payload.data,
        pagingDetail: action.payload.paging,
      };
    case typeChat.SAVE_MESSAGE_SEARCH:
      return {
        ...state,
        id_messageSearch: action.payload,
      };
    case typeChat.GET_DETAIL_MESSAGE_SOCKET_SEEN_SUCCESS:
      const arrayListChat = [...state.detailChat];
      let dataNew = arrayListChat?.filter(
        (item: any) => item?.id === action?.payload?.id,
      );
      let dataSeen = arrayListChat?.filter(
        (item: any) => item?.id !== action?.payload?.id,
      );
      dataSeen?.forEach((itemData: any, indexData: any) => {
        let dataUser: any = [];
        if (itemData?.users_seen?.length > 0) {
          dataUser = [...itemData?.users_seen];
          const indexUser = dataUser.findIndex(
            (element: any) => element?.id == action.payload?.userID,
          );
          if (indexUser > -1) {
            dataUser.splice(indexUser, 1);
          }
        }
        dataSeen[indexData].users_seen = dataUser;
      });
      return {
        ...state,
        detailChat: dataNew?.concat(dataSeen),
      };
    case typeChat.IS_GET_INFO_ROOM:
      return {
        ...state,
        isGetInfoRoom: action.payload,
      };
    default:
      return state;
  }
}

import {typeChat} from './type';

export const getRoomList = (payload: any) => ({
  type: typeChat.GET_ROOM_LIST,
  payload,
});

export const getRoomListSuccess = (payload: any) => ({
  type: typeChat.GET_ROOM_LIST_SUCCESS,
  payload,
});

export const getDetailListChat = (payload: any) => ({
  type: typeChat.GET_DETAIL_LIST_CHAT,
  payload,
});

export const getDetailListChatSuccess = (payload: any) => ({
  type: typeChat.GET_DETAIL_LIST_CHAT_SUCCESS,
  payload,
});

export const saveIdCompany = (payload: any) => ({
  type: typeChat.SAVE_ID_COMPANY,
  payload,
});

export const deleteMessage = (payload: any) => ({
  type: typeChat.DELETE_MESSAGE,
  payload,
});

export const editMessageAction = (payload: any) => ({
  type: typeChat.EDIT_MESSAGE,
  payload,
});

export const pinMessage = (payload: any) => ({
  type: typeChat.PIN_MESSAGE,
  payload,
});

export const saveIdRoomChat = (payload: any) => ({
  type: typeChat.SAVE_ID_ROOMCHAT,
  payload,
});

export const getDetailMessageSocket = (payload: any) => ({
  type: typeChat.GET_DETAIL_MESSAGE_SOCKET,
  payload,
});

export const getDetailMessageSocketCurrent = (payload: any) => ({
  type: typeChat.GET_DETAIL_MESSAGE_SOCKET_CURRENT,
  payload,
});

export const getDetailMessageSocketSuccess = (payload: any) => ({
  type: typeChat.GET_DETAIL_MESSAGE_SOCKET_SUCCESS,
  payload,
});

export const saveMessageReply = (payload: any) => ({
  type: typeChat.SAVE_MESSAGE_REPLY,
  payload,
});

export const saveMessageEdit = (payload: any) => ({
  type: typeChat.SAVE_MESSAGE_EDIT,
  payload,
});

export const resetDataChat = () => ({
  type: typeChat.RESET_DATA,
});

export const fetchResultMessageAction = (payload: any) => ({
  type: typeChat.FETCH_RESULT_SEARCH_MESSAGE,
  payload,
});

export const fetchResultMessageActionListRoom = (payload: any) => ({
  type: typeChat.FETCH_RESULT_SEARCH_MESSAGE_LIST_ROOM,
  payload,
});

export const fetchResultMessageActionListFile = (payload: any) => ({
  type: typeChat.FETCH_RESULT_SEARCH_MESSAGE_LIST_FILE,
  payload,
});

export const fetchResultMessageSuccess = (payload: any) => ({
  type: typeChat.RESULT_SEARCH_MESSAGE,
  payload,
});

export const saveIdMessageSearch = (payload: any) => ({
  type: typeChat.SAVE_MESSAGE_SEARCH,
  payload,
});

export const updateMessageSeen = (payload: any) => ({
  type: typeChat.UPDATE_MESSAGE_SEEN,
  payload,
});

export const getDetailMessageSocketSeen = (payload: any) => ({
  type: typeChat.GET_DETAIL_MESSAGE_SOCKET_SEEN,
  payload,
});

export const getDetailMessageSocketSeenSuccess = (payload: any) => ({
  type: typeChat.GET_DETAIL_MESSAGE_SOCKET_SEEN_SUCCESS,
  payload,
});

export const isGetInfoRoom = (payload: any) => ({
  type: typeChat.IS_GET_INFO_ROOM,
  payload,
});

export const getUnreadMessageCount = (payload: any) => ({
  type: typeChat.GET_UNREAD_MESSAGE_COUNT_ALL,
  payload,
});

export const getUnreadMessageCountSuccess = (payload: any) => ({
  type: typeChat.GET_UNREAD_MESSAGE_COUNT_ALL_SUCCESS,
  payload,
});

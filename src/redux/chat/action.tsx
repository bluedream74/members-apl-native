import {typeChat} from './type';

//Action get ra list room chat
export const getRoomList = (payload: any) => ({
  type: typeChat.GET_ROOM_LIST,
  payload,
});

//Action get ra list room chat thành công
export const getRoomListSuccess = (payload: any) => ({
  type: typeChat.GET_ROOM_LIST_SUCCESS,
  payload,
});

//Action get ra các message trong 1 room chat
export const getDetailListChat = (payload: any) => ({
  type: typeChat.GET_DETAIL_LIST_CHAT,
  payload,
});

//Action get ra các message trong 1 room chat thành công
export const getDetailListChatSuccess = (payload: any) => ({
  type: typeChat.GET_DETAIL_LIST_CHAT_SUCCESS,
  payload,
});

//Action lưu ID của company vào redux
export const saveIdCompany = (payload: any) => ({
  type: typeChat.SAVE_ID_COMPANY,
  payload,
});

//Action xoá message
export const deleteMessage = (payload: any) => ({
  type: typeChat.DELETE_MESSAGE,
  payload,
});

//Action chỉnh sửa message
export const editMessageAction = (payload: any) => ({
  type: typeChat.EDIT_MESSAGE,
  payload,
});

//Action pin message lên top
export const pinMessage = (payload: any) => ({
  type: typeChat.PIN_MESSAGE,
  payload,
});

//Action lưu id room chat vào redux => cái này dùng để check xem có đang ở trong phòng chat hay không
export const saveIdRoomChat = (payload: any) => ({
  type: typeChat.SAVE_ID_ROOMCHAT,
  payload,
});

//Action dùng để get ra detail 1 message khi socket trả về id tin nhắn
export const getDetailMessageSocket = (payload: any) => ({
  type: typeChat.GET_DETAIL_MESSAGE_SOCKET,
  payload,
});

//Action dùng để get ra detail 1 message khi socket trả về id tin nhắn nhưng là của chính mình, xem file handle socket để rõ hơn
export const getDetailMessageSocketCurrent = (payload: any) => ({
  type: typeChat.GET_DETAIL_MESSAGE_SOCKET_CURRENT,
  payload,
});

//Action dùng để get ra detail 1 message khi socket trả về => thành công
export const getDetailMessageSocketSuccess = (payload: any) => ({
  type: typeChat.GET_DETAIL_MESSAGE_SOCKET_SUCCESS,
  payload,
});

//Action lưu tin nhắn reply vào redux
export const saveMessageReply = (payload: any) => ({
  type: typeChat.SAVE_MESSAGE_REPLY,
  payload,
});

//Action lưu tin nhắn edit vào redux
export const saveMessageEdit = (payload: any) => ({
  type: typeChat.SAVE_MESSAGE_EDIT,
  payload,
});

//Action lưu tin nhắn quote vào redux
export const saveMessageQuote = (payload: any) => ({
  type: typeChat.SAVE_MESSAGE_QUOTE,
  payload,
});

//Action dùng để reset toàn bộ các thông tin chat đc lưu trong redux
export const resetDataChat = () => ({
  type: typeChat.RESET_DATA,
});

//Action dùng để get ra kết quả search message
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

export const fetchResultMessageActionRedLine = (payload: any) => ({
  type: typeChat.FETCH_RESULT_SEARCH_MESSAGE_RED_LINE,
  payload,
});

//Action dùng để cập nhật tin nhắn cuối cùng trong room
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

export const updateMessageReaction = (payload: any) => ({
  type: typeChat.EDIT_MESSAGE_REACTION,
  payload,
});

export const getDetailRoomSocket = (payload: any) => ({
  type: typeChat.DETAIL_ROOM_SOCKET,
  payload,
});

export const getDetailRoomSocketSuccess = (payload: any) => ({
  type: typeChat.DETAIL_ROOM_SOCKET_SUCCESS,
  payload,
});

export const showHideModalFilterListChat = (payload: any) => ({
  type: typeChat.SHOW_HIDE_MODAL_FILTER_LISTCHAT,
  payload,
});

export const saveTypeFilter = (payload: any) => ({
  type: typeChat.SAVE_TYPE_FILTER,
  payload,
});

export const saveCategoryFilter = (payload: any) => ({
  type: typeChat.SAVE_CATEGORY_FILTER,
  payload,
});

export const saveStatusFilter = (payload: any) => ({
  type: typeChat.SAVE_STATUS_FILTER,
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

export const logMessage = (payload: any) => ({
  type: typeChat.LOG_MESSAGE,
  payload,
});

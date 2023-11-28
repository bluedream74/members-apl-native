import {put, takeLatest, select, takeEvery, call} from 'redux-saga/effects';
import {
  getRoomListSuccess,
  getDetailListChatSuccess,
  getDetailMessageSocketSuccess,
  deleteMessage,
  editMessageAction,
  getRoomList,
  fetchResultMessageSuccess,
  saveIdMessageSearch,
  updateMessageSeen,
  getDetailMessageSocketSeenSuccess,
  getDetailRoomSocketSuccess,
  getUnreadMessageCountSuccess,
} from './action';

import {typeChat} from './type';
import {
  getRoomListApi,
  getDetailChatApi,
  getMessageFromSocket,
  getResultSearchMessage,
  registerLastMessage,
  getUnreadMessageCountApi,
  GlobalService,
  detailRoomchat, logMessage,
} from "@services";

import {NavigationUtils} from '@navigation';
import {ROUTE_NAME} from '@routeName';
import {store} from '../store';
import {convertArrUnique} from '@util';
import {AppSocket} from '@util';

interface ResponseGenerator {
  result?: any;
  data?: any;
  code?: any;
}

export function* getRoomListSaga(action: any) {
  try {
    const result: ResponseGenerator = yield getRoomListApi(action?.payload);
    yield put(getRoomListSuccess(result?.data?.rooms));
  } catch (error) {
  } finally {
    GlobalService.hideLoading();
  }
}

export function* getDetailChatSaga(action: any) {
  try {
    const param = {
      id: action?.payload.id,
      page: action?.payload.page,
    };
    const result: ResponseGenerator = yield getDetailChatApi(param);
    yield put(getDetailListChatSuccess(result?.data));
    if (action?.payload.page === 1) {
      const data = {
        id_room: action?.payload.id,
        id_message: result?.data?.room_messages?.data[0]?.id ?? 0,
      };
      yield put(updateMessageSeen(data));
    }
  } catch (error) {
  } finally {
  }
}

export function* getDetailMessageSaga(action: any) {
  const state = store.getState();
  try {
    const body = {
      message_id: action.payload?.id_message,
    };
    const result: ResponseGenerator = yield getMessageFromSocket(body);
    const data = {
      id_room: state?.chat?.id_roomChat,
      id_message: action.payload?.id_message,
    };
    yield put(updateMessageSeen(data));
    //Check xoá tin nhắn
    if (result?.data?.message?.del_flag == 1) {
      yield put(deleteMessage(result?.data?.message?.id));
    } else {
      //Chỉnh sửa tin nhắn
      if (result?.data?.message?.medthod === 1) {
        yield put(
          editMessageAction({
            id: result?.data?.message?.id,
            data: result?.data?.message,
          }),
        );
      } else {
        //Chỉnh sửa tin nhắn
        if (action.payload?.message_type === 3) {
          yield put(
            editMessageAction({
              id: result?.data?.message?.id,
              data: result?.data?.message,
            }),
          );
        }
        //Check nếu còn trong phòng mà bị remove sẽ bị kích ra ngoài
        if (
          result?.data?.message?.msg_type === 10 &&
          state?.auth?.userInfo?.id === result?.data?.message?.from_id
        ) {
          NavigationUtils.navigate(ROUTE_NAME.LISTCHAT_SCREEN);
        } else {
          //Hành động nối tin nhắn vào mảng
          yield put(getDetailMessageSocketSuccess([result?.data?.message]));
        }
      }
    }
  } catch (error) {
  } finally {
  }
}

export function* editMessageReaction(action: any) {
  const state = store.getState();
  try {
    const body = {
      message_id: action.payload?.id_message,
    };
    const result: ResponseGenerator = yield getMessageFromSocket(body);
    const data = {
      id_room: state?.chat?.id_roomChat,
      id_message: action.payload?.id_message,
    };
    yield put(updateMessageSeen(data));
    if (result?.data?.message?.del_flag == 1) {
      yield put(deleteMessage(result?.data?.message?.id));
    } else {
      yield put(
        editMessageAction({
          id: result?.data?.message?.id,
          data: result?.data?.message,
        }),
      );
    }
  } catch (error) {
  } finally {
  }
}

export function* getDetailMessageSagaCurrent(action: any) {
  const state = store.getState();
  try {
    const body = {
      message_id: action.payload?.id_message,
    };
    const result: ResponseGenerator = yield getMessageFromSocket(body);
    if (
      result?.data?.message?.msg_type === 10 &&
      state?.auth?.userInfo?.id === result?.data?.message?.from_id
    ) {
      NavigationUtils.navigate(ROUTE_NAME.LISTCHAT_SCREEN);
    } else if (result?.data?.message?.msg_type === 4) {
      yield put(getRoomList({company_id: state?.chat?.idCompany}));
    }
  } catch (error) {
  } finally {
  }
}

export function* fetchResultMessageRedLine(action: any) {
  //Hàm xử lý cho việc tìm kiếm message
  try {
    const body = {
      id_room: action.payload.id_room,
      id_message: action.payload.id_message,
    };
    const res: ResponseGenerator = yield getResultSearchMessage(body);
    if (res?.code === 200 && res?.data?.room_messages) {
      const param = {
        id: action.payload.id_room,
        page: res?.data.pages,
      };
      const result: ResponseGenerator = yield getDetailChatApi(param);
      const valueSave = {
        data: convertArrUnique(
          res?.data?.room_messages?.data.concat(
            result?.data?.room_messages?.data,
          ),
          'id',
        ),
        paging: result?.data?.room_messages?.paging,
      };
      yield put(fetchResultMessageSuccess(valueSave));
      yield put(saveIdMessageSearch(action.payload.id_message));
    }
  } catch (error) {
  } finally {
  }
}

export function* fetchResultMessage(action: any) {
  //Hàm xử lý cho việc tìm kiếm message
  try {
    const body = {
      id_room: action.payload.id_room,
      id_message: action.payload.id_message,
    };
    const res: ResponseGenerator = yield getResultSearchMessage(body);
    if (res?.code === 200) {
      const param = {
        id: action.payload.id_room,
        page: res?.data.pages,
      };
      const result: ResponseGenerator = yield getDetailChatApi(param);
      const valueSave = {
        data: convertArrUnique(
          res?.data?.room_messages?.data.concat(
            result?.data?.room_messages?.data,
          ),
          'id',
        ),
        paging: result?.data?.room_messages?.paging,
      };
      yield put(fetchResultMessageSuccess(valueSave));
      yield put(saveIdMessageSearch(action.payload.id_message));
      NavigationUtils.goBack();
    }
  } catch (error) {
  } finally {
  }
}

export function* fetchResultMessageListFile(action: any) {
  try {
    const body = {
      id_room: action.payload.id_room,
      id_message: action.payload.id_message,
    };
    const res: ResponseGenerator = yield getResultSearchMessage(body);
    if (res?.code === 200) {
      const param = {
        id: action.payload.id_room,
        page: res?.data.pages,
      };
      const result: ResponseGenerator = yield getDetailChatApi(param);
      const valueSave = {
        data: convertArrUnique(
          res?.data?.room_messages?.data.concat(
            result?.data?.room_messages?.data,
          ),
          'id',
        ),
        paging: result?.data?.room_messages?.paging,
      };
      yield put(fetchResultMessageSuccess(valueSave));
      yield put(saveIdMessageSearch(action.payload.id_message));
      NavigationUtils.pop(2);
    }
  } catch (error) {
  } finally {
  }
}

export function* fetchResultMessageListRoom(action: any) {
  try {
    const body = {
      id_room: action.payload.id_room,
      id_message: action.payload.id_message,
    };
    const res: ResponseGenerator = yield getResultSearchMessage(body);
    if (res?.code === 200) {
      const param = {
        id: action.payload.id_room,
        page: res?.data.pages,
      };
      const result: ResponseGenerator = yield getDetailChatApi(param);
      const valueSave = {
        data: convertArrUnique(
          res?.data?.room_messages?.data.concat(
            result?.data?.room_messages?.data,
          ),
          'id',
        ),
        paging: result?.data?.room_messages?.paging,
      };
      yield put(fetchResultMessageSuccess(valueSave));
      yield put(saveIdMessageSearch(action.payload.id_message));
    }
  } catch (error) {
  } finally {
  }
}

function* updateMessageSeenSaga(action: any) {
  const state = store.getState();
  const user_id = state?.auth?.userInfo.id;
  const {getSocket} = AppSocket;
  const socket = getSocket();
  try {
    const body = {
      id_room: action.payload.id_room,
      id_message: action.payload.id_message,
    };
    const result: ResponseGenerator = yield registerLastMessage(body);
    yield socket.emit('connect_room_join_req2', {
      user_id: user_id,
      room_ids: [action.payload.id_room],
    });
    yield socket.emit('new_message_conf', {
      user_id: user_id,
      room_id: action.payload.id_room,
      task_id: null,
      message_id: action.payload.id_message,
    });
  } catch (error: any) {}
}

function* getDetailMessageSeen(action: any) {
  const body = {
    message_id: action.payload?.idMsg,
  };
  try {
    const result: ResponseGenerator = yield getMessageFromSocket(body);
    if (result?.data?.message?.del_flag == 1) {
    } else {
      if (result?.data?.message?.medthod === 1) {
      } else {
        yield put(
          editMessageAction({
            id: result?.data?.message?.id,
            data: result?.data?.message,
          }),
        );
        const infoEdit = {
          id: result?.data?.message?.id,
          userID: action?.payload?.idUser,
        };
        yield put(getDetailMessageSocketSeenSuccess(infoEdit));
      }
    }
  } catch (error: any) {}
}

function* getDetailRoomSocket(action: any) {
  try {
    const result: ResponseGenerator = yield detailRoomchat(action?.payload);
    yield put(getDetailRoomSocketSuccess(result?.data?.room));
  } catch (error: any) {}
}
export function* getUnreadMessageCountSaga() {
  try {
    const state = store.getState();
    const user_id = state?.auth?.userInfo.id;
    const result: ResponseGenerator = yield getUnreadMessageCountApi(user_id);
    yield put(getUnreadMessageCountSuccess(result?.data));
  } catch (error) {
  } finally {
    GlobalService.hideLoading();
  }
}
export function* logMessageSaga(action: any) {
  try {
    const body = {
      current_room_id: action.payload.current_room_id,
      irregular_message_ids: action.payload.irregular_message_ids,
    };
    const res: ResponseGenerator = yield logMessage(body);
  } catch (error) {
  } finally {
    GlobalService.hideLoading();
  }
}

export function* chatSaga() {
  yield takeEvery(typeChat.GET_ROOM_LIST, getRoomListSaga);
  yield takeEvery(typeChat.GET_DETAIL_LIST_CHAT, getDetailChatSaga);
  yield takeEvery(typeChat.GET_DETAIL_MESSAGE_SOCKET, getDetailMessageSaga);
  yield takeEvery(
    typeChat.GET_DETAIL_MESSAGE_SOCKET_CURRENT,
    getDetailMessageSagaCurrent,
  );
  yield takeEvery(
    typeChat.FETCH_RESULT_SEARCH_MESSAGE_RED_LINE,
    fetchResultMessageRedLine,
  );
  yield takeEvery(
    typeChat.FETCH_RESULT_SEARCH_MESSAGE_LIST_FILE,
    fetchResultMessageListFile,
  );
  yield takeEvery(
    typeChat.FETCH_RESULT_SEARCH_MESSAGE_LIST_ROOM,
    fetchResultMessageListRoom,
  );
  yield takeEvery(typeChat.UPDATE_MESSAGE_SEEN, updateMessageSeenSaga);
  yield takeEvery(
    typeChat.GET_DETAIL_MESSAGE_SOCKET_SEEN,
    getDetailMessageSeen,
  );
  yield takeEvery(typeChat.EDIT_MESSAGE_REACTION, editMessageReaction);
  yield takeEvery(typeChat.DETAIL_ROOM_SOCKET, getDetailRoomSocket);
  yield takeEvery(
    typeChat.GET_UNREAD_MESSAGE_COUNT_ALL,
    getUnreadMessageCountSaga,
  );
  // yield takeEvery(typeChat.LOG_MESSAGE, logMessageSaga);
}

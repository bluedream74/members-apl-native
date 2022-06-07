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
} from './action';

import {typeChat} from './type';
import {
  getRoomListApi,
  getDetailChatApi,
  getMessageFromSocket,
  getResultSearchMessage,
} from '@services';

import {NavigationUtils} from '@navigation';
import {ROUTE_NAME} from '@routeName';
import {store} from '../store';
import {convertArrUnique} from '@util';

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
  } catch (error) {
  } finally {
  }
}

export function* getDetailMessageSaga(action: any) {
  try {
    const body = {
      message_id: action.payload,
    };
    const result: ResponseGenerator = yield getMessageFromSocket(body);
    if (result?.data?.message?.del_flag == 1) {
      yield put(deleteMessage(result?.data?.message?.id));
    } else {
      if (result?.data?.message?.medthod === 1) {
        yield put(
          editMessageAction({
            id: result?.data?.message?.id,
            data: result?.data?.message,
          }),
        );
      } else {
        yield put(getDetailMessageSocketSuccess([result?.data?.message]));
      }
    }
  } catch (error) {
  } finally {
  }
}

export function* getDetailMessageSagaCurrent(action: any) {
  const state = store.getState();
  try {
    const body = {
      message_id: action.payload,
    };
    const result: ResponseGenerator = yield getMessageFromSocket(body);
    if (result?.data?.message?.msg_type === 10) {
      NavigationUtils.navigate(ROUTE_NAME.LISTCHAT_SCREEN);
    } else if (result?.data?.message?.msg_type === 4) {
      yield put(getRoomList({company_id: state?.chat?.idCompany}));
    }
  } catch (error) {
  } finally {
  }
}

export function* fetchResultMessage(action: any) {
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

export function* chatSaga() {
  yield takeEvery(typeChat.GET_ROOM_LIST, getRoomListSaga);
  yield takeEvery(typeChat.GET_DETAIL_LIST_CHAT, getDetailChatSaga);
  yield takeEvery(typeChat.GET_DETAIL_MESSAGE_SOCKET, getDetailMessageSaga);
  yield takeEvery(
    typeChat.GET_DETAIL_MESSAGE_SOCKET_CURRENT,
    getDetailMessageSagaCurrent,
  );
  yield takeEvery(typeChat.FETCH_RESULT_SEARCH_MESSAGE, fetchResultMessage);
}

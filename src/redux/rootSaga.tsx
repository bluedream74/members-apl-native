import {all, fork} from 'redux-saga/effects';

import {authSaga} from './auth';
import {chatSaga} from './chat';

function* rootSaga() {
  yield all([fork(authSaga), fork(chatSaga)]);
}

export default rootSaga;

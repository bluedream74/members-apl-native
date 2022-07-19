import {combineReducers} from 'redux';
import auth from './auth/reducer';
import chat from './chat/reducer';

const appReducer = combineReducers({
  auth,
  chat,
});

export type RootState = ReturnType<typeof appReducer>;
export default appReducer;

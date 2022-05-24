import {io} from 'socket.io-client';
import {getRoomList, getDetailMessageSocket} from '@redux';
import {store} from '../redux/store';

function createAppSocket() {
  const socket = io('https://stage-v3mbs-msg01.mem-bers.jp:443');
  const state = store.getState();

  const init = () => {
    socket.on('connect', () => {
      console.log('Connected');
    });
    socket.on('message_ind', data => {
      console.log('message_ind', data);
    });
    socket.on('new_message_ind', data => {
      if (data?.user_id !== state?.auth.userInfo.id) {
        if (data?.room_id === state?.chat?.id_roomChat) {
          store.dispatch(getDetailMessageSocket(data?.message_id));
        } else {
          store.dispatch(getRoomList({company_id: state?.chat?.idCompany}));
        }
      } else {
        null;
      }
    });
  };

  const endConnect = () => {};

  return {
    init,
    endConnect,
    socket,
  };
}

export const AppSocket = createAppSocket();

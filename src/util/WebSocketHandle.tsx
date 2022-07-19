import {io, Socket} from 'socket.io-client';
import {
  getRoomList,
  getDetailMessageSocket,
  getDetailMessageSocketCurrent,
  getDetailMessageSocketSeen,
  isGetInfoRoom,
} from '@redux';
import {store} from '../redux/store';
import {EVENT_SOCKET} from '@util';

//socket no auth
// const socket = io('https://stage-v3mbs-msg01.mem-bers.jp:443', SOCKET_CONFIG);
//new url test server websocket
// const socket = io('https://v3mbs-msg01.sense.co.jp:443', SOCKET_CONFIG);
//socket with auth
// const socket = io('https://v3mbs-msg01.mem-bers.jp:443', SOCKET_CONFIG);

let socket = io('', {
  autoConnect: false,
});

function createAppSocket() {
  const init = (token?: string) => {
    let SOCKET_CONFIG = {
      autoConnect: false,
      auth: {
        token: token || store.getState()?.auth?.userInfo?.ws_token,
      },
    };
    socket = io('https://v3mbs-msg01.mem-bers.jp:443', SOCKET_CONFIG);
    socket.connect();
    onHanleEvent(socket);
  };

  const onHanleEvent = (socket: any) => {
    socket.on(EVENT_SOCKET.CONNECT, () => {
      console.log('CONNECTED', socket);
    });
    // socket.on(EVENT_SOCKET.NEW_MESSAGE_IND, (data: any) => {
    //   const state = store.getState();
    //   if (data?.user_id !== state?.auth?.userInfo?.id) {
    //     if (data?.room_id == state?.chat?.id_roomChat) {
    //       store.dispatch(getDetailMessageSocket(data?.message_id));
    //     } else {
    //     }
    //   } else {
    //     store.dispatch(getDetailMessageSocketCurrent(data?.message_id));
    //   }
    // });

    socket.on(EVENT_SOCKET.MESSAGE_IND, (data: any) => {
      const state = store.getState();
      if (data?.user_id !== state?.auth?.userInfo?.id) {
        if (data?.room_id == state?.chat?.id_roomChat) {
          if (data?.message_type === 3) {
            const value = {
              id_message: data?.relation_message_id,
              message_type: data?.message_type,
            };
            store.dispatch(getDetailMessageSocket(value));
          } else {
            const value = {
              id_message: data?.message_id,
              message_type: data?.message_type,
            };
            store.dispatch(getDetailMessageSocket(value));
          }
        }
      } else {
        if (data?.message_type === 3) {
          const value = {
            id_message: data?.relation_message_id,
            message_type: data?.message_type,
          };
          store.dispatch(getDetailMessageSocketCurrent(value));
        } else {
          const value = {
            id_message: data?.message_id,
            message_type: data?.message_type,
          };
          store.dispatch(getDetailMessageSocketCurrent(value));
        }
      }
    });

    socket.on(EVENT_SOCKET.CHAT_GROUP_UPDATE_IND, (data: any) => {
      const state = store.getState();
      if (data?.member_info?.ids?.includes(state?.auth?.userInfo?.id)) {
        if (data?.room_id == state?.chat?.id_roomChat) {
          if (data?.member_info?.type === 5) {
            store?.dispatch(isGetInfoRoom(true));
          }
        } else {
          store.dispatch(
            getRoomList({company_id: state?.chat?.idCompany, search: null}),
          );
        }
      } else {
        if (data?.room_id == state?.chat?.id_roomChat) {
          store?.dispatch(isGetInfoRoom(true));
        } else {
          store.dispatch(
            getRoomList({company_id: state?.chat?.idCompany, search: null}),
          );
        }
      }
    });

    socket.on(EVENT_SOCKET.NEW_MESSAGE_CONF, async (data: any) => {
      const state = store.getState();
      if (data?.user_id !== state?.auth?.userInfo?.id) {
        if (data?.room_id == state?.chat?.id_roomChat) {
          const body = {
            idMsg: data?.message_id,
            idUser: data?.user_id,
          };
          store.dispatch(getDetailMessageSocketSeen(body));
        } else {
        }
      } else {
      }
    });
    socket.on(EVENT_SOCKET.DISCONNECT, () => {});
  };
  const endConnect = () => {
    socket.disconnect();
  };

  const getSocket = () => {
    return socket;
  };

  return {
    init,
    endConnect,
    getSocket,
    onHanleEvent,
  };
}

export const AppSocket = createAppSocket();

import {io, Socket} from 'socket.io-client';
import {
  getRoomList,
  getDetailMessageSocket,
  getDetailMessageSocketCurrent,
  getDetailMessageSocketSeen,
  updateMessageReaction,
  saveIsGetInfoRoom,
  getDetailRoomSocket,
} from '@redux';
import {store} from '../redux/store';
import {EVENT_SOCKET} from '@util';

//socket stagging
//const socketURL = 'https://stage-v3mbs-msg01.mem-bers.jp:443';
//socket product
const socketURL = 'https://v3mbs-msg01.mem-bers.jp:443';

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
    socket = io(socketURL, SOCKET_CONFIG);
    socket.connect();
    onHanleEvent(socket);
  };

  const onHanleEvent = (socket: any) => {
    socket.on(EVENT_SOCKET.CONNECT, () => {});

    // 誰かがメッセージ送信&socketサーバに送信(NEW_MESSAGE_IND)->ここで受信
    // ルームリストの更新
    socket.on(EVENT_SOCKET.NEW_MESSAGE_IND, (data: any) => {
      console.log(EVENT_SOCKET.NEW_MESSAGE_IND, data)
      const state = store.getState();
      if (data?.room_id == state?.chat?.id_roomChat) {
        return null;
      } else {
        if (state?.chat?.roomList?.length > 0) {
          const dataList = [...state?.chat?.roomList];
          const index = dataList.findIndex(
            (element: any) => element?.id == data?.room_id,
          );
          if (index > -1) {
            store.dispatch(getDetailRoomSocket(data?.room_id));
          }
        }
      }
    });

    // 誰かがメッセージ送信&socketサーバに送信(MESSAGE_IND)->ここで受信
    // ルーム詳細の更新
    socket.on(EVENT_SOCKET.MESSAGE_IND, (data: any) => {
      console.log(EVENT_SOCKET.MESSAGE_IND, data)
      const state = store.getState();
      if (data?.user_id !== state?.auth?.userInfo?.id) {
        if (data?.room_id == state?.chat?.id_roomChat) {
          //Check tin nhắn về là dạng thả reaction
          if (data?.message_type === 3) {
            const value = {
              id_message: data?.relation_message_id,
              message_type: data?.message_type,
            };
            store.dispatch(updateMessageReaction(value));
          } else {
            //Dạng message nhận về bình thường
            const value = {
              id_message: data?.message_id,
              message_type: data?.message_type,
            };
            //Đây là sự kiện action redux khi nhận được 1 tin nhắn từ socket về
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
      console.log(EVENT_SOCKET.CHAT_GROUP_UPDATE_IND, data)
      const state = store.getState();
      if (data?.member_info?.ids?.includes(state?.auth?.userInfo?.id)) {
        if (data?.room_id == state?.chat?.id_roomChat) {
          if (data?.member_info?.type === 5) {
            store?.dispatch(saveIsGetInfoRoom(true));
          }
        } else {
          store.dispatch(
            getRoomList({
              company_id: state?.chat?.idCompany,
              search: null,
              type: state?.chat?.type_Filter,
              category_id: state?.chat?.categoryID_Filter,
            }),
          );
        }
      } else {
        if (data?.room_id == state?.chat?.id_roomChat) {
          store?.dispatch(saveIsGetInfoRoom(true));
        } else {
          store.dispatch(
            getRoomList({
              company_id: state?.chat?.idCompany,
              search: null,
              type: state?.chat?.type_Filter,
              category_id: state?.chat?.categoryID_Filter,
            }),
          );
        }
      }
    });

    socket.on(EVENT_SOCKET.NEW_MESSAGE_CONF, async (data: any) => {
      console.log(EVENT_SOCKET.NEW_MESSAGE_CONF, data)
      const state = store.getState();
      if (data?.user_id !== state?.auth?.userInfo?.id) {
        if (data?.room_id == state?.chat?.id_roomChat) {
          const body = {
            idMsg: data?.message_id,
            idUser: data?.user_id,
          };
          store.dispatch(getDetailMessageSocketSeen(body));
        } else {
          store.dispatch(
            getRoomList({
              company_id: state?.chat?.idCompany,
              search: null,
              type: state?.chat?.type_Filter,
              category_id: state?.chat?.categoryID_Filter,
            }),
          );
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

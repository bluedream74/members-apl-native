import {io} from 'socket.io-client';
import {
  getRoomList,
  getDetailMessageSocket,
  getDetailMessageSocketCurrent,
  getDetailMessageSocketSeen,
  updateMessageReaction,
  saveIsGetInfoRoom,
  getListUserChat,
  getDetailRoomSocket,
  registerRoomChat,
  updateRoomList,
} from '@redux';
import {store} from '../redux/store';
import {EVENT_SOCKET} from '@util';

//socket stagging
//const socketURL = 'https://stage-v3mbs-msg01.mem-bers.jp:443';
//socket product
const socketURL = 'https://v3mbs-msg01.mem-bers.jp:443';

let socketIO = io('', {
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
    socketIO = io(socketURL, SOCKET_CONFIG);
    socketIO.connect();
    onHanleEvent(socketIO);
  };

  const onHanleEvent = (socket: any) => {
    socket.on(EVENT_SOCKET.CONNECT, () => {});

    // 誰かがメッセージ送信&socketサーバに送信(NEW_MESSAGE_IND)->ここで受信
    // ルームリストの更新
    socket.on(EVENT_SOCKET.NEW_MESSAGE_IND, (data: any) => {
      console.log(EVENT_SOCKET.NEW_MESSAGE_IND, data);
      const state = store.getState();
      if (data?.room_id === state?.chat?.id_roomChat) {
        return null;
      } else {
        if (state?.chat?.roomList?.length > 0) {
          const dataList = [...state?.chat?.roomList];
          const index = dataList.findIndex(
            (element: any) => element?.id === data?.room_id,
          );
          if (index > -1) {
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
      }
    });

    // 誰かがメッセージ送信&socketサーバに送信(MESSAGE_IND)->ここで受信
    // ルーム詳細の更新
    socket.on(EVENT_SOCKET.MESSAGE_IND, (data: any) => {
      console.log(EVENT_SOCKET.MESSAGE_IND, data);
      const state = store.getState();
      if (data?.user_id !== state?.auth?.userInfo?.id) {
        if (data?.room_id === state?.chat?.id_roomChat) {
          if (data?.message_type === 3) {
            const value = {
              id_message: data?.relation_message_id,
              message_type: data?.message_type,
            };
            store.dispatch(updateMessageReaction(value));
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
      console.log(EVENT_SOCKET.CHAT_GROUP_UPDATE_IND, data);
      const state = store.getState();
      if (data?.room_id === state?.chat?.id_roomChat) {
        store.dispatch(saveIsGetInfoRoom(true));
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
      //チャットルームが新規作成かつ自身のユーザIDがmember_infoのidsに含まれているか判定
      if(data.member_info?.type === 1 && data.member_info?.ids?.findIndex((userId: number) => userId === state?.auth?.userInfo?.id) > -1){
        const newRoom = state?.chat?.roomList?.filter((el: any) => el.id === data?.room_id);
        if (newRoom.length === 0) {
          //サーバサイドにAPIリクエストを送りpush通知を送付するデバイスとして登録させる
          store.dispatch(registerRoomChat({
            connect_room_id: data?.room_id,
          }));
        }
      }
    });

    socket.on(EVENT_SOCKET.NEW_MESSAGE_CONF, async (data: any) => {
      console.log(EVENT_SOCKET.NEW_MESSAGE_CONF, data);
      const state = store.getState();
      if (data?.user_id !== state?.auth?.userInfo?.id) {
        if (data?.room_id === state?.chat?.id_roomChat) {
          const body = {
            idMsg: data?.message_id,
            idUser: data?.user_id,
          };
          store.dispatch(getDetailMessageSocketSeen(body));
        } else if(state.chat.roomList.length > 0) {
          store.dispatch(updateRoomList({room_id: data.room_id}));
        }
      }
    });

    socket.on(EVENT_SOCKET.DISCONNECT, () => {});

    //AHD-11819用修正。
    //web側から詳細チャットを開いた段階でアプリ側に送信されるのがこれのみのため、暫定的にルームの既読状態を検知するために使用。
    socket.on(EVENT_SOCKET.CHANGE_BROWSER_ICON, (data: any) => {
      console.log(EVENT_SOCKET.CHANGE_BROWSER_ICON, data);
      const state = store.getState();

      if(data.user_id === state.auth.userInfo.id && state.chat.roomList.length > 0) {
        store.dispatch(updateRoomList({
          room_id: data.room_id,
          unread_count: data.unread_count
        }));
      }
    });
  };

  const endConnect = () => {
    socketIO.disconnect();
  };

  const getSocket = () => {
    return socketIO;
  };

  return {
    init,
    endConnect,
    getSocket,
    onHanleEvent,
  };
}

export const AppSocket = createAppSocket();

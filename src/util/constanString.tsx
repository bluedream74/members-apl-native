import {store} from '../redux/store';
export const HITSLOP = {top: 20, left: 20, right: 20, bottom: 20};
export const LINK_URL_REGEX =
  /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
export const EVENT_SOCKET = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  NEW_MESSAGE_IND: 'new_message_ind',
  NEW_MESSAGE_CONF: 'new_message_conf',
  CHAT_GROUP_UPDATE_IND: 'ChatGroup_update_ind',
  MESSAGE_IND: 'message_ind',
};

export const SOCKET_CONFIG = {
  autoConnect: false,
  auth: {
    token: store.getState()?.auth?.userInfo?.ws_token,
  },
};

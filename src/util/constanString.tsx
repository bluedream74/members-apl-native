// 本番向け
// export const API_DOMAIN = 'mem-bers.jp';
// export const SOCKETIO_DOMAIN = 'v3mbs-msg01.mem-bers.jp';

// STG向け
export const API_DOMAIN = 'stage.mem-bers.jp';
export const SOCKETIO_DOMAIN = 'stage-v3mbs-msg01.mem-bers.jp';

export const HITSLOP = {top: 20, left: 20, right: 20, bottom: 20};
export const LINK_URL_REGEX =
  /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
export const EVENT_SOCKET = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  //イベント受信メッセージ（すべてのルームを聞くことができます）
  NEW_MESSAGE_IND: 'new_message_ind',
  //リアルタイム表示メッセージのイベント
  NEW_MESSAGE_CONF: 'new_message_conf',
  //チャットリスト外のリアルタイムイベント（名前変更、未読メッセージの更新、ルーム情報の変更...）
  CHAT_GROUP_UPDATE_IND: 'ChatGroup_update_ind',
  //イベント受信メッセージ (ルームに参加したときにのみ聞こえます)
  MESSAGE_IND: 'message_ind',
  //webで詳細画面を開いた場合、メッセージの既読数変化の際に送られてくる 
  CHANGE_BROWSER_ICON: 'change_browser_icon',
};

export const ATTACHMENT_FILE_TYPE = {
  IMAGE: 4,
  MOVIE: 8,
  PDF: 2,
  DOC: 5,
  XLS: 3,
};

export const MESSAGE_RANGE_TYPE = {
  USER: 1, // ユーザID（複数）
  GROUP: 2, // グループID（複数）
  ALL: 3, // ALL
};

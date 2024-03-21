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
  //Sự kiện connect
  CONNECT: 'connect',
  //Sự kiện disconnect
  DISCONNECT: 'disconnect',
  //Sự kiện nhận message về (lắng nghe toàn bộ room nào cũng có thể nghe được)
  // イベント受信メッセージ（すべてのルームを聞くことができます）
  NEW_MESSAGE_IND: 'new_message_ind',
  //Sự kiện dành cho việc realtime phần đã xem tin nhắn
  //リアルタイム表示メッセージのイベント
  NEW_MESSAGE_CONF: 'new_message_conf',
  //Sự kiện realtime ngoài list chat (đổi tên, cập nhật các tin nhắn chưa đọc, đổi thông tin phòng ...)
  //チャットリスト外のリアルタイムイベント（名前変更、未読メッセージの更新、ルーム情報の変更...）
  CHAT_GROUP_UPDATE_IND: 'ChatGroup_update_ind',
  //Sự kiện nhận message về (chỉ nghe được khi đã join vào 1 room)
  // イベント受信メッセージ (ルームに参加したときにのみ聞こえます)
  MESSAGE_IND: 'message_ind',
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

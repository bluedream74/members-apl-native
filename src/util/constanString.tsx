export const HITSLOP = {top: 20, left: 20, right: 20, bottom: 20};
export const LINK_URL_REGEX =
  /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
export const EVENT_SOCKET = {
  //Sự kiện connect
  CONNECT: 'connect',
  //Sự kiện disconnect
  DISCONNECT: 'disconnect',
  //Sự kiện nhận message về (lắng nghe toàn bộ room nào cũng có thể nghe được)
  NEW_MESSAGE_IND: 'new_message_ind',
  //Sự kiện dành cho việc realtime phần đã xem tin nhắn
  NEW_MESSAGE_CONF: 'new_message_conf',
  //Sự kiện realtime ngoài list chat (đổi tên, cập nhật các tin nhắn chưa đọc, đổi thông tin phòng ...)
  CHAT_GROUP_UPDATE_IND: 'ChatGroup_update_ind',
  //Sự kiện nhận message về (chỉ nghe được khi đã join vào 1 room)
  MESSAGE_IND: 'message_ind',
};

export const ATTACHMENT_FILE_TYPE = {
  IMAGE: 4,
  MOVIE: 8,
  PDF: 2,
  DOC: 5,
  XLS: 3,
}

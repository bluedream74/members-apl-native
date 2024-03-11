import {colors} from '@stylesCommon';
import React, {useState, useCallback} from 'react';
import {View, Text, TouchableOpacity, Dimensions, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import {
  iconFile,
  iconPdf,
  iconDoc,
  iconXls,
  defaultAvatar,
  iconEdit,
  iconReply,
  iconQuote2,
} from '@images';
import {Menu} from 'react-native-material-menu';
import {MenuFeature} from '../components/MenuFeature';
import MessageInfo from '../components/MessageInfo';
import moment from 'moment';
import Clipboard from '@react-native-clipboard/clipboard';
import {showMessage} from 'react-native-flash-message';
import {useSelector} from 'react-redux';
import {Reaction} from './Reaction';
import {ROUTE_NAME} from '@routeName';
import {useNavigation} from '@react-navigation/native';
import {styles} from './stylesItem';
import {scale, moderateVerticalScale} from 'react-native-size-matters';
import {MsgFile} from './MsgFile';
import {ViewUserSeen} from './viewUserSeen';
import {ViewTask} from './ViewTask';
import {MenuOption} from './MenuOption';

const colorCurrent = ['#CBEEF0', '#BFD6D8'];
const color = ['#FDF5E6', '#FDF5E6'];
const colorSelfMention = ['#FDE3E3', '#FDE3E3'];
const colorReplyQuote = ['#DCDCDC', '#DCDCDC'];
const width = Dimensions.get('window').width;

const ItemMessage = React.memo((props: any) => {
  const navigation = useNavigation<any>();

  const user_id = useSelector((state: any) => state.auth.userInfo.id);

  const {
    deleteMsg,
    pinMsg,
    replyMsg,
    editMsg,
    bookmarkMsg,
    onReaction,
    changePartCopy,
    navigatiteToListReaction,
    listUser,
    idRoomChat,
    newIndexArray,
    quoteMsg,
    me,
    showRedLine,
    idRedLine,
    isAdmin,
    moveToMessage,
    indexRedLine,
    setFormattedText,
    mentionedUsers,
    setListUserSelect,
    setInputText,
  } = props;
  const {
    user,
    text,
    _id,
    reaction,
    createdAt,
    msg_type,
    reply_to_message_text,
    reply_to_message_user,
    reply_to_message_user_id,
    attachment_files,
    reply_to_message_files,
    reply_to_message_stamp,
    stamp_icon,
    users_seen,
    stamp_no,
    task,
    task_message,
    task_link,
    message_quote,
    quote_message_id,
    quote_message_user,
    index,
    updated_at,
    reply_to_message_id,
  } = props.currentMessage;

  const [visible, setVisible] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);

  const onShowMenu = useCallback(() => {
    setVisible(!visible);
  }, [visible]);

  const onShowModalDelete = useCallback(() => {
    setShowModalDelete(!showModalDelete);
  }, [showModalDelete]);

  const navigateToList = useCallback(
    id => {
      navigatiteToListReaction(id);
    },
    [navigatiteToListReaction],
  );

  const onJumpToOriginal = useCallback(
    id => {
      moveToMessage(id);
    },
    [moveToMessage],
  );

  /**
   * 自分のメンションが入っているメッセージ
   */
  const checkMessageToSelfMention = useCallback(() => {
    //@allをリンク色にする（@all単独、@all+半角スペース、@all+全角スペース、@all+改行の場合）
    const matchs = text?.match(
      new RegExp('@all( |　|<br>)+|^@all$|( |　|<br>)@all$', 'g'),
    );
    if (matchs != null) {
      return true;
    }
    //@自分
    const mentionText = `@${me?.last_name.replace(
      ' ',
      '',
    )}${me?.first_name?.replace(' ', '')}さん`;
    if (text?.includes(mentionText)) {
      return true;
    }
    return false;
  }, [me, text]);

  const formatColor = useCallback(() => {
    if (user?._id === user_id) {
      return colorCurrent;
    }
    if (checkMessageToSelfMention()) {
      return colorSelfMention;
    }
    return color;
  }, [checkMessageToSelfMention, user?._id, user_id]);

  //Đây là hàm xử lý khi ấn vào menu reaction
  const onActionMenu = useCallback(
    async value => {
      await onShowMenu();
      const txt = String(text);
      switch (value) {
        case 7:
          Clipboard.setString(txt.replace(/<br>/g, '\n'));
          showMessage({
            message: 'コピー',
            backgroundColor: colors.backgroundTab,
            color: '#FFFFFF',
            position: {
              bottom: 0,
              left: width / 2 - scale(50 + 10),
              right: width / 2 - scale(50),
            },
            duration: 500,
            style: {
              width: scale(100),
              justifyContent: 'center',
              alignItems: 'center',
            },
          });
          break;
        case 8:
          const dataMessageEdit = {
            id: _id,
            user: user,
            text: txt.replace(/<br>/g, '\n'),
            attachment_files: attachment_files,
          };
          editMsg(dataMessageEdit);
          break;
        case 9:
          const dataMessageReply = {
            id: _id,
            user: user,
            text: txt,
            attachment_files: attachment_files,
            stamp_no: stamp_no,
            roomId: idRoomChat,
          };
          replyMsg(dataMessageReply);
          // add mention to textbox
          if (user.name === null) {
            // in case of guest message
            return;
          }
          const formattedText1: (string | JSX.Element)[] = [];
          const word = `@${user.name}さん`;
          const word_no_title = `@${user.name}`;
          mentionedUsers.push(word.trim());
          mentionedUsers.push(word_no_title.trim());
          setListUserSelect([
            {
              userId: user._id,
              userName: user.name,
            },
          ]);
          const mention = (
            <Text
              key={word + index}
              style={{
                alignSelf: 'flex-start',
                color: '#3366CC',
                fontWeight: 'bold',
              }}>
              {word}
            </Text>
          );
          const emptyText = (
            <Text
              key={parseInt(index, 10) + 1}
              style={{
                alignSelf: 'flex-start',
                color: 'black',
              }}>
              {''}
            </Text>
          );
          formattedText1.push(mention);
          setFormattedText([' ', ...formattedText1, ' ', emptyText]);
          setInputText(word);
          break;
        case 10:
          pinMsg(_id);
          break;
        case 11:
          deleteMsg(_id);
          break;
        case 12:
          bookmarkMsg(_id);
          break;
        case 13:
          const dataQuote = {
            id: _id,
            user: user,
            text: txt,
            roomId: idRoomChat,
          };
          quoteMsg(dataQuote);
          break;
        case 14:
          const copyData = {
            me: user?._id === user_id,
            colors: formatColor(),
            text: text.replace(/<br>/g, '\n'),
          };
          changePartCopy(copyData);
          break;
      }
    },
    [
      _id,
      attachment_files,
      bookmarkMsg,
      changePartCopy,
      deleteMsg,
      editMsg,
      formatColor,
      idRoomChat,
      index,
      mentionedUsers,
      onShowMenu,
      pinMsg,
      quoteMsg,
      replyMsg,
      setFormattedText,
      stamp_no,
      text,
      user,
      user_id,
      setInputText,
      setListUserSelect,
    ],
  );

  const onActionReaction = useCallback(
    value => {
      onShowMenu();
      onReaction(value, _id);
    },
    [_id, onReaction, onShowMenu],
  );

  var countReaction = reaction.reduce(function (total: any, course: any) {
    return total + course.count;
  }, 0);

  const renderTxtName = () => {
    return <Text style={styles.txtNameSend}>{user?.name}</Text>;
  };

  const renderImgaeFile = useCallback((typeFile: any) => {
    switch (typeFile) {
      case '2':
        return iconPdf;
      case '5':
        return iconDoc;
      case '3':
        return iconXls;
      default:
        return iconFile;
    }
  }, []);

  const onClickDetailSeen = useCallback(() => {
    navigation.navigate(ROUTE_NAME.USER_SEEN, {id: _id});
  }, [_id, navigation]);

  /**
   * 条件分岐でシステムメッセージ
   * @param msgtype
   * @returns メッセージ
   */
  const centerTxt = () => {
    switch (msg_type) {
      case 9:
        return 'ゲストが参加しました。';
      case 5:
        return `${user?.name}さんが参加しました。`;
      case 8:
        return 'グストを招待しました。';
      default:
        return text;
    }
  };

  return (
    <>
      {msg_type === 11 ||
      msg_type === 4 ||
      msg_type === 5 ||
      msg_type === 9 ||
      msg_type === 8 ||
      msg_type === 10 ||
      msg_type === 12 ? (
        <TouchableOpacity
          style={styles.viewCenter}
          onPress={onShowModalDelete}
          disabled={isAdmin === 1 ? false : true}>
          <Text style={styles.txtCenter} numberOfLines={2}>
            {centerTxt()}
          </Text>
          <Menu
            style={styles.containerMenuDelete}
            visible={showModalDelete}
            onRequestClose={onShowModalDelete}
            key={1}>
            <MenuOption onDeleteMessage={() => onActionMenu(11)} />
          </Menu>
        </TouchableOpacity>
      ) : msg_type === 14 ? (
        <Text style={styles.txtCenter} numberOfLines={2}>
          {task_message}
        </Text>
      ) : (
        <>
          {idRedLine === _id && showRedLine === true ? (
            <View style={styles.viewCenter}>
              <View style={styles.viewRedLine} />
              <Text style={styles.txtRedLine}>未読メッセージ</Text>
            </View>
          ) : null}
          <View
            style={[
              user?._id === user_id
                ? styles.containerCurrent
                : styles.container,
              {
                marginBottom:
                  indexRedLine && indexRedLine - 1 === index
                    ? moderateVerticalScale(30)
                    : 0,
              },
            ]}>
            <>
              {user?._id === user_id ? null : renderTxtName()}
              {msg_type === 6 ? (
                <View style={styles.viewTask}>
                  <FastImage source={defaultAvatar} style={styles.image} />
                  <ViewTask data={task} mess={text} task_link={task_link} />
                </View>
              ) : null}
              <TouchableOpacity
                style={styles.chat}
                onPress={onShowMenu}
                disabled={msg_type === 6}>
                {user?._id === user_id ? (
                  <>
                    {msg_type === 6 || msg_type === 8 ? null : (
                      <>
                        {moment(createdAt) < moment(updated_at) ? (
                          <Image source={iconEdit} style={styles.iconEdit} />
                        ) : null}
                        {moment(createdAt) < moment(updated_at) ? (
                          <Text style={styles.txtTime}>
                            {moment(updated_at, 'YYYY/MM/DD hh:mm:ss').format(
                              'MM/DD HH:mm',
                            )}
                          </Text>
                        ) : (
                          <Text style={styles.txtTime}>
                            {moment(createdAt, 'YYYY/MM/DD hh:mm:ss').format(
                              'MM/DD HH:mm',
                            )}
                          </Text>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <View style={styles.viewAvatar}>
                    {msg_type === 6 || msg_type === 8 ? null : (
                      <FastImage
                        style={styles.image}
                        source={{
                          uri: user?.avatar,
                          priority: FastImage.priority.high,
                          cache: FastImage.cacheControl.immutable,
                        }}
                      />
                    )}
                    <View style={{flex: 1}} />
                  </View>
                )}
                <>
                  {msg_type === 1 ? (
                    <FastImage
                      source={{
                        uri: stamp_icon,
                        priority: FastImage.priority.high,
                        cache: FastImage.cacheControl.immutable,
                      }}
                      style={
                        stamp_no === 1
                          ? styles.imageStamp
                          : styles.imageStampBig
                      }
                    />
                  ) : (
                    <View style={styles.containerViewChatWrap}>
                      {msg_type === 6 ||
                      msg_type === 8 ||
                      msg_type === 14 ? null : (
                        <View
                          style={
                            user?._id === user_id
                              ? [
                                  styles.containerViewChat,
                                  {alignItems: 'flex-end'},
                                ]
                              : [
                                  styles.containerViewChat,
                                  {alignItems: 'flex-start'},
                                ]
                          }>
                          {reply_to_message_text ||
                          reply_to_message_files?.length > 0 ||
                          reply_to_message_stamp?.stamp_icon ||
                          message_quote ? (
                            <>
                              {reply_to_message_text && (
                                <View style={styles.containerAdditionalMessage}>
                                  <Image
                                    source={
                                      message_quote ? iconQuote2 : iconReply
                                    }
                                    style={styles.iconReply}
                                  />
                                  <Text
                                    style={
                                      styles.containerAdditionalMessageText
                                    }>
                                    {reply_to_message_user_id !== user?._id &&
                                      reply_to_message_user_id === user_id &&
                                      user.name +
                                        'が' +
                                        reply_to_message_user +
                                        'に返信しました'}
                                    {reply_to_message_user_id === user?._id &&
                                      reply_to_message_user_id === user_id &&
                                      '自分に返信しました'}
                                    {reply_to_message_user_id !== user?._id &&
                                      reply_to_message_user_id !== user_id &&
                                      reply_to_message_user + 'に返信しました'}
                                  </Text>
                                </View>
                              )}
                              {message_quote && (
                                <View style={styles.containerAdditionalMessage}>
                                  <Text
                                    style={
                                      styles.containerAdditionalMessageText
                                    }>
                                    引用：{quote_message_user}
                                  </Text>
                                </View>
                              )}
                              <LinearGradient
                                colors={colorReplyQuote}
                                start={{x: 1, y: 0}}
                                end={{x: 0, y: 0}}
                                style={styles.containerAdditionalChat}>
                                <View style={styles.viewReply}>
                                  <View style={styles.txtReply}>
                                    {reply_to_message_text ? (
                                      <TouchableOpacity
                                        style={styles.chat}
                                        onPress={() =>
                                          onJumpToOriginal(reply_to_message_id)
                                        }>
                                        <MessageInfo
                                          text={reply_to_message_text.replace(
                                            /[<]br[^>]*[>]/gi,
                                            '',
                                          )}
                                          textSetting={{numberOfLines: 1}}
                                        />
                                      </TouchableOpacity>
                                    ) : null}
                                    {message_quote ? (
                                      <TouchableOpacity
                                        style={styles.chat}
                                        onPress={() =>
                                          onJumpToOriginal(quote_message_id)
                                        }>
                                        <MessageInfo
                                          text={message_quote.replace(
                                            /[<]br[^>]*[>]/gi,
                                            '',
                                          )}
                                          textSetting={{numberOfLines: 1}}
                                        />
                                      </TouchableOpacity>
                                    ) : null}
                                    {reply_to_message_files?.length > 0 ? (
                                      <View style={styles.viewRowEdit}>
                                        {reply_to_message_files?.map(
                                          (item: any) => (
                                            <View key={item?.id}>
                                              {item?.type === 4 ? (
                                                <FastImage
                                                  source={{
                                                    uri: item?.path,
                                                    priority:
                                                      FastImage.priority.high,
                                                    cache:
                                                      FastImage.cacheControl
                                                        .immutable,
                                                  }}
                                                  style={styles.imageSmall}
                                                />
                                              ) : (
                                                <FastImage
                                                  source={renderImgaeFile(
                                                    item?.type,
                                                  )}
                                                  style={styles.imageFile}
                                                />
                                              )}
                                            </View>
                                          ),
                                        )}
                                      </View>
                                    ) : null}
                                    {reply_to_message_stamp?.stamp_icon ? (
                                      <FastImage
                                        source={{
                                          uri: reply_to_message_stamp?.stamp_icon,
                                          priority: FastImage.priority.high,
                                          cache:
                                            FastImage.cacheControl.immutable,
                                        }}
                                        style={
                                          reply_to_message_stamp?.stamp_no === 1
                                            ? styles.imageLikeReply
                                            : styles.imageStampRepLy
                                        }
                                      />
                                    ) : null}
                                  </View>
                                </View>
                              </LinearGradient>
                            </>
                          ) : null}
                          <LinearGradient
                            colors={formatColor()}
                            start={{x: 1, y: 0}}
                            end={{x: 0, y: 0}}
                            style={styles.containerChat}>
                            <MessageInfo
                              text={text}
                              joinedUsers={listUser ? listUser.concat(me) : []}
                            />
                            {attachment_files?.length > 0 ? (
                              <MsgFile data={attachment_files} />
                            ) : null}
                          </LinearGradient>
                        </View>
                      )}
                    </View>
                  )}
                </>
                {user?._id === user_id ||
                msg_type === 6 ||
                msg_type === 8 ||
                msg_type === 14 ? null : (
                  <>
                    {moment(createdAt) < moment(updated_at) ? (
                      <Text style={styles.txtTime}>
                        {moment(updated_at, 'YYYY/MM/DD hh:mm:ss').format(
                          'MM/DD HH:mm',
                        )}
                      </Text>
                    ) : (
                      <Text style={styles.txtTime}>
                        {moment(createdAt, 'YYYY/MM/DD hh:mm:ss').format(
                          'MM/DD HH:mm',
                        )}
                      </Text>
                    )}
                    {moment(createdAt) < moment(updated_at) ? (
                      <Image source={iconEdit} style={styles.iconEdit} />
                    ) : null}
                  </>
                )}
              </TouchableOpacity>
              {reaction?.length > 0 && (
                <TouchableOpacity
                  style={styles.viewReaction}
                  onPress={() => navigateToList(_id)}>
                  <View style={styles.reaction}>
                    <Reaction reaction={reaction} />
                    {countReaction > 1 && (
                      <Text style={styles.txtLengthReaction}>
                        {countReaction}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            </>

            <Menu
              style={{
                //Logic check ẩnh và hiện menu khi tin nhắn ở sát phần trên của màn hình
                marginTop:
                  index === newIndexArray ||
                  index === newIndexArray - 1 ||
                  index === newIndexArray - 2
                    ? moderateVerticalScale(0)
                    : moderateVerticalScale(-125),
                width: (width * 4) / 5,
              }}
              visible={visible}
              onRequestClose={onShowMenu}>
              <MenuFeature
                userId={user?._id}
                msgType={msg_type}
                onActionMenu={(value: any) => onActionMenu(value)}
                onActionReaction={(value: any) => onActionReaction(value)}
              />
            </Menu>

            {users_seen?.length > 0 ? (
              <TouchableOpacity
                key={index}
                style={styles.viewSeen}
                onPress={onClickDetailSeen}>
                {users_seen?.map((item: any, indexItem: any) => {
                  return (
                    <ViewUserSeen
                      item={item}
                      index={indexItem}
                      key={indexItem}
                      data={users_seen}
                    />
                  );
                })}
              </TouchableOpacity>
            ) : null}
          </View>
        </>
      )}
    </>
  );
});

export {ItemMessage};

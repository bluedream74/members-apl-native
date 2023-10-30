import {colors, stylesCommon} from '@stylesCommon';
import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Linking,
} from 'react-native';
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
import {
  scale,
  verticalScale,
  moderateVerticalScale,
} from 'react-native-size-matters';
import {MsgFile} from './MsgFile';
import {isSameDay, validateLink, convertString} from '@util';
import HighlightText from '@sanar/react-native-highlight-text';
import {ViewUserSeen} from './viewUserSeen';
import Autolink from 'react-native-autolink';
import {ViewTask} from './ViewTask';
import {decode} from 'html-entities';
import {MenuOption} from './MenuOption';

const colorCurrent = ['#CBEEF0', '#BFD6D8'];
const color = ['#FDF5E6', '#FDF5E6'];
const colorSelfMention = ['#FDE3E3', '#FDE3E3'];
const colorReplyQuote = ['#DCDCDC', '#DCDCDC'];
const width = Dimensions.get('window').width;

const dataAll: any = [
  {
    id: 'All',
    last_name: 'a',
    first_name: 'll',
  },
];

const ItemMessage = React.memo((props: any) => {
  const navigation = useNavigation<any>();

  const user_id = useSelector((state: any) => state.auth.userInfo.id);
  const listChat = useSelector((state: any) => state.chat?.detailChat);

  const {
    deleteMsg,
    pinMsg,
    replyMsg,
    editMsg,
    bookmarkMsg,
    onReaction,
    navigatiteToListReaction,
    listUser,
    onAddMember,
    idRoomChat,
    newIndexArray,
    quoteMsg,
    me,
    showRedLine,
    redLineId,
    isAdmin,
    moveToMessage,
    indexRedLine,
    setFormattedText,
    mentionedUsers,
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
    task_link,
    message_quote,
    quote_message_id,
    quote_message_user,
    quote_message_user_id,
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

  const navigateToList = useCallback(_id => {
    navigatiteToListReaction(_id);
  }, []);

  const onJumpToOriginal = useCallback(id => {
    moveToMessage(id);
  }, []);

  //Đây là hàm xử lý khi ấn vào menu reaction
  const onActionMenu = useCallback(
    value => {
      onShowMenu();
      switch (value) {
        case 7:
          Clipboard.setString(text.replace(/<br>/g, '\n'));
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
            text: text.replace(/<br>/g, '\n'),
            attachment_files: attachment_files,
          };
          editMsg(dataMessageEdit);
          break;
        case 9:
          const dataMessageReply = {
            id: _id,
            user: user,
            text: text,
            attachment_files: attachment_files,
            stamp_no: stamp_no,
          };
          replyMsg(dataMessageReply);
          // add mention to textbox
          if (user.name === null) {
            // in case of guest message
            return;
          }
          const formattedText1: (string | JSX.Element)[] = [];
          const word = '@' + user.name + 'さん';
          const word_no_title = '@' + user.name + ' ';
          mentionedUsers.push(word.trim());
          mentionedUsers.push(word_no_title.trim());
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
            text: text,
          };
          quoteMsg(dataQuote);
          break;
      }
    },
    [visible],
  );

  const onActionReaction = useCallback(
    value => {
      onShowMenu();
      onReaction(value, _id);
    },
    [visible],
  );

  var countReaction = reaction.reduce(function (total: any, course: any) {
    return total + course.count;
  }, 0);

  const renderTxtName = () => {
    return <Text style={styles.txtNameSend}>{user?.name}</Text>;
  };

  const convertMentionToLink = useCallback((text: any, joinedUsers: any) => {
    let textBold: any = [];
    joinedUsers.forEach((joinedUser: any) => {
      let mentionText = `@${joinedUser?.last_name.replace(
        ' ',
        '',
      )}${joinedUser?.first_name?.replace(' ', '')}`;
      if (text?.includes(mentionText)) {
        textBold = textBold?.concat(mentionText);
      }
    });
    return textBold;
  }, []);

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
  }, []);

  const onConfirm = useCallback(() => {
    onAddMember(1);
  }, []);

  const onReject = useCallback(() => {
    onAddMember(2);
  }, []);

  const formatText = (inputText: string) => {
    if (inputText.length === 0) {
      return;
    }
    const words = inputText.split(' ');
    const formattedText: (string | JSX.Element)[] = [];
    words.forEach((word, index) => {
      const isLastWord = index === words.length - 1;
      if (!word.startsWith('@')) {
        const nonmention = (
          <Text key={word + index} style={{color: 'black'}}>
            {word}
          </Text>
        );
        return isLastWord
          ? formattedText.push(nonmention)
          : formattedText.push(nonmention, ' ');
      } else {
        let myName = `@${me?.last_name.replace(
          ' ',
          '',
        )}${me?.first_name?.replace(' ', '')}`;
        let mention;
        // 自分宛のメンションの場合
        if (word.includes(myName)) {
          mention = (
            <View>
              <Text
                key={word + index}
                style={{
                  alignSelf: 'flex-start',
                  color: '#3366CC',
                  fontWeight: 'bold',
                }}>
                {word}
              </Text>
            </View>
          );
        } else {
          // 他人宛のメンションの場合
          mention = (
            <View>
              <Text
                key={word + index}
                style={{
                  alignSelf: 'flex-start',
                  color: '#3366CC',
                  fontWeight: 'bold',
                }}>
                {word}
              </Text>
            </View>
          );
        }

        isLastWord
          ? formattedText.push(mention)
          : formattedText.push(mention, ' ');
      }
    });
    return formattedText;
  };

  const formatColor = () => {
    if (user?._id == user_id) {
      return colorCurrent;
    } else if (checkMessageToSelfMention()) {
      return colorSelfMention;
    } else {
      return color;
    }
  };

  /**
   * 自分のメンションが入っているメッセージ
   */
  const checkMessageToSelfMention = () => {
    let isSelfMention = false;
    //@allをリンク色にする（@all単独、@all+半角スペース、@all+全角スペース、@all+改行の場合）
    const matchs = text?.match(new RegExp("@all( |　|<br>)+|^@all$|( |　|<br>)@all$", 'g'));
    if (matchs != null) {
      isSelfMention = true;
    } else {
      //@自分
      let mentionText = `@${me?.last_name.replace(
        ' ',
        '',
      )}${me?.first_name?.replace(' ', '')}さん`;

      if (text?.includes(mentionText)) {
        isSelfMention = true;
      }
    }

    return isSelfMention;
  };

  return (
    <>
      {msg_type == 11 ||
      msg_type == 4 ||
      msg_type == 5 ||
      msg_type == 9 ||
      msg_type == 10 ||
      msg_type == 9 ||
      msg_type == 8 ||
      msg_type == 12 ? (
        <TouchableOpacity
          style={styles.viewCenter}
          onPress={onShowModalDelete}
          disabled={isAdmin === 1 ? false : true}>
          <Text style={styles.txtCenter} numberOfLines={2}>
            {msg_type === 9
              ? 'ゲストが参加しました。'
              : msg_type === 5
              ? `${user?.name}さんが参加しました。`
              : msg_type === 8
              ? 'グストを招待しました。'
              : text}
          </Text>
          <Menu
            style={styles.containerMenuDelete}
            visible={showModalDelete}
            onRequestClose={onShowModalDelete}
            key={1}>
            <MenuOption onDeleteMessage={() => onActionMenu(11)} />
          </Menu>
        </TouchableOpacity>
      ) : (
        <>
          {redLineId === _id && showRedLine === true ? (
            <View style={styles.viewCenter}>
              <View style={styles.viewRedLine} />
              <Text style={styles.txtRedLine}>未読メッセージ</Text>
            </View>
          ) : null}
          <View
            style={[
              user?._id == user_id ? styles.containerCurrent : styles.container,
              {
                marginBottom:
                  indexRedLine && indexRedLine - 1 === index
                    ? moderateVerticalScale(30)
                    : 0,
              },
            ]}>
            <>
              {user?._id == user_id ? null : renderTxtName()}
              {msg_type == 6 ? (
                <View style={styles.viewTask}>
                  <FastImage source={defaultAvatar} style={styles.image} />
                  <ViewTask data={task} mess={text} task_link={task_link} />
                </View>
              ) : null}
              <TouchableOpacity
                style={styles.chat}
                onPress={onShowMenu}
                disabled={msg_type == 6}>
                {user?._id == user_id ? (
                  <>
                    {msg_type == 6 || msg_type == 8 ? null : (
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
                    {msg_type == 6 || msg_type == 8 ? null : (
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
                  {msg_type == 1 ? (
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
                    <>
                      {msg_type == 6 || msg_type == 8 ? null : (
                        <View style={user?._id == user_id ? [styles.containerViewChat, {alignItems: 'flex-end',}] : [styles.containerViewChat, {alignItems: 'flex-start',}]}>
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
                                    {reply_to_message_user_id !== user?._id && reply_to_message_user_id === user_id && user.name + 'が' + reply_to_message_user + 'に返信しました'}
                                    {reply_to_message_user_id === user?._id && reply_to_message_user_id === user_id && '自分に返信しました'}
                                    {reply_to_message_user_id !== user?._id && reply_to_message_user_id !== user_id && reply_to_message_user + 'に返信しました'}

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
                                          text={reply_to_message_text.replace(/[<]br[^>]*[>]/gi,"")}
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
                                          text={message_quote.replace(/[<]br[^>]*[>]/gi,"")}
                                          textSetting={{numberOfLines: 1}}
                                        />
                                      </TouchableOpacity>
                                    ) : null}
                                    {reply_to_message_files?.length > 0 ? (
                                      <View style={styles.viewRowEdit}>
                                        {reply_to_message_files?.map(
                                          (item: any) => (
                                            <View key={item?.id}>
                                              {item?.type == 4 ? (
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
                                          reply_to_message_stamp?.stamp_no == 1
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
                    </>
                  )}
                </>
                {user?._id == user_id ||
                msg_type == 6 ||
                msg_type == 8 ? null : (
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
              }}
              visible={visible}
              onRequestClose={onShowMenu}
              key={1}>
              <MenuFeature
                userId={user?._id}
                onActionMenu={(value: any) => onActionMenu(value)}
                onActionReaction={(value: any) => onActionReaction(value)}
              />
            </Menu>

            {users_seen?.length > 0 ? (
              <TouchableOpacity
                style={styles.viewSeen}
                onPress={onClickDetailSeen}>
                {users_seen?.map((item: any, index: any) => {
                  return (
                    <ViewUserSeen
                      item={item}
                      index={index}
                      key={index}
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

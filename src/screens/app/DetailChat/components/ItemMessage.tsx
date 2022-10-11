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
import {iconFile, iconPdf, iconDoc, iconXls, defaultAvatar} from '@images';
import {Menu} from 'react-native-material-menu';
import {MenuFeature} from '../components/MenuFeature';
import moment from 'moment';
import Clipboard from '@react-native-clipboard/clipboard';
import {showMessage} from 'react-native-flash-message';
import {useSelector} from 'react-redux';
import {Reaction} from './Reaction';
import {ROUTE_NAME} from '@routeName';
import {useNavigation} from '@react-navigation/native';
import {styles} from './stylesItem';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';
import {MsgFile} from './MsgFile';
import {isSameDay, validateLink, convertString} from '@util';
import HighlightText from '@sanar/react-native-highlight-text';
import {ViewUserSeen} from './viewUserSeen';
import Autolink from 'react-native-autolink';
import {ViewTask} from './ViewTask';
import {ViewInvite} from './ViewInvite';

const colorCurrent = ['#CBEEF0', '#BFD6D8'];
const color = ['#E8E8E8', '#D4D4D4'];
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
    navigatiteToListReaction,
    listUser,
    onAddMember,
    idRoomChat,
    me,
  } = props;
  const {
    user,
    text,
    _id,
    reaction,
    createdAt,
    msg_type,
    reply_to_message_text,
    attachment_files,
    reply_to_message_files,
    reply_to_message_stamp,
    stamp_icon,
    users_seen,
    stamp_no,
    task,
    guest,
    task_link,
  } = props.currentMessage;

  const [visible, setVisible] = useState(false);

  const onShowMenu = useCallback(() => {
    setVisible(!visible);
  }, [visible]);

  const navigateToList = useCallback(_id => {
    navigatiteToListReaction(_id);
  }, []);

  const onActionMenu = useCallback(
    value => {
      onShowMenu();
      switch (value) {
        case 7:
          Clipboard.setString(text);
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
            text: text,
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
    return <Text style={styles.txtNameSend}>{user?.name || guest?.name}</Text>;
  };

  const convertMentionToLink = useCallback((text: any, joinedUsers: any) => {
    let textBold: any = [];
    joinedUsers.forEach((joinedUser: any) => {
      let mentionText = `@${joinedUser?.last_name.replace(' ', '',)}${joinedUser?.first_name?.replace(' ', '')}`;
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
        let myName = `@${me?.last_name.replace(' ', '',)}${me?.first_name?.replace(' ', '')}`;
        let mention;
        if (word.includes(myName)) {
          mention = (
            <View
              style={{
                padding: 5,
                backgroundColor: '#aaaaaa',
                borderRadius: 5,
              }}>
              <Text
                key={word + index}
                style={{
                  alignSelf: 'flex-start',
                  color: 'black',
                  fontWeight: 'bold',
                }}>
                {word}
              </Text>
            </View>
          );
        } else {
          mention = (
            <Text
              key={word + index}
              style={{
                alignSelf: 'flex-start',
                color: 'black',
                fontWeight: 'bold',
              }}>
              {word}
            </Text>
          );
        }


        isLastWord
          ? formattedText.push(mention)
          : formattedText.push(mention, ' ');
      }
    });
    return formattedText;
  };

  return (
    <>
      {msg_type == 11 ||
      msg_type == 4 ||
      msg_type == 5 ||
      msg_type == 9 ||
      msg_type == 10 ||
      msg_type == 9 ||
      msg_type == 12 ? (
        <View style={styles.viewCenter}>
          <Text style={styles.txtCenter} numberOfLines={2}>
            {msg_type !== 9 ? text : `${guest?.name}さんが参加しました。`}
          </Text>
        </View>
      ) : (
        <>
          <View
            style={
              user?._id == user_id ? styles.containerCurrent : styles.container
            }>
            <>
              {user?._id == user_id ? null : renderTxtName()}
              {msg_type == 6 ? (
                <View style={styles.viewTask}>
                  <FastImage source={defaultAvatar} style={styles.image} />
                  <ViewTask data={task} mess={text} task_link={task_link} />
                </View>
              ) : null}
              {msg_type == 8 ? (
                <View style={styles.viewInvite}>
                  <FastImage source={defaultAvatar} style={styles.image} />
                  <ViewInvite
                    data={guest}
                    idRoomChat={idRoomChat}
                    idMessage={_id}
                  />
                </View>
              ) : null}
              <TouchableOpacity
                style={styles.chat}
                onPress={onShowMenu}
                disabled={msg_type == 6}>
                {user?._id == user_id ? (
                  <>
                    {msg_type == 6 || msg_type == 8 ? null : (
                      <Text style={styles.txtTimeCurent}>
                        {moment(createdAt, 'YYYY/MM/DD hh:mm:ss').format(
                          'MM/DD HH:mm',
                        )}
                      </Text>
                    )}
                  </>
                ) : (
                  <View style={styles.viewAvatar}>
                    <FastImage
                      style={styles.image}
                      source={{
                        uri: user?.avatar,
                        priority: FastImage.priority.high,
                        cache: FastImage.cacheControl.immutable,
                      }}
                    />
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
                        <LinearGradient
                          colors={user?._id == user_id ? colorCurrent : color}
                          start={{x: 1, y: 0}}
                          end={{x: 0, y: 0}}
                          style={styles.containerChat}>
                          {reply_to_message_text ||
                          reply_to_message_files?.length > 0 ||
                          reply_to_message_stamp?.stamp_icon ? (
                            <View style={styles.viewReply}>
                              <View style={styles.viewColumn} />
                              <View>
                                <Text style={styles.txtTitleReply}>
                                  返信メッセージ
                                </Text>
                                {reply_to_message_text ? (
                                  <Text
                                    style={styles.txtContentReply}
                                    numberOfLines={1}>
                                    {reply_to_message_text}
                                  </Text>
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
                                      cache: FastImage.cacheControl.immutable,
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
                          ) : null}
                          {attachment_files?.length > 0 ? (
                            <MsgFile data={attachment_files} />
                          ) : null}
                          {user?._id == user_id ? (
                            <Autolink
                              text={text?.split('<br>').join('\n')}
                              email
                              url
                              renderText={text => (
                                <HighlightText
                                  highlightStyle={styles.txtBold}
                                  //@ts-ignore
                                  searchWords={convertMentionToLink(text, listUser)}
                                  textToHighlight={convertString(text)}
                                  style={styles.txtMessage}
                                />
                              )}
                            />
                          ) : (
                            <Autolink
                              text={text?.split('<br>').join('\n')}
                              email
                              url
                              renderText={text => formatText(text)}
                            />
                          )}
                        </LinearGradient>
                      )}
                    </>
                  )}
                </>
                {user?._id == user_id ||
                msg_type == 6 ||
                msg_type == 8 ? null : (
                  <Text style={styles.txtTime}>
                    {moment(createdAt, 'YYYY/MM/DD hh:mm:ss').format(
                      'MM/DD HH:mm',
                    )}
                  </Text>
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
              style={styles.containerMenu}
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
                style={
                  user?._id == user_id
                    ? styles.viewSeenCurrent
                    : styles.viewSeen
                }
                onPress={onClickDetailSeen}>
                {users_seen?.map((item: any, index: any) => {
                  return <ViewUserSeen item={item} index={index} key={index} />;
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

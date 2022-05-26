import React, {useRef, useEffect} from 'react';
import {View, Text, TouchableOpacity, Image, Platform} from 'react-native';
import {styles} from './styles';
import {Header} from '@component';
import {
  iconSearch,
  iconDetail,
  iconDelete,
  menuReply,
  iconClose,
} from '@images';
import {useFunction} from './useFunction';
import {Menu} from 'react-native-material-menu';
import {
  GiftedChat,
  Message,
  LoadEarlier,
} from '../../../lib/react-native-gifted-chat';
import {ItemMessage} from './components/ItemMessage';
import {
  renderSend,
  renderInputToolbar,
  renderComposer,
} from './components/InputToolbar';
import {verticalScale} from 'react-native-size-matters';

const DetailChat = (props: any) => {
  const {
    chatUser,
    idRoomChat,
    getConvertedMessages,
    listChat,
    deleteMsg,
    dataDetail,
    sendMessage,
    navigateToDetail,
    message_pinned,
    updateGimMessage,
    onLoadMore,
    replyMessage,
    messageReply,
    removeReplyMessage,
  } = useFunction(props);

  const renderMessage = (props: any) => {
    return (
      <>
        <ItemMessage
          {...props}
          deleteMsg={(id: any) => {
            deleteMsg(id);
          }}
          pinMsg={(id: any) => {
            updateGimMessage(id, 1);
          }}
          replyMsg={(data: any) => {
            replyMessage(data);
          }}
        />
      </>
    );
  };

  const isCloseToTop = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: any) => {
    const paddingToTop = Platform.OS === 'ios' ? -20 : 10;
    return (
      contentSize.height - layoutMeasurement.height - paddingToTop <=
      contentOffset.y
    );
  };

  return (
    <View style={styles.container}>
      <Header
        back
        title={dataDetail?.name}
        imageCenter
        iconRightFirst={iconDetail}
        iconRightSecond={iconSearch}
        onRightFirst={navigateToDetail}
        onRightSecond={() => {}}
      />
      {message_pinned?.message && (
        <View style={styles.viewPinMessage}>
          <View style={styles.viewContent}>
            <Text style={styles.txtTitle}>Pinned message</Text>
            <Text style={styles.txtContent} numberOfLines={2}>
              {message_pinned?.message}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.viewIcon}
            onPress={() => {
              updateGimMessage(message_pinned?.id, 0);
            }}>
            <Image source={iconDelete} style={styles.iconDelete} />
          </TouchableOpacity>
        </View>
      )}
      <GiftedChat
        messages={getConvertedMessages(listChat)}
        onSend={(messages: any) => {
          sendMessage(messages);
        }}
        renderMessage={renderMessage}
        renderInputToolbar={renderInputToolbar}
        renderComposer={renderComposer}
        user={chatUser}
        renderSend={renderSend}
        renderFooter={() => <View style={styles.viewBottom} />}
        listViewProps={{
          scrollEventThrottle: 400,
          onScroll: ({nativeEvent}: any) => {
            if (isCloseToTop(nativeEvent)) {
              onLoadMore();
            }
          },
        }}
        renderAccessory={
          messageReply
            ? () => (
                <>
                  {messageReply && (
                    <View style={styles.viewRepMessage}>
                      <View style={styles.viewIconRepMessage}>
                        <Image source={menuReply} style={styles.iconReply} />
                      </View>
                      <View style={styles.viewTxtRepMessage}>
                        <Text style={styles.name}>Reply message</Text>
                        <Text style={styles.content} numberOfLines={2}>
                          {messageReply?.text}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.viewIconRepMessage}
                        onPress={removeReplyMessage}>
                        <Image source={iconClose} style={styles.iconClose} />
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )
            : undefined
        }
        bottomOffset={0}
      />
    </View>
  );
};

export {DetailChat};

import React, {useCallback} from 'react';
import {View, Text, TouchableOpacity, Image, Platform} from 'react-native';
import {styles} from './styles';
import {Header} from '@component';
import {iconSearch, iconUpload, iconLike, iconDetail, iconSend} from '@images';
import {useFunction} from './useFunction';
import {GiftedChat, Actions} from '../../../lib/react-native-gifted-chat';
import {ItemMessage} from './components/ItemMessage';
import {
  renderSend,
  renderInputToolbar,
  renderComposer,
} from './components/InputToolbar';
import {ModalPickFile} from './components/ModalPickFile';
import {convertString} from '@util';

import {ModalStamp} from './components/ModalStamp';
import {ModalReply} from './components/ModalReply';
import {ModalEdit} from './components/ModalEdit';
import {ModalPin} from './components/ModalPin';
import {ModalTagName} from './components/ModalTagName';

const DetailChat = (props: any) => {
  const {
    idRoomChat,
    chatUser,
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
    editMessage,
    message_edit,
    reactionMessage,
    navigatiteToListReaction,
    pickFile,
    cancelModal,
    chosePhoto,
    choseFile,
    sendLabel,
    searchMessage,
    showModalStamp,
    modalStamp,
    giftedChatRef,
    text,
    setShowTag,
    showTagModal,
    listUser,
    setText,
    bookmarkMessage,
    ids,
    setIds,
  } = useFunction(props);

  const renderActions = useCallback((props: any) => {
    return (
      <Actions
        {...props}
        containerStyle={styles.addBtn}
        onPressActionButton={cancelModal}
        icon={() => <Image source={iconUpload} />}
      />
    );
  }, []);

  const renderActionsRight = useCallback((props: any) => {
    return (
      <>
        {props.text?.length > 0 ? (
          <Actions
            {...props}
            containerStyle={styles.buttonRight}
            onPressActionButton={() => {
              const messages = [
                {
                  text: props.text,
                  user: {_id: props.user?._id},
                  createdAt: new Date(Date.now()),
                },
              ];
              sendMessage(messages);
            }}
            icon={() => <Image source={iconSend} />}
          />
        ) : (
          <Actions
            {...props}
            containerStyle={styles.buttonRight}
            onPressActionButton={() => sendLabel(1)}
            icon={() => <Image source={iconLike} />}
          />
        )}
      </>
    );
  }, []);

  const renderMessage = useCallback(
    (props: any) => {
      return (
        <>
          <ItemMessage
            {...props}
            idRoomChat={idRoomChat}
            deleteMsg={(id: any) => {
              deleteMsg(id);
            }}
            pinMsg={(id: any) => {
              updateGimMessage(id, 1);
            }}
            replyMsg={(data: any) => {
              replyMessage(data);
            }}
            editMsg={(data: any) => {
              editMessage(data);
            }}
            bookmarkMsg={(data: any) => {
              bookmarkMessage(data);
            }}
            onReaction={(data: any, idMsg: any) => {
              reactionMessage(data, idMsg);
            }}
            navigatiteToListReaction={(idMsg: any) => {
              navigatiteToListReaction(idMsg);
            }}
            listUser={listUser}
          />
        </>
      );
    },
    [listUser],
  );

  const isCloseToTop = useCallback(
    ({layoutMeasurement, contentOffset, contentSize}: any) => {
      const paddingToTop = Platform.OS === 'ios' ? -20 : 10;
      return (
        contentSize.height - layoutMeasurement.height - paddingToTop <=
        contentOffset.y
      );
    },
    [],
  );

  return (
    <View style={styles.container}>
      <Header
        back
        title={
          dataDetail?.name && dataDetail?.name?.length > 0
            ? dataDetail?.name
            : `${
                dataDetail?.one_one_check[0]
                  ? dataDetail?.one_one_check[0]?.last_name
                  : ''
              } ${
                dataDetail?.one_one_check[0]
                  ? dataDetail?.one_one_check[0]?.first_name
                  : ''
              }`
        }
        imageCenter
        iconRightFirst={iconDetail}
        iconRightSecond={iconSearch}
        styleIconRightFirst={[styles.colorIcon, styles.size]}
        styleIconRightSeccond={styles.colorIcon}
        onRightFirst={navigateToDetail}
        sourceImageCenter={
          dataDetail?.one_one_check?.length > 0
            ? dataDetail?.one_one_check[0]?.icon_image
            : dataDetail?.icon_image
        }
        onRightSecond={searchMessage}
      />
      {message_pinned?.id && (
        <ModalPin
          updateGimMessage={(id: any, value: any) =>
            updateGimMessage(id, value)
          }
        />
      )}
      <GiftedChat
        text={text}
        ref={giftedChatRef}
        onInputTextChanged={value => setText(value)}
        messages={getConvertedMessages(listChat)}
        onSend={() => {
          showModalStamp();
        }}
        alwaysShowSend={true}
        renderMessage={renderMessage}
        renderInputToolbar={renderInputToolbar}
        renderComposer={renderComposer}
        user={chatUser}
        renderSend={renderSend}
        renderFooter={() => <View style={styles.viewBottom} />}
        renderActions={renderActions}
        renderActionsRight={renderActionsRight}
        listViewProps={{
          scrollEventThrottle: 400,
          onScroll: ({nativeEvent}: any) => {
            if (isCloseToTop(nativeEvent)) {
              onLoadMore();
            } else if (nativeEvent?.contentOffset?.y === 0) {
            }
          },
          onScrollToIndexFailed: (info: any) => {
            if (info?.index >= 0) {
              const wait = new Promise(resolve => setTimeout(resolve, 500));
              wait.then(() => {
                giftedChatRef.current?._messageContainerRef?.current?.scrollToIndex(
                  {
                    animated: true,
                    index: info?.index,
                  },
                );
              });
            }
          },
        }}
        textInputProps={{
          onKeyPress: ({nativeEvent}: any) => {
            if (nativeEvent?.key?.trim() === '@') {
              setShowTag(true);
            } else {
              setShowTag(false);
            }
          },
        }}
        renderAccessory={
          messageReply ||
          message_edit ||
          modalStamp === true ||
          showTagModal === true
            ? () => (
                <>
                  {showTagModal && (
                    <ModalTagName
                      idRoomChat={idRoomChat}
                      choseUser={(value: any, id: any) => {
                        setText(`${text}${value}`);
                        setIds(ids?.concat([id]));
                        setShowTag(false);
                      }}
                    />
                  )}
                  {messageReply && <ModalReply />}
                  {message_edit && <ModalEdit />}
                  {modalStamp && (
                    <ModalStamp
                      onChose={(value: any) => {
                        sendLabel(value);
                      }}
                    />
                  )}
                </>
              )
            : undefined
        }
        bottomOffset={0}
        messagesContainerStyle={styles.containerMessage}
      />
      <ModalPickFile
        visible={pickFile}
        onCancel={cancelModal}
        chosePhoto={chosePhoto}
        choseFile={choseFile}
      />
    </View>
  );
};

export {DetailChat};

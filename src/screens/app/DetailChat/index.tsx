import React, {useCallback} from 'react';
import {View, Image, Platform} from 'react-native';
import {styles} from './styles';
import {Header} from '@component';
import {iconSearch, iconUpload, iconLike, iconDetail} from '@images';
import {useFunction} from './useFunction';
import {GiftedChat, Actions} from '../../../lib/react-native-gifted-chat';
import {ItemMessage} from './components/ItemMessage';
import {
  renderSend,
  renderInputToolbar,
  renderComposer,
} from './components/InputToolbar';
import {ModalPickFile} from './components/ModalPickFile';

import {ModalStamp} from './components/ModalStamp';
import {ModalReply} from './components/ModalReply';
import {ModalQuote} from './components/ModalQuote';
import {ModalEdit} from './components/ModalEdit';
import {ModalPin} from './components/ModalPin';
import {ModalTagName} from './components/ModalTagName';

const DetailChat = (props: any) => {
  // custom hook logic
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
    setIndex,
    newIndexArray,
    quoteMessage,
    messageQuote,
    listUserSelect,
    setListUserSelect
  } = useFunction(props);

  //Render ra UI chọn ảnh, video, file
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

  //Render ra UI stamp
  const renderActionsRight = useCallback((props: any) => {
    return (
      <Actions
        {...props}
        containerStyle={styles.buttonRight}
        onPressActionButton={() => sendLabel(1)}
        icon={() => <Image source={iconLike} />}
      />
    );
  }, []);

  //Render ra UI của message
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
            quoteMsg={(data: any) => {
              quoteMessage(data);
            }}
            navigatiteToListReaction={(idMsg: any) => {
              navigatiteToListReaction(idMsg);
            }}
            listUser={listUser}
            newIndexArray={newIndexArray}
          />
        </>
      );
    },
    [listUser, newIndexArray],
  );

  //Check phạm vi để gọi hàm loadmore
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

  //Check vị trí scroll màn hình đang ở index số mấy
  const onViewRef = React.useRef((viewableItems: any) => {
    const index = viewableItems?.viewableItems?.length - 1;
    setIndex(viewableItems?.viewableItems[index]?.index);
  });

  //Config view xem trong tài liệu của RN
  const viewConfigRef = React.useRef({
    viewAreaCoveragePercentThreshold: 0,
  });

  return (
    <View style={styles.container}>
      <Header
        back
        //Check title header nếu đây là chat 1-1 hay chat nhóm
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
      {/* UI pin message */}
      {message_pinned?.id && (
        <ModalPin
          updateGimMessage={(id: any, value: any) =>
            updateGimMessage(id, value)
          }
        />
      )}
      {/* UI list chat message */}
      <GiftedChat
        text={text}
        ref={giftedChatRef}
        onInputTextChanged={value => setText(value)}
        messages={getConvertedMessages(listChat)}
        onSend={(messages: any) => {
          if (messages[0]?.text?.length === 0) {
            showModalStamp();
          } else {
            sendMessage(messages);
          }
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
        //Các props của flatlist nhúng vào gifted chat
        listViewProps={{
          scrollEventThrottle: 400,
          //Xử lý loadmore tin nhắn
          onScroll: ({nativeEvent}: any) => {
            if (isCloseToTop(nativeEvent)) {
              onLoadMore();
            } else if (nativeEvent?.contentOffset?.y === 0) {
            }
          },

          //Xử lý tracking xem đang scroll ở vị trí tin nhắn số bao nhiêu
          viewabilityConfig: viewConfigRef.current,
          onViewableItemsChanged: onViewRef.current,

          //Xử lý khi vào màn detail chat sẽ nhảy đến message được chỉ định
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
        //Các props của textInput nhúng vào gifted chat
        textInputProps={{
          onKeyPress: ({nativeEvent}: any) => {
            if (nativeEvent?.key?.trim() === '@') {
              setShowTag(true);
            } else {
              setShowTag(false);
            }
          },
        }}
        //Chú ý đây là phần xử lý các UI nằm bên trên của input chat (có custom trong thư viện)
        renderAccessory={
          messageReply ||
          message_edit ||
          messageQuote ||
          modalStamp === true ||
          showTagModal === true
            ? () => (
                <>
                  {/* UI modal tag name */}
                  {showTagModal && (
                    <ModalTagName
                      idRoomChat={idRoomChat}
                      choseUser={(value: any, id: any, item: any) => {
                        // logic khi tag name là tin nhắn tag có tên người và đồng thời gửi thêm 1 mảng id người dùng được tag
                        if (id < 0) {
                          // check nếu đây là id của khách lẻ thì không gửi mảng id lên
                          setText(`${text}${value}`);
                          setShowTag(false);
                        } else {
                          setText(`${text}${value}`);
                          setIds(ids?.concat([id]));
                          setListUserSelect(listUserSelect?.concat([{...item}]))
                          setShowTag(false);
                        }
                      }}
                    />
                  )}
                  {/* UI reply message */}
                  {messageReply && <ModalReply />}
                  {/* UI Edit message */}
                  {message_edit && <ModalEdit />}
                  {/* UI message quote */}
                  {messageQuote && <ModalQuote />}
                  {/* UI chọn stamp */}
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
      {/* UI modal chọn ảnh, video và file */}
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

import React, {useCallback, useRef} from 'react';
import {
  View,
  Image,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
} from 'react-native';
import {styles} from './styles';
import {Header} from '@component';
import {
  iconSearch,
  iconUpload,
  iconLike,
  iconDetail,
  iconSend,
  iconTask,
} from '@images';
import {useFunction} from './useFunction';
import {GiftedChat, Actions} from '../../../lib/react-native-gifted-chat';
import LinearGradient from 'react-native-linear-gradient';
import {ItemMessage} from './components/ItemMessage';
import DecoButton from './components/DecoButton';
import {
  renderSend,
  renderInputToolbar,
  renderComposer,
} from './components/InputToolbar';
import {ModalPickFile} from './components/ModalPickFile';
import {ShowPickedFile} from './components/ShowPickedFile';

import {ModalStamp} from './components/ModalStamp';
import {ModalReply} from './components/ModalReply';
import {ModalQuote} from './components/ModalQuote';
import {ModalEdit} from './components/ModalEdit';
import {ModalPin} from './components/ModalPin';
import {ModalTagName} from './components/ModalTagName';
import {ModalTask} from './components/ModalTask';
import {ModalUserList} from './components/ModalUserList';
import {useSelector} from 'react-redux';

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
    onLoadMoreDown,
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
    listUserChat,
    bookmarkMessage,
    ids,
    setIds,
    setIndex,
    newIndexArray,
    quoteMessage,
    messageQuote,
    formattedText,
    setFormattedText,
    mentionedUsers,
    formatText,
    getText,
    me,
    showRedLine,
    idRedLine,
    navigateToMessage,
    indexRedLine,
    onCreateTask,
    setShowTaskForm,
    showTaskForm,
    onSaveTask,
    setShowUserList,
    showUserList,
    partCopy,
    changePartCopy,
    selected,
    setSelected,
    setInputText,
    textSelection,
    onDecoSelected,
    keyboardHeight,
    chosenFiles,
    deleteFile,
    setListUserSelect,
    listUserSelect,
    customBack,
    setInputIndex,
    inputIndex,
    showSendMessageButton,
    setPageLoading,
  } = useFunction(props);

  const mute = useSelector((state: any) => state.chat.isMuteStatusRoom);

  //Render ra UI chọn ảnh, video, file
  const renderActions = useCallback(
    (inputProps: any) => {
      return (
        <Actions
          {...inputProps}
          containerStyle={styles.addBtn}
          onPressActionButton={cancelModal}
          icon={() => <Image source={iconUpload} />}
        />
      );
    },
    [cancelModal],
  );

  const renderActionsRight = useCallback(
    (inputProps: any) => {
      return (
        <>
          {showSendMessageButton && (
            <>
              {inputProps.formattedText?.length > 0 ||
              chosenFiles.length > 0 ? (
                <Actions
                  {...inputProps}
                  containerStyle={styles.buttonRight}
                  onPressActionButton={() => {
                    const messages = [
                      {
                        text: getText(inputProps.formattedText),
                        user: {_id: inputProps.user?._id},
                        createdAt: new Date(Date.now()),
                      },
                    ];
                    sendMessage(messages);
                    setFormattedText([]);
                  }}
                  icon={() => <Image source={iconSend} />}
                />
              ) : (
                <Actions
                  {...inputProps}
                  containerStyle={styles.buttonRight}
                  onPressActionButton={() => sendLabel(1)}
                  icon={() => <Image source={iconLike} />}
                />
              )}
            </>
          )}
        </>
      );
    },
    [
      chosenFiles,
      getText,
      sendLabel,
      sendMessage,
      setFormattedText,
      showSendMessageButton,
    ],
  );

  //Render ra UI của message
  const renderMessage = useCallback(
    (inputProps: any) => {
      return (
        <>
          <ItemMessage
            {...inputProps}
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
            changePartCopy={(data: any) => {
              changePartCopy(data);
            }}
            quoteMsg={(data: any) => {
              quoteMessage(data);
            }}
            navigatiteToListReaction={(idMsg: any) => {
              navigatiteToListReaction(idMsg);
            }}
            listUser={listUserChat}
            newIndexArray={newIndexArray}
            me={me}
            showRedLine={showRedLine}
            idRedLine={idRedLine}
            isAdmin={dataDetail?.is_admin}
            moveToMessage={(id: any) => {
              navigateToMessage(id);
            }}
            indexRedLine={indexRedLine}
            setFormattedText={setFormattedText}
            mentionedUsers={mentionedUsers}
            setListUserSelect={setListUserSelect}
            setInputText={setInputText}
            setPageLoading={setPageLoading}
          />
        </>
      );
    },
    [
      listUserChat,
      newIndexArray,
      bookmarkMessage,
      dataDetail?.is_admin,
      deleteMsg,
      editMessage,
      idRoomChat,
      indexRedLine,
      me,
      mentionedUsers,
      navigateToMessage,
      navigatiteToListReaction,
      quoteMessage,
      reactionMessage,
      changePartCopy,
      idRedLine,
      replyMessage,
      setFormattedText,
      showRedLine,
      updateGimMessage,
      setInputText,
      setListUserSelect,
      setPageLoading,
    ],
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
  const onViewRef = useRef((viewableItems: any) => {
    const index = viewableItems?.viewableItems?.length - 1;
    setIndex(viewableItems?.viewableItems[index]?.index);
  });

  //Config view xem trong tài liệu của RN
  const viewConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 0,
  });

  return (
    <View style={styles.container}>
      <View style={showTaskForm ? [styles.blackout] : []} />
      <View style={{height: '100%'}}>
        <Header
          back
          //Check title header nếu đây là chat 1-1 hay chat nhóm
          title={
            dataDetail?.name && dataDetail?.name?.length > 0
              ? dataDetail?.name
              : `${
                  dataDetail?.one_one_check &&
                  dataDetail?.one_one_check?.length > 0
                    ? dataDetail?.one_one_check[0]?.last_name
                    : ''
                } ${
                  dataDetail?.one_one_check &&
                  dataDetail?.one_one_check?.length > 0
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
          customBack={customBack}
          mute={mute}
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
          formattedText={formattedText}
          keyboardHeight={keyboardHeight}
          ref={giftedChatRef}
          onInputTextChanged={txt => {
            formatText(txt, false);
            setInputText(txt);
          }}
          textSelection={textSelection}
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
          //Các props của flatlist nhúng vào gifted chat
          listViewProps={{
            scrollEventThrottle: 400,
            //Xử lý loadmore tin nhắn
            onScroll: ({nativeEvent}: any) => {
              if (isCloseToTop(nativeEvent)) {
                onLoadMore();
              } else if (nativeEvent?.contentOffset?.y === 0) {
                onLoadMoreDown();
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
              } else if (nativeEvent?.key === 'Enter') {
                formattedText.push(' ');
                setFormattedText(formattedText);
                return false;
              } else if (nativeEvent?.key === 'Backspace') {
                // 半角@入力後にも発火するので何もしない
              } else {
                setShowTag(false);
              }
            },
            onSelectionChange: ({nativeEvent}: any) => {
              textSelection.start = nativeEvent.selection.start;
              textSelection.end = nativeEvent.selection.end;
              setInputIndex(nativeEvent.selection.start);
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
                        choseUser={(value: any, title: string, id: any) => {
                          setIds(ids?.concat([id]));
                          setShowTag(false);
                          if (id === 'All') {
                            setListUserSelect(
                              listUserChat.map(el => {
                                return {
                                  userId: el.id,
                                  userName: el.last_name + el.first_name,
                                };
                              }),
                            );
                          } else {
                            listUserSelect.push({
                              userId: id,
                              userName: value,
                            });
                            setListUserSelect(listUserSelect);
                          }

                          if (value) {
                            mentionedUsers.push('@' + value + title);
                            mentionedUsers.push('@' + value);
                            const wordBeforeMention = getText(formattedText)
                              ? getText(formattedText)
                              : ' ';
                            //前のテキストと今のテキストの違いをみつけてそれが@のみのはずなので、その@の位置にinsertする
                            const first = wordBeforeMention.substring(
                              0,
                              inputIndex,
                            );
                            const second = wordBeforeMention.substring(
                              inputIndex + 1,
                            );
                            const newText = `${first} @${value}${title} ${second}`;
                            formatText(newText, true);
                            setInputText(newText);
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
        <DecoButton onDecoSelected={onDecoSelected} />
        {chosenFiles.length > 0 && (
          <ShowPickedFile chosenFiles={chosenFiles} deleteFile={deleteFile} />
        )}
        {/* create task icon */}
        <View
          style={
            keyboardHeight === 0 && chosenFiles.length === 0
              ? styles.viewTask
              : chosenFiles.length > 0 && keyboardHeight === 0
              ? styles.viewTaskWithFiles
              : keyboardHeight > 0 && chosenFiles.length === 0
              ? styles.viewTaskWithKeyboard
              : styles.viewTaskWithKeyboardFiles
          }>
          <TouchableOpacity onPress={onCreateTask}>
            <Image source={iconTask} style={styles.imageTask} />
          </TouchableOpacity>
        </View>
      </View>
      {showTaskForm && (
        <ModalTask
          visible={showTaskForm}
          onCancel={() => setShowTaskForm(false)}
          onSaveTask={onSaveTask}
          idRoomChat={idRoomChat}
          selected={selected}
          setSelected={setSelected}
          showTaskForm={showTaskForm}
        />
      )}
      {showUserList && (
        <ModalUserList
          visible={showUserList}
          onCancel={() => setShowUserList(false)}
          setShowTaskForm={setShowTaskForm}
          setShowUserList={setShowUserList}
          setSelected={setSelected}
          keyboardHeight={keyboardHeight}
        />
      )}
      {/* UI modal chọn ảnh, video và file */}
      <ModalPickFile
        visible={pickFile}
        onCancel={cancelModal}
        chosePhoto={chosePhoto}
        choseFile={choseFile}
      />
      {partCopy && (
        <View style={styles.viewPartCopy}>
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.viewPartCopyOverlay,
              {alignItems: partCopy.me ? 'flex-end' : 'flex-start'},
            ]}
            onPress={() => changePartCopy(null)}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <LinearGradient
                colors={partCopy.colors}
                start={{x: 1, y: 0}}
                end={{x: 0, y: 0}}
                style={styles.containerChat}>
                <TextInput
                  editable={Platform.OS === 'android'}
                  multiline
                  scrollEnabled={true}
                  selectTextOnFocus={true}
                  showSoftInputOnFocus={false}
                  style={styles.partCopyText}
                  value={partCopy.text}
                  onChangeText={() => {
                    Keyboard.dismiss();
                    changePartCopy(partCopy);
                  }}
                />
              </LinearGradient>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export {DetailChat};

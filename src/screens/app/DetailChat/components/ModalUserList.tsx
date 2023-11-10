import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';

import {colors, stylesCommon} from '@stylesCommon';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';
import AntDesign from 'react-native-vector-icons/AntDesign';
AntDesign.loadFont().then();
import {getListUser} from '@services';
import {Colors} from '../../Project/Task/component/Colors';
import {showMessage} from 'react-native-flash-message';
import {ItemUser} from '../../DetailChat/components/ItemUser';
import {useSelector} from 'react-redux';
import {AppInput} from '@component';

const ModalUserList = React.memo((prop: any) => {
  const {
    onCancel,
    visible,
    idRoomChat,
    setShowTaskForm,
    setShowUserList,
    setSelected,
    keyboardHeight,
  } = prop;
  const [listUser, setListUser] = useState<any>([]);
  const [allListUser, setAllListUser] = useState<any>([]);
  const loginUser = useSelector((state: any) => state.auth.userInfo);
  const [searchWord, setSearchWord] = useState<any>('');

  useEffect(() => {
    getListUserApi();
  }, []);

  const getListUserApi = async () => {
    try {
      if (!idRoomChat) {
        throw new Error('idRoomChat is undefined.');
      }
      const result = await getListUser({room_id: idRoomChat, all: 1});
      const dataUser = result?.data?.users?.data;
      const dataConvert = dataUser?.map((element: any) => {
        return {
          ...element,
          label:
            element?.id < 0
              ? element?.name
              : `${element?.last_name}${element?.first_name}`,
        };
      });
      setListUser(
        dataConvert
          .map(user => {
            return {
              label: user.label,
              value: user.id,
              icon_image: user.icon_image,
            };
          })
          .concat([
            {
              label: loginUser.last_name + loginUser.first_name,
              value: loginUser.id,
              icon_image: loginUser.icon_image,
            },
          ]),
      );
      setAllListUser(
        dataConvert
          .map(user => {
            return {
              label: user.label,
              value: user.id,
              icon_image: user.icon_image,
            };
          })
          .concat([
            {
              label: loginUser.last_name + loginUser.first_name,
              value: loginUser.id,
              icon_image: loginUser.icon_image,
            },
          ]),
      );
    } catch (error) {
      console.error(error);
      showMessage({
        message: '処理中にエラーが発生しました',
        type: 'danger',
      });
    }
  };

  const closeModal = () => {
    onCancel();
  };

  const renderItem = ({item}: any) => (
    <ItemUser
      item={item}
      setShowTaskForm={setShowTaskForm}
      setShowUserList={setShowUserList}
      setSelected={setSelected}
    />
  );

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={() => {}}
      style={{
        width: '100%',
        alignSelf: 'center',
        height: '100%',
        justifyContent: 'flex-start',
        backgroundColor: 'green',
      }}
      animationType="fade">
      <TouchableWithoutFeedback
        onPress={() => {
          closeModal();
        }}>
        <View style={styles.containerModal}>
          <View
            style={
              keyboardHeight === 0
                ? styles.viewContent
                : styles.viewContentWithKeyboard
            }>
            <AppInput
              onChange={(text: any) => {
                setSearchWord(text);
                if (text !== '') {
                  setListUser(
                    allListUser.filter(user => user.label.includes(text)),
                  );
                } else {
                  setListUser(allListUser);
                }
              }}
              value={searchWord}
              styleContainer={styles.containerSearch}
              styleInput={styles.input}
              placeholder={'Search'}
            />
            <FlatList
              data={listUser}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                <Text style={styles.txtEmpty}>データなし</Text>
              }
              onEndReachedThreshold={0.01}
              onEndReached={() => {}}
              contentContainerStyle={{paddingBottom: 5}}
              keyboardShouldPersistTaps={'handled'}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

const styles = StyleSheet.create({
  containerModal: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },

  viewOut: {
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#0000ff',
  },
  icon: {
    tintColor: colors.darkGrayText,
  },
  buttonClose: {
    position: 'absolute',
    right: 0,
  },
  buttonSave: {
    position: 'absolute',
    right: 40,
    width: '15%',
    paddingVertical: moderateScale(10),
    borderRadius: verticalScale(10) / 2,
  },
  buttonSaveTitle: {
    fontSize: moderateScale(11),
    fontWeight: 'bold',
  },
  buttonBottomSave: {
    width: '30%',
    alignSelf: 'center',
    paddingVertical: moderateScale(10),
    borderRadius: verticalScale(10) / 2,
  },
  buttonBottomSaveTitle: {
    fontSize: moderateScale(11),
    fontWeight: 'bold',
  },
  containerSearch: {
    width: '90%',
    textAlign: 'center',
    alignSelf: 'center',
    borderRadius: moderateScale(0),
    margin: scale(5),
    paddingHorizontal: verticalScale(1),
  },
  input: {
    paddingVertical: verticalScale(1),
    fontSize: moderateScale(13),
  },
  periodBox: {
    width: '45%',
    padding: scale(2),
  },
  periodDate: {
    width: '90%',
  },
  periodTime: {
    width: '90%',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerDropdown: {
    width: '100%',
  },
  dropdown: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  placeholderStyle: {
    fontSize: 12,
  },
  selectedTextStyle: {
    fontSize: 12,
  },
  iconStyle: {
    width: 10,
    height: 10,
  },
  inputSearchStyle: {
    height: 30,
    fontSize: 12,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'white',
    shadowColor: '#000',
    marginTop: 8,
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  textSelectedStyle: {
    marginRight: 5,
    fontSize: 10,
  },
  textTitleInput: {
    color: colors.black,
    fontSize: moderateScale(11),
    ...stylesCommon.fontWeight600,
    marginTop: 12,
    marginBottom: 5,
  },
  textMandatory: {
    color: colors.white,
    fontSize: moderateScale(11),
    ...stylesCommon.fontWeight600,
  },
  datePickerStyle: {
    fontSize: moderateScale(11),
    width: '80%',
  },
  parentHr: {
    height: 1,
    color: '#000000',
    width: '100%',
    borderWidth: 0.5,
    borderColor: Colors.LIGHTGRAY,
  },
  rowTitle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  mandatory: {
    backgroundColor: '#D8643F',
    borderRadius: moderateScale(5),
    marginTop: 6,
    marginBottom: 5,
    marginLeft: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 5,
    marginLeft: 35,
  },
  checkbox: {
    margin: 11,
    marginLeft: 0,
    width: 18,
    height: 18,
    padding: 2,
  },
  checkboxLabel: {
    margin: 11,
    marginLeft: 0,
    fontSize: moderateScale(11),
    color: '#999999',
  },
  viewContent: {
    width: '50%',
    height: '20%',
    bottom: 180,
    left: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(10),
    borderWidth: 0.5,
    borderColor: '#999999',
  },
  viewContentWithKeyboard: {
    width: '50%',
    height: '20%',
    bottom: 520,
    left: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(10),
    borderWidth: 0.5,
    borderColor: '#999999',
  },
  txtEmpty: {
    textAlign: 'center',
    marginTop: verticalScale(20),
    color: colors.darkGrayText,
    ...stylesCommon.fontWeight600,
    fontSize: moderateScale(18),
  },
});

export {ModalUserList};

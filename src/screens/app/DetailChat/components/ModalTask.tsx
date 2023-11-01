import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import CheckBox from '@react-native-community/checkbox';
import {AppButton, AppInput} from '@component';
import {iconClose} from '@images';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import {colors, stylesCommon} from '@stylesCommon';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';
import {HITSLOP} from '@util';
import DateTimePicker from '@react-native-community/datetimepicker';
import {MultiSelect} from 'react-native-element-dropdown';
import {getListUser} from '@services';
import {Colors} from '../../Project/Task/component/Colors';
import {showMessage} from 'react-native-flash-message';
import {useSelector} from 'react-redux';
import moment from 'moment/moment';

const ModalTask = React.memo((prop: any) => {
  const {
    onCancel,
    visible,
    onSaveTask,
    onUpdateTask,
    idRoomChat,
    item,
    selected,
    setSelected,
    showTaskForm,
  } = prop;
  const [taskName, setTaskName] = React.useState('');
  const [taskDescription, setTaskDescription] = React.useState('');
  const [listUser, setListUser] = useState<any>([]);
  const [date, setDate] = useState(moment().format('YYYY/MM/DD'));
  const [time, setTime] = useState('00:00:00');
  const [isGoogleCalendar, setIsGoogleCalendar] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);
  const [focusDescription, setFocusDescription] = useState(false);
  const loginUser = useSelector((state: any) => state.auth.userInfo);
  const inputRef = useRef();

  const [date1, setDate1] = useState(new Date());
  const [date2, setDate2] = useState(new Date());
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const onChange1 = (event, selectedDate) => {
    const currentDate = selectedDate || date1;
    setDate1(currentDate);
    const formartedDate =
      currentDate.getFullYear() +
      '-' +
      ('0' + (currentDate.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + currentDate.getDate()).slice(-2);
    setDate(formartedDate);
    setShow1(Platform.OS === 'ios');
  };
  const onChange2 = (event, selectedDate) => {
    const currentDate = selectedDate || date2;
    setDate2(currentDate);
    const formartedTime = ('0' + currentDate.getHours()).slice(-2) +
      ':' +
      ('0' + currentDate.getMinutes()).slice(-2) +
      ':00';
    setTime(formartedTime);
    setShow2(Platform.OS === 'ios');
  };

  const showDatepicker = () => {
    setShow1(true);
  };

  const showTimepicker = () => {
    setShow2(true);
  };

  useEffect(() => {
    getListUserApi();
  }, []);
  useEffect(() => {
    if (item) {
      setTaskName(item?.name);
      setDate(item?.plans_end_date);
      setTime(item?.plans_end_time);
      setTaskDescription(item?.description);
      setSelected(
        item?.persons.map((person: {name: any; user_id: any}) => {
          return person.user_id;
        }),
      );
      setIsGoogleCalendar(item?.gcalendar_flg);
      setIsAllDay(item?.all_day_flg);
    }
  }, [item]);
  useEffect(() => {
    setTaskName('');
    setTaskDescription('');
    setDate(moment().format('YYYY/MM/DD'));
    setTime('00:00:00');
    setIsGoogleCalendar(false);
    setIsAllDay(false);
  }, [showTaskForm]);

  const getListUserApi = async () => {
    try {
      if(!idRoomChat) return;
      const result = await getListUser({room_id: idRoomChat, all: true});

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
            return {label: user.label, value: user.id};
          })
          .concat([
            {
              label: loginUser.last_name + loginUser.first_name,
              value: loginUser.id,
            },
          ]),
      );
    } catch {
      () => {
        showMessage({
          message: '処理中にエラーが発生しました',
          type: 'danger',
        });
      };
    }
  };

  const closeModal = () => {
    onCancel();
  };
  const onPressDescription = () => {
    inputRef.current.focus();
  };
  const saveTask = () => {
    let data;
    if (!item) {
      // create new
      data = {
        taskName: taskName,
        taskDescription: taskDescription,
        selected: selected,
        date: date,
        time: time,
        isGoogleCalendar: isGoogleCalendar,
        isAllDay: isAllDay,
        chat_room_id: idRoomChat,
      };
      onSaveTask(data);
    } else {
      // update
      data = {
        project_id: item.project_id,
        task_id: item.id,
        task_name: taskName,
        actual_start_date: item.actual_start_date,
        actual_end_date: item.actual_end_date,
        plans_end_date: date,
        plans_end_time: time,
        plans_time: item.plans_time,
        actual_time: item.actual_time,
        plans_cnt: item.plans_cnt,
        actual_cnt: item.actual_cnt,
        cost: item.cost,
        task_person_id: selected,
        description: taskDescription,
        cost_flg: item.cost_flg,
        remaindar_flg: item.remaindar_flg,
        repeat_flag: item.repeat_flag ?? 0,
        stat: item.stat,
        chat_room_id: idRoomChat,
        gcalendar_flg: isGoogleCalendar,
        all_day_flg: isAllDay,
      };
      onUpdateTask(data);
    }
  };
  const renderDataItem = (item, selected) => {
    return (
      <View style={styles.item}>
        {selected && (
          <CheckBox
            value={true}
            style={styles.checkbox}
            boxType={'square'}
            hideBox={false}
          />
        )}
        {!selected && (
          <CheckBox
            value={false}
            style={styles.checkbox}
            boxType={'square'}
            hideBox={false}
          />
        )}
        <Text style={styles.selectedTextStyle}>{item.label}</Text>
      </View>
    );
  };
  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={closeModal}
      animationType="fade">
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.containerModal}>
          <View
            style={styles.viewOut}
            //@ts-ignore
            onStartShouldSetResponder={closeModal}
          />
          <View style={styles.container}>
            {!focusDescription && (
              <View>
                <View style={styles.viewHeader}>
                  <TouchableOpacity
                    style={styles.buttonClose}
                    hitSlop={HITSLOP}
                    onPress={closeModal}>
                    <Image source={iconClose} style={styles.icon} />
                  </TouchableOpacity>
                  <AppButton
                    title={'保存'}
                    onPress={saveTask}
                    styleButton={styles.buttonSave}
                    styleTitle={styles.buttonSaveTitle}
                  />
                </View>
                <View style={styles.parentHr} />
                <View style={styles.rowTitle}>
                  <Text style={styles.textTitleInput}>タスク名</Text>
                  <View style={styles.mandatory}>
                    <Text style={styles.textMandatory}>必須</Text>
                  </View>
                </View>
                <AppInput
                  onChange={(text: any) => {
                    setTaskName(text);
                  }}
                  value={taskName}
                  styleContainer={styles.containerSearch}
                  styleInput={styles.input}
                />
                <Text style={[styles.textTitleInput, {paddingTop: 10}]}>期間</Text>
                <View style={styles.row}>
                  <Text
                    style={[
                      styles.textTitleInput,
                      {width: '10%', color: '#777777', ...stylesCommon.fontWeight500},
                    ]}>
                    終了
                  </Text>
                  <View style={styles.periodBox}>
                    {!show1 && (
                      <View>
                        <TouchableOpacity onPress={() => showDatepicker()}>
                          <Text>{date}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {show1 && (
                      <DateTimePicker
                        testID="dateTimePicker"
                        timeZoneOffsetInMinutes={
                          -new Date().getTimezoneOffset()
                        }
                        value={date1}
                        mode={'date'}
                        is24Hour={true}
                        display="default"
                        onChange={onChange1}
                      />
                    )}
                  </View>
                  <View style={styles.periodBox}>
                    {!show2 && (
                      <View>
                        <TouchableOpacity onPress={() => showTimepicker()}>
                          <Text>{time}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {show2 && (
                      <DateTimePicker
                        testID="dateTimePicker"
                        timeZoneOffsetInMinutes={
                          -new Date().getTimezoneOffset()
                        }
                        value={date2}
                        mode={'time'}
                        is24Hour={false}
                        display="default"
                        onChange={onChange2}
                      />
                    )}
                  </View>
                </View>
                <View style={styles.checkboxContainer}>
                  <CheckBox
                    value={isGoogleCalendar}
                    onValueChange={setIsGoogleCalendar}
                    style={styles.checkbox}
                    boxType={'square'}
                    hideBox={false}
                  />
                  <Text style={styles.checkboxLabel}>Googleカレンダーに表示</Text>
                  <CheckBox
                    value={isAllDay}
                    onValueChange={setIsAllDay}
                    style={styles.checkbox}
                    boxType={'square'}
                    hideBox={false}
                  />
                  <Text style={styles.checkboxLabel}>終日</Text>
                </View>

                <View style={[styles.rowTitle, {paddingTop: 0}]}>
                  <Text style={styles.textTitleInput}>担当者</Text>
                  <View style={styles.mandatory}>
                    <Text style={styles.textMandatory}>必須</Text>
                  </View>
                </View>
                <View style={styles.containerDropdown}>
                  <MultiSelect
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={listUser}
                    labelField="label"
                    valueField="value"
                    placeholder="担当者を選択"
                    value={selected}
                    search
                    searchPlaceholder="Search..."
                    onChange={user => {
                      setSelected(user);
                    }}
                    renderLeftIcon={() => {}}
                    renderItem={renderDataItem}
                    renderSelectedItem={(item, unSelect) => (
                      <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
                        <View style={styles.selectedStyle}>
                          <Text style={styles.textSelectedStyle}>{item.label}</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                  <StatusBar />
                </View>
            </View>)}
            <Text style={[styles.textTitleInput, {paddingTop: 10}]}>説明</Text>
            <View style={styles.containerDescriptionModal}>
              <View
                style={styles.viewContent}>
                <TouchableOpacity
                  style={{
                    height: '90%',
                    marginHorizontal: 5,
                    backgroundColor: '#ffffff',
                    marginTop: 5,
                  }}
                  onPress={onPressDescription}>
                  <TextInput
                    ref={inputRef}
                    editable
                    multiline
                    numberOfLines={5}
                    maxLength={400}
                    onChangeText={text => setTaskDescription(text)}
                    value={taskDescription}
                    style={{padding: 10}}
                    onFocus={() =>setFocusDescription(true) }
                    onBlur={() => setFocusDescription(false) }
                  />
                </TouchableOpacity>
              </View>
            </View>
            <AppButton
              title={'保存'}
              onPress={saveTask}
              styleButton={styles.buttonBottomSave}
              styleTitle={styles.buttonBottomSaveTitle}
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
    top: 60,
    left: 10,
    width: '95%',
    height: '90%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    textAlign: 'center',
    background: '#000000',
  },
  containerDescriptionModal: {
    width: '100%',
    height: '30%',
    backgroundColor: 'transparent',
  },
  container: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(10),
    alignItems: 'flex-start',
    paddingHorizontal: scale(26),
    paddingBottom: getBottomSpace() + 10,
    backgroundColor: '#FFFFFF',
  },
  containerSave: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(4),
    alignItems: 'center',
    paddingHorizontal: scale(26),
    paddingBottom: getBottomSpace() + 10,
    backgroundColor: '#FFFFFF',
  },
  viewOut: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  viewHeader: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // marginVertical: verticalScale(25),
    // flexDirection: 'row',
    height: '10%',
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
    borderRadius: verticalScale(10) / 2,
    paddingHorizontal: scale(13),
  },
  input: {
    paddingVertical: verticalScale(10),
    fontSize: moderateScale(14),
    ...stylesCommon.fontWeight500,
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
    width: 200,
    height: 35,
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
    paddingLeft: 17,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 30,
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
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 0.5,
    width: '100%',
    height: '60%',
    marginBottom: 10,
    borderRadius: moderateScale(10),
  },
});

export {ModalTask};

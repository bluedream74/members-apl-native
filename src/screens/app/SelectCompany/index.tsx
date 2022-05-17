import React, {useState, useCallback, useEffect} from 'react';
import {View, Text, TouchableOpacity, FlatList, TextInput} from 'react-native';
import {styles} from './styles';
import {Header, AppInput, AppButton} from '@component';
import {iconSearch, iconAddListChat} from '@images';
import {useFocusEffect} from '@react-navigation/native';
import {debounce} from 'lodash';
import {getRoomList, getUserInfo} from '@redux';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {ROUTE_NAME} from '@routeName';
import {getListCompany} from '@services';

const SelectCompany = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const user = useSelector((state: any) => state.auth.userInfo);
  const [key, setKey] = useState<string>('');
  const [data, setData] = useState([]);
  const [active, setActive] = useState(null);

  const getListCompanyApi = async () => {
    try {
      const res = await getListCompany();
      setData(res?.data.data);
    } catch (error) {}
  };

  useFocusEffect(
    useCallback(() => {
      getListCompanyApi();
    }, []),
  );

  const debounceText = useCallback(
    debounce(text => dispatch(getRoomList({key: text})), 500),
    [],
  );

  const onChangeActive = useCallback(
    (value: any) => {
      setActive(value);
    },
    [active],
  );

  const onNavigate = useCallback(() => {
    navigation.navigate(ROUTE_NAME.TAB_SCREEN);
  }, []);

  const onChangeText = (text: any) => {
    setKey(text);
    // debounceText(text);
  };
  const renderItem = ({item, index}: any) => (
    <>
      <TouchableOpacity
        style={[
          styles.item,
          {borderBottomWidth: index + 1 === data?.length ? 0 : 1},
        ]}
        onPress={() => onChangeActive(item?.id)}>
        <View style={styles.viewActive}>
          <View style={styles.viewActiveInfo}>
            {active === item?.id && <View style={styles.active} />}
          </View>
        </View>
        <View style={styles.viewContentItem}>
          <Text style={styles.txtID}>ID: {item?.id}</Text>
          <Text style={styles.txtName}>{item?.name}</Text>
          <Text style={styles.txtIDContent}>{item?.post_code}</Text>
        </View>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <Header title="チャットグループ一覧" imageCenter />
      <View style={styles.viewContent}>
        <AppInput
          placeholder="チャット名、メッセージ内容を検索"
          onChange={onChangeText}
          value={key}
          styleContainer={styles.containerSearch}
          styleInput={styles.input}
          icon={iconSearch}
          styleIcon={styles.icon}
        />
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.txtEmpty}>会社が見つかりません</Text>
          }
        />
      </View>
      <View style={styles.viewBottom}>
        <AppButton title="選択" disabled={!active} onPress={onNavigate} />
      </View>
    </View>
  );
};

export {SelectCompany};

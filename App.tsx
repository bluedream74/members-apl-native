import React, { useEffect } from "react";
import { StatusBar, Alert, BackHandler, Linking } from "react-native";
import NavigationApp from './src/navigation/StackContainer';
import {NavigationUtils} from '@navigation';
import {store, persistor} from './src/redux/store';
import {Provider, useDispatch} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {GlobalUI} from '@component';
import {GlobalService} from '@services';
import FlashMessage from 'react-native-flash-message';
import {LogBox} from 'react-native';
import VersionCheck from 'react-native-version-check';
import RNExitApp from 'react-native-exit-app';

//Disable yellow box warning
LogBox.ignoreAllLogs();

const App = () => {
  const checkUpdateNeeded = async () => {
    let updateNeeded = await VersionCheck.needUpdate();
    if (updateNeeded && updateNeeded.isNeeded) {
      //Alert the user and direct to the app url
      Alert.alert(
        'バージョンを更新してください',
        '本アプリを利用するには最新バージョンに更新する必要があります。',
        [
          {
            text: '更新',
            onPress: () => {
              const link = updateNeeded.storeUrl;
              Linking.canOpenURL(link).then(
                supported => {
                  supported && Linking.openURL(link);
                },
                err => console.log(err),
              );
              setTimeout(() => {
                RNExitApp.exitApp();
              }, 2000);
            },
          },
        ],
        {cancelable: false},
      );
    }
  };
  useEffect(() => {
    checkUpdateNeeded();
  }, []);
  return (
    <>
      <StatusBar
        barStyle={'dark-content'}
        translucent={true}
        backgroundColor="transparent"
      />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NavigationApp
            ref={(navigatorRef: any) =>
              NavigationUtils.setTopLevelNavigator(navigatorRef)
            }
          />
        </PersistGate>
      </Provider>
      <FlashMessage position="top" floating={true} hideStatusBar={false} />
      <GlobalUI ref={GlobalService.globalUIRef} />
    </>
  );
};

export default App;

//NOTE:
//Turn on log redux: check src/redux/store.tsx
//Turn on log api request: check src/services/logger.tsx
//Tất cả đã được tích hợp locate typeScript

//======> src/assets ======>  : font chữ của app
//======> src/component ======> : Các thành phần đc sử dụng trong app như button, input, modal ...
//======> src/images ======> : Các ảnh và icon được dùng trong app
//======> src/lib ======> : Nơi chứa các lib được custom lại
//======> src/navigation ======> : Nơi chứa Route name và các file thành phần điều hướng trong app
//======> src/redux ======> : Nơi chứa khá nhiều tầng logic và các biến được quản lý trong app
//======> src/screens ======> : Nơi chứa các UI màn hình
//======> src/services ======> : Nơi chứa các request tới server
//======> src/stylesCommon ======> : Nơi chứa các style chung của app như font chữ và màu sắc
//======> src/util ======> : Nơi chứa các hàm logic hỗ trợ và các dịch vụ của bên api thứ 3 được sử dụng trong app

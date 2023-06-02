import messaging from '@react-native-firebase/messaging';
import {colors} from '@stylesCommon';
import {showMessage} from 'react-native-flash-message';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';
import {Platform} from 'react-native';
import {getSystemVersion} from 'react-native-device-info';
import {registerToken} from '@services';
import {store} from '../redux/store';
import {convertString} from '@util';
import notifee, {EventType} from '@notifee/react-native';
import {getRoomList} from "@redux";

function createAppNotification() {
  let fcmToken = '';
  let lastMessageId = '';

  const initFB = () => {
    requestUserPermisstion();
    messaging().onTokenRefresh((newFcmToken: string) => {
      saveDeviceToken(newFcmToken);
    });

    messaging()
      .getInitialNotification()
      .then(async notification => {
        if (!notification) {
          return;
        }
        if (notification.messageId !== lastMessageId) {
          lastMessageId = notification.messageId || '';
        }
        handleUserInteractionNotification(notification);
      })
      .catch(error => {
        throw error;
      });

    messaging().onMessage(async notification => {
      if (notification.messageId !== lastMessageId) {
        lastMessageId = notification.messageId || '';
        handleNotiOnForeground(notification);
      }
    });

    messaging().onNotificationOpenedApp(async notification => {
      if (notification.messageId !== lastMessageId) {
        lastMessageId = notification.messageId || '';
      }
      await notifee.decrementBadgeCount();
      handleUserInteractionNotification(notification);
    });

    messaging().setBackgroundMessageHandler(async notification => {
      if (notification.messageId !== lastMessageId) {
        lastMessageId = notification.messageId || '';
      }
      await notifee
        .incrementBadgeCount()
        .then(() => notifee.getBadgeCount())
        .then(count => {});
      handleUserInteractionNotification(notification);
    });
  };

  notifee.onBackgroundEvent(async ({type, detail}: any) => {
    const {notification, pressAction} = detail;
    if (type === EventType.ACTION_PRESS && pressAction?.id === 'mark-as-read') {
      await notifee.decrementBadgeCount();
      await notifee.cancelNotification(notification?.id);
    }
  });

  const requestUserPermisstion = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const newFcmToken = await messaging().getToken();
      fcmToken = newFcmToken;
      saveDeviceToken(newFcmToken);
    }
  };

  const handleNotiOnForeground = async (message: any) => {
    let {notification, data} = message;
    let title = '';
    let bodyMessage = '';
    const state = store.getState();
    try {
      title = notification.title;
      bodyMessage = notification.body;
      showMessage({
        backgroundColor: 'rgba(139, 194, 39, 0.8)',
        duration: 5000,
        message: title,
        description: convertString(bodyMessage),
        color: '#FFFFFF',
        //@ts-ignore
        onPress: async () => {},
      });
      // update list chat unread message count
      store.dispatch(
        getRoomList({
          key: null,
          company_id: state.chat.idCompany,
          page: 1,
          type: state.chat.type_Filter,
          category_id: state.chat.categoryID_Filter,
        }),
      );
    } catch (error) {}
  };

  const handleUserInteractionNotification = (message: any) => {
    let {notification, data} = message;
    let title = '';
    let bodyMessage = '';
    try {
      title = notification.title;
      bodyMessage = convertString(notification?.title);
    } catch (error) {}
  };

  const saveDeviceToken = async (newFcmToken: string) => {
    try {
      const data = {
        token: newFcmToken,
        os_version: getSystemVersion(),
        os_name: Platform.OS,
      };
      const response = await registerToken(data);
    } catch (error) {}
  };

  const removeBadge = () => {
    notifee.setBadgeCount(0);
  };

  return {
    requestUserPermisstion,
    fcmToken,
    initFB,
    removeBadge,
  };
}

export const AppNotification = createAppNotification();

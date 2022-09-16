/**
 * @format
 */

import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { useSelector } from "react-redux";

messaging().setBackgroundMessageHandler(async remoteMessage => {});
/**
 * 通知受信時イベント
 */
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   if (Platform.OS === 'ios') {
//     console.log("hosotanidebug111");
//     // プッシュ通知件数をインクリメント
//     PushNotificationIOS.getApplicationIconBadgeNumber(number => {
//       // 未読チャット数取得API
//       console.log("hosotanidebug111222");
//       const unreadMessageCount = useSelector(
//         (state: any) => state.chat?.unReadMessageCount,
//       );
//       console.log("hosotanidebug111222333");
//       console.log(unreadMessageCount);
//       PushNotificationIOS.setApplicationIconBadgeNumber(unreadMessageCount);
//     });
//   }
// });

AppRegistry.registerComponent(appName, () => App);

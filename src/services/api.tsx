import axios from 'axios';
import {describeSuccessResponse, describeErrorResponse} from './logger';
import {showMessage} from 'react-native-flash-message';
import {store} from '../redux/store';
import {NavigationUtils} from '@navigation';
import {ROUTE_NAME} from '@routeName';

const api = axios.create();

const BASEURL = 'https://member-chat-api.adamo.tech/mobile';
// const BASEURL = 'https://stage.mem-bers.jp/mobile'

api.interceptors.request.use(
  async (config: any) => {
    config.baseURL = BASEURL;
    const state = store.getState();
    //@ts-ignore
    const token = state?.auth?.token;
    if (token) {
      config.headers = {
        Authorization: token,
        'Content-Type': 'application/json',
        ...config.headers,
      };
    }
    if (config?.method?.toUpperCase() === 'GET') {
      config.params = {...config.params};
    }
    return config;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  function (response: any) {
    describeSuccessResponse(response);
    try {
      return response?.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  function (error) {
    const {message} = error?.response?.data;
    if (error?.response?.data?.code === 503) {
      NavigationUtils.navigate(ROUTE_NAME.NETWORK_ERR);
    } else {
      showMessage({
        message: message ? message : 'Network Error',
        type: 'danger',
      });
    }
    describeErrorResponse(error);
    return Promise.reject(error);
  },
);

export default api;

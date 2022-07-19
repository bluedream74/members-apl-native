import React, {useImperativeHandle, useState, useRef} from 'react';
import {BackHandler} from 'react-native';
import {Loading} from './Loading';

export const GlobalUI = React.forwardRef((props, ref) => {
  const [isLoading, setLoading] = useState(false);
  const [isShowModalJob, setIsShowModalJob] = useState(false);
  const job = useRef<any>();

  const backAction = () => {
    return true;
  };

  useImperativeHandle(
    ref,
    () => ({
      showLoading,
      hideLoading,
    }),
    [],
  );

  const showLoading = () => {
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
  };
  return (
    <>
      <Loading isLoading={isLoading} />
    </>
  );
});

export default GlobalUI;

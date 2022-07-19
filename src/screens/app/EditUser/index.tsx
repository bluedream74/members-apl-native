import React, {useCallback, useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {styles} from './styles';
import {Header, AppInput, AppButton} from '@component';
import {iconClose} from '@images';
import {colors} from '@stylesCommon';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector, useDispatch} from 'react-redux';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import * as yup from 'yup';
import {validateForm} from '@util';
import {saveInfoUser} from '@redux';
import {GlobalService, updateProfile} from '@services';

const EditUser = (props: any) => {
  const {route} = props;
  const {type} = route?.params;
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state?.auth?.userInfo);
  const navigation = useNavigation<any>();

  const formInitialValuesName = {
    first_name: user?.first_name,
    last_name: user?.last_name,
  };

  const formInitialValuesEmail = {
    email: user?.mail,
  };

  const validationSchemaName = yup.object().shape({
    first_name: validateForm().first_name,
    last_name: validateForm().last_name,
  });

  const validationSchemaEmail = yup.object().shape({
    email: validateForm().email,
  });

  const onBack = useCallback(() => {
    navigation.goBack();
  }, []);

  const handleSubmit = async (value: any) => {
    const body = {
      ...value,
      type: type === 'Email' ? 'email' : 'name',
    };
    try {
      GlobalService.showLoading();
      const res = await updateProfile(body);
      dispatch(saveInfoUser(res?.data?.user_info));
      onBack();
      GlobalService.hideLoading();
    } catch {
      GlobalService.hideLoading();
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="個人情報"
        imageCenter
        iconRightFirst={iconClose}
        onRightFirst={onBack}
      />
      <View style={styles.viewContent}>
        <Formik
          initialValues={
            type === 'Name' ? formInitialValuesName : formInitialValuesEmail
          }
          validationSchema={
            type === 'Name' ? validationSchemaName : validationSchemaEmail
          }
          validateOnChange={false}
          onSubmit={handleSubmit}>
          {props => {
            return (
              <View style={styles.linearGradient}>
                <KeyboardAwareScrollView
                  alwaysBounceVertical={false}
                  style={styles.viewForm}
                  showsVerticalScrollIndicator={false}>
                  {type === 'Name' ? (
                    <>
                      <Text style={styles.txtTitle}>姓</Text>
                      <AppInput
                        placeholder="姓"
                        onChange={props.handleChange('last_name')}
                        //@ts-ignore
                        value={props.values.last_name}
                        //@ts-ignore
                        error={props.errors.last_name}
                      />
                      <Text style={styles.txtTitle}>名</Text>
                      <AppInput
                        placeholder="名"
                        onChange={props.handleChange('first_name')}
                        //@ts-ignore
                        value={props.values.first_name}
                        //@ts-ignore
                        error={props.errors.first_name}
                      />
                    </>
                  ) : null}
                  {type === 'Email' ? (
                    <>
                      <Text style={styles.txtTitle}>Eメール</Text>
                      <AppInput
                        placeholder="Eメール"
                        onChange={props.handleChange('email')}
                        //@ts-ignore
                        value={props.values.email}
                        //@ts-ignore
                        error={props.errors.email}
                      />
                    </>
                  ) : null}
                  <AppButton
                    title="アップデート"
                    onPress={props.handleSubmit}
                    styleButton={styles.button}
                  />
                </KeyboardAwareScrollView>
              </View>
            );
          }}
        </Formik>
      </View>
    </View>
  );
};

export {EditUser};

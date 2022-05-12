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
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state?.auth?.userInfo);
  const navigation = useNavigation<any>();

  const formInitialValues = {
    first_name: user?.first_name,
    last_name: user?.last_name,
    email: user?.mail,
  };

  const validationSchema = yup.object().shape({
    first_name: validateForm().first_name,
    last_name: validateForm().last_name,
    email: validateForm().email,
  });

  const onBack = useCallback(() => {
    navigation.goBack();
  }, []);

  const handleSubmit = async (value: any) => {
    try {
      GlobalService.showLoading();
      const res = await updateProfile(value);
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
          initialValues={formInitialValues}
          validationSchema={validationSchema}
          validateOnChange={false}
          onSubmit={handleSubmit}>
          {props => {
            return (
              <View style={styles.linearGradient}>
                <KeyboardAwareScrollView
                  alwaysBounceVertical={false}
                  style={styles.viewForm}
                  showsVerticalScrollIndicator={false}>
                  <Text style={styles.txtTitle}>ファーストネーム</Text>
                  <AppInput
                    placeholder="ファーストネーム"
                    onChange={props.handleChange('first_name')}
                    value={props.values.first_name}
                    error={props.errors.first_name}
                  />
                  <Text style={styles.txtTitle}>苗字</Text>
                  <AppInput
                    placeholder="苗字"
                    onChange={props.handleChange('last_name')}
                    value={props.values.last_name}
                    error={props.errors.last_name}
                  />
                  <Text style={styles.txtTitle}>Eメール</Text>
                  <AppInput
                    placeholder="Eメール"
                    onChange={props.handleChange('email')}
                    value={props.values.email}
                    error={props.errors.email}
                  />
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

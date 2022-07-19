// import moment from 'moment';
import * as yup from 'yup';
export const validateForm = () => {
  return {
    login: yup.string().required('この項目は必須です'),
    current_password: yup.string().required('この項目は必須です'),
    password: yup.string().required('この項目は必須です'),
    first_name: yup.string().required('この項目は必須です'),
    last_name: yup.string().required('この項目は必須です'),
    email: yup
      .string()
      .required('この項目は必須です')
      .email('Email is not valid'),
    confirmPassword: yup
      .string()
      .required('この項目は必須です')
      // .min(VALIDATE.minPassLength, trans("validate.minConfirmPassError"))
      // .max(VALIDATE.maxPassLength, trans("validate.maxConfirmPassError"))
      .oneOf(
        [yup.ref('password'), null],
        'パスワードがパスワードと一致しないことを確認する',
      ),

    fullname: yup
      .string()
      .required('この項目は必須です')
      .max(100, 'Full name may not be greater than 100 characters'),
    phone: yup
      .string()
      .required('この項目は必須です')
      .min(7, 'Phone must be at least 7 characters')
      .max(11, 'Phone may not be greater than 11 characters'),
    prefix: yup.string().required('この項目は必須です'),
    is_volunteer: yup.number().required('この項目は必須です'),
    dob: yup.string().required('この項目は必須です'),
    location: yup.string().required('この項目は必須です'),
    language: yup.string().required('この項目は必須です'),
  };
};

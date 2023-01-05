import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { verticalScale, scale, moderateScale } from 'react-native-size-matters';
import { colors, stylesCommon } from '@stylesCommon';

const MenuOption = React.memo((props: any) => {
  const { onDeleteMessage } = props;
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onDeleteMessage}>
        <Text style={styles.txtTitle}>削除</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
  },
  button: {
    paddingVertical: verticalScale(12),
    width: scale(80),
    alignItems: 'center'
  },
  txtTitle: {
    fontSize: moderateScale(14),
    color: colors.darkGrayText,
    ...stylesCommon.fontWeight600,
  },
});

export { MenuOption };

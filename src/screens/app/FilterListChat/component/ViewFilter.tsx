import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ViewHeader} from './ViewHeader';
import {ViewItem} from './ViewItem';

const ViewFilter = React.memo((props: any) => {
  const {onClick} = props;
  return (
    <View style={styles.container}>
      <ViewHeader title="メンションがあるチャット" />
      <ViewItem title="すべてのチャット" onPress={() => onClick(0)} />
      <ViewItem title="未読があるチャット" onPress={() => onClick(2)} />
      {/* <ViewItem
        title="メンションがあるチャット"
        hideBorder={true}
        onPress={() => onClick()}
      /> */}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    marginVertical: 4,
    borderRadius: 10,
  },
});

export {ViewFilter};

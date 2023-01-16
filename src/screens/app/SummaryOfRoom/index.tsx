import React, {useState, useCallback, useEffect} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {stylesCommon} from '@stylesCommon';
import {Header} from '@component';

import {ViewText} from './Component/ViewText';

const SummaryOfRoom = (props: any) => {
  const {route} = props;
  const {idRoom_chat} = route?.params;

  const renderView = useCallback(() => {
    return <ViewText id={idRoom_chat} />;
  }, []);

  return (
    <View style={styles.container}>
      <Header title="概要" imageCenter back />
      <View style={styles.viewContent}>
        {renderView()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...stylesCommon.viewContainer,
  },
  viewContent: {
    flex: 1,
  },
});

export {SummaryOfRoom};

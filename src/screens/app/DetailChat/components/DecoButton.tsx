
import React from 'react';
import { View } from 'react-native';
import { AppButton } from '@component';
import { styles } from './stylesItem';

export type DecoButtonProps = {
  onDecoSelected: any;
};

export default function DecoButton({ onDecoSelected }: DecoButtonProps) {
  const decoButtonArr = [{
    text: 'タイトル',
    tag: 'title',
  }, {
    text: '囲み枠',
    tag: 'info',
  }, {
    text: '罫線',
    tag: 'hr',
  }, {
    text: '太字',
    tag: 'bold',
  }, {
    text: '赤字',
    tag: 'red',
  }];

  return (
    <View style={styles.decoContainer}>
      {
        decoButtonArr.map((item) => {
          return (
            <AppButton
              title={item.text}
              onPress={() => onDecoSelected(item.tag)}
              styleButton={styles.decoButton}
              styleTitle={styles.decoText}
            />
          );
        })
      }
    </View>
  );
}
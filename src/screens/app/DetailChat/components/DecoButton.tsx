
import React, { useState } from 'react';
import { Dimensions, Keyboard, View } from 'react-native';
import { AppButton } from '@component';
import { styles } from './stylesItem';

const height = Dimensions.get('window').height;

export type DecoButtonProps = {
  onDecoSelected: any;
};

export default function DecoButton({ onDecoSelected }: DecoButtonProps) {
  const decoButtonArr = [{
    text: 'タイトル',
    tag: 'title',
    width: 72,
  }, {
    text: '囲み枠',
    tag: 'info',
    width: 72,
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

  const [bottom, setBottom] = useState(0)

  Keyboard.addListener(
    'keyboardWillShow',
    () => {
      setBottom(height >= 812 ? 340 : 250);
    }
  )
  Keyboard.addListener(
    'keyboardWillHide',
    () => {
      setBottom(0);
    }
  )

  return (
    <View style={[styles.decoContainer, { bottom: bottom }]}>
      {
        decoButtonArr.map((item) => {
          return (
            <AppButton
              key={item.tag}
              title={item.text}
              onPress={() => onDecoSelected(item.tag)}
              styleButton={[styles.decoButton, item.width ? { width: item?.width } : '']}
              styleTitle={styles.decoText}
            />
          );
        })
      }
    </View>
  );
}
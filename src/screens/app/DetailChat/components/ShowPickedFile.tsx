import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image, Keyboard, Dimensions,
  ImageBackground,
  TouchableHighlight,
} from "react-native";
import {getBottomSpace} from 'react-native-iphone-x-helper';
import {colors, stylesCommon} from '@stylesCommon';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';
import {iconDelete } from "@images";

const height = Dimensions.get('window').height;

const ShowPickedFile = React.memo((prop: any) => {
  const {
    chosenFiles,
    deleteFile,
  } = prop;
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
    <View style={[styles.container, { bottom: bottom }]}>
      <View style={styles.viewFeature}>
        {chosenFiles.map((item: any, index: any) => {
          return (
            <View key={item?.id}>
              {item?.sourceURL && (
                <ImageBackground
                  source={{
                    uri: item.sourceURL,
                  }}
                  style={styles.imageEmoji}>
                  <TouchableHighlight onPress={()=> deleteFile(item.sourceURL)} style={{backgroundColor: "transparent", width: "25%", alignSelf: "flex-end"}}>
                    {/*<Image source={iconDelete} style={{height: 9, width: 9,margin:4}} />*/}
                    <View style={styles.iconDelete}>
                      <Text style={styles.crossDelete}>x</Text>
                    </View>
                  </TouchableHighlight>
                </ImageBackground>
              )}
              {item?.uri && <Text>{item.name}</Text>}
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: moderateScale(4),
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingBottom: getBottomSpace(),
    backgroundColor: '#f2f2f2',
  },
  viewOut: {
    width: '100%',
    height: '10%',
    backgroundColor: 'transparent',
  },
  viewHeader: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(25),
    marginBottom: verticalScale(15),
    flexDirection: 'row',
  },
  txtHeader: {
    fontSize: moderateScale(18),
    color: colors.darkGrayText,
    ...stylesCommon.fontWeight600,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    paddingVertical: verticalScale(20),
    borderColor: colors.border,
  },
  txtTitle: {
    fontSize: moderateScale(16),
    color: colors.darkGrayText,
    ...stylesCommon.fontWeight600,
  },
  icon: {
    tintColor: colors.darkGrayText,
  },
  buttonClose: {
    position: 'absolute',
    left: 0,
  },
  txtInput: {
    padding: 10,
    borderColor: colors.border,
    borderWidth: 1,
    width: '90%',
    borderRadius: moderateScale(4),
    margin: 10,
  },
  viewFeature: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  itemFeature: {
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageEmoji: {
    width: 80,
    height: 80,
  },
  iconDelete: {
    backgroundColor: '#000000',
    borderRadius: 25,
    width: 15,
    height: 15,
  },
  crossDelete: {
    marginTop: 1,
    marginLeft: 4,
    color: '#ffffff',
    fontSize: 13,
    width: 13,
    height: 13,
    lineHeight: 13,
    fontWeight: 'bold',
  },
});

export {ShowPickedFile};

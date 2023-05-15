import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import {AppButton} from '@component';
import {iconClose} from '@images';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import {colors, stylesCommon} from '@stylesCommon';
import {scale, verticalScale, moderateScale} from 'react-native-size-matters';
import {HITSLOP} from '@util';

const ModalPickedFile = React.memo((prop: any) => {
  const {sendFile, onCancel, visible, chosenFiles, imageDescription, setImageDescription, onBack} = prop;
  const closeModal = () => {
    onCancel();
  };
  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={() => {}}
      animationType="fade">
      <View style={styles.containerModal}>
        <View
          style={styles.viewOut}
          //@ts-ignore
          onStartShouldSetResponder={closeModal}
        />
        <View style={styles.container}>
          <View style={styles.viewHeader}>
            <TouchableOpacity
              style={styles.buttonClose}
              hitSlop={HITSLOP}
              onPress={closeModal}>
              <Image source={iconClose} style={styles.icon} />
            </TouchableOpacity>
            <Text style={styles.txtHeader}>ファイルを送信する</Text>
          </View>
          <TextInput
            editable
            multiline
            numberOfLines={5}
            maxLength={400}
            onChangeText={text => setImageDescription(text)}
            value={imageDescription}
            style={styles.txtInput}
          />
          <View style={styles.viewFeature}>
            {chosenFiles.map((item: any, index: any) => {
              return (
                <View key={item?.id}>
                  <TouchableOpacity
                    style={styles.itemFeature}
                    key={item?.id}
                    onPress={() => onBack(item?.id)}
                  >
                    {item.sourceURL && (
                      <Image
                        style={styles.imageEmoji}
                        source={{
                          uri: item.sourceURL,
                        }}
                      />
                    )}
                    {item.uri && (
                      <Text>{item.name}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
          <AppButton
            title="送信"
            onPress={sendFile}
            styleButton={[styles.button, {borderBottomWidth: 0}]}
            styleTitle={styles.txtTitle}
          />
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  containerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    borderRadius: moderateScale(4),
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingBottom: getBottomSpace() + 20,
    backgroundColor: '#FFFFFF',
  },
  viewOut: {
    width: '100%',
    height: '100%',
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
});

export {ModalPickedFile};

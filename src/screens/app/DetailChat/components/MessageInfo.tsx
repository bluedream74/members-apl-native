import React, {useCallback} from 'react';
import {Linking, useWindowDimensions} from 'react-native';
import RenderHtml, {
  HTMLElementModel,
  HTMLContentModel,
} from 'react-native-render-html';
import {styles} from './stylesItem';
import {saveIdRoomChat, resetDataChat} from '@redux';
import {store} from '../../../../redux/store';
import {ROUTE_NAME} from '@routeName';
import {NavigationUtils} from '@navigation';
import {API_DOMAIN} from '@util';

const customHTMLElementModels = {
  'deco-info': HTMLElementModel.fromCustomModel({
    tagName: 'deco-info',
    mixedUAStyles: {
      borderColor: '#8D8D8D',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 3,
      padding: 10,
      marginTop: 10,
      marginBottom: 10,
    },
    contentModel: HTMLContentModel.block,
  }),
  'deco-title': HTMLElementModel.fromCustomModel({
    tagName: 'deco-title',
    mixedUAStyles: {
      fontWeight: 'bold',
      borderStyle: 'solid',
      borderLeftWidth: 4,
      borderLeftColor: '#19A2AA',
      marginBottom: 5,
      paddingLeft: 10,
    },
    contentModel: HTMLContentModel.block,
  }),
  'deco-hr': HTMLElementModel.fromCustomModel({
    tagName: 'deco-hr',
    mixedUAStyles: {
      borderBottomWidth: 1,
      borderStyle: 'solid',
      borderBottomColor: '#707070',
      marginTop: 10,
      marginBottom: 10,
    },
    contentModel: HTMLContentModel.block,
  }),
  'deco-bold': HTMLElementModel.fromCustomModel({
    tagName: 'deco-bold',
    mixedUAStyles: {
      fontWeight: 'bold',
    },
    contentModel: HTMLContentModel.textual,
  }),
  'deco-red': HTMLElementModel.fromCustomModel({
    tagName: 'deco-red',
    mixedUAStyles: {
      color: '#E44122',
    },
    contentModel: HTMLContentModel.textual,
  }),
};

const tagsStyles = {
  body: styles.txtMessage,
  a: {
    textDecorationLine: 'none',
  },
};

export type MessageInfoProps = {
  text: string;
  joinedUsers?: any;
  textSetting?: any;
};

const onPress = async (event: any, href: string) => {
  const parseUrl = String(href).split('/');
  if (
    parseUrl[0] === 'https:' &&
    parseUrl[2] === API_DOMAIN &&
    parseUrl[3] === 'chat'
  ) {
    const parseParams = String(parseUrl[4]).split('?messId=');
    const roomId = parseParams[0];
    const messageId = parseParams[1];
    if (Number(roomId) > 0) {
      const state = store.getState();
      if (roomId !== state?.chat?.id_roomChat) {
        await store.dispatch(resetDataChat());
        await store.dispatch(saveIdRoomChat(roomId));
      }
      NavigationUtils.navigate(ROUTE_NAME.DETAIL_CHAT, {
        idRoomChat: roomId,
        idMessageSearchListChat: messageId,
      });
    }
  } else {
    Linking.openURL(href);
  }
};

const renderersProps = {
  a: {
    onPress: onPress,
  },
};

export default function MessageInfo({
  text,
  joinedUsers = [],
  textSetting = {},
}: MessageInfoProps) {
  const {width} = useWindowDimensions();

  /**
   * "@xxxxxx"の文字列で実在するユーザーをリンク文字に置き換え
   * @param {string} text テキスト
   * @param {any} joinedUsers  参加ユーザー情報
   */
  const convertMentionToLink = useCallback((input: string, users: any) => {
    let replaceText = input;
    // メンションメンバー情報とメッセージを比較し、本当にメッセージにメンション内容が入っているかを確認
    users.forEach((joinedUser: any) => {
      let mentionText = `@${joinedUser?.last_name.replace(
        ' ',
        '',
      )}${joinedUser?.first_name?.replace(' ', '')}`;
      if (replaceText.includes(mentionText)) {
        const escapedText = mentionText.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
        replaceText = replaceText.replace(
          new RegExp(escapedText, 'g'),
          '<b>$&</b>',
        );
      }
      //@allをリンク色にする（@all単独、@all+半角スペース、@all+全角スペース、@all+改行の場合）
      const matchs = replaceText.match(
        new RegExp('@all( |　|<br>)+|^@all$|( |　|<br>)@all$', 'g'),
      );
      if (matchs != null) {
        replaceText = replaceText.replace(
          new RegExp('^@all|@all$| @all|@all ', 'g'),
          '<b>@all</b>',
        );
      }
      //@AIをリンク色にする（@AI単独、@AI+半角スペース、@AI+全角スペース、@aAI+改行の場合）
      const AiMatchs = replaceText.match(
        new RegExp('@AI( |　|<br>)+|^@AI$|( |　|<br>)@AI$', 'g'),
      );
      if (AiMatchs != null) {
        replaceText = replaceText.replace(
          new RegExp('^@AI|@AI$| @aAI|@AI ', 'g'),
          '<b>@AI</b>',
        );
      }
    });
    return replaceText;
  }, []);

  /**
   *
   * @param {string} str - メッセージ
   */
  const customAnchorify = useCallback((str: string) => {
    if (str === null) {
      return str;
    }

    const regexp_url =
      /((h?)(ttps?:\/\/[-_.!~*'()a-zA-Z0-9;"'/?:@&=+$,%#[…\]\u3001-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+))/g;
    str = str.replace(regexp_url, '<a href="$1">$1</a>');
    str = str.replace('">https://', '">');
    str = str.replace('">http://', '">');

    const regexp_email =
      /(\/|:)?([a-zA-Z0-9])+([a-zA-Z0-9._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9._-]+)+/g;
    let regexp_makeMailLink = function (mail: string) {
      // 先頭が'/'または':'であればリンク化しない
      let first_char = mail.slice(0, 1);
      if (first_char === '/' || first_char === ':') {
        return mail;
      } else {
        return '<a href="mailto:' + mail + '" target="_blank">' + mail + '</a>';
      }
    };

    return str.replace(regexp_email, regexp_makeMailLink);
  }, []);

  const convertMessageNotation = useCallback((input: string) => {
    let replaceText = input;
    replaceText = replaceText.replace(
      new RegExp('\\[title\\]((.?s?)*?)\\[/title\\]', 'gi'),
      '<deco-title>$1</deco-title>',
    );
    replaceText = replaceText.replace(
      new RegExp('\\[info\\]((.?s?)*?)\\[/info\\]', 'gi'),
      '<deco-info>$1</deco-info>',
    );
    replaceText = replaceText.replace(
      new RegExp('\\[hr\\]((.?s?)*?)', 'gi'),
      '<deco-hr></deco-hr>$1',
    );
    replaceText = replaceText.replace(
      new RegExp('\\[bold\\]((.?s?)*?)\\[/bold\\]', 'gi'),
      '<deco-bold>$1</deco-bold>',
    );
    replaceText = replaceText.replace(
      new RegExp('\\[red\\]((.?s?)*?)\\[/red\\]', 'gi'),
      '<deco-red>$1</deco-red>',
    );
    replaceText =
      '<p style="font-size:16px;margin: 0px;">' + replaceText + '</p>';

    return replaceText;
  }, []);

  return (
    <>
      <RenderHtml
        defaultTextProps={textSetting}
        renderersProps={renderersProps}
        contentWidth={width}
        source={{
          html: text
            ? convertMentionToLink(
                customAnchorify(
                  convertMessageNotation(text.replace(/\n/g, '<br>')),
                ),
                joinedUsers,
              )
            : '',
        }}
        customHTMLElementModels={customHTMLElementModels}
        // @ts-ignore
        tagsStyles={tagsStyles}
      />
    </>
  );
}

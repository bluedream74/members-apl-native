import React, {useCallback} from 'react';
import {useWindowDimensions} from 'react-native';
import RenderHtml, {
  HTMLElementModel,
  HTMLContentModel,
} from 'react-native-render-html';
import {styles} from './stylesItem';

export type MessageInfoProps = {
  text: string;
  joinedUsers: any;
  textSetting: any;
};

export default function MessageInfo({
  text,
  joinedUsers = [],
  textSetting = {},
}: MessageInfoProps) {
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
      contentModel: HTMLContentModel.block
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
      contentModel: HTMLContentModel.block
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
      contentModel: HTMLContentModel.block
    }),
    'deco-bold': HTMLElementModel.fromCustomModel({
      tagName: 'deco-bold',
      mixedUAStyles: {
        fontWeight: 'bold'
      },
      contentModel: HTMLContentModel.textual
    }),
    'deco-red': HTMLElementModel.fromCustomModel({
      tagName: 'deco-red',
      mixedUAStyles: {
        color: '#E44122',
      },
      contentModel: HTMLContentModel.textual
    }),
  };

  const {width} = useWindowDimensions();
  const tagsStyles = {
    body: styles.txtMessage,
    a: {
      textDecorationLine: "none",
    },
  };

  /**
   * "@xxxxxx"の文字列で実在するユーザーをリンク文字に置き換え
   * @param {string} text テキスト
   * @param {any} joinedUsers  参加ユーザー情報
   */
  const convertMentionToLink = useCallback((text: string, joinedUsers: any) => {
    // メンションメンバー情報とメッセージを比較し、本当にメッセージにメンション内容が入っているかを確認
    joinedUsers.forEach((joinedUser: any) => {

      let mentionText = `@${joinedUser?.last_name.replace(
        ' ',
        '',
      )}${joinedUser?.first_name?.replace(' ', '')}`;
      if (text.includes(mentionText)) {
        const escapedText = mentionText.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
        text = text.replace(new RegExp(escapedText, 'g'), '<b>$&</b>');
      }
      //@allをリンク色にする（@all単独、@all+半角スペース、@all+全角スペース、@all+改行の場合）
      const matchs = text.match(new RegExp('@all( |　|<br>)+|^@all$|( |　|<br>)@all$', 'g'));
      if (matchs != null) {
        text = text.replace(new RegExp('^@all|@all$| @all|@all ', 'g'), '<b>@all</b>');
      }
      //@AIをリンク色にする（@AI単独、@AI+半角スペース、@AI+全角スペース、@aAI+改行の場合）
      const AiMatchs = text.match(new RegExp('@AI( |　|<br>)+|^@AI$|( |　|<br>)@AI$', 'g'));
      if (AiMatchs != null) {
        text = text.replace(new RegExp('^@AI|@AI$| @aAI|@AI ', 'g'), '<b>@AI</b>');
      }
    });
    return text;
  }, []);

  /**
   *
   * @param {string} str - メッセージ
   */
  const customAnchorify = useCallback((str: string) => {
    if (str === null) {
      return str;
    }

    let regexp_url = /((h?)(ttps?:\/\/[-_.!~*\'()a-zA-Z0-9;"'\/?:\@&=+\$,%#\[…\]\u3001-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+))/g;
    str = str.replace(regexp_url, '<a href="$1">$1</a>');
    str = str.replace('">https://', '">');
    str = str.replace('">http://', '">');

    let regexp_email = /(\/|:)?([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+/g;
    let regexp_makeMailLink = function (mail: string) {
      // 先頭が'/'または':'であればリンク化しない
      let first_char = mail.slice(0, 1);
      if (first_char === '/' || first_char === ':') {
        return mail;
      } else {
        return '<a href="mailto:' + mail + '" target="_blank">' + mail + '</a>';
      }
    }

    return str.replace(regexp_email, regexp_makeMailLink)
  }, []);

  const convertMessageNotation = useCallback((text: string) => {
    text = text.replace(new RegExp('\\[title\\]((.?\s?)*?)\\[/title\\]', 'gi'), '<deco-title>$1</deco-title>');
    text = text.replace(new RegExp('\\[info\\]((.?\s?)*?)\\[/info\\]', 'gi'), '<deco-info>$1</deco-info>');
    text = text.replace(new RegExp('\\[hr\\]((.?\s?)*?)', 'gi'), '<deco-hr></deco-hr>$1');
    text = text.replace(new RegExp('\\[bold\\]((.?\s?)*?)\\[/bold\\]', 'gi'), '<deco-bold>$1</deco-bold>');
    text = text.replace(new RegExp('\\[red\\]((.?\s?)*?)\\[/red\\]', 'gi'), '<deco-red>$1</deco-red>');
    text = '<p style="font-size:16px;margin: 0px;">' + text + '</p>';

    return text;
  }, []);

  return (
    <>
      <RenderHtml
        defaultTextProps={textSetting}
        contentWidth={width}
        source={{
          html: text ? convertMentionToLink(customAnchorify(convertMessageNotation(text.replace(/\n/g, '<br>'))), joinedUsers) : ''
        }}
        customHTMLElementModels={customHTMLElementModels}
        // @ts-ignore
        tagsStyles={tagsStyles}
      />
    </>
  );
}

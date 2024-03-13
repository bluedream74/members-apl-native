import React, {useCallback} from 'react';
import {useWindowDimensions} from 'react-native';
import RenderHtml, {
  HTMLElementModel,
  HTMLContentModel,
} from 'react-native-render-html';
import {styles} from './stylesItem';

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
    });

    //@allをリンク色にする
    //@AIをリンク色にする
    replaceText = replaceText.replace(/(?<=( |　|<br>|;">))@all/g, '<b>$&</b>');
    replaceText = replaceText.replace(/@all(?=( |　|<br>|<\/p>))/g, '<b>$&</b>');
    replaceText = replaceText.replace(/(?<=( |　|<br>|;">))@AI/g, '<b>$&</b>');
    replaceText = replaceText.replace(/@AI(?=( |　|<br>|<\/p>))/g, '<b>$&</b>');
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

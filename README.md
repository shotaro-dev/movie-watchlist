# movie-watchlist

## 要件定義

- ページは２つだけ。
  - index.html はサーチペイジ、OMDB API title デサーチして、検索結果を表示する
  - index.html では、ユーザーがローカルストレージにデータを保存できる。
  - watchlist.html では、ローカルストレージ保存されたデータを表示する。

## 仕様

- tailwind だけを使用する
- OMDB API を使用する -検索バーを作成する -検索結果を表示する -各映画の横に「Watchlist に追加」ボタンを作成する -検索 input は header と main の間の上に配置する。 -ダークモードライトモード対応。 -サーチページでは初期画面と検索失敗と成功の３つの状態を作成する。 -初期画面では、検索バーのみ表示する。
- index.html のとき header の右に watchlist.html に移動するリンク.
- watchlist.html のとき header の右に index.html に移動するリンク.
- watchlist.html ではローカルストレージに保存された映画を表示する
- watchlist.html では各映画の横に「Watchlist から削除」ボタンを作成する
- watchlist.html ではローカルストレージに保存された映画がない場合、「Your watchlist is looking a little empty...」というメッセージを表示する。
- watchilist がなかったら main section で search 　ページに誘導するボタンを表示する

## 設計

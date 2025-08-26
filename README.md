# JANスキャナ（シャッター方式 / 完全自己ホスト）

この版は **vendor フォルダのみ**を使い、外部CDNへは一切アクセスしません。

## 必須配置
```
vendor/
└─ zxing/
   ├─ browser/0.1.5/esm/   # @zxing/browser の esm 一式
   └─ library/0.20.0/esm/   # @zxing/library の esm 一式
```
> `index.js` だけでは動きません。`esm/` ディレクトリ内の **すべての .js** を置いてください。

## 取得方法（tarball 推奨）
- https://registry.npmjs.org/@zxing/browser/-/browser-0.1.5.tgz
- https://registry.npmjs.org/@zxing/library/-/library-0.20.0.tgz

ダウンロード→解凍すると `package/esm/` が出ます。**そのフォルダを丸ごと**上記の場所へコピーします。

## GitHub Pages の公開パスに注意
プロジェクトページ（例: `.../test_app/`）でも動くように、ImportMap は **相対パス**になっています。

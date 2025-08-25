# JANスキャナ（シャッター方式 / GitHub Pages）

- iOS/Android の混在端末向けに、**ZXing（iOS系）** と **BarcodeDetector（Android Chrome優先）** を自動切替
- **シャッター方式**（1枚スナップショットを解析）
- **自己ホスト対応**：`vendor/zxing/...` に ESM を置けば **CDN不要**で動作
- 置かなくても、**jsDelivr → unpkg** の順でCDNフェイルオーバーして動作

## ディレクトリ構成
```
/
├─ index.html
├─ robots.txt            # 検索避け（必要なければ削除）
└─ vendor/
   └─ zxing/
      ├─ browser/0.1.5/esm/index.js   # 置けばCDN無しで動作
      └─ library/0.20.0/esm/index.js  # 同上
```

### ZXingの自己ホスト方法
```bash
mkdir -p vendor/zxing/browser/0.1.5/esm vendor/zxing/library/0.20.0/esm

curl -L 'https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/esm/index.js'   -o vendor/zxing/browser/0.1.5/esm/index.js

curl -L 'https://cdn.jsdelivr.net/npm/@zxing/library@0.20.0/esm/index.js'   -o vendor/zxing/library/0.20.0/esm/index.js
```

> Apache-2.0 ライセンス。リポジトリ同梱可。

## GitHub Pages に公開
- リポジトリの `Settings > Pages` でブランチを指定
- 公開URLにアクセスし **START** を押してカメラ権限を許可
- iOSでは ZXing で解析、Android Chrome は BarcodeDetector 優先→未対応は ZXing

## 注意
- 端末カメラは **https** でのみ起動します（PagesはOK）
- 暗所や近すぎは失敗率↑。**少し引いてから寄せる**とAF安定
- iOSは torch 非対応端末が多いです

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start');
  const videoContainer = document.getElementById('video-container');
  const video = document.getElementById('video');
  const resultDiv = document.getElementById('result');

  startBtn.addEventListener('click', async () => {
    videoContainer.style.display = 'block';

    // ZXingはグローバル変数（CDNが正しく読み込まれていればwindow.ZXingでOK）
    const codeReader = new ZXing.BrowserBarcodeReader();

    try {
      const result = await codeReader.decodeOnceFromVideoDevice(undefined, video, {
        formats: [ZXing.BarcodeFormat.EAN_13]
      });
      resultDiv.textContent = 'スキャン結果: ' + result.text;
      codeReader.reset();
    } catch (e) {
      resultDiv.textContent = 'エラー: ' + (e && e.message ? e.message : e);
      codeReader.reset();
    }
  });
});

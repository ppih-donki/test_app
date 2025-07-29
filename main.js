let scannedCodes = new Set();

function isValidJAN(code) {
  code = String(code);
  if (!/^\d{13}$/.test(code)) return false;

  const digits = code.split("").map(Number);
  const checkDigit = digits[digits.length - 1];
  const baseDigits = digits.slice(0, -1);

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += baseDigits[i] * (i % 2 === 0 ? 1 : 3);
  }
  const calcCheckDigit = (10 - (sum % 10)) % 10;
  return calcCheckDigit === checkDigit;
}

function isMobileOrTablet() {
  return /Android|iPhone|iPad|iPod|Windows Phone|webOS/i.test(navigator.userAgent);
}

window.addEventListener("DOMContentLoaded", () => {
  if (!isMobileOrTablet()) {
    document.body.innerHTML = `
      <h2 style="color:red;">モバイル端末専用です。スマートフォンまたはタブレットでご利用ください。</h2>
      <p>以下のQRコードをスマートフォンでスキャンしてください：</p>
      <img src="qr.mobile.png" alt="スマホで開くQRコード" style="max-width: 300px; width: 80%; margin-top: 1em;">
    `;
    return;
  }

  const videoContainer = document.getElementById("video-container");
  const video = document.getElementById("video");

  document.getElementById("start-scan-13").addEventListener("click", async () => {
    document.getElementById("error-message").textContent = "";
    videoContainer.style.display = "block";

    // ZXingライブラリの準備
    const codeReader = new ZXingBrowser.BrowserBarcodeReader();
    try {
      const result = await codeReader.decodeOnceFromVideoDevice(undefined, video, {
        // EAN-13だけに限定
        formats: [ZXingBrowser.BarcodeFormat.EAN_13]
      });
      videoContainer.style.display = "none";
      
      const code = result.text;
      if (isValidJAN(code)) {
        if (!scannedCodes.has(code)) {
          scannedCodes.add(code);
          const li = document.createElement("li");
          li.textContent = code;
          document.getElementById("code-list").appendChild(li);
        }
      } else {
        document.getElementById("error-message").textContent = "無効なJANコードです。再スキャンしてください。";
      }
      codeReader.reset();
    } catch (err) {
      videoContainer.style.display = "none";
      document.getElementById("error-message").textContent = "カメラの起動またはスキャンに失敗しました: " + (err && err.message ? err.message : err);
      if (codeReader) codeReader.reset();
    }
  });

  document.getElementById("download-csv").addEventListener("click", () => {
    const csvContent = "data:text/csv;charset=utf-8," + Array.from(scannedCodes).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "jan_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});

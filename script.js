let scannedCodes = new Set();
const API_KEY = "YOUR_GOOGLE_CLOUD_VISION_API_KEY";  // ここにAPIキーを設定
const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

function isValidJAN(code) {
  if (!/^\d{8}$|^\d{13}$/.test(code)) return false;

  const digits = code.split("").map(Number);
  const checkDigit = digits[digits.length - 1];
  const baseDigits = digits.slice(0, -1);

  let sum = 0;

  if (code.length === 8) {
    for (let i = 0; i < 7; i++) {
      sum += baseDigits[i] * (i % 2 === 0 ? 3 : 1);
    }
  } else if (code.length === 13) {
    for (let i = 0; i < 12; i++) {
      sum += baseDigits[i] * (i % 2 === 0 ? 1 : 3);
    }
  } else {
    return false;
  }

  const calcCheckDigit = (10 - (sum % 10)) % 10;
  return calcCheckDigit === checkDigit;
}

function isMobileOrTablet() {
  return /Android|iPhone|iPad|iPod|Windows Phone|webOS/i.test(navigator.userAgent);
}

async function detectBarcodeFromImage(base64Image) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: "BARCODE_DETECTION" }]
        }
      ]
    })
  });
  const result = await response.json();
  try {
    return result.responses[0].barcodeAnnotations[0].rawValue;
  } catch {
    return null;
  }
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

  const video = document.getElementById("camera-stream");
  const canvas = document.getElementById("capture-canvas");
  const ctx = canvas.getContext("2d");

  document.getElementById("start-scan").addEventListener("click", async () => {
    document.getElementById("error-message").textContent = "";
    document.getElementById("reader-container").style.display = "block";

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      video.srcObject = stream;

      // 3秒後に1フレームをキャプチャしてGoogle Visionへ送信
      setTimeout(async () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL("image/jpeg").replace(/^data:image\/jpeg;base64,/, "");

        const code = await detectBarcodeFromImage(base64Image);
        stream.getTracks().forEach(track => track.stop());  // カメラ停止
        document.getElementById("reader-container").style.display = "none";

        if (code && isValidJAN(code)) {
          if (!scannedCodes.has(code)) {
            scannedCodes.add(code);
            const li = document.createElement("li");
            li.textContent = code;
            document.getElementById("code-list").appendChild(li);
          }
        } else {
          document.getElementById("error-message").textContent = "無効なJANコードです。再スキャンしてください。";
        }
      }, 3000);
    } catch (e) {
      console.error(e);
      document.getElementById("error-message").textContent = "カメラを起動できません。";
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

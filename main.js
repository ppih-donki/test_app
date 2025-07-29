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

  document.getElementById("start-scan-13").addEventListener("click", () => {
    document.getElementById("error-message").textContent = "";
    document.getElementById("reader-container").style.display = "block";

    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector('#reader'),
        constraints: {
          facingMode: "environment"
        },
      },
      decoder: {
        readers: ["ean_reader"]
      }
    }, (err) => {
      if (err) {
        document.getElementById("error-message").textContent = "カメラの初期化に失敗しました: " + err;
        console.error(err);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((data) => {
      const code = data.codeResult.code;
      console.log("Scanned code:", code, "typeof:", typeof code);
      Quagga.stop();
      document.getElementById("reader-container").style.display = "none";

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
    });
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
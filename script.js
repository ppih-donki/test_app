let scannedCodes = new Set();

// ✅ チェックデジット検証ロジック修正済み
function isValidJAN(code) {
  code = String(code); // 常に文字列として扱う

  if (!/^\d{8}$|^\d{13}$/.test(code)) return false;

  const digits = code.split("").map(Number);
  const checkDigit = digits[digits.length - 1];
  const baseDigits = digits.slice(0, -1);

  let sum = 0;

  if (code.length === 8) {
    // EAN-8: 奇数3倍・偶数そのまま
    for (let i = 0; i < 7; i++) {
      sum += baseDigits[i] * (i % 2 === 0 ? 3 : 1);
    }
  } else if (code.length === 13) {
    // EAN-13: 奇数そのまま・偶数3倍
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

window.addEventListener("DOMContentLoaded", () => {
  if (!isMobileOrTablet()) {
    document.body.innerHTML = `
      <h2 style="color:red;">モバイル端末専用です。スマートフォンまたはタブレットでご利用ください。</h2>
      <p>以下のQRコードをスマートフォンでスキャンしてください：</p>
      <img src="qr.mobile.png" alt="スマホで開くQRコード" style="max-width: 300px; width: 80%; margin-top: 1em;">
    `;
    return;
  }

  document.getElementById("start-scan").addEventListener("click", () => {
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
        readers: ["ean_reader", "ean_8_reader"]
      }
    }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((data) => {
      const code = data.codeResult.code;
      console.log("Scanned code:", code, "typeof:", typeof code); // デバッグ用
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

let scannedCodes = new Set();

function isValidJAN(code) {
  if (!/^\d{8}$|^\d{13}$/.test(code)) return false;
  const digits = code.split("").map(Number);
  const checkDigit = digits.pop();
  let sum = 0;

  if (code.length === 7) {
    for (let i = 0; i < 7; i++) {
      sum += digits[i] * (i % 2 === 0 ? 3 : 1);
    }
    return (10 - (sum % 10)) % 10 === checkDigit;
  } else if (code.length === 12) {
    for (let i = 0; i < 12; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }
    return (10 - (sum % 10)) % 10 === checkDigit;
  }

  return false;
}

function isMobileOrTablet() {
  return /Android|iPhone|iPad|iPod|Windows Phone|webOS/i.test(navigator.userAgent);
}

window.addEventListener("DOMContentLoaded", () => {
  if (!isMobileOrTablet()) {
    document.body.innerHTML = "<h2 style='color:red;'>モバイル端末専用です。スマートフォンまたはタブレットでご利用ください。</h2>";
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
    const csvContent = "data:text/csv;charset=utf-8," + Array.from(scannedCodes).join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "jan_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});

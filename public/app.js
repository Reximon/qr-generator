 const btnText = document.getElementById("btn-text");
    const btnWifi = document.getElementById("btn-wifi");
    const textFields = document.getElementById("text-fields");
    const wifiFields = document.getElementById("wifi-fields");
    const generateBtn = document.getElementById("generate");
    const textInput = document.getElementById("text");
    const ssidInput = document.getElementById("ssid");
    const passwordInput = document.getElementById("password");
    const encryptionSelect = document.getElementById("encryption");
    const qrContainer = document.getElementById("qr-container");
    const errorDiv = document.getElementById("error");
    const outputArea = document.getElementById("output-area");

    let currentType = "text";

    function ensureUrl(t) {
      if (t.startsWith("http://") || t.startsWith("https://")) return t;
      return "https://" + t;
    }

    function setLoading(v) {
      generateBtn.disabled = v;
      if (v) qrContainer.innerHTML = '<div class="loader"></div>';
    }

    function switchType(type) {
      currentType = type;
      btnText.classList.toggle("active", type === "text");
      btnWifi.classList.toggle("active", type === "wifi");
      textFields.classList.toggle("hidden", type === "wifi");
      wifiFields.classList.toggle("visible", type === "wifi");
    }

    btnText.addEventListener("click", () => switchType("text"));
    btnWifi.addEventListener("click", () => switchType("wifi"));

    generateBtn.addEventListener("click", async () => {
      errorDiv.style.display = "none";
      setLoading(true);
      outputArea.style.display = "block";
      try {
        let url;
        if (currentType === "wifi") {
          const ssid = ssidInput.value.trim();
          const pass = passwordInput.value.trim();
          const enc = encryptionSelect.value;
          if (!ssid) throw new Error("Falta el SSID");
          const params = new URLSearchParams({ type: "wifi", ssid, password: pass, encryption: enc });
          url = "/api/qr?" + params.toString();
        } else {
          let t = textInput.value.trim();
          if (!t) throw new Error("Escribe un texto o URL");
          t = ensureUrl(t);
          url = "/api/qr?" + new URLSearchParams({ type: "text", text: t }).toString();
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al generar QR");
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        qrContainer.innerHTML = '<img src="' + blobUrl + '" alt="QR Code" /><a href="' + blobUrl + '" download="qr.png" class="download-btn">Descargar QR</a>';
      } catch (e) {
        errorDiv.textContent = e.message;
        errorDiv.style.display = "block";
        outputArea.style.display = "none";
      } finally {
        setLoading(false);
      }
    });

    textInput.addEventListener("keypress", (e) => { if (e.key === "Enter") generateBtn.click(); });
    ssidInput.addEventListener("keypress", (e) => { if (e.key === "Enter") generateBtn.click(); });
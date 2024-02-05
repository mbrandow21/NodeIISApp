import './util/PHCWidgets.js';
(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const cacheKey = urlParams.get("cacheKey");
  if (cacheKey) {
    sessionStorage.setItem("cachedKey", cacheKey);
  }

  // Dynamically add CSS
  const PHCStyleTag = document.createElement("link");
  PHCStyleTag.rel = "stylesheet";
  // PHCStyleTag.href = "./styles/main.css";
  PHCStyleTag.href = "https://dev.phc.events/widgets/styles/main.css";
  document.head.appendChild(PHCStyleTag);
})();
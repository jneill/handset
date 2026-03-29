const webview = document.getElementById('webview');
const overlay = document.getElementById('url-overlay');
const urlInput = document.getElementById('url-input');
const okBtn = document.getElementById('url-ok');
const cancelBtn = document.getElementById('url-cancel');

let currentUrl = '';

// Initialize: show URL prompt if no stored URL, otherwise load it
window.addEventListener('DOMContentLoaded', async () => {
  currentUrl = await window.demoAPI.getCurrentUrl();
  if (currentUrl) {
    webview.src = currentUrl;
  } else {
    overlay.classList.remove('hidden');
    urlInput.focus();
  }
});

// Menu: Change URL
window.demoAPI.onShowUrlPrompt(() => {
  urlInput.value = currentUrl;
  overlay.classList.remove('hidden');
  urlInput.select();
  urlInput.focus();
});

// Menu: Reload
window.demoAPI.onReloadWebview(() => {
  webview.reload();
});

// URL overlay: OK
function submitUrl() {
  let url = urlInput.value.trim();
  if (!url) return;

  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = url.includes('localhost') ? `http://${url}` : `https://${url}`;
  }

  currentUrl = url;
  webview.src = url;
  window.demoAPI.setUrl(url);
  overlay.classList.add('hidden');
}

okBtn.addEventListener('click', submitUrl);

urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitUrl();
  if (e.key === 'Escape') overlay.classList.add('hidden');
});

// URL overlay: Cancel
cancelBtn.addEventListener('click', () => {
  overlay.classList.add('hidden');
});

// Close overlay on backdrop click
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) overlay.classList.add('hidden');
});

// Open external links in system browser
webview.addEventListener('new-window', (e) => {
  e.preventDefault();
  window.demoAPI.openExternal(e.url);
});

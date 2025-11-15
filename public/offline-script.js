/**
 * Offline Page Script
 * Handles connection status checking and auto-reload when back online
 *
 * Epic H-1: CSP Hardening
 * Extracted from inline script to comply with nonce-based CSP
 */

function checkOnlineStatus() {
  const statusEl = document.getElementById("status");
  if (navigator.onLine) {
    statusEl.textContent = "✓ Connection restored";
    statusEl.className = "status online";
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    statusEl.textContent = "✗ Still offline";
    statusEl.className = "status offline";
  }
}

// Attach event listener to retry button (CSP-compliant, no inline handlers)
document.addEventListener("DOMContentLoaded", () => {
  const retryButton = document.getElementById("retry-button");
  if (retryButton) {
    retryButton.addEventListener("click", () => {
      window.location.reload();
    });
  }
});

// Check online status periodically
setInterval(checkOnlineStatus, 3000);
checkOnlineStatus();

// Listen for online event
window.addEventListener("online", () => {
  document.getElementById("status").textContent = "✓ Connection restored! Reloading...";
  document.getElementById("status").className = "status online";
  setTimeout(() => {
    window.location.reload();
  }, 500);
});

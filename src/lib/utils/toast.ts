/**
 * Simple Toast Notification Utility
 *
 * Provides toast notifications without requiring additional dependencies.
 * Uses DOM manipulation to show temporary notification messages.
 */

type ToastType = "success" | "error" | "info" | "warning";

type ToastOptions = {
  duration?: number; // Duration in milliseconds (default: 3000)
  type?: ToastType;
};

let toastContainer: HTMLDivElement | null = null;

/**
 * Get or create the toast container
 */
function getToastContainer(): HTMLDivElement {
  if (toastContainer && document.body.contains(toastContainer)) {
    return toastContainer;
  }

  toastContainer = document.createElement("div");
  toastContainer.id = "toast-container";
  toastContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  `;
  document.body.appendChild(toastContainer);
  return toastContainer;
}

/**
 * Get toast styles based on type
 */
function getToastStyles(type: ToastType): string {
  const baseStyles = `
    padding: 12px 20px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(22, 22, 22, 0.15);
    pointer-events: auto;
    min-width: 300px;
    max-width: 500px;
    word-wrap: break-word;
    animation: slideIn 0.3s ease-out;
  `;

  const typeStyles = {
    success: "background-color: #FF5200; color: white;",
    error: "background-color: #FF5200; color: white;",
    info: "background-color: #FF5200; color: white;",
    warning: "background-color: #FF5200; color: white;",
  };

  return baseStyles + typeStyles[type];
}

/**
 * Show a toast notification
 */
function showToast(message: string, options: ToastOptions = {}): void {
  const { duration = 3000, type = "info" } = options;

  const container = getToastContainer();
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = getToastStyles(type);

  // Add animation keyframes if not already added
  if (!document.getElementById("toast-animations")) {
    const style = document.createElement("style");
    style.id = "toast-animations";
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  container.appendChild(toast);

  // Remove toast after duration
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      // Remove container if empty
      if (container.children.length === 0 && container.parentNode) {
        container.parentNode.removeChild(container);
        toastContainer = null;
      }
    }, 300);
  }, duration);
}

/**
 * Toast utility with convenience methods
 */
export const toast = {
  success: (message: string, duration?: number) =>
    showToast(message, { type: "success", duration }),
  error: (message: string, duration?: number) => showToast(message, { type: "error", duration }),
  info: (message: string, duration?: number) => showToast(message, { type: "info", duration }),
  warning: (message: string, duration?: number) =>
    showToast(message, { type: "warning", duration }),
};

/**
 * Confirm dialog replacement
 * Returns a promise that resolves to true if confirmed, false if cancelled
 */
export function confirm(message: string, title = "Confirm"): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(22, 22, 22, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-center;
      animation: fadeIn 0.2s ease-out;
    `;

    const modal = document.createElement("div");
    modal.style.cssText = `
      background-color: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(22, 22, 22, 0.1);
      animation: scaleIn 0.2s ease-out;
    `;

    const titleElement = document.createElement("h3");
    titleElement.textContent = title;
    titleElement.style.cssText = `
      font-size: 18px;
      font-weight: 600;
      color: #171717;
      margin-bottom: 12px;
    `;

    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    messageElement.style.cssText = `
      font-size: 14px;
      color: #171717;
      margin-bottom: 20px;
      line-height: 1.5;
    `;

    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    `;

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.cssText = `
      padding: 8px 16px;
      border-radius: 8px;
      border: 2px solid #E5E5E5;
      background-color: white;
      color: #171717;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    `;
    cancelButton.onmouseover = () => {
      cancelButton.style.borderColor = "#737373";
      cancelButton.style.color = "#737373";
    };
    cancelButton.onmouseout = () => {
      cancelButton.style.borderColor = "#E5E5E5";
      cancelButton.style.color = "#171717";
    };

    const confirmButton = document.createElement("button");
    confirmButton.textContent = "Confirm";
    confirmButton.style.cssText = `
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background-color: #737373;
      color: white;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    `;
    confirmButton.onmouseover = () => {
      confirmButton.style.backgroundColor = "#737373";
    };
    confirmButton.onmouseout = () => {
      confirmButton.style.backgroundColor = "#737373";
    };

    const cleanup = () => {
      overlay.style.animation = "fadeOut 0.2s ease-in";
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 200);
    };

    cancelButton.onclick = () => {
      cleanup();
      resolve(false);
    };

    confirmButton.onclick = () => {
      cleanup();
      resolve(true);
    };

    // Add animation keyframes if not already added
    if (!document.getElementById("modal-animations")) {
      const style = document.createElement("style");
      style.id = "modal-animations";
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);

    modal.appendChild(titleElement);
    modal.appendChild(messageElement);
    modal.appendChild(buttonContainer);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Focus confirm button for accessibility
    confirmButton.focus();
  });
}

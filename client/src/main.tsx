import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { debug } from "./utils/debug";
import { registerSW } from "virtual:pwa-register";

// Log app initialization
debug.log("App initialization started", {
  readyState: document.readyState,
  timestamp: Date.now()
});

// Register service worker for PWA functionality with auto-update
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    debug.log("PWA: New content available, auto-updating...");
    // Dispatch custom event for update notification
    window.dispatchEvent(new CustomEvent("pwa-update-available"));
    // Auto-reload after a short delay to apply updates
    setTimeout(() => {
      debug.log("PWA: Reloading to apply updates");
      window.location.reload();
    }, 1000);
  },
  onOfflineReady() {
    debug.log("PWA: App ready for offline use");
    // Dispatch custom event for offline notification
    window.dispatchEvent(new CustomEvent("pwa-offline-ready"));
  },
  onRegistered(registration) {
    debug.log("PWA: Service Worker registered", { scope: registration?.scope });
    
    // Check for updates every 60 seconds
    if (registration) {
      setInterval(() => {
        debug.log("PWA: Checking for updates...");
        registration.update().catch((error) => {
          debug.error("PWA: Update check failed", error);
        });
      }, 60000); // Check every 60 seconds
    }
  },
  onRegisterError(error) {
    debug.error("PWA: Service Worker registration failed", error);
  },
});

// Expose update function globally for manual updates if needed
(window as any).updatePWA = updateSW;

// Check for updates when app becomes visible (user returns to app)
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    debug.log("PWA: App became visible, checking for updates");
    // Trigger service worker update check
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update().catch((error) => {
            debug.error("PWA: Manual update check failed", error);
          });
        }
      });
    }
  }
});

// Listen for app focus to check for updates
window.addEventListener("focus", () => {
  debug.log("PWA: App gained focus, checking for updates");
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        registration.update().catch((error) => {
          debug.error("PWA: Focus update check failed", error);
        });
      }
    });
  }
});

// Ensure the DOM is fully loaded
const renderApp = () => {
  debug.log("renderApp called", { readyState: document.readyState });
  
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    const errorMsg = "Root element not found. Cannot mount React app.";
    debug.error(errorMsg, new Error(errorMsg));
    document.body.innerHTML = `
      <div style="text-align: center; padding: 50px; font-family: sans-serif;">
        <h1>Error Loading Application</h1>
        <p>Unable to find the root element. Please refresh the page.</p>
      </div>
    `;
    return;
  }

  try {
    debug.log("Mounting React app");
    
    // Clear any existing content (removes the loader)
    const loader = document.getElementById("app-loader");
    if (loader) {
      loader.style.display = "none";
    }

    const root = createRoot(rootElement);
    root.render(
      <HelmetProvider>
        <App />
      </HelmetProvider>
    );
    
    debug.log("React app mounted successfully");
  } catch (error) {
    debug.error("Error mounting React app", error);
    console.error("Error mounting React app:", error);
    
    rootElement.innerHTML = `
      <div style="text-align: center; padding: 50px; font-family: sans-serif;">
        <h1>Error Loading Application</h1>
        <p>An error occurred while loading the application. Please refresh the page.</p>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">Error: ${error}</p>
        <p style="color: #999; font-size: 12px; margin-top: 10px;">
          Check browser console or type 'dineMaisonDebug.getLogs()' for more details.
        </p>
      </div>
    `;
  }
};

// Ensure DOM is ready
if (document.readyState === "loading") {
  debug.log("DOM still loading, waiting for DOMContentLoaded");
  document.addEventListener("DOMContentLoaded", renderApp);
} else {
  debug.log("DOM ready, rendering immediately");
  renderApp();
}

// Add global error handler
window.addEventListener("error", (event) => {
  debug.error("Global error caught", {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener("unhandledrejection", (event) => {
  debug.error("Unhandled promise rejection", {
    reason: event.reason,
    promise: event.promise
  });
});

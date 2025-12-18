import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { debug } from "./utils/debug";

// Log app initialization
debug.log("App initialization started", {
  readyState: document.readyState,
  timestamp: Date.now()
});

// Remove any stale service workers that might have been registered previously.
// We don't ship a service worker today, so old registrations can break fetches.
const cleanupServiceWorkers = () => {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.getRegistrations()
    .then((registrations) => {
      registrations.forEach((registration) => {
        debug.log("Unregistering stale service worker", { scope: registration.scope });
        registration.unregister();
      });
    })
    .catch((error) => {
      debug.error("Failed to unregister service workers", error);
    });

  if ("caches" in window) {
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch((error) => {
        debug.error("Failed to clear service worker caches", error);
      });
  }
};

cleanupServiceWorkers();

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

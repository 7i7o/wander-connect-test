import { WanderEmbedded } from "@wanderapp/embed-sdk";
import { useEffect, useState } from "react";

type IframeMode = "popup" | "modal" | "half" | "sidebar";

const otherIcons = {
  reload: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
    </svg>
  ),
};

// Add these constants at the top after imports
const STORAGE_KEYS = {
  IFRAME_MODE: "wander-iframe-mode",
  BASE_URL: "wander-base-url",
  BASE_SERVER_URL: "wander-base-server-url",
} as const;

function App() {
  const [wander, setWander] = useState<WanderEmbedded | null>(null);
  const [iframeMode, setIframeMode] = useState<IframeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.IFRAME_MODE);
    return (stored as IframeMode) || "sidebar";
  });
  const [baseURL, setBaseURL] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.BASE_URL) ||
      "https://wander-embed-dev-git-chore-implement-embe-8bbfff-community-labs.vercel.app"
    );
  });
  const [baseServerURL, setBaseServerURL] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.BASE_SERVER_URL) ||
      "https://embed-api-dev.wander.app"
    );
  });

  const [needsReload, setNeedsReload] = useState(false);

  useEffect(() => {
    const storedMode = localStorage.getItem(STORAGE_KEYS.IFRAME_MODE);
    const storedBaseURL = localStorage.getItem(STORAGE_KEYS.BASE_URL);
    const storedBaseServerURL = localStorage.getItem(
      STORAGE_KEYS.BASE_SERVER_URL
    );

    if (
      storedMode !== iframeMode ||
      storedBaseURL !== baseURL ||
      storedBaseServerURL !== baseServerURL
    ) {
      localStorage.setItem(STORAGE_KEYS.IFRAME_MODE, iframeMode);
      localStorage.setItem(STORAGE_KEYS.BASE_URL, baseURL);
      localStorage.setItem(STORAGE_KEYS.BASE_SERVER_URL, baseServerURL);
      setNeedsReload(true);
    }
  }, [iframeMode, baseURL, baseServerURL]);

  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    const wanderInstance = new WanderEmbedded({
      clientId: "ALPHA",
      iframe: {
        routeLayout: {
          auth: iframeMode,
        },
      },
      button: {
        position: "top-right",
        theme: "system",
        label: true,
        wanderLogo: iframeMode === "sidebar" ? "default" : "text-color",
      },
      baseURL: baseURL || undefined,
      baseServerURL: baseServerURL || undefined,
    });

    setWander(wanderInstance);

    return () => {
      wanderInstance.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white dark:bg-gray-800 shadow-lg sm:rounded-3xl sm:p-20">
          {needsReload && (
            <div className="absolute top-4 right-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 
                  text-white rounded-lg transition-colors"
                title="Reload to apply changes"
              >
                <span>Reload</span>
                {otherIcons.reload}
              </button>
            </div>
          )}
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 dark:text-gray-300 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  App Title
                </h1>
                <p>Your new App is ready. This is just a placeholder.</p>
                <div className="flex flex-col gap-2">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Select iframe mode:
                  </label>
                  <select
                    value={iframeMode}
                    onChange={(e) =>
                      setIframeMode(e.target.value as IframeMode)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                      bg-white dark:bg-gray-700 rounded-md 
                      text-gray-700 dark:text-gray-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      dark:focus:ring-blue-400"
                  >
                    <option value="popup">Popup</option>
                    <option value="modal">Modal</option>
                    <option value="half">Half</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Base URL (optional):
                  </label>
                  <input
                    type="text"
                    value={baseURL}
                    onChange={(e) => setBaseURL(e.target.value)}
                    placeholder="e.g., http://localhost:5173"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                      bg-white dark:bg-gray-700 rounded-md 
                      text-gray-700 dark:text-gray-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      dark:focus:ring-blue-400"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Base Server URL:
                  </label>
                  <input
                    type="text"
                    value={baseServerURL}
                    onChange={(e) => setBaseServerURL(e.target.value)}
                    placeholder="e.g., http://localhost:3000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-700 rounded-md 
                    text-gray-700 dark:text-gray-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    dark:focus:ring-blue-400"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 
                  text-white rounded-lg transition-colors"
                    onClick={() => wander?.open()}
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

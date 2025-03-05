import { WanderEmbedded } from "@wanderapp/embed-sdk";
import { useEffect, useState } from "react";

type IframeMode = "popup" | "modal" | "half" | "sidebar";
type ThemeMode = "light" | "dark" | "system";

const ThemeIcons = {
  light: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  ),
  dark: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  ),
  system: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  ),
};

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
  THEME_MODE: "wander-theme-mode",
} as const;

function App() {
  const [instance, setInstance] = useState<WanderEmbedded | null>(null);
  const [iframeMode, setIframeMode] = useState<IframeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.IFRAME_MODE);
    return (stored as IframeMode) || "sidebar";
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
    return (stored as ThemeMode) || "system";
  });

  const [needsReload, setNeedsReload] = useState(false);

  useEffect(() => {
    const storedMode = localStorage.getItem(STORAGE_KEYS.IFRAME_MODE);
    if (storedMode !== iframeMode) {
      localStorage.setItem(STORAGE_KEYS.IFRAME_MODE, iframeMode);
      setNeedsReload(true);
    }
  }, [iframeMode]);

  useEffect(() => {
    const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
    if (storedTheme !== themeMode) {
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, themeMode);
      setNeedsReload(true);
    }

    const isDark =
      themeMode === "dark" ||
      (themeMode === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(isDark ? "dark" : "light");
  }, [themeMode]);

  useEffect(() => {
    const wanderInstance = new WanderEmbedded({
      iframe: {
        routeLayout: {
          auth: iframeMode,
        },
      },
      button: {
        position: "top-right",
        theme: themeMode,
        label: true,
        wanderLogo: iframeMode === "sidebar" ? "default" : "text-color",
      },
    });

    setInstance(wanderInstance);

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
                  {/* <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Select theme:
                  </label> */}
                  <div className="flex gap-2">
                    {(Object.keys(ThemeIcons) as ThemeMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setThemeMode(mode)}
                        className={`p-3 rounded-lg flex items-center justify-center transition-colors
                          ${
                            themeMode === mode
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        title={`${
                          mode.charAt(0).toUpperCase() + mode.slice(1)
                        } mode`}
                      >
                        {ThemeIcons[mode]}
                      </button>
                    ))}
                  </div>
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

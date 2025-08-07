import { AuthInfo, BackupInfo, WanderConnect } from "@wanderapp/connect";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { ScrollArea } from "./components/ui/scroll-area";

type IframeMode = "popup" | "modal" | "half" | "sidebar";

const SCREENSHOT_THEMES = [
  {
    name: "default",
  },
  {
    name: "Brave Dark",
    background: "#3B3B3F",
  },
  {
    name: "Brave Light",
    background: "#FFFFFF",
  },
  {
    name: "Chrome Mobile Dark",
    background: "#111510",
  },
  {
    name: "Chrome Mobile Light",
    background: "#F7FBF4",
  },
  {
    name: "In App Dark",
    background: "#1B1D21",
  },
  {
    name: "In App Light",
    background: "#FFFFFF",
  },
] as const;

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

function flattenObject(
  obj: any,
  prefix: string = "",
  result: Record<string, any> = {}
): Record<string, any> {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value === null || value === undefined || value === "" || !value)
        continue;

      if (value instanceof Date) result[newKey] = value.toISOString();
      else if (typeof value === "boolean")
        result[newKey] = value ? "True" : "False";
      else {
        if (typeof value === "object" && value.constructor === Object)
          flattenObject(value, newKey, result);
        else result[newKey] = value;
      }
    }
  }
  return result;
}

interface FlattenedData {
  key: string;
  value: any;
}

function getTableData(data: AuthInfo | BackupInfo): Array<FlattenedData> {
  const flattenedData = flattenObject(data);
  const tableData: Array<{
    key: string;
    value: any;
  }> = [];
  Object.entries(flattenedData).forEach(([key, value]) => {
    tableData.push({ key, value });
  });
  return tableData;
}

function App() {
  const [wander, setWander] = useState<WanderConnect | null>(null);
  const [authInfo, setAuthInfo] = useState<AuthInfo | undefined>();
  const [flattenedAuthInfo, setFlattenedAuthInfo] = useState<FlattenedData[]>(
    []
  );
  const [backupInfo, setBackupInfo] = useState<BackupInfo | undefined>();
  const [flattenedBackupInfo, setFlattenedBackupInfo] = useState<
    FlattenedData[]
  >([]);
  const [iframeMode, setIframeMode] = useState<IframeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.IFRAME_MODE);
    return (stored as IframeMode) || "popup";
  });
  const [baseURL, setBaseURL] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.BASE_URL) ||
      "https://connect.wander.app"
    );
  });
  const [baseServerURL, setBaseServerURL] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.BASE_SERVER_URL) ||
      "https://connect-api.wander.app"
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

  const handleOnAuth = useCallback((authInfo: AuthInfo) => {
    if (authInfo) {
      setAuthInfo(authInfo);
      setFlattenedAuthInfo(getTableData(authInfo));
    } else {
      setAuthInfo(undefined);
      setFlattenedAuthInfo([]);
    }
  }, []);
  const handleOnBackup = useCallback((b: BackupInfo) => {
    console.log("[ BackupInfo ] ", b);
    setBackupInfo(b);
    setFlattenedBackupInfo(getTableData(b));
  }, []);

  useEffect(() => {
    const wanderInstance = new WanderConnect({
      clientId: "FREE_TRIAL",
      iframe: {
        routeLayout: {
          auth: iframeMode,
        },
      },
      button: {
        position: "top-right",
        // theme: "system",
        // label: true,
        // wanderLogo: iframeMode === "sidebar" ? "default" : "text-color",
      },
      baseURL: baseURL || undefined,
      baseServerURL: baseServerURL || undefined,
      onAuth: handleOnAuth,
      onBackup: handleOnBackup,
    });

    setWander(wanderInstance);

    return () => {
      wanderInstance.destroy();
    };
  }, []);

  const connect = async () => {
    if (!window.arweaveWallet) {
      alert("Can't find `window.arweaveWallet`");
      return;
    }

    await window.arweaveWallet.connect([
      "ACCESS_ADDRESS",
      "ACCESS_PUBLIC_KEY",
      "ACCESS_ALL_ADDRESSES",
      "SIGN_TRANSACTION",
      "ENCRYPT",
      "DECRYPT",
      "SIGNATURE",
      "ACCESS_ARWEAVE_CONFIG",
      "DISPATCH",
      "ACCESS_TOKENS",
    ]);
  };

  const disconnect = async () => {
    if (!window.arweaveWallet) {
      alert("Can't find `window.arweaveWallet`");
      return;
    }

    await window.arweaveWallet.disconnect();
  };
  const logout = async () => {
    if (!wander) {
      alert("Can't find `wander connect instance`");
      return;
    }

    await wander.signOut();
  };

  const encryptAndDecrypt = async () => {
    if (!window.arweaveWallet) {
      alert("Can't find `window.arweaveWallet`");
      return;
    }

    const enc = new TextEncoder();
    const message = enc.encode("This message was encrypted and decrypted!");
    const encrypted = await window.arweaveWallet.encrypt(message, {
      name: "RSA-OAEP",
    });
    const decrypted = await window.arweaveWallet.decrypt(encrypted, {
      name: "RSA-OAEP",
    });
    alert(new TextDecoder().decode(decrypted));
  };

  const [screenshotThemeIndex, setScreenshotThemeIndex] = useState(0);
  const screenshotThemeName = SCREENSHOT_THEMES[screenshotThemeIndex].name;

  const changeTheme = () => {
    const nextScreenshotThemeIndex =
      (screenshotThemeIndex + 1) % SCREENSHOT_THEMES.length;

    setScreenshotThemeIndex(nextScreenshotThemeIndex);

    const { documentElement } = document;
    const rootElement = document.querySelector(
      "body > div > div"
    ) as HTMLDivElement;

    if (!rootElement) return;

    const screenshotTheme = SCREENSHOT_THEMES[nextScreenshotThemeIndex];

    if (screenshotTheme.name === "default") {
      documentElement.removeAttribute("style");
      rootElement.removeAttribute("style");
    } else {
      documentElement.style.background = screenshotTheme.background;
      rootElement.style.display = "none";
    }
  };

  return (
    <>
      <div className="flex w-full pt-20 pb-10 justify-center bg-accent">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Wander Connect Test</CardTitle>
            <CardDescription>
              Simple App to test Wander Connect
              {screenshotThemeName === "default" ? null : (
                <p>Screenshot Mode: {screenshotThemeName}</p>
              )}
            </CardDescription>
            {needsReload && (
              <CardAction>
                <Button onClick={() => window.location.reload()}>
                  {otherIcons.reload}
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="grid w-full max-w-sm items-center gap-2">
                <Label>Select iframe mode:</Label>
                <Select
                  value={iframeMode}
                  onValueChange={(value) => setIframeMode(value as IframeMode)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Iframe Modes</SelectLabel>
                      <SelectItem value="popup">Popup</SelectItem>
                      <SelectItem value="modal">Modal</SelectItem>
                      <SelectItem value="half">Half</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-full max-w-sm items-center gap-2">
                <Label>Base URL (optional):</Label>
                <Input
                  type="text"
                  value={baseURL}
                  onChange={(e) => setBaseURL(e.target.value)}
                  placeholder="e.g., http://localhost:5173"
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-2">
                <Label>Base Server URL:</Label>
                <Input
                  type="text"
                  value={baseServerURL}
                  onChange={(e) => setBaseServerURL(e.target.value)}
                  placeholder="e.g., http://localhost:3000"
                />
              </div>
              <div className="w-full grid grid-cols-2 gap-2">
                <Button onClick={() => wander?.open()}>Open</Button>
                <Button onClick={() => wander?.open("backup")}>
                  Open Backup
                </Button>
              </div>
              <Button onClick={() => connect()}>Connect</Button>
              <Button onClick={() => disconnect()}>Disconnect</Button>
              <Button onClick={() => logout()}>Log Out</Button>
              <Button onClick={() => encryptAndDecrypt()}>
                Encrypt & Decrypt
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
             <Table>
                <TableCaption>Session Info</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flattenedAuthInfo.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.key}</TableCell>
                      <TableCell>{item.value}</TableCell>
                    </TableRow>
                  ))}
                  {flattenedBackupInfo.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.key}</TableCell>
                      <TableCell className="text-ellipsis">{item.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardFooter>
        </Card>
      </div>

      <Button
        className="fixed right-2 bottom-2 w-8 h-8 rounded-full transition-colors"
        // className="fixed right-2 bottom-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
        onClick={changeTheme}
      >
        📸
      </Button>
    </>
  );
}

export default App;

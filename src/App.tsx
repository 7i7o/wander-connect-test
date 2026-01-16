import {
    AuthInfo,
    BackupInfo,
    ThemeSetting,
    WanderConnect,
} from "@wanderapp/connect";
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
import { Table, TableBody, TableCell, TableRow } from "./components/ui/table";
import { Separator } from "./components/ui/separator";
import { Collapsible, CollapsibleTrigger } from "./components/ui/collapsible";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import {
    ArrowRightLeftIcon,
    CoinsIcon,
    DatabaseBackupIcon,
    DollarSignIcon,
    DoorOpenIcon,
    HomeIcon,
    Link2Icon,
    LockIcon,
    LockOpenIcon,
    LogOut,
    Moon,
    RefreshCwIcon,
    Sun,
    UnplugIcon,
    WalletIcon,
} from "lucide-react";

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

// Add these constants at the top after imports
const STORAGE_KEYS = {
    IFRAME_MODE: "wander-iframe-mode",
    BASE_URL: "wander-base-url",
    BASE_SERVER_URL: "wander-base-server-url",
    ENVIRONMENT: "wander-environment",
} as const;

const ENVIRONMENTS = {
    PRODUCTION: {
        name: "Production",
        baseURL: "https://connect.wander.app",
        baseServerURL: "https://connect-api.wander.app",
    },
    DEVELOPMENT: {
        name: "Development",
        baseURL: "https://connect-dev.wander.app",
        baseServerURL: "https://connect-api-dev.wander.app",
    },
    CUSTOM: {
        name: "Custom",
        baseURL: "",
        baseServerURL: "",
    },
} as const;

type EnvironmentType = keyof typeof ENVIRONMENTS;

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
    const [theme, setTheme] = useState("dark");
    const linkRegEx = new RegExp("http(s)?://*");
    const [isOpen, setIsOpen] = useState(false);
    const [wander, setWander] = useState<WanderConnect | null>(null);
    //   const [authInfo, setAuthInfo] = useState<AuthInfo | undefined>();
    const [flattenedAuthInfo, setFlattenedAuthInfo] = useState<FlattenedData[]>(
        []
    );
    //   const [backupInfo, setBackupInfo] = useState<BackupInfo | undefined>();
    const [flattenedBackupInfo, setFlattenedBackupInfo] = useState<
        FlattenedData[]
    >([]);
    const [iframeMode, setIframeMode] = useState<IframeMode>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.IFRAME_MODE);
        return (stored as IframeMode) || "popup";
    });

    const [environment, setEnvironment] = useState<EnvironmentType>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.ENVIRONMENT);
        return (stored as EnvironmentType) || "PRODUCTION";
    });

    const [baseURL, setBaseURL] = useState<string>(() => {
        const storedEnv = localStorage.getItem(STORAGE_KEYS.ENVIRONMENT) as EnvironmentType || "PRODUCTION";
        const storedURL = localStorage.getItem(STORAGE_KEYS.BASE_URL);

        if (storedEnv === "CUSTOM" && storedURL) {
            return storedURL;
        }
        return ENVIRONMENTS[storedEnv].baseURL;
    });

    const [baseServerURL, setBaseServerURL] = useState<string>(() => {
        const storedEnv = localStorage.getItem(STORAGE_KEYS.ENVIRONMENT) as EnvironmentType || "PRODUCTION";
        const storedServerURL = localStorage.getItem(STORAGE_KEYS.BASE_SERVER_URL);

        if (storedEnv === "CUSTOM" && storedServerURL) {
            return storedServerURL;
        }
        return ENVIRONMENTS[storedEnv].baseServerURL;
    });

    const [needsReload, setNeedsReload] = useState(false);

    useEffect(() => {
        if (wander) wander.setTheme(theme as ThemeSetting);
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
    }, [theme]);

    useEffect(() => {
        const storedMode = localStorage.getItem(STORAGE_KEYS.IFRAME_MODE);
        const storedEnvironment = localStorage.getItem(STORAGE_KEYS.ENVIRONMENT);
        const storedBaseURL = localStorage.getItem(STORAGE_KEYS.BASE_URL);
        const storedBaseServerURL = localStorage.getItem(
            STORAGE_KEYS.BASE_SERVER_URL
        );

        if (
            storedMode !== iframeMode ||
            storedEnvironment !== environment ||
            (environment === "CUSTOM" && storedBaseURL !== baseURL) ||
            (environment === "CUSTOM" && storedBaseServerURL !== baseServerURL)
        ) {
            localStorage.setItem(STORAGE_KEYS.IFRAME_MODE, iframeMode);
            localStorage.setItem(STORAGE_KEYS.ENVIRONMENT, environment);
            if (environment === "CUSTOM") {
                localStorage.setItem(STORAGE_KEYS.BASE_URL, baseURL);
                localStorage.setItem(STORAGE_KEYS.BASE_SERVER_URL, baseServerURL);
            }
            setNeedsReload(true);
        }
    }, [iframeMode, environment, baseURL, baseServerURL]);

    useEffect(() => {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(isDark ? "dark" : "light");
    }, []);

    const handleOnAuth = useCallback((authInfo: AuthInfo) => {
        if (authInfo) {
            //   setAuthInfo(authInfo);
            setFlattenedAuthInfo(getTableData(authInfo));
        } else {
            //   setAuthInfo(undefined);
            setFlattenedAuthInfo([]);
        }
    }, []);
    const handleOnBackup = useCallback((b: BackupInfo) => {
        console.log("[ BackupInfo ] ", b);
        // setBackupInfo(b);
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

    const handleEnvironmentChange = (newEnvironment: EnvironmentType) => {
        setEnvironment(newEnvironment);

        if (newEnvironment !== "CUSTOM") {
            setBaseURL(ENVIRONMENTS[newEnvironment].baseURL);
            setBaseServerURL(ENVIRONMENTS[newEnvironment].baseServerURL);
        }
    };

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
            <div className="flex min-h-screen w-full pt-20 pb-20 justify-center bg-accent">
                <Card className="w-full max-w-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <img
                                src="/logo.svg"
                                alt=""
                                className="inline-flex w-8 h-8 mr-2"
                            />
                            Wander Connect Test
                        </CardTitle>
                        <CardDescription>
                            Simple App to test Wander Connect
                            {screenshotThemeName === "default" ? null : (
                                <p>Screenshot Mode: {screenshotThemeName}</p>
                            )}
                        </CardDescription>
                        <CardAction>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                            >
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            </Button>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3">
                            <div className="grid w-full  items-center gap-2">
                                <Label>Layout Mode</Label>
                                <div className="flex items-center justify-between">
                                    <Select
                                        value={iframeMode}
                                        onValueChange={(value) =>
                                            setIframeMode(value as IframeMode)
                                        }
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
                                    {needsReload ? (
                                        <Button onClick={() => window.location.reload()}>
                                            <RefreshCwIcon className="h-[1.2rem] w-[1.2rem]" />
                                        </Button>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                            </div>
                            <div className="grid w-full items-center gap-2">
                                <Label>Environment</Label>
                                <RadioGroup
                                    value={environment}
                                    onValueChange={handleEnvironmentChange}
                                    className="flex flex-row gap-6"
                                >
                                    {Object.entries(ENVIRONMENTS).map(([key, env]) => (
                                        <div key={key} className="flex items-center space-x-2">
                                            <RadioGroupItem value={key} id={key} />
                                            <Label htmlFor={key} className="text-sm font-normal cursor-pointer">
                                                {env.name}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                            <div className="grid w-full items-center gap-2">
                                <Label>Base URL</Label>
                                <Input
                                    type="text"
                                    value={baseURL}
                                    onChange={(e) => setBaseURL(e.target.value)}
                                    placeholder="e.g., http://localhost:5173"
                                    disabled={environment !== "CUSTOM"}
                                />
                            </div>
                            <div className="grid w-full items-center gap-2">
                                <Label>Base Server URL</Label>
                                <Input
                                    type="text"
                                    value={baseServerURL}
                                    onChange={(e) => setBaseServerURL(e.target.value)}
                                    placeholder="e.g., http://localhost:3000"
                                    disabled={environment !== "CUSTOM"}
                                />
                            </div>
                            <div className="w-full grid grid-cols-3 gap-2">
                                <Button onClick={() => wander?.open()}>
                                    <DoorOpenIcon />
                                    Open
                                </Button>
                                <Button onClick={() => wander?.open("home")}>
                                    <HomeIcon />
                                    Home
                                </Button>
                                <Button onClick={() => wander?.open("backup")}>
                                    <DatabaseBackupIcon />
                                    Backup
                                </Button>
                                <Button onClick={() => wander?.open("receive")}>
                                    <CoinsIcon />
                                    Receive
                                </Button>
                                <Button onClick={() => wander?.open("receive-address")}>
                                    <WalletIcon />
                                    Address
                                </Button>
                                <Button onClick={() => wander?.open("buy")}>
                                    <DollarSignIcon />
                                    Buy
                                </Button>
                                <Button onClick={() => wander?.open("transactions")}>
                                    <ArrowRightLeftIcon />
                                    Transactions
                                </Button>
                            </div>
                            <div className="w-full grid grid-cols-2 gap-2">
                                <Button onClick={() => connect()}>
                                    <Link2Icon />
                                    Connect
                                </Button>
                                <Button onClick={() => disconnect()}>
                                    <UnplugIcon />
                                    Disconnect
                                </Button>
                            </div>
                            <div className="w-full grid grid-cols-2 gap-2">
                                <Button onClick={() => logout()}>
                                    <LogOut />
                                    Log Out
                                </Button>
                                <Button onClick={() => encryptAndDecrypt()}>
                                    <LockIcon />
                                    Encrypt/Decrypt
                                    <LockOpenIcon />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="flex-col gap-2">
                        <Collapsible
                            open={isOpen}
                            onOpenChange={setIsOpen}
                            className="flex w-full flex-col gap-2"
                        >
                            <CollapsibleTrigger asChild>
                                <Button variant="outline">
                                    <CardDescription>Session Info</CardDescription>
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <Table>
                                    {/* <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader> */}
                                    <TableBody>
                                        {flattenedAuthInfo.map((item, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">
                                                    {item.key}
                                                </TableCell>
                                                <TableCell>
                                                    {typeof item.value === "string" &&
                                                        linkRegEx.test(item.value) ? (
                                                        <img
                                                            src={item.value}
                                                            alt="img"
                                                            title={item.value}
                                                            className="w-8 h-8 rounded-full"
                                                        />
                                                    ) : (
                                                        item.value
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {flattenedBackupInfo.map((item, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">
                                                    {item.key}
                                                </TableCell>
                                                <TableCell className="text-ellipsis">
                                                    {item.value}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CollapsibleContent>
                        </Collapsible>
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

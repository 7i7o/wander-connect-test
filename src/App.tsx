import { WanderEmbedded } from "@wanderapp/embed-sdk";
import { useEffect, useState } from "react";

type IframeMode = "popup" | "modal" | "half" | "sidebar";

function App() {
  //   const [message, setMessage] = useState("");
  const [instance, setInstance] = useState<WanderEmbedded | null>(null);
  const [iframeMode, setIframeMode] = useState<IframeMode>("sidebar");

  useEffect(() => {
    // Cleanup previous instance
    instance?.destroy();

    const wanderInstance = new WanderEmbedded({
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
    });

    setInstance(wanderInstance);

    // Cleanup on component unmount
    return () => {
      wanderInstance.destroy();
    };
  }, [iframeMode]);

  //   const handleSignMessage = async () => {
  //     await (window.arweaveWallet as any)?.connect(["SIGNATURE"]);
  //     await (window.arweaveWallet as any)?.signMessage(
  //       new TextEncoder().encode(message)
  //     );
  //   };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  App Title
                </h1>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Select iframe mode:
                  </label>
                  <select
                    value={iframeMode}
                    onChange={(e) =>
                      setIframeMode(e.target.value as IframeMode)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="popup">Popup</option>
                    <option value="modal">Modal</option>
                    <option value="half">Half</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                </div>
                <p>Your new App is ready. This is just a placeholder.</p>
                <div className="flex flex-col gap-2">
                  {/* <input
                    type="text"
                    className="border border-gray-300 rounded-md p-2"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    onClick={handleSignMessage}
                  >
                    send message
                  </button> */}
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

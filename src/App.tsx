import { WanderEmbedded } from "@kranthicodes/wander-embedded-sdk";
import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [instance, setInstance] = useState<WanderEmbedded | null>(null);

  useEffect(() => {
    const wanderInstance = new WanderEmbedded({
      theme: {
        primary: "#000000",
        secondary: "#000000",
      },
    });
    setInstance(wanderInstance);
  }, []);
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Vite + React + TypeScript + Tailwind CSS
                </h1>
                <p>
                  Your new project is ready! Start editing and see the magic
                  happen.
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    className="border border-gray-300 rounded-md p-2"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    onClick={() => instance?.sendMessageToIframe(message)}
                  >
                    send message
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

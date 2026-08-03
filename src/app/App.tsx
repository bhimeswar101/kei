import { useEffect } from "react";

import { runtime } from "@/core/runtime";

function App() {
  useEffect(() => {
    const start = async () => {
      try {
        await runtime.start();

        console.info(
          "✅ Kei application runtime started.",
        );
      } catch (error) {
        console.error(
          "❌ Failed to start Kei application runtime:",
          error,
        );
      }
    };

    void start();

    return () => {
      void runtime.stop();
    };
  }, []);

  return (
    <main className="min-h-screen bg-black" />
  );
}

export default App;
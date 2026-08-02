import { useEffect } from "react";

import { runtime } from "@/core/runtime";

function App() {
  useEffect(() => {
    const start = async () => {
      try {
        await runtime.start();
      } catch (error) {
        console.error("❌ Failed to start Kei:", error);
      }
    };

    void start();

    return () => {
      void runtime.stop();
    };
  }, []);

  return <main className="min-h-screen bg-black" />;
}

export default App;

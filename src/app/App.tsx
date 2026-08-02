import { useEffect } from "react";

import { contextEngine } from "@/core/context";
import { intelligenceEngine } from "@/core/intelligence";
import { runtime } from "@/core/runtime";

function App() {
  useEffect(() => {
    const start = async () => {
      try {
        await runtime.start();

        const requestId =
          "execution-test-missing-handler";

        const testContext = {
          requestId,

          input: {
            id: "execution-test-input",
            type: "text" as const,
            text: "Open Spotify",
            timestamp: new Date(),
          },

          context:
            contextEngine.createSnapshot(
              requestId,
            ),
        };

        const result =
          await intelligenceEngine.process(
            testContext,
          );

        console.log(
          "🧠 4.7 Intelligence result:",
          result,
        );

        console.log(
          "⚙️ 4.7 Execution result:",
          result.execution,
        );
      } catch (error) {
        console.error(
          "❌ 4.7 Execution test failed:",
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
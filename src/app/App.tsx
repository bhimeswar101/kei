import { useEffect } from "react";

import { runtime } from "@/core/runtime";

function App() {
  useEffect(() => {
    void runtime.start();

    return () => {
      void runtime.stop();
    };
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <h1 className="text-5xl font-bold text-violet-400">
        Kei
      </h1>
    </div>
  );
}

export default App;
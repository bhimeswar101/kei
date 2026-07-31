import { pluginManager } from "@/core/plugins";
import { VoicePlugin } from "@/plugins/voice";

function App() {
  async function boot() {
    const voice = new VoicePlugin();

    pluginManager.register(voice);

    console.log(pluginManager.getAll());

    await pluginManager.startAll();

    console.log(voice.state());

    await pluginManager.stopAll();

    console.log(voice.state());
  }

  boot();

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <h1 className="text-5xl font-bold text-violet-400">
        Kei
      </h1>
    </div>
  );
}

export default App;
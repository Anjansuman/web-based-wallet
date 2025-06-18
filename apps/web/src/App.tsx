/// <reference types="chrome" />

import { useState } from "react";
import Dashboard from "./components/Dashboard/Dashboard";
import { useEffect } from "react";
import Seed from "./components/Seed/Seed";
import SetPassword from "./components/Password/SetPassword";
import UnlockWallet from "./components/Password/UnlockWallet";

type Stage = "loading" | "import" | "setPassword" | "unlock" | "dashboard"

function App() {

  const [stage, setStage] = useState<Stage>("loading");
  const [tempMnemonic, setTempMnemonic] = useState<string | null>(null);

  useEffect(() => {

    chrome.storage.local.get("vault", (data) => {
      data.vault ? setStage("unlock") : setStage("import");
    })

  }, []);

  if(stage === "loading") return null;

  if(stage === "import") {
    return <Seed onComplete={(mnemonic) => {
      setTempMnemonic(mnemonic);
      setStage("setPassword");
    }} />
  }

  if(stage === "setPassword" && tempMnemonic) {
    return <SetPassword mnemonic={tempMnemonic} onComplete={() => setStage("dashboard")} />
  }

  if(stage === "unlock") {
    return <Dashboard />
    return <UnlockWallet onUnlock={() => setStage("dashboard")} />
  }

  return <Dashboard />
}

export default App;

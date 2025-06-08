/// <reference types="chrome" />

import { useState } from "react";
import Dashboard from "./components/Dashboard/Dashboard";
import { useEffect } from "react";
import Seed from "./components/Seed/Seed";
import SetPassword from "./components/Password/SetPassword";

type Stage = "loading" | "import" | "setPassword" | "unlock" | "dashboard"

function App() {

  const [stage, setStage] = useState<Stage>("loading");
  const [tempPrivateKey, setTempPrivateKey] = useState<string | null>(null);

  useEffect(() => {

    chrome.storage.local.get("vault", (data) => {
      data.vault ? setStage("unlock") : setStage("import");
    })

  }, []);

  if(stage === "loading") return null;

  if(stage === "import") {
    return <Seed onComplete={(privateKey) => {
      setTempPrivateKey(privateKey);
      setStage("setPassword");
    }} />
  }

  if(stage === "setPassword" && tempPrivateKey) {
    return <SetPassword privateKey={tempPrivateKey} onComplete={() => setStage("dashboard")} />
  }

  if(stage === "unlock") {
    return <Dashboard />
  }

  return <Dashboard />
}

export default App;

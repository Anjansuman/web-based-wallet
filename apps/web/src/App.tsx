/// <reference types="chrome" />

import { useState, useEffect, Suspense, lazy } from "react";
import image from "../public/images/logo.png";
import { useHashed } from "./context/HashedAtom";

type Stage = "loading" | "import" | "setPassword" | "unlock" | "dashboard";

const Seed = lazy(() => import("./pages/Seed/Seed"));
const SetPassword = lazy(() => import("./pages/Password/SetPassword"));
const UnlockWallet = lazy(() => import("./pages/Password/UnlockWallet"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));


export default function App() {
    const [stage, setStage] = useState<Stage>("loading");
    const [tempMnemonic, setTempMnemonic] = useState<string | null>(null);
    const { setHashed } = useHashed();

    useEffect(() => {
        chrome.runtime.sendMessage({ type: "IS_WALLET_UNLOCKED" }, async (res) => {
            if(res.unlocked) {
                console.log("unlocking wallet without pass and setting hashed: ", res.hashed);
                setHashed(res.hashed);
                setStage("dashboard");
                return;
            }
        });

        chrome.storage.local.get("vault", (data) => {
            data.vault ? setStage("unlock") : setStage("import");
        });
    }, []);

    if (stage === "loading") return null;

    return (
        <>
            {stage === "import" && (
                <Suspense fallback={<PageLoader />}>
                    <Seed
                        onComplete={(mnemonic) => {
                            setTempMnemonic(mnemonic);
                            setStage("setPassword");
                        }}
                    />
                </Suspense>
            )}

            {stage === "setPassword" && tempMnemonic && (
                <Suspense fallback={<PageLoader />}>
                    <SetPassword
                        mnemonic={tempMnemonic}
                        onComplete={() => setStage("dashboard")}
                    />
                </Suspense>
            )}

            {stage === "unlock" && (
                <Suspense fallback={<PageLoader />}>
                    <UnlockWallet onUnlock={() => setStage("dashboard")} />
                </Suspense>
            )}

            {stage === "dashboard" && (
                <Suspense fallback={<PageLoader />}>
                    <Dashboard />
                </Suspense>
            )}
        </>
    );
}


const PageLoader = () => {
    return <div className="w-full h-full flex justify-center items-center ">
        <img src={image} alt="logo" className="size-30 " />
    </div>
}


// this page doesn't support lazy loader

/*

/// <reference types="chrome" />

import { useState } from "react";
import Dashboard from "./pages/Dashboard/Dashboard";
import { useEffect } from "react";
import Seed from "./pages/Seed/Seed";
import SetPassword from "./pages/Password/SetPassword";
import UnlockWallet from "./pages/Password/UnlockWallet";

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
    return <UnlockWallet onUnlock={() => setStage("dashboard")} />
  }

  return <Dashboard />
}

export default App;

*/
/// <reference types="chrome" />

import { useState, useEffect, Suspense, lazy } from "react";
import image from "../public/images/logo.png";
import { useHashedStore } from "./store/hashed-store";
import { Hashed } from "./utils/hashed";
import { PAGE } from "./enums/page-enum";
import { usePageStore } from "./store/page-store";


const Seed = lazy(() => import("./pages/Seed/Seed"));
const SetPassword = lazy(() => import("./pages/Password/SetPassword"));
const UnlockWallet = lazy(() => import("./pages/Password/UnlockWallet"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));


export default function App() {
    const [tempMnemonic, setTempMnemonic] = useState<string | null>(null);

    const { setHashed } = useHashedStore();
    const { page, setPage } = usePageStore();

    useEffect(() => {
        chrome.runtime.sendMessage({ type: "IS_WALLET_UNLOCKED" }, async (res) => {
            if (res.unlocked) {

                const newHashed = new Hashed();
                newHashed.initHashedWithData(res.hashed as Hashed);

                setHashed(newHashed);
                setPage(PAGE.DASHBOARD);

                return;
            }
        });

        chrome.storage.local.get("vault", (data) => {
            data.vault ? setPage(PAGE.UNLOCK) : setPage(PAGE.IMPORT);
        });
    }, []);

    useEffect(() => {

    }, [page]);

    if (page === PAGE.LOADING) return null;

    return (
        <>
            {page === PAGE.IMPORT && (
                <Suspense fallback={<PageLoader />}>
                    <Seed
                        onComplete={(mnemonic) => {
                            setTempMnemonic(mnemonic);
                            setPage(PAGE.SET_PASSWORD);
                        }}
                    />
                </Suspense>
            )}

            {page === PAGE.SET_PASSWORD && tempMnemonic && (
                <Suspense fallback={<PageLoader />}>
                    <SetPassword
                        mnemonic={tempMnemonic}
                        onComplete={() => setPage(PAGE.DASHBOARD)}
                    />
                </Suspense>
            )}

            {page === PAGE.UNLOCK && (
                <Suspense fallback={<PageLoader />}>
                    <UnlockWallet onUnlock={() => setPage(PAGE.DASHBOARD)} />
                </Suspense>
            )}

            {page === PAGE.DASHBOARD && (
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
import { useEffect, useRef, useState } from "react";
import { NavBar } from "./components/NavBar/NavBar";
import SideBar from "./components/SideBar/SideBar";
import BottomBar from "./components/BottomBar/BottomBar";
import Value from "./components/Value/Value";
import ActionButtons from "./components/ActionButtons/ActionButtons";
import { Receive } from "./pages/Receive";
import { useHashedStore } from "../../store/hashed-store";
import { AddAccount } from "./pages/AddAccount/AddAccount";
import { Settings } from "./pages/Settings";
import { EditAccounts } from "./pages/EditAccounts/EditAccounts";
import gsap from "gsap";
import { Send } from "./pages/Send";


export default function Dashboard() {

    const [sideBar, setSideBar] = useState<boolean>(false);
    const sideBarRef = useRef<HTMLDivElement>(null);

    const [accountPanel, setAccountPanel] = useState<"receive" | "send" | "swap" | "buy" | null>(null);
    const [walletPanel, setWalletPanel] = useState<"add" | "edit" | "settings" | null>(null);

    const [balance, setBalance] = useState<{ token: string, USD: string }>({ token: "0.0", USD: "0.0" });

    const { hashed } = useHashedStore();

    useEffect(() => {
        if (!hashed) return;

        const getValue = async () => {
            const values = await hashed.setBalanceOfCurrentAccount();
            if(values) {
                setBalance(values);
            } else {
                // handle the error
            }
        }
        getValue();
        // const ctx = setInterval(() => getValue(), 5000);
        const repeatFetch = setInterval(() => getValue(), 7000);

        return () => clearInterval(repeatFetch);

    }, [hashed]);

    const handleSideBarClose = () => {
        gsap.to(sideBarRef.current, {
            x: -100,
            duration: 0.2,
            ease: "power2.inOut",
            onComplete: () => {
                setSideBar(false);
            }
        });
    }

    return <div className="h-full w-full flex flex-col justify-start ">
        <div className="h-full flex-grow ">
            <NavBar sideBar={() => setSideBar(true)} />
            {
                sideBar && <SideBar
                    ref={sideBarRef}
                    close={() => setSideBar(false)}
                    addAccount={() => {
                        setWalletPanel("add");
                        handleSideBarClose();
                    }}
                    editAccounts={() => {
                        setWalletPanel("edit");
                        handleSideBarClose();
                    }}
                    settings={() => {
                        setWalletPanel("settings");
                        handleSideBarClose();
                    }}
                />
            }
            <BottomBar />
            <div className="w-full px-3 mt-[70px] flex flex-col items-center gap-y-3 ">
                <Value amount={balance.token} currency={"ETH"} USD={balance.USD} />
                <ActionButtons
                    receive={() => {
                        setSideBar(false);
                        setAccountPanel("receive");
                    }}
                    send={() => {
                        setSideBar(false);
                        setAccountPanel("send");
                    }}
                    swap={() => {
                        setSideBar(false);
                        setAccountPanel("swap");
                    }}
                    buy={() => {
                        setSideBar(false);
                        setAccountPanel("buy");
                    }}
                />

            </div>

            {/* panels for working with balance */}
            {accountPanel === "receive" && <Receive close={() => setAccountPanel(null)} />}
            {accountPanel === "send" && <Send close={() => setAccountPanel(null)} />}
            {accountPanel === "swap" && <Receive close={() => setAccountPanel(null)} />}
            {accountPanel === "buy" && <Receive close={() => setAccountPanel(null)} />}

            {/* panels for working with wallet */}
            {walletPanel === "add" && <AddAccount close={() => setWalletPanel(null)} />}
            {walletPanel === "edit" && <EditAccounts close={() => setWalletPanel(null)} />}
            {walletPanel === "settings" && <Settings close={() => setWalletPanel(null)} />}


        </div>
    </div>
}
import { useEffect, useState } from "react";
import { NavBar } from "./NavBar/NavBar";
import SideBar from "./SideBar/SideBar";
import BottomBar from "./components/BottomBar/BottomBar";
import Value from "./Value/Value";
import ActionButtons from "./components/ActionButtons/ActionButtons";
import { Receive } from "./pages/Receive";
import { useHashed } from "../../context/HashedAtom";


export default function Dashboard() {

    const [sideBar, setSideBar] = useState<boolean>(false);
    
    const [accountPanel, setAccountPanel] = useState<"receive" | "send" | "swap" | "buy" | null>(null);
    const [walletPanel, setWalletPanel] = useState<"add" | "edit" | "settings" | null>(null);

    const [balance, setBalance] = useState<number>(12); // 12 is set for testing cause i have 0 eth

    const { hashed } = useHashed();

    useEffect(() => {
        if (!hashed) return;

        const getValue = async () => {
            const value = await hashed.setBalanceOfCurrentAccount();
            setBalance(value);
            return value
        }
        getValue();

    }, [hashed]);


    return <div className="h-full w-full flex flex-col justify-start ">
        <div className="h-full flex-grow ">
            <NavBar sideBar={() => setSideBar(true)} />
            {
                sideBar && <SideBar
                    close={() => setSideBar(false)}
                    addAccount={() => setWalletPanel("add")}
                    editAccounts={() => setWalletPanel("edit")}
                    settings={() => setWalletPanel("settings")}
                />
            }
            <BottomBar />
            <div className="w-full px-3 mt-[70px] flex flex-col items-center gap-y-3 ">
                <Value amount={balance} currency={"ETH"} USD={92.31} />
                <ActionButtons
                    receive={() => setAccountPanel("receive")}
                    send={() => setAccountPanel("send")}
                    swap={() => setAccountPanel("swap")}
                    buy={() => setAccountPanel("buy")}
                />

            </div>
            {accountPanel === "receive" && <Receive close={() => setAccountPanel(null)} />}
            {accountPanel === "send" && <Receive close={() => setAccountPanel(null)} />}
            {accountPanel === "swap" && <Receive close={() => setAccountPanel(null)} />}
            {accountPanel === "buy" && <Receive close={() => setAccountPanel(null)} />}

            {walletPanel === "add" && <></>}

        </div>
    </div>
}
import { useState } from "react";
import { NavBar } from "./NavBar/NavBar";
import SideBar from "./SideBar/SideBar";
import BottomBar from "./BottomBar/BottomBar";
import Value from "./Value/Value";
import ActionButtons from "./ActionButtons/ActionButtons";


export default function Dashboard() {

    const [sideBar, setSideBar] = useState<boolean>(false);

    return <div className="h-full w-full flex flex-col justify-start ">
        <div className="h-full flex-grow ">
            <NavBar sideBar={() => setSideBar(true)} />
            {
                sideBar && <SideBar close={() => setSideBar(false)} />
            }
            <BottomBar />
            <div className="w-full px-3 mt-[70px] flex flex-col items-center gap-y-3 ">
                <Value amount={0.0413} currency={"ETH"} USD={92.31} />
                <ActionButtons />
            </div>
        </div>
    </div>
}
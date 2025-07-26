import { useEffect, useState } from "react";
import { NetworkTab } from "../NetworkTab/NetworkTab";
import { useHashedStore } from "../../../../store/hashed-store";

interface NavBarProps {
    sideBar: () => void
}

export const NavBar = ({ sideBar }: NavBarProps) => {

    const [networkTab, setNetworkTab] = useState<boolean>(false);
    const [currAccount, setCurrAccount] = useState<string>("");

    const { hashed } = useHashedStore();

    useEffect(() => {
        if(!hashed) return;

        console.log("hashed from navbar: ", hashed);

        const currentAccount = hashed.getSelectedAccount().name;
        setCurrAccount(currentAccount);
    }, []);

    return (
        <div className="h-14 w-full fixed top-0 left-0 p-4 flex justify-between items-center shadow-md z-30">
            <div
                className="h-7 w-7 rounded-full bg-white flex justify-center text-[10px] items-center text-center cursor-pointer"
                onClick={sideBar}
            >
                {currAccount.charAt(0)}
            </div>
            <div>Account 1</div>
            <div
                className="h-5 w-8 bg-red-400 rounded-full p-2 flex justify-center items-center gap-x-2 "
                onClick={() => setNetworkTab(true)}
            >
                <div className="h-4 w-4 p-1 rounded-full bg-gray-700 text-white text-[10px] flex justify-center items-center cursor-pointer ">
                    a
                </div>
                {
                    networkTab && <NetworkTab close={() => setNetworkTab(false)} />
                }
            </div>

        </div>
    );
};

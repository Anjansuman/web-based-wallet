import { IconChevronCompactDown } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import NetworkTab from "../NetworkTab/NetworkTab";
import { useHashed } from "../../../../context/HashedAtom";

interface NavBarProps {
    sideBar: () => void
}

export const NavBar = ({ sideBar }: NavBarProps) => {

    const [networkTab, setNetworkTab] = useState<boolean>(false);
    const [currAccount, setCurrAccount] = useState<string>("");

    const { hashed } = useHashed();

    useEffect(() => {
        if(!hashed) return;

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
                className="h-5 w-8 bg-red-400 rounded-full p-1 flex justify-center items-center "
                onClick={() => setNetworkTab(true)}
            >
                <div className="h-4 w-4 rounded-full bg-gray-700 text-white text-[10px] flex justify-center items-center ">
                    a
                </div>
                <IconChevronCompactDown className="size-3" />
                {
                    networkTab && <NetworkTab close={() => setNetworkTab(false)} />
                }
            </div>

        </div>
    );
};

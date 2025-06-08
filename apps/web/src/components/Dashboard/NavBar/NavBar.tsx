
interface NavBarProps {
    sideBar: () => void
}

export const NavBar = ({ sideBar }: NavBarProps) => {
    return (
        <div className="h-14 w-full fixed top-0 left-0 px-3 py-2 flex justify-between items-center shadow-md z-50">
            {/* Your NavBar content */}
            <div
                className="h-7 w-7 border border-red-400 rounded-full cursor-pointer "
                onClick={sideBar}
            ></div>
            <div>Account 1</div>
            <div className="h-7 w-7 bg-red-400"></div>
        </div>
    );
};

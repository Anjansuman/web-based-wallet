import { useState } from "react";
import { useContext } from "react";
import { createContext } from "react";
import PopUp from "../components/ui/PopUp";

type resultType = "success" | "error";

interface PopUpPanelContextType {
    showPanel: (content: string, result: resultType) => void,
    hidePanel: () => void
}

const PopUpPanelContext = createContext<PopUpPanelContextType | null>(null);

export function usePopUp() {
    const context = useContext(PopUpPanelContext);
    if(!context) {
        throw new Error("usePopUp must be used within it's provider");
    }
    return context;
}

export const PopUpPanelProvider = ({ children }: { children: React.ReactNode }) => {
    const [content, setContent] = useState<string | null>(null);
    const [result, setResult] = useState<resultType | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const showPanel = (newContent: string, result: resultType) => {
        setContent(newContent);
        setResult(result);
        setIsOpen(true);
    }

    const hidePanel = () => {
        setIsOpen(false);
    }

    return <PopUpPanelContext.Provider value={{ showPanel, hidePanel }}>
        {children}
        {
            isOpen && content && result && <PopUp content={content} ok={hidePanel} result={result} />
        }
    </PopUpPanelContext.Provider>
}
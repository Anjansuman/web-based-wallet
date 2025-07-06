import { usePopUp } from "../context/PopUpPanelContext";


export function useNotifier() {
  const { showPanel } = usePopUp();

  function notify(message: string, type: "success" | "error") {
    showPanel(message, type);
  }

  return { notify };
}
import { useHashedStore } from "../store/hashed-store";


export const EmptyHashedState = () => {
    const { removeHashed } = useHashedStore();
    removeHashed();
}
import { useHashed } from "../context/HashedAtom";


export const EmptyHashedState = () => {
    const { removeHashed } = useHashed();
    removeHashed();
}
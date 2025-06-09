import { useState } from "react";
import crypto from "crypto-js";

interface setPasswordProps {
    seed: string,
    onComplete: () => void
}

export default function SetPassword({ seed, onComplete }: setPasswordProps) {

    const [password, setPassword] = useState("");

    const handleEncrypt = () => {
        const salt = crypto.lib.WordArray.random(16).toString();

        const key = crypto.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: 100000
        });

        const iv = crypto.lib.WordArray.random(16).toString();
        const encrypted = crypto.AES.encrypt(seed, key.toString(), {
            iv: crypto.enc.Hex.parse(iv)
        }).toString();

        // creating vault
        const vault = {
            ciphertext: encrypted, // encrypted password
            salt,
            iv
        };

        chrome.storage.local.set({ vault }, onComplete);
    }

    return <div className="h-full w-full ">
        <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleEncrypt}>Secure Wallet</button>
    </div>
}
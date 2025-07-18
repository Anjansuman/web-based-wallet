export const SolanaLogo = ({ size }: { size: string }) => {
    return (
        <div>
            <svg
                width={size}
                height={size}
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Top stripe */}
                <path
                    d="M307.414 60H131.981C131.3 60 130.647 60.2686 130.181 60.7642L91.1533 102.028C90.1926 103.065 91.0508 104.896 92.586 104.896H268.019C268.7 104.896 269.353 104.627 269.819 104.132L308.847 62.8679C309.807 61.8313 308.949 60 307.414 60Z"
                    fill="url(#paint0_linear)"
                />

                {/* Middle stripe */}
                <path
                    d="M92.586 170.552C91.0508 170.552 90.1926 172.384 91.1533 173.42L130.181 214.684C130.647 215.179 131.3 215.448 131.981 215.448H307.414C308.949 215.448 309.807 213.616 308.847 212.58L269.819 171.316C269.353 170.82 268.7 170.552 268.019 170.552H92.586Z"
                    fill="url(#paint1_linear)"
                />

                {/* Bottom stripe */}
                <path
                    d="M307.414 281.103H131.981C131.3 281.103 130.647 281.371 130.181 281.867L91.1533 323.13C90.1926 324.167 91.0508 326 92.586 326H268.019C268.7 326 269.353 325.731 269.819 325.236L308.847 283.972C309.807 282.935 308.949 281.103 307.414 281.103Z"
                    fill="url(#paint2_linear)"
                />

                {/* Gradients */}
                <defs>
                    <linearGradient
                        id="paint0_linear"
                        x1="90"
                        y1="60"
                        x2="310"
                        y2="105"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#00FFA3" />
                        <stop offset="1" stopColor="#DC1FFF" />
                    </linearGradient>
                    <linearGradient
                        id="paint1_linear"
                        x1="90"
                        y1="170"
                        x2="310"
                        y2="215"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#00FFA3" />
                        <stop offset="1" stopColor="#DC1FFF" />
                    </linearGradient>
                    <linearGradient
                        id="paint2_linear"
                        x1="90"
                        y1="281"
                        x2="310"
                        y2="326"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#00FFA3" />
                        <stop offset="1" stopColor="#DC1FFF" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

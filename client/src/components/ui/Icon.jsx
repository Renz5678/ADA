import iconPng from "../../assets/icon.png";
import iconLightPng from "../../assets/iconLight.png";

export default function Icon({ height, width, className = "", variant = "light" }) {
    const src = variant === "light" ? iconLightPng : iconPng;
    return (
        <img
            src={src}
            alt="ADA Icon"
            className={`object-contain ${className}`}
            style={{
                height: height ? `${height}rem` : "auto",
                width: width ? `${width}rem` : "auto",
            }}
        />
    );
}
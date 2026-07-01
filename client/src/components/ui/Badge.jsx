export default function Badge({ label, bgColor, textColor }) {
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            {label}
        </span>
    );
}
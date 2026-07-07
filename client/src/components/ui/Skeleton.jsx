export default function Skeleton({ className = '', ...props }) {
    return (
        <div
            className={`animate-pulse rounded-xl bg-gray-200 ${className}`}
            {...props}
        />
    );
}

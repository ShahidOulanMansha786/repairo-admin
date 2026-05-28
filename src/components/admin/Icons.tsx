import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

// ─── Dashboard Icon ───────────────────────────────────────────────────────────
export function DashboardIcon({ className, ...props }: IconProps) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <path
                d="M2 10C2 5.58468 5.58468 2 10 2V10H18C18 14.4153 14.4153 18 10 18C5.58468 18 2 14.4153 2 10H2Z"
                fill="currentColor"
            />
            <path
                d="M12 2.25195C14.8191 2.97944 17.0205 5.18085 17.748 7.99995H12V2.25195Z"
                fill="currentColor"
            />
        </svg>
    );
}

// ─── Shop Verification (RepairShops) Icon ────────────────────────────────────
export function ShopVerificationIcon({ className, ...props }: IconProps) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <path
                d="M15.8333 17.5002V4.16683C15.8333 3.24635 15.0871 2.50016 14.1667 2.50016H5.83333C4.91286 2.50016 4.16667 3.24635 4.16667 4.16683V17.5002M15.8333 17.5002H17.5M15.8333 17.5002H11.6667M4.16667 17.5002H2.5M4.16667 17.5002H8.33333M7.5 5.8335H8.33333M7.5 9.16683H8.33333M11.6667 0.833496V3.3335M7.5 11.6668H7.50833M12.5 5.8335H12.5083M12.5 9.16683H12.5083M12.5 12.5002H12.5083M9.16667 12.5002H9.175M9.16667 15.8335H9.175M12.5 15.8335H12.5083M5.83333 5.8335H5.84167M5.83333 9.16683H5.84167M5.83333 12.5002H5.84167M5.83333 15.8335H5.84167"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// ─── Users Icon ───────────────────────────────────────────────────────────────
export function UsersIcon({ className, ...props }: IconProps) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <g clipPath="url(#users-clip)">
                <path
                    d="M10 3.62848C10.917 2.58886 12.3817 2.22531 13.6785 2.71548C14.9752 3.20565 15.8331 4.44722 15.8331 5.83348C15.8331 7.21975 14.9752 8.46131 13.6785 8.95148C12.3817 9.44165 10.917 9.0781 10 8.03848M12.5 17.5001H2.5V16.6668C2.5 13.9072 4.74042 11.6668 7.5 11.6668C10.2596 11.6668 12.5 13.9072 12.5 16.6668V17.5001ZM10.8333 5.83348C10.8333 7.6732 9.33972 9.16681 7.5 9.16681C5.66028 9.16681 4.16667 7.6732 4.16667 5.83348C4.16667 3.99376 5.66028 2.50015 7.5 2.50015C9.33972 2.50015 10.8333 3.99376 10.8333 5.83348Z"
                    stroke="currentColor"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
            <defs>
                <clipPath id="users-clip">
                    <rect width="20" height="20" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}

// ─── Leads Icon ───────────────────────────────────────────────────────────────
export function LeadsIcon({ className, ...props }: IconProps) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <path
                d="M2 10C2 5.58468 5.58468 2 10 2V10H18C18 14.4153 14.4153 18 10 18C5.58468 18 2 14.4153 2 10H2Z"
                fill="currentColor"
            />
            <path
                d="M12 2.25195C14.8191 2.97944 17.0205 5.18085 17.748 7.99995H12V2.25195Z"
                fill="currentColor"
            />
        </svg>
    );
}

// ─── Payments Icon ────────────────────────────────────────────────────────────
export function PaymentsIcon({ className, ...props }: IconProps) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <path
                d="M2.5 8.33333H17.5M5.83333 12.5H6.66667M10 12.5H10.8333M5 15.8333H15C15.9205 15.8333 16.6667 15.0871 16.6667 14.1667V4.16667C16.6667 3.24619 15.9205 2.5 15 2.5H5C4.07953 2.5 3.33333 3.24619 3.33333 4.16667V14.1667C3.33333 15.0871 4.07953 15.8333 5 15.8333Z"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// ─── Disputes Icon ────────────────────────────────────────────────────────────
export function DisputesIcon({ className, ...props }: IconProps) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <path
                d="M2.5 5L5 5.83333M5 5.83333L2.5 13.3333C3.98184 14.4443 6.019 14.4443 7.50083 13.3333M5 5.83333L7.5 13.3333M5 5.83333L10 4.16667M15 5.83333L17.5 5M15 5.83333L12.5 13.3333C13.9818 14.4443 16.019 14.4443 17.5008 13.3333M15 5.83333L17.5 13.3333M15 5.83333L10 4.16667M10 2.5V4.16667M10 17.5V4.16667M10 17.5H7.5M10 17.5H12.5"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// ─── Analytics Icon ───────────────────────────────────────────────────────────
export function AnalyticsIcon({ className, ...props }: IconProps) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <path
                d="M7.5 15.8333V10.8333C7.5 9.91286 6.75381 9.16667 5.83333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H5.83333C6.75381 17.5 7.5 16.7538 7.5 15.8333ZM7.5 15.8333V7.5C7.5 6.57953 8.24619 5.83333 9.16667 5.83333H10.8333C11.7538 5.83333 12.5 6.57953 12.5 7.5V15.8333M7.5 15.8333C7.5 16.7538 8.24619 17.5 9.16667 17.5H10.8333C11.7538 17.5 12.5 16.7538 12.5 15.8333M12.5 15.8333V4.16667C12.5 3.24619 13.2462 2.5 14.1667 2.5H15.8333C16.7538 2.5 17.5 3.24619 17.5 4.16667V15.8333C17.5 16.7538 16.7538 17.5 15.8333 17.5H14.1667C13.2462 17.5 12.5 16.7538 12.5 15.8333Z"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

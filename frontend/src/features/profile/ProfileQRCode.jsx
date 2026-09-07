import { QRCodeSVG } from "qrcode.react";
import { getProfileUrl } from "../../lib/profile";

export default function ProfileQRCode({ username }) {
    const profileUrl = getProfileUrl(username);

    return (
        <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-white rounded-2xl shadow-xl shadow-black/40 ring-1 ring-white/10">
                <QRCodeSVG
                    value={profileUrl}
                    size={168}
                    level="M"
                    fgColor="#090d16"
                    bgColor="#ffffff"
                />
            </div>
            <p className="text-[11px] text-slate-400 mt-3 font-medium">
                Scan with any camera app to open @{username}
            </p>
        </div>
    );
}

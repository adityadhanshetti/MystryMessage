import { QRCodeSVG } from "qrcode.react";

import { getProfileUrl } from "../../lib/profile";

export default function ProfileQRCode({ username }) {
    const profileUrl = getProfileUrl(username);

    return (
        <div>
            <h3>My Mystry QR</h3>

            <QRCodeSVG value={profileUrl} size={200} level="M" includeMargin />

            <p>Scan to send me an anonymous message.</p>
        </div>
    );
}

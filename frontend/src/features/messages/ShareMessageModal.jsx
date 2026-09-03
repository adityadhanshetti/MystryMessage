import { useState, useRef } from "react";
import {
    ShareIcon,
    CheckIcon,
    CopyIcon,
    CloseIcon,
    LogoIcon,
} from "../../components/icons";
import { getProfileUrl } from "../../lib/profile";

export default function ShareMessageModal({
    isOpen,
    onClose,
    messageContent,
    replyContent,
    username,
}) {
    const [copied, setCopied] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const profileUrl = getProfileUrl(username);

    if (!isOpen) return null;

    const formattedShareText = `🤫 Anonymous asked:
"${messageContent}"

${replyContent ? `💬 My response:\n"${replyContent}"\n\n` : ""}Send me anonymous messages or ask anything at: ${profileUrl}`;

    async function handleCopyText() {
        try {
            await navigator.clipboard.writeText(formattedShareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    }

    function handleShareTwitter() {
        const text = encodeURIComponent(
            `🤫 Anonymous message: "${messageContent.slice(0, 140)}${
                messageContent.length > 140 ? "..." : ""
            }"\n\nAsk me anything: ${profileUrl}`,
        );
        window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
    }

    function handleShareWhatsApp() {
        const text = encodeURIComponent(formattedShareText);
        window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }

    async function handleNativeShare() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Mystry Message",
                    text: formattedShareText,
                    url: profileUrl,
                });
            } catch (err) {
                if (err?.name !== "AbortError") {
                    handleCopyText();
                }
            }
        } else {
            handleCopyText();
        }
    }

    function handleDownloadStoryImage() {
        setIsGeneratingImage(true);

        try {
            const canvas = document.createElement("canvas");
            canvas.width = 1080;
            canvas.height = 1920;
            const ctx = canvas.getContext("2d");

            if (!ctx) return;

            // 1. Background gradient
            const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1920);
            bgGradient.addColorStop(0, "#080b11");
            bgGradient.addColorStop(0.35, "#181438");
            bgGradient.addColorStop(0.7, "#0d1326");
            bgGradient.addColorStop(1, "#080b11");
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, 1080, 1920);

            // Ambient background glow circle
            const glow = ctx.createRadialGradient(540, 700, 50, 540, 700, 600);
            glow.addColorStop(0, "rgba(99, 102, 241, 0.25)");
            glow.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, 1080, 1920);

            // 2. Story Card Background Sticker (Rounded rect)
            const cardX = 90;
            const cardY = 420;
            const cardW = 900;
            const cardH = replyContent ? 820 : 640;
            const radius = 48;

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardW, cardH, radius);
            ctx.fillStyle = "rgba(17, 24, 39, 0.88)";
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
            ctx.stroke();
            ctx.restore();

            // 3. Card Header
            ctx.font = "bold 36px sans-serif";
            ctx.fillStyle = "#818cf8";
            ctx.fillText("MYSTRY MESSAGE", cardX + 50, cardY + 80);

            if (username) {
                ctx.font = "500 32px monospace";
                ctx.fillStyle = "#94a3b8";
                ctx.fillText(`@${username}`, cardX + cardW - 50 - ctx.measureText(`@${username}`).width, cardY + 80);
            }

            // Divider
            ctx.beginPath();
            ctx.moveTo(cardX + 50, cardY + 115);
            ctx.lineTo(cardX + cardW - 50, cardY + 115);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 2;
            ctx.stroke();

            // 4. Question Section
            ctx.font = "bold 26px monospace";
            ctx.fillStyle = "#a5b4fc";
            ctx.fillText("ANONYMOUS MESSAGE:", cardX + 50, cardY + 165);

            // Wrap Question Text
            function wrap(text, x, y, maxW, lineH, font, fill) {
                ctx.font = font;
                ctx.fillStyle = fill;
                const words = text.split(" ");
                let line = "";
                let currY = y;
                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + " ";
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxW && n > 0) {
                        ctx.fillText(line, x, currY);
                        line = words[n] + " ";
                        currY += lineH;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, x, currY);
                return currY + lineH;
            }

            let nextY = wrap(
                `"${messageContent}"`,
                cardX + 50,
                cardY + 225,
                cardW - 100,
                48,
                "italic 38px sans-serif",
                "#ffffff",
            );

            // 5. Response Section (if exists)
            if (replyContent) {
                nextY += 20;
                ctx.font = "bold 26px monospace";
                ctx.fillStyle = "#34d399";
                ctx.fillText("MY ANSWER:", cardX + 50, nextY);

                nextY = wrap(
                    `"${replyContent}"`,
                    cardX + 50,
                    nextY + 55,
                    cardW - 100,
                    44,
                    "34px sans-serif",
                    "#c7d2fe",
                );
            }

            // 6. Watermark Footer
            ctx.font = "bold 32px sans-serif";
            ctx.fillStyle = "#cbd5e1";
            const footerText = "Ask me anything on Mystry Message";
            ctx.fillText(footerText, (1080 - ctx.measureText(footerText).width) / 2, 1600);

            ctx.font = "500 28px monospace";
            ctx.fillStyle = "#6366f1";
            const urlText = profileUrl || "mystrymessage.com";
            ctx.fillText(urlText, (1080 - ctx.measureText(urlText).width) / 2, 1650);

            // Download Trigger
            const link = document.createElement("a");
            link.download = `mystry-story-${username || "message"}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } finally {
            setIsGeneratingImage(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
            <div className="surface-panel max-w-md w-full p-6 rounded-2xl space-y-5 border border-white/[0.12] shadow-2xl relative">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                        <ShareIcon className="w-4 h-4 text-indigo-400" />
                        <h3 className="font-bold text-sm text-white">
                            Share to Social Media
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Social Card Preview */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/60 border border-indigo-500/20 shadow-inner space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-indigo-300">
                        <div className="flex items-center gap-1.5 font-bold">
                            <LogoIcon className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Mystry Message</span>
                        </div>
                        {username && (
                            <span className="font-mono text-slate-400">
                                @{username}
                            </span>
                        )}
                    </div>

                    <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block">
                            Anonymous Message
                        </span>
                        <p className="text-xs sm:text-sm font-medium text-white leading-relaxed italic bg-white/[0.04] p-3 rounded-xl border border-white/[0.06]">
                            "{messageContent}"
                        </p>
                    </div>

                    {replyContent && (
                        <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-300 font-semibold block">
                                My Response
                            </span>
                            <p className="text-xs sm:text-sm font-medium text-indigo-100 leading-relaxed bg-indigo-600/20 p-3 rounded-xl border border-indigo-500/30">
                                "{replyContent}"
                            </p>
                        </div>
                    )}

                    <div className="pt-2 text-[10px] text-slate-400 text-right font-mono">
                        mystrymessage.com
                    </div>
                </div>

                {/* Share Actions */}
                <div className="space-y-2">
                    {/* Story Image Generator Button */}
                    <button
                        type="button"
                        onClick={handleDownloadStoryImage}
                        disabled={isGeneratingImage}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold cursor-pointer shadow-lg shadow-purple-600/25 transition-all"
                    >
                        <span>📸 Download Instagram / Snapchat Story Image (.PNG)</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                        {/* Twitter / X */}
                        <button
                            type="button"
                            onClick={handleShareTwitter}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl btn-secondary text-xs font-semibold hover:border-sky-500/40 cursor-pointer"
                        >
                            <span>Share on X / Twitter</span>
                        </button>

                        {/* WhatsApp */}
                        <button
                            type="button"
                            onClick={handleShareWhatsApp}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl btn-secondary text-xs font-semibold hover:border-emerald-500/40 cursor-pointer"
                        >
                            <span>Share on WhatsApp</span>
                        </button>
                    </div>

                    {/* Native Web Share */}
                    <button
                        type="button"
                        onClick={handleNativeShare}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl btn-secondary text-white text-xs font-semibold cursor-pointer"
                    >
                        <ShareIcon className="w-3.5 h-3.5" />
                        <span>Native Device Share</span>
                    </button>

                    {/* Copy Formatted Text */}
                    <button
                        type="button"
                        onClick={handleCopyText}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl btn-secondary text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
                    >
                        {copied ? (
                            <>
                                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-300">
                                    Copied Q&A to clipboard!
                                </span>
                            </>
                        ) : (
                            <>
                                <CopyIcon className="w-3.5 h-3.5 text-slate-400" />
                                <span>Copy Q&A Text to Clipboard</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

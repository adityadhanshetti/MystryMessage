import { useState } from "react";
import { SparklesIcon } from "../../components/icons";

const PROMPTS = {
    fun: [
        "What's a secret habit you have that nobody knows about?",
        "If you could trade lives with anyone for 24 hours, who would it be?",
        "What is the most embarrassing song in your playlist right now?",
        "What's your biggest pet peeve that seems completely irrational?",
        "If your life was a movie, what genre would it be?",
    ],
    deep: [
        "What is something you wish people understood better about you?",
        "What's the hardest truth you had to accept about yourself?",
        "When was the last time you felt truly proud of yourself?",
        "What's a dream you haven't told anyone yet?",
        "If you could send a message to yourself 5 years ago, what would it say?",
    ],
    ama: [
        "What's the best piece of advice you've ever received?",
        "What project or goal are you working on that excites you right now?",
        "How do you deal with stress or creative burnout?",
        "What's one thing you changed your mind about recently?",
    ],
    wholesome: [
        "Just wanted to drop by and say you're doing an amazing job! ❤️",
        "Your positive energy is inspiring, keep doing what you're doing!",
        "Hope you're taking care of yourself and having a wonderful day!",
        "You inspire more people than you probably realize.",
    ],
};

const CATEGORIES = [
    { id: "fun", label: "🔥 Fun & Spicy" },
    { id: "deep", label: "💭 Deep & Honest" },
    { id: "ama", label: "💼 Career & AMA" },
    { id: "wholesome", label: "💖 Kind Words" },
];

export default function PromptSuggestions({ onSelectPrompt }) {
    const [selectedCategory, setSelectedCategory] = useState("fun");
    const [promptIndex, setPromptIndex] = useState(0);

    const currentPrompts = PROMPTS[selectedCategory] || PROMPTS.fun;

    function handleShuffle() {
        const nextIndex = (promptIndex + 1) % currentPrompts.length;
        setPromptIndex(nextIndex);
        onSelectPrompt(currentPrompts[nextIndex]);
    }

    function handleCategoryClick(catId) {
        setSelectedCategory(catId);
        const list = PROMPTS[catId];
        const random = Math.floor(Math.random() * list.length);
        setPromptIndex(random);
        onSelectPrompt(list[random]);
    }

    return (
        <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1.5 text-[11px]">
                    <SparklesIcon className="w-3.5 h-3.5 text-indigo-400" />
                    Need inspiration? Tap a prompt:
                </span>

                <button
                    type="button"
                    onClick={handleShuffle}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                    🎲 Shuffle
                </button>
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer border ${
                            selectedCategory === cat.id
                                ? "bg-indigo-600/30 text-indigo-200 border-indigo-500/40 font-semibold shadow-sm"
                                : "btn-secondary text-slate-400 hover:text-white"
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Current Selected Prompt Card Preview */}
            <button
                type="button"
                onClick={() => onSelectPrompt(currentPrompts[promptIndex])}
                className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all text-xs text-slate-300 hover:text-white cursor-pointer group flex items-start justify-between gap-2"
            >
                <span className="line-clamp-2 italic">
                    "{currentPrompts[promptIndex]}"
                </span>
                <span className="text-[10px] text-indigo-400 font-medium shrink-0 group-hover:translate-x-0.5 transition-transform">
                    Use →
                </span>
            </button>
        </div>
    );
}

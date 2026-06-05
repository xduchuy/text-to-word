import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative p-2 bg-white dark:bg-[#27272A] text-ink-black dark:text-zinc-100 border-2 border-ink-border dark:border-[#3F3F46] rounded-lg shadow-[2px_2px_0px_var(--shadow-color)] dark:shadow-[2px_2px_0px_#060608] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_var(--shadow-color)] dark:hover:shadow-[3px_3px_0px_#060608] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer overflow-hidden transition-all duration-100"
      aria-label="Toggle Theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0, rotate: -40 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 40 }}
          transition={{ duration: 0.2 }}
        >
          {theme === "light" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
};
export default ThemeToggle;

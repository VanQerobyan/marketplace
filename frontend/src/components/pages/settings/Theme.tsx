import { useTheme } from "next-themes"

export const Theme = () => {

    const { setTheme, theme } = useTheme();


    return <>
        <div className="w-full min-w-0 max-w-2xl py-1 font-sans text-[#493429] dark:text-[#e8e6e1]">
            <p className="text-xl font-bold leading-8 tracking-tight text-[#34251e] sm:text-2xl dark:text-[#f6f4ef]">Theme</p>
            <button className="mt-6 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-[#a27850] bg-[#f4ebdf] px-6 py-3 text-sm font-semibold text-[#493429] outline-none transition-colors hover:bg-[#eddfce] focus-visible:ring-4 focus-visible:ring-[#92683f]/25 focus-visible:ring-offset-2 motion-reduce:transition-none dark:border-[#74634f] dark:bg-[#24272b] dark:text-[#e8e6e1] dark:hover:bg-[#34302b] dark:focus-visible:ring-[#d6b58c]/25 dark:ring-offset-[#1b1d20]" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>Set Theme {theme === "dark" ? "light" : "dark"}</button>
        </div>
    </>
}
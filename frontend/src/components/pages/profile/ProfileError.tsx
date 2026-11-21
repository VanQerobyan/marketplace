export const ProfileError = () => {
    return <>
    
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-[#d9b59b] bg-gradient-to-br from-[#fffcf8] via-[#fff1e8] to-[#f7f0e7] px-6 py-10 text-center shadow-xl shadow-[#b58b62]/30 dark:border-[#704b4e] dark:from-[#1b1d20] dark:via-[#332426] dark:to-[#111315] dark:shadow-[#000000]/30">

          <div className="grid size-20 place-items-center rounded-full bg-[#fff1e8] text-[#843e2e] ring-8 ring-[#f4ebdf] dark:bg-[#332426] dark:text-[#f0aaa6] dark:ring-[#24272b]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="size-10"
            >
              <circle cx="12" cy="7" r="4" />
              <path
                strokeLinecap="round"
                d="M4 21a8 8 0 0 1 12-6.9"
              />
              <path
                strokeLinecap="round"
                d="m17 17 4 4m0-4-4 4"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-[#34251e] dark:text-[#f6f4ef]">
            Unable to load your profile
          </h2>

          <p className="max-w-xs text-sm leading-6 text-[#634b38] dark:text-[#c8c4bd]">
            We couldn't load your account information.
            Please try again.
          </p>

        </div>
    </>
}
export const ListingError = () => {
    return <>
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-[#d9b59b] bg-gradient-to-br from-[#fffdf9] to-[#f4ebdf] p-8 text-center shadow-lg shadow-[#dfc8ad]/50 dark:border-[#704b4e] dark:shadow-[#000000]/50 dark:from-[#1b1d20] dark:to-[#191b1e]">

      <div className="grid size-14 place-items-center rounded-full bg-[#fff1e8] text-[#843e2e] dark:bg-[#332426] dark:text-[#f0aaa6]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-7"
        >
          <circle cx="12" cy="12" r="10" />
          <path
            strokeLinecap="round"
            d="M12 7v6m0 4h.01"
          />
        </svg>
      </div>

      <h2 className="text-lg font-bold text-[#34251e] dark:text-[#f6f4ef]">
        Unable to load listings
      </h2>

      <p className="text-sm leading-6 text-[#634b38] dark:text-[#c8c4bd]">
        Something went wrong while loading your listings.
        Please try again.
      </p>

      <button
        type="button"
        className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#493429] to-[#654a37] px-6 py-3 text-sm font-semibold text-[#fffcf8] shadow-md shadow-[#b58b62]/25 transition hover:from-[#34251e] hover:to-[#493429] active:scale-95 dark:shadow-[#000000]/25 dark:from-[#c8a477] dark:to-[#b58f64] dark:hover:from-[#d7b68e] dark:hover:to-[#c8a477] dark:active:from-[#b58f64] dark:active:to-[#a57d52] dark:text-[#1b1712] dark:shadow-[0_4px_14px_#00000026] dark:hover:shadow-[0_6px_18px_#00000033]"
      >
        <span>↻</span>
        Try again
      </button>
    </div>
    
    </>
}
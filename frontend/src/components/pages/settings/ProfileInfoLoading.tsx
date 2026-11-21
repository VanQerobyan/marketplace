export const ProfileInfoLoading = () => {
    return <>
    
    <div className="w-full max-w-2xl font-sans flex min-h-64 flex-col items-center justify-center gap-4 rounded-3xl border border-[#e9e0d6] bg-gradient-to-br from-[#fffcf8] to-[#f7f0e7] p-8 text-center shadow-sm dark:border-[#34373d] dark:from-[#1b1d20] dark:to-[#111315]">
      <div className="flex size-14 items-center justify-center rounded-full bg-[#f4ebdf] dark:bg-[#24272b]">
        <div className="size-8 animate-spin rounded-full border-4 border-[#dfc8ad] border-t-[#493429] dark:border-[#46494f]" />
      </div>

      <div className="max-w-sm">
        <h3 className="text-base font-semibold text-[#493429] dark:text-[#e8e6e1]">
          Loading profile...
        </h3>
        <p className="mt-2 text-sm text-[#74604e] dark:text-[#aaa69f]">
          Please wait while we load your account information.
        </p>
      </div>
    </div>
    </>
}
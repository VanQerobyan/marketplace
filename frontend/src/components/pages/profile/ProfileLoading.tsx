export const ProfileLoading = () => {
    return <>
    
    <div
          role="status"
          aria-label="Loading profile"
          className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-[#e9e0d6] bg-[#fffdf9] shadow-lg shadow-[#b58b62]/25 dark:border-[#34373d] dark:bg-[#1b1d20] dark:shadow-[#000000]/25"
        >
          <div className="animate-pulse">
            {/* Cover */}
            <div className="h-36 bg-gradient-to-r from-[#eddfce] via-[#dfc8ad] to-[#b58b62] sm:h-44 dark:from-[#2d3035] dark:via-[#3b332a] dark:to-[#34302b]" />

            <div className="px-6 pb-8 sm:px-8">
              {/* Avatar */}
              <div className="-mt-12 size-24 rounded-full border-4 border-[#fffdf9] bg-[#eddfce] shadow-md sm:size-28 dark:border-[#1b1d20] dark:bg-[#2d3035]" />

              {/* Name and username */}
              <div className="mt-5 space-y-3">
                <div className="h-6 w-48 rounded-lg bg-[#eddfce] dark:bg-[#2d3035]" />
                <div className="h-3 w-28 rounded-lg bg-[#e9e0d6] dark:bg-[#34373d]" />
              </div>

              {/* Edit button */}
              <div className="mt-6 h-10 w-32 rounded-xl bg-[#eddfce] dark:bg-[#2d3035]" />

              {/* Statistics */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex flex-col items-center gap-3 rounded-xl bg-[#f4ebdf]/70 p-4 dark:bg-[#24272b]/70"
                  >
                    <div className="h-5 w-10 rounded bg-[#eddfce] dark:bg-[#2d3035]" />
                    <div className="h-3 w-16 rounded bg-[#e9e0d6] dark:bg-[#34373d]" />
                  </div>
                ))}
              </div>

              {/* Personal information */}
              <div className="mt-8 space-y-4">
                <div className="h-5 w-44 rounded bg-[#eddfce] dark:bg-[#2d3035]" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="h-14 rounded-xl bg-[#f4ebdf] dark:bg-[#24272b]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="sr-only">Loading your profile...</p>
        </div>

    </>
}
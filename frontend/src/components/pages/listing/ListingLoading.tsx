export const ListingLoading = () => {
    return <>
    
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
      <div className="size-12 animate-spin rounded-full border-4 border-[#e9e0d6] border-t-[#493429] border-r-[#b58b62] dark:border-[#34373d]" />

      <p className="text-sm font-medium text-[#74604e] dark:text-[#aaa69f]">
        Loading listings...
      </p>
    </div>
    </>
}
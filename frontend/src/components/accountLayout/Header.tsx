import { NavLink } from "react-router-dom"
import { useGetUsersQuery } from "../../../store/api/usersApi";
import { UserSearch } from "./UserSearch";
import { NotificationBell } from "./NotificationBell";

export const Header = () => {


      const { data } = useGetUsersQuery();
    
    return data && <>
    
    <header className="sticky top-0 z-30 flex min-h-20 shrink-0 flex-wrap items-center gap-5 py-4 sm:h-20 sm:flex-nowrap sm:py-0 border-b border-[#e9e0d6] bg-[#fffdf9]/95 px-4 backdrop-blur-xl sm:px-6 lg:gap-8 lg:px-8 group-has-[a[href='/account/settings/accountInfo']]/settings:bg-[#fffdf9] group-has-[a[href='/account/settings/accountInfo']]/settings:lg:gap-8 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:px-8 group-has-[a[href='/account/settings/accountInfo']]/settings:xl:px-12 dark:border-[#34373d] dark:bg-[#17191c]/95 dark:group-has-[a[href='/account/settings/accountInfo']]/settings:bg-[#17191c]">
            <NavLink
              to="/account"
              className="flex shrink-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-[#92683f] lg:w-48 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:w-56 dark:focus-visible:ring-[#d6b58c]"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#493429] to-[#654a37] text-[#fffcf8] shadow-md shadow-[#b58b62]/60 group-has-[a[href='/account/settings/accountInfo']]/settings:bg-none group-has-[a[href='/account/settings/accountInfo']]/settings:text-[#75502f] group-has-[a[href='/account/settings/accountInfo']]/settings:shadow-none group-has-[a[href='/account/settings/accountInfo']]/settings:[&_svg]:size-8 dark:shadow-[#000000]/60 dark:group-has-[a[href='/account/settings/accountInfo']]/settings:text-[#dec099] dark:from-[#c8a477] dark:to-[#b58f64] dark:hover:from-[#d7b68e] dark:hover:to-[#c8a477] dark:active:from-[#b58f64] dark:active:to-[#a57d52] dark:text-[#1b1712] dark:shadow-[0_4px_14px_#00000026] dark:hover:shadow-[0_6px_18px_#00000033]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 8h14l1 12H4L5 8Zm3 0V6a4 4 0 0 1 8 0v2m1 4c0 3-6 3-6 0"
                  />
                </svg>
              </span>
              <span className="text-lg font-extrabold tracking-tight sm:text-xl">
                Swaply<span className="text-[#493429] dark:text-[#e8e6e1]"></span>
              </span>
            </NavLink>
            <UserSearch />
            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3 group-has-[a[href='/account/settings/accountInfo']]/settings:sm:gap-5 group-has-[a[href='/account/settings/accountInfo']]/settings:[&_svg]:size-6">
              <span className="mr-3 hidden text-xs font-medium tracking-wide text-[#74604e] xl:block group-has-[a[href='/account/settings/accountInfo']]/settings:xl:hidden dark:text-[#aaa69f]">
                Buy. Sell. Connect.
              </span>
              <NavLink
                to="/account/favorites"
                aria-label="Favorites"
                className="hidden size-10 place-items-center rounded-full text-[#74604e] outline-none transition-colors hover:bg-[#f4ebdf] hover:text-[#493429] focus-visible:ring-4 focus-visible:ring-[#92683f] sm:grid motion-reduce:transition-none dark:text-[#aaa69f] dark:hover:bg-[#24272b] dark:hover:text-[#e8e6e1] dark:focus-visible:ring-[#d6b58c]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"
                  />
                </svg>
              </NavLink>
              <NotificationBell />
              <NavLink
                to="/account/profile"
                aria-label="View your profile"
                className="relative ml-1 grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#fffcf8] bg-gradient-to-br from-[#eddfce] to-[#dfc8ad] text-[#8b6140] shadow-[0_0_0_1px_#d9c6b0] outline-none focus-visible:ring-4 focus-visible:ring-[#92683f] group-has-[a[href='/account/settings/accountInfo']]/settings:size-12 group-has-[a[href='/account/settings/accountInfo']]/settings:sm:ml-4 dark:border-[#1b1d20] dark:from-[#2d3035] dark:to-[#3b332a] dark:text-[#d6b58c] dark:focus-visible:ring-[#d6b58c]"
              >
                <img
                  src={`http://localhost:5000${data.data.avatar}`}
                  className="absolute inset-0 block size-full min-h-0 min-w-0 rounded-full object-cover object-center"
                />
              </NavLink>
            </div>
          </header>
    </>
}

import { NavLink } from "react-router-dom"

export const NavBar = () => {
    return <>
    
        <nav
                        aria-label="Account navigation"
                        className="grid grid-cols-3 gap-1.5 p-3 sm:grid-cols-7 sm:px-5 lg:flex lg:flex-col lg:gap-2 lg:px-4 lg:py-2 [&_svg]:size-5 [&_svg]:shrink-0 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:gap-2 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:px-4 group-has-[a[href='/account/settings/accountInfo']]/settings:[&>a]:lg:min-h-14 group-has-[a[href='/account/settings/accountInfo']]/settings:[&>a]:lg:gap-4 group-has-[a[href='/account/settings/accountInfo']]/settings:[&>a]:lg:px-5 group-has-[a[href='/account/settings/accountInfo']]/settings:[&>a]:lg:text-base group-has-[a[href='/account/settings/accountInfo']]/settings:[&>a[aria-current=page]]:bg-[#f1e5d6] group-has-[a[href='/account/settings/accountInfo']]/settings:[&_svg]:lg:size-6 dark:group-has-[a[href='/account/settings/accountInfo']]/settings:[&>a[aria-current=page]]:bg-[#34302b]"
                      >
                        <NavLink
                          to="profile"
                          className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-[11px] font-medium text-[#634b38] outline-none transition-colors hover:bg-[#f4ebdf] hover:text-[#493429] focus-visible:ring-4 focus-visible:ring-[#92683f] aria-[current=page]:bg-[#dfc8ad] aria-[current=page]:font-semibold aria-[current=page]:text-[#493429] motion-reduce:transition-none lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:text-sm dark:text-[#c8c4bd] dark:hover:bg-[#24272b] dark:hover:text-[#e8e6e1] dark:focus-visible:ring-[#d6b58c] dark:aria-[current=page]:bg-[#3b332a] dark:aria-[current=page]:text-[#e8e6e1]"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          >
                            <circle cx="12" cy="8" r="3.5" />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 21v-2a7 7 0 0 1 14 0v2"
                            />
                          </svg>
                          My profile
                        </NavLink>
                        <NavLink
                          to="listings"
                          className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-[11px] font-medium text-[#634b38] outline-none transition-colors hover:bg-[#f4ebdf] hover:text-[#493429] focus-visible:ring-4 focus-visible:ring-[#92683f] aria-[current=page]:bg-[#dfc8ad] aria-[current=page]:font-semibold aria-[current=page]:text-[#493429] motion-reduce:transition-none lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:text-sm dark:text-[#c8c4bd] dark:hover:bg-[#24272b] dark:hover:text-[#e8e6e1] dark:focus-visible:ring-[#d6b58c] dark:aria-[current=page]:bg-[#3b332a] dark:aria-[current=page]:text-[#e8e6e1]"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          >
                            <rect x="5" y="5" width="14" height="16" rx="3" />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5V3h6v2M9 11h6m-6 4h4"
                            />
                          </svg>
                          My listings
                        </NavLink>
                        <NavLink
                          to="purchases"
                          className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-[11px] font-medium text-[#634b38] outline-none hover:bg-[#f4ebdf] focus-visible:ring-4 focus-visible:ring-[#92683f] aria-[current=page]:bg-[#dfc8ad] lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:text-sm dark:text-[#c8c4bd] dark:hover:bg-[#24272b] dark:aria-[current=page]:bg-[#3b332a]"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                            <rect x="3" y="5" width="18" height="14" rx="3" />
                            <path d="M3 10h18M7 15h4" />
                          </svg>
                          My purchases
                        </NavLink>
                        <NavLink
                          to="favorites"
                          className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-[11px] font-medium text-[#634b38] outline-none transition-colors hover:bg-[#f4ebdf] hover:text-[#493429] focus-visible:ring-4 focus-visible:ring-[#92683f] aria-[current=page]:bg-[#dfc8ad] aria-[current=page]:font-semibold aria-[current=page]:text-[#493429] motion-reduce:transition-none lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:text-sm dark:text-[#c8c4bd] dark:hover:bg-[#24272b] dark:hover:text-[#e8e6e1] dark:focus-visible:ring-[#d6b58c] dark:aria-[current=page]:bg-[#3b332a] dark:aria-[current=page]:text-[#e8e6e1]"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"
                            />
                          </svg>
                          Favorites
                        </NavLink>
                        <NavLink
                          to="messages"
                          className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-[11px] font-medium text-[#634b38] outline-none transition-colors hover:bg-[#f4ebdf] hover:text-[#493429] focus-visible:ring-4 focus-visible:ring-[#92683f] aria-[current=page]:bg-[#dfc8ad] aria-[current=page]:font-semibold aria-[current=page]:text-[#493429] motion-reduce:transition-none lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:text-sm dark:text-[#c8c4bd] dark:hover:bg-[#24272b] dark:hover:text-[#e8e6e1] dark:focus-visible:ring-[#d6b58c] dark:aria-[current=page]:bg-[#3b332a] dark:aria-[current=page]:text-[#e8e6e1]"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 11a8 8 0 0 1-8 8H5l-3 3V11a8 8 0 0 1 8-8h3a8 8 0 0 1 8 8ZM7 10h10M7 14h6"
                            />
                          </svg>
                          Messages
                        </NavLink>
                        <NavLink
                          to="notifications"
                          className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-[11px] font-medium text-[#634b38] outline-none transition-colors hover:bg-[#f4ebdf] hover:text-[#493429] focus-visible:ring-4 focus-visible:ring-[#92683f] aria-[current=page]:bg-[#dfc8ad] aria-[current=page]:font-semibold aria-[current=page]:text-[#493429] motion-reduce:transition-none lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:text-sm dark:text-[#c8c4bd] dark:hover:bg-[#24272b] dark:hover:text-[#e8e6e1] dark:focus-visible:ring-[#d6b58c] dark:aria-[current=page]:bg-[#3b332a] dark:aria-[current=page]:text-[#e8e6e1]"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4"
                            />
                          </svg>
                          Notifications
                        </NavLink>
                        <NavLink
                          to="settings"
                          className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-[11px] font-medium text-[#634b38] outline-none transition-colors hover:bg-[#f4ebdf] hover:text-[#493429] focus-visible:ring-4 focus-visible:ring-[#92683f] aria-[current=page]:bg-[#dfc8ad] aria-[current=page]:font-semibold aria-[current=page]:text-[#493429] motion-reduce:transition-none lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:text-sm dark:text-[#c8c4bd] dark:hover:bg-[#24272b] dark:hover:text-[#e8e6e1] dark:focus-visible:ring-[#d6b58c] dark:aria-[current=page]:bg-[#3b332a] dark:aria-[current=page]:text-[#e8e6e1]"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m9 3 1 3h4l1-3 3 2-1 3 2 3 3 1-1 4h-3l-2 3v3h-4l-1-3-3-1-3 1-2-3 2-2V9L2 7l3-3 3 1Z"
                            />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Settings
                        </NavLink>
                      </nav>
    </>
}

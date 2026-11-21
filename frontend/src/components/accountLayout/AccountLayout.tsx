import { Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetUsersQuery } from "../../../store/api/usersApi";
import { loggedOut, selectAuth } from "../../../store/authSlice";
import { NavBar } from "./NavBar";
import { Header } from "./Header";

export const AccountLayout = () => {
  const { token } = useSelector(selectAuth);
  const dispatch = useDispatch();

  const { data } = useGetUsersQuery(undefined, { skip: !token });
  const user = data?.data;

  const handleLogout = () => {
    dispatch(loggedOut());
  };

  if (!token) return <Navigate to="/signIn" replace />;
  return (
    data && (
      <>
        <div className="flex min-h-svh w-full flex-col bg-[#f7f0e7] font-sans text-[#493429] selection:bg-[#ead8c1] selection:text-[#493429] group/settings has-[a[href='/account/settings/accountInfo']]:bg-[#fffdf9] dark:bg-[#111315] dark:text-[#e8e6e1] dark:selection:bg-[#3b332a] dark:selection:text-[#e8e6e1] dark:has-[a[href='/account/settings/accountInfo']]:bg-[#111315]">
          <Header/>
          <div className="flex flex-1 flex-col lg:flex-row group-has-[a[href='/account/settings/accountInfo']]/settings:lg:gap-4">
            <aside className="flex shrink-0 flex-col border-b border-[#e9e0d6] bg-gradient-to-b from-[#fffdf9] to-[#f4ebdf] lg:w-64 lg:border-b-0 lg:border-r group-has-[a[href='/account/settings/accountInfo']]/settings:lg:my-5 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:ml-1 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:w-64 group-has-[a[href='/account/settings/accountInfo']]/settings:xl:w-72 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:rounded-2xl group-has-[a[href='/account/settings/accountInfo']]/settings:lg:border-0 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:from-[#f7f0e7] group-has-[a[href='/account/settings/accountInfo']]/settings:lg:to-[#fffdf9] dark:border-[#34373d] dark:from-[#17191c] dark:to-[#141619] dark:group-has-[a[href='/account/settings/accountInfo']]/settings:lg:from-[#17191c] dark:group-has-[a[href='/account/settings/accountInfo']]/settings:lg:to-[#141619]">
              <p className="hidden px-7 pb-3 pt-8 text-[10px] font-semibold tracking-[0.2em] text-[#74604e] lg:block group-has-[a[href='/account/settings/accountInfo']]/settings:lg:hidden dark:text-[#aaa69f]">
                YOUR ACCOUNT
              </p>
              <NavBar/>
              <button
                popoverTarget="logout-popover"
                aria-label="Log out"
                className="group mx-5 mb-6 mt-auto hidden cursor-pointer items-center gap-3 rounded-2xl border border-[#e9e0d6] bg-[#fffdf9]/80 p-3 text-left shadow-sm outline-none transition duration-200 hover:border-[#a27850] hover:bg-[#f4ebdf] hover:shadow-md hover:shadow-[#b58b62]/60 focus-visible:ring-4 focus-visible:ring-[#92683f] active:bg-[#ead8c1] lg:flex motion-reduce:transition-none group-has-[a[href='/account/settings/accountInfo']]/settings:lg:order-first group-has-[a[href='/account/settings/accountInfo']]/settings:lg:mx-5 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:mb-7 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:mt-5 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:flex-col group-has-[a[href='/account/settings/accountInfo']]/settings:lg:gap-4 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:rounded-xl group-has-[a[href='/account/settings/accountInfo']]/settings:lg:border-transparent group-has-[a[href='/account/settings/accountInfo']]/settings:lg:bg-transparent group-has-[a[href='/account/settings/accountInfo']]/settings:lg:p-0 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:pb-3 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:text-center group-has-[a[href='/account/settings/accountInfo']]/settings:lg:shadow-none group-has-[a[href='/account/settings/accountInfo']]/settings:lg:hover:border-transparent group-has-[a[href='/account/settings/accountInfo']]/settings:lg:hover:bg-transparent group-has-[a[href='/account/settings/accountInfo']]/settings:lg:hover:shadow-none dark:border-[#34373d] dark:bg-[#1b1d20]/80 dark:hover:border-[#74634f] dark:hover:bg-[#24272b] dark:hover:shadow-[#000000]/60 dark:focus-visible:ring-[#d6b58c] dark:active:bg-[#3b332a]"
              >
                <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[#f4ebdf] to-[#dfc8ad] text-[#8b6140] ring-1 ring-[#e9e0d6] transition-colors group-hover:text-[#493429] group-hover:ring-[#92683f] motion-reduce:transition-none group-has-[a[href='/account/settings/accountInfo']]/settings:lg:size-24 group-has-[a[href='/account/settings/accountInfo']]/settings:xl:size-28 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:ring-0 dark:from-[#24272b] dark:to-[#3b332a] dark:text-[#d6b58c] dark:ring-[#34373d] dark:group-hover:text-[#e8e6e1] dark:group-hover:ring-[#d6b58c]">
                  <img
                    src={`http://localhost:5000${data?.data.avatar}`}
                    className="absolute inset-0 block size-full min-h-0 min-w-0 rounded-full object-cover object-center"
                  />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold group-has-[a[href='/account/settings/accountInfo']]/settings:lg:text-lg group-has-[a[href='/account/settings/accountInfo']]/settings:lg:font-bold">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#74604e] group-has-[a[href='/account/settings/accountInfo']]/settings:lg:mt-1 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:text-sm dark:text-[#aaa69f]">
                    {user?.username}
                  </p>
                </div>
              </button>
              <div
                id="logout-popover"
                popover="auto"
                className="fixed inset-0 m-auto h-fit w-[calc(100%-2rem)] max-w-xs space-y-3 rounded-3xl border border-[#e9e0d6] bg-gradient-to-br from-[#fffdf9] to-[#f4ebdf] p-6 font-sans text-[#493429] shadow-[0_24px_80px_-16px_#49342940] backdrop:bg-[#493429]/30 backdrop:backdrop-blur-sm dark:border-[#34373d] dark:text-[#e8e6e1] dark:from-[#1b1d20] dark:to-[#191b1e]"
              >
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#493429] to-[#654a37] px-5 py-3 text-sm font-semibold text-[#fffcf8] shadow-md shadow-[#b58b62]/70 outline-none transition duration-200 hover:from-[#34251e] hover:to-[#493429] hover:shadow-lg hover:shadow-[#b58b62]/80 focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 dark:shadow-[#000000]/70 dark:hover:shadow-[#000000]/80 dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:from-[#c8a477] dark:to-[#b58f64] dark:hover:from-[#d7b68e] dark:hover:to-[#c8a477] dark:active:from-[#b58f64] dark:active:to-[#a57d52] dark:text-[#1b1712] dark:shadow-[0_4px_14px_#00000026] dark:hover:shadow-[0_6px_18px_#00000033]"
                >
                  Log out
                </button>
                <button
                  type="button"
                  popoverTarget="logout-popover"
                  popoverTargetAction="hide"
                  className="flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl border border-[#a27850] bg-[#fffdf9] px-5 py-3 text-sm font-semibold text-[#634b38] outline-none transition duration-200 hover:border-[#a27850] hover:bg-[#f4ebdf] hover:text-[#493429] focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 active:bg-[#ead8c1] motion-reduce:transition-none dark:border-[#74634f] dark:bg-[#1b1d20] dark:text-[#c8c4bd] dark:hover:border-[#74634f] dark:hover:bg-[#24272b] dark:hover:text-[#e8e6e1] dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:active:bg-[#3b332a]"
                >
                  Cancel
                </button>
              </div>
            </aside>
            <main className="flex min-w-0 flex-1 bg-[radial-gradient(ellipse_at_top_right,#dcc2a455,transparent_55%)] p-4 sm:p-6 lg:p-8 group-has-[a[href='/account/settings/accountInfo']]/settings:bg-none group-has-[a[href='/account/settings/accountInfo']]/settings:lg:px-6 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:pb-8 group-has-[a[href='/account/settings/accountInfo']]/settings:lg:pt-8 dark:bg-[radial-gradient(ellipse_at_top_right,#c8a4770a,transparent_55%)]">
              <div className="mx-auto w-full min-w-0 max-w-[1440px] rounded-2xl border border-[#e9e0d6] bg-[#fffdf9] p-5 shadow-[0_4px_28px_#49342904] [overflow-wrap:anywhere] sm:p-7 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:tracking-tight sm:[&_h1]:text-2xl group-has-[a[href='/account/settings/accountInfo']]/settings:rounded-none group-has-[a[href='/account/settings/accountInfo']]/settings:border-0 group-has-[a[href='/account/settings/accountInfo']]/settings:bg-transparent group-has-[a[href='/account/settings/accountInfo']]/settings:p-0 group-has-[a[href='/account/settings/accountInfo']]/settings:shadow-none group-has-[a[href='/account/settings/accountInfo']]/settings:sm:p-0 dark:border-[#34373d] dark:bg-[#1b1d20]">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </>
    )
  );
};

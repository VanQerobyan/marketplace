import { useForm } from "react-hook-form";
import type { SigninUser } from "../../types/userTypes";
import { PasswordValidator, UsernameValidator } from "../../validators/auth/SignUpValidator";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSignInMutation } from "../../../store/api/authApi";
import { useDispatch } from "react-redux";
import { credentialsReceived } from "../../../store/authSlice";
import { GoogleSignIn } from "./GoogleSignIn";

export const SignIn = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { register, handleSubmit, formState: { errors } } = useForm<SigninUser>();
  const [signIn] = useSignInMutation();
  const handleSignIn = async (data: SigninUser) => {
    setError("");
    try {
      const result = await signIn(data).unwrap();
      dispatch(credentialsReceived(result.data));
      navigate("/account/profile");
    } catch (error: unknown) {
      if (
        typeof error === "object" && error !== null && "data" in error &&
        typeof error.data === "object" && error.data !== null &&
        "message" in error.data && typeof error.data.message === "string"
      ) {
        setError(error.data.message);
      } else {
        setError("Unable to sign in. Please try again.");
      }
    }
  };
  return (
    <>
      <form
        onSubmit={handleSubmit(handleSignIn)}
        className="relative isolate mx-auto my-[max(1rem,calc((100svh-29rem)/2))] flex w-[calc(100%-2rem)] max-w-[30rem] flex-col px-6 py-8 font-sans text-[#493429] selection:bg-[#dcc2a4] selection:text-[#34251e] sm:my-[max(2rem,calc((100svh-31rem)/2))] sm:px-10 sm:py-10 lg:ml-auto lg:mr-[5vw] before:pointer-events-none before:fixed before:inset-0 before:-z-20 before:flex before:items-end before:justify-center before:bg-[#493429] before:bg-[linear-gradient(120deg,#34251ecc_0%,#49342966_42%,#34251e26_100%),url('/images/signin-background.png')] before:bg-cover before:bg-center before:bg-no-repeat before:px-6 before:pb-5 before:text-center before:text-[10px] before:font-medium before:tracking-[0.08em] before:text-[#f2dfc8] before:content-['A_new_day._A_new_find.'_/_''] lg:before:justify-start lg:before:px-[5vw] lg:before:pb-7 lg:before:text-left after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[1.75rem] after:border after:border-[#fff8ed]/75 after:bg-[#fffcf8]/90 after:shadow-[0_24px_100px_#20130c66] after:backdrop-blur-xl after:content-[''] dark:text-[#e8e6e1] dark:selection:bg-[#3b332a] dark:selection:text-[#f6f4ef] dark:after:border-[#46494f]/75 dark:after:bg-[#1b1d20]/90"
      >
        {error && (
          <p role="alert" className="order-7 mt-4 rounded-xl border border-[#e4c5ad] bg-[#fff1e8] px-4 py-3 text-xs font-medium leading-5 text-[#843e2e] dark:border-[#704b4e] dark:bg-[#332426] dark:text-[#f0aaa6]">
            {error}
          </p>
        )}
        {errors.username && (
          <p className="order-3 mt-2 rounded-xl border border-[#e4c5ad] bg-[#fff1e8] px-4 py-3 text-xs font-medium leading-5 text-[#843e2e] dark:border-[#704b4e] dark:bg-[#332426] dark:text-[#f0aaa6]">
            {errors.username.message}
          </p>
        )}
        <label
          htmlFor="username"
          className="relative order-1 mb-2 block text-sm font-semibold leading-5 text-[#493429] before:mb-16 before:block before:text-4xl before:font-bold before:leading-[1.2] before:tracking-[-0.03em] before:content-['Sign_in'_/_''] after:pointer-events-none after:absolute after:left-0 after:top-14 after:text-sm after:font-normal after:leading-6 after:tracking-normal after:text-[#806b59] after:content-['Enter_your_username_and_password'_/_''] sm:before:text-[2.5rem] md:before:text-[2.75rem] dark:text-[#e8e6e1] dark:after:text-[#b4ada4]"
        >
          Username
        </label>
        <input
          id="username"
          className="order-2 h-14 w-full min-w-0 shrink-0 rounded-xl border border-[#a27850] bg-[#fffdfb] px-4 text-base text-[#493429] shadow-[0_2px_5px_#49342905] outline-none transition-colors hover:border-[#92683f] focus:border-[#92683f] focus:ring-4 focus:ring-[#b58b62]/20 motion-reduce:transition-none dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
          type="text"
          {...register("username", UsernameValidator)}
        ></input>

        {errors.password && (
          <p className="order-6 mt-2 rounded-xl border border-[#e4c5ad] bg-[#fff1e8] px-4 py-3 text-xs font-medium leading-5 text-[#843e2e] dark:border-[#704b4e] dark:bg-[#332426] dark:text-[#f0aaa6]">
            {errors.password.message}
          </p>
        )}
        <label
          htmlFor="password"
          className="order-4 mb-2 mt-6 block text-sm font-semibold leading-5 text-[#493429] before:pointer-events-none before:fixed before:left-[5vw] before:top-[calc(50%-6.5rem)] before:hidden before:w-[min(36vw,28rem)] before:text-[clamp(2rem,3.3vw,3rem)] before:font-semibold before:leading-tight before:tracking-[-0.035em] before:text-[#fffcf8] before:content-['Welcome_Back'_/_''] lg:before:block after:pointer-events-none after:fixed after:left-[5vw] after:top-[calc(50%-1.5rem)] after:hidden after:w-[min(35vw,22rem)] after:whitespace-pre-line after:text-base after:font-normal after:leading-7 after:tracking-normal after:text-[#f4e5d2] after:content-['Sign_in_to_continue_to_Swaply.\AYour_next_great_find_is_waiting.'_/_''] lg:after:block dark:text-[#e8e6e1]"
        >
          Password
        </label>
        <input
          id="password"
          className="order-5 h-14 w-full min-w-0 shrink-0 rounded-xl border border-[#a27850] bg-[#fffdfb] px-4 text-base text-[#493429] shadow-[0_2px_5px_#49342905] outline-none transition-colors hover:border-[#92683f] focus:border-[#92683f] focus:ring-4 focus:ring-[#b58b62]/20 motion-reduce:transition-none dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
          type="password"
          {...register("password", PasswordValidator)}
        ></input>
        <button
          type="submit"
          className="order-8 mt-10 flex min-h-14 w-full shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#493429] px-6 text-base font-semibold text-[#fffcf8] shadow-[0_8px_24px_#4934291f] outline-none transition-colors hover:bg-[#654a37] focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-4 focus-visible:ring-offset-[#fffcf8] motion-reduce:transition-none before:pointer-events-none before:fixed before:left-[5vw] before:top-[calc(50%-10rem)] before:hidden before:rounded-full before:border before:border-[#f2dfc8]/35 before:bg-[#493429]/25 before:px-3.5 before:py-2 before:text-left before:text-[9px] before:font-semibold before:tracking-[0.22em] before:text-[#f4e5d2] before:content-['GOOD_FINDS._NEW_BEGINNINGS.'_/_''] lg:before:inline-flex after:pointer-events-none after:fixed after:left-[5vw] after:top-[calc(50%+5rem)] after:hidden after:w-[min(35vw,22rem)] after:whitespace-pre-line after:rounded-2xl after:border after:border-[#f2dfc8]/20 after:bg-[#493429]/25 after:px-5 after:py-3 after:text-left after:text-sm after:font-normal after:leading-8 after:tracking-normal after:text-[#fffcf8] after:backdrop-blur-sm after:content-['✓__Discover_new_finds\A✓__Save_your_favorites\A✓__Buy,_sell_and_connect'_/_''] lg:after:block dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:before:border-[#74634f]/35 dark:after:border-[#74634f]/20 dark:bg-[#c8a477] dark:hover:bg-[#d7b68e] dark:active:bg-[#b58f64] dark:text-[#1b1712] dark:shadow-[0_4px_14px_#00000026] dark:hover:shadow-[0_6px_18px_#00000033]"
        >
          Sign in
        </button>
        <NavLink to={'/signUp'} className="order-9 mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#d9c6b0] bg-[#fffdf9]/70 px-4 py-2 text-sm font-semibold text-[#493429] outline-none transition-colors after:text-base after:text-[#8b6140] after:content-['→'_/_''] hover:border-[#92683f] hover:bg-[#f4ebdf] hover:text-[#34251e] focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffcf8] motion-reduce:transition-none dark:border-[#46494f] dark:bg-[#1b1d20]/70 dark:text-[#e8e6e1] dark:after:text-[#d6b58c] dark:hover:border-[#d6b58c] dark:hover:bg-[#24272b] dark:hover:text-[#f6f4ef] dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20]">Sign up</NavLink>
        <GoogleSignIn />
      </form>
    </>
  );
};

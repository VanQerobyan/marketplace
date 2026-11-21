import { useForm } from "react-hook-form";
import type { SignUpUser } from "../../types/userTypes";
import { EmailValidator, FirstNameValidator, LastNameValidator, PasswordValidator, UsernameValidator } from "../../validators/auth/SignUpValidator";
import { SignUpDetails } from "./authUtils/AuthUtils";
import { useSignUpMutation } from "../../../store/api/authApi";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GoogleSignIn } from "./GoogleSignIn";
export const SignUp = () => {
  
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpUser>();
  const [signUp] = useSignUpMutation();
  const handleSignUp = async (data: SignUpUser) => {
    setError("");
    try {
      await signUp(data).unwrap();
      navigate("/signIn");
    } catch (error: unknown) {
      if (
        typeof error === "object" && error !== null && "data" in error &&
        typeof error.data === "object" && error.data !== null &&
        "message" in error.data && typeof error.data.message === "string"
      ) {
        setError(error.data.message);
      } else {
        setError("Unable to create your account. Please try again.");
      }
    }
  };
  return (
    <>
      <form
        onSubmit={handleSubmit(handleSignUp)}
        className="relative isolate mx-auto my-[max(1.25rem,calc((100svh-43rem)/2))] flex w-[calc(100%-2rem)] max-w-[32rem] flex-col px-6 py-8 font-sans text-[#493429] selection:bg-[#dcc2a4] selection:text-[#34251e] sm:my-[max(2rem,calc((100svh-45rem)/2))] sm:px-10 sm:py-10 before:pointer-events-none before:fixed before:inset-0 before:-z-20 before:bg-[#493429] before:bg-[linear-gradient(120deg,#34251ecc_0%,#49342966_42%,#34251e26_100%),url('/images/signup-scene.png')] before:bg-cover before:bg-center before:bg-no-repeat before:flex before:items-end before:justify-center before:px-6 before:pb-5 before:text-center before:text-[10px] before:font-medium before:tracking-[0.08em] before:text-[#f2dfc8] before:content-['Good_finds._New_beginnings.'_/_''] lg:before:justify-start lg:before:px-[5vw] lg:before:pb-7 lg:before:text-left after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[1.75rem] after:border after:border-[#fff8ed]/75 after:bg-[#fffcf8]/90 after:shadow-[0_24px_100px_#20130c66] after:backdrop-blur-xl after:content-[''] [&>header]:order-1 [&>header]:mb-6 [&>header>p:first-child]:text-[9px] [&>header>p:first-child]:tracking-[0.18em] sm:[&>header>h1]:text-[1.75rem] lg:ml-auto lg:mr-[5vw] dark:text-[#e8e6e1] dark:selection:bg-[#3b332a] dark:selection:text-[#f6f4ef] dark:after:border-[#46494f]/75 dark:after:bg-[#1b1d20]/90"
      >
        <SignUpDetails/>
        {error && (
          <p role="alert" className="order-2 mb-3 rounded-xl border border-[#e4c5ad] bg-[#fff1e8] px-3 py-2 text-xs font-medium leading-5 text-[#843e2e] dark:border-[#704b4e] dark:bg-[#332426] dark:text-[#f0aaa6]">
            {error}
          </p>
        )}
        {errors.firstName && (
          <p className="order-5 mt-2 rounded-xl border border-[#e4c5ad] bg-[#fff1e8] px-3 py-2 text-xs font-medium leading-5 text-[#843e2e] dark:border-[#704b4e] dark:bg-[#332426] dark:text-[#f0aaa6]">
            {errors.firstName.message}
          </p>
        )}
        <label htmlFor="firstName" className="order-3 mb-2 mt-4 block text-xs font-semibold tracking-wide text-[#493429] first-of-type:mt-0 dark:text-[#e8e6e1]">First name</label>
        <input id="firstName" className="order-4 h-12 w-full min-w-0 shrink-0 rounded-xl border border-[#a27850] bg-[#fffdf9]/80 px-4 text-base text-[#493429] shadow-[0_2px_6px_#49342905] outline-none transition-colors placeholder:text-[#806b59] hover:border-[#92683f] hover:bg-[#fffcf8] focus:border-[#92683f] focus:bg-[#fffcf8] focus:ring-4 focus:ring-[#b58b62]/20 motion-reduce:transition-none dark:hover:bg-[#1b1d20] dark:focus:bg-[#1b1d20] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
          type="text" placeholder="First name" {...register("firstName", FirstNameValidator)}
        ></input>
        {errors.lastName && (
          <p className="order-8 mt-2 rounded-xl border border-[#e4c5ad] bg-[#fff1e8] px-3 py-2 text-xs font-medium leading-5 text-[#843e2e] dark:border-[#704b4e] dark:bg-[#332426] dark:text-[#f0aaa6]">
            {errors.lastName.message}
          </p>
        )}
        <label htmlFor="lastName" className="order-6 mb-2 mt-4 block text-xs font-semibold tracking-wide text-[#493429] first-of-type:mt-0 dark:text-[#e8e6e1]">Last name</label>
        <input id="lastName" className="order-7 h-12 w-full min-w-0 shrink-0 rounded-xl border border-[#a27850] bg-[#fffdf9]/80 px-4 text-base text-[#493429] shadow-[0_2px_6px_#49342905] outline-none transition-colors placeholder:text-[#806b59] hover:border-[#92683f] hover:bg-[#fffcf8] focus:border-[#92683f] focus:bg-[#fffcf8] focus:ring-4 focus:ring-[#b58b62]/20 motion-reduce:transition-none dark:hover:bg-[#1b1d20] dark:focus:bg-[#1b1d20] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
          type="text" placeholder="Last name" {...register("lastName", LastNameValidator)}
        ></input>
        {errors.username && (
          <p className="order-11 mt-2 rounded-xl border border-[#e4c5ad] bg-[#fff1e8] px-3 py-2 text-xs font-medium leading-5 text-[#843e2e] dark:border-[#704b4e] dark:bg-[#332426] dark:text-[#f0aaa6]">
            {errors.username.message}
          </p>
        )}
        <label htmlFor="username" className="order-9 mb-2 mt-4 block text-xs font-semibold tracking-wide text-[#493429] first-of-type:mt-0 dark:text-[#e8e6e1]">Username</label>
        <input id="username" className="order-10 h-12 w-full min-w-0 shrink-0 rounded-xl border border-[#a27850] bg-[#fffdf9]/80 px-4 text-base text-[#493429] shadow-[0_2px_6px_#49342905] outline-none transition-colors placeholder:text-[#806b59] hover:border-[#92683f] hover:bg-[#fffcf8] focus:border-[#92683f] focus:bg-[#fffcf8] focus:ring-4 focus:ring-[#b58b62]/20 motion-reduce:transition-none dark:hover:bg-[#1b1d20] dark:focus:bg-[#1b1d20] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
          type="text" placeholder="Username" {...register("username", UsernameValidator)}
        ></input>
        {errors.email && (
          <p className="order-14 mt-2 rounded-xl border border-[#e4c5ad] bg-[#fff1e8] px-3 py-2 text-xs font-medium leading-5 text-[#843e2e] dark:border-[#704b4e] dark:bg-[#332426] dark:text-[#f0aaa6]">
            {errors.email.message}
          </p>
        )}
        <label htmlFor="email" className="order-12 mb-2 mt-4 block text-xs font-semibold tracking-wide text-[#493429] first-of-type:mt-0 dark:text-[#e8e6e1]">Email</label>
        <input id="email" className="order-13 h-12 w-full min-w-0 shrink-0 rounded-xl border border-[#a27850] bg-[#fffdf9]/80 px-4 text-base text-[#493429] shadow-[0_2px_6px_#49342905] outline-none transition-colors placeholder:text-[#806b59] hover:border-[#92683f] hover:bg-[#fffcf8] focus:border-[#92683f] focus:bg-[#fffcf8] focus:ring-4 focus:ring-[#b58b62]/20 motion-reduce:transition-none dark:hover:bg-[#1b1d20] dark:focus:bg-[#1b1d20] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
          type="text" placeholder="Email" {...register("email", EmailValidator)}
        ></input>
        {errors.password && (
          <p className="order-17 mt-2 rounded-xl border border-[#e4c5ad] bg-[#fff1e8] px-3 py-2 text-xs font-medium leading-5 text-[#843e2e] dark:border-[#704b4e] dark:bg-[#332426] dark:text-[#f0aaa6]">
            {errors.password.message}
          </p>
        )}
        <label htmlFor="password" className="order-15 mb-2 mt-4 block text-xs font-semibold tracking-wide text-[#493429] first-of-type:mt-0 dark:text-[#e8e6e1]">Password</label>
        <input id="password" className="order-16 h-12 w-full min-w-0 shrink-0 rounded-xl border border-[#a27850] bg-[#fffdf9]/80 px-4 text-base text-[#493429] shadow-[0_2px_6px_#49342905] outline-none transition-colors placeholder:text-[#806b59] hover:border-[#92683f] hover:bg-[#fffcf8] focus:border-[#92683f] focus:bg-[#fffcf8] focus:ring-4 focus:ring-[#b58b62]/20 motion-reduce:transition-none dark:hover:bg-[#1b1d20] dark:focus:bg-[#1b1d20] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
          type="password" placeholder="Password" {...register("password", PasswordValidator)}
        ></input>
        <button type="submit" className="relative order-18 mt-6 flex min-h-13 w-full shrink-0 cursor-pointer items-center justify-center gap-3 rounded-xl bg-[#493429] px-6 text-sm font-semibold text-[#fffcf8] shadow-[0_8px_24px_#49342926] outline-none transition-colors hover:bg-[#654a37] focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-4 focus-visible:ring-offset-[#fffcf8] after:text-lg after:text-[#e5c5a1] after:content-['→'_/_''] motion-reduce:transition-none dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:bg-[#c8a477] dark:hover:bg-[#d7b68e] dark:active:bg-[#b58f64] dark:text-[#1b1712] dark:shadow-[0_4px_14px_#00000026] dark:hover:shadow-[0_6px_18px_#00000033]">Sign up</button>
        <NavLink to={"/signIn"} className="order-19 mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#d9c6b0] bg-[#fffdf9]/70 px-4 py-2 text-sm font-semibold text-[#493429] outline-none transition-colors after:text-base after:text-[#8b6140] after:content-['→'_/_''] hover:border-[#92683f] hover:bg-[#f4ebdf] hover:text-[#34251e] focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffcf8] motion-reduce:transition-none dark:border-[#46494f] dark:bg-[#1b1d20]/70 dark:text-[#e8e6e1] dark:after:text-[#d6b58c] dark:hover:border-[#d6b58c] dark:hover:bg-[#24272b] dark:hover:text-[#f6f4ef] dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20]">Sign in</NavLink>
        <GoogleSignIn />
      </form>
    </>
  );
};

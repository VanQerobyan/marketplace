import { EmailValidator, FirstNameValidator, LastNameValidator, UsernameValidator } from "../../../validators/auth/SignUpValidator";
import { useForm } from "react-hook-form";
import type { EditAccount } from "../../../types/userTypes";
import { useEditUserMutation, useGetUsersQuery } from "../../../../store/api/usersApi";
import { ProfileInfoLoading } from "./ProfileInfoLoading";
import { useEffect } from "react";

export const EditProfile = () => {
      const { register, handleSubmit, formState: { errors, isDirty}, reset } = useForm<EditAccount>();
      const [editUserData, result] = useEditUserMutation();
      const {isLoading, data} = useGetUsersQuery();
      const user = data?.data;
      const handleEdit = async (data: EditAccount) => {
          await editUserData(data);
      };
      useEffect(() => {
          reset({
            firstName: user?.firstName,
            lastName: user?.lastName,
            username: user?.username, 
            email: user?.email
          })
      }, [reset])
    return <>
        { isLoading && <ProfileInfoLoading/>}
        { result.isSuccess && <div>
                    <p role="status" className="mb-6 flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-[#c7d1b5] bg-[#f0f3e8] px-4 py-3.5 text-sm font-medium leading-6 text-[#4d603c] shadow-sm before:grid before:size-7 before:shrink-0 before:place-items-center before:rounded-full before:bg-[#dce6cf] before:text-base before:font-bold before:content-['✓'_/_''] dark:border-[#425c4c] dark:bg-[#23302a] dark:text-[#bad6c2] dark:before:bg-[#344b3d]">Fields change successfully</p>            
          </div>
          }
          {result.isError && <p className="mb-6 flex w-full max-w-2xl items-start gap-3 rounded-2xl border border-[#e4c5ad] bg-[#fff1e8] px-4 py-3.5 text-sm font-medium leading-6 text-[#843e2e] shadow-sm before:mt-0.5 before:grid before:size-6 before:shrink-0 before:place-items-center before:rounded-full before:bg-[#f4dfd0] before:text-sm before:font-bold before:leading-none before:content-['!'_/_''] dark:border-[#704b4e] dark:bg-[#332426] dark:text-[#f0aaa6] dark:before:bg-[#48302d]">“We couldn’t save your changes. Please check your details and try again.”</p>}
                                    <form
                                      onSubmit={handleSubmit(handleEdit)}
                                      className="grid w-full min-w-0 max-w-2xl grid-cols-1 content-start gap-x-7 pb-2 font-sans text-[#493429] sm:grid-cols-2 dark:text-[#e8e6e1]"
                                    >
                                      {errors.firstName && (
                                        <p className="mt-2 rounded-lg bg-[#fff1e8] px-3 py-2 text-xs font-medium leading-relaxed text-[#843e2e] sm:col-start-1 sm:row-start-3 col-start-1 row-start-3 dark:bg-[#332426] dark:text-[#f0aaa6]">
                                          {errors.firstName.message}
                                        </p>
                                      )}
                                      <label
                                        htmlFor="firstName"
                                        className="mb-2 text-sm font-semibold leading-6 text-[#34251e] sm:text-base col-start-1 row-start-1 sm:col-start-1 sm:row-start-1 dark:text-[#f6f4ef]"
                                      >
                                        First name
                                      </label>
                                      <input
                                        id="firstName"
                                        type="text"
                                        placeholder="First name"
                                        className="h-[3.25rem] w-full min-w-0 rounded-xl border border-[#d9c6b0] bg-[#fffdf9] px-4 text-base font-normal text-[#493429] shadow-[0_1px_2px_#49342905] outline-none transition-colors placeholder:text-[#74604e] hover:border-[#a27850] focus:border-[#92683f] focus:ring-4 focus:ring-[#92683f]/15 motion-reduce:transition-none col-start-1 row-start-2 sm:col-start-1 sm:row-start-2 dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
                                        {...register("firstName", FirstNameValidator)}
                                      ></input>
                
                                      {errors.lastName && (
                                        <p className="mt-2 rounded-lg bg-[#fff1e8] px-3 py-2 text-xs font-medium leading-relaxed text-[#843e2e] sm:col-start-2 sm:row-start-3 col-start-1 row-start-6 dark:bg-[#332426] dark:text-[#f0aaa6]">
                                          {errors.lastName.message}
                                        </p>
                                      )}
                                      <label
                                        htmlFor="LastName"
                                        className="mb-2 mt-8 sm:mt-0 text-sm font-semibold leading-6 text-[#34251e] sm:text-base col-start-1 row-start-4 sm:col-start-2 sm:row-start-1 dark:text-[#f6f4ef]"
                                      >
                                        Last name
                                      </label>
                                      <input
                                        id="LastName"
                                        type="text"
                                        placeholder="Last name"
                                        className="h-[3.25rem] w-full min-w-0 rounded-xl border border-[#d9c6b0] bg-[#fffdf9] px-4 text-base font-normal text-[#493429] shadow-[0_1px_2px_#49342905] outline-none transition-colors placeholder:text-[#74604e] hover:border-[#a27850] focus:border-[#92683f] focus:ring-4 focus:ring-[#92683f]/15 motion-reduce:transition-none col-start-1 row-start-5 sm:col-start-2 sm:row-start-2 dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
                                        {...register("lastName", LastNameValidator)}
                                      ></input>
                
                                      {errors.username && (
                                        <p className="mt-2 rounded-lg bg-[#fff1e8] px-3 py-2 text-xs font-medium leading-relaxed text-[#843e2e] sm:col-span-2 sm:row-start-9 col-start-1 row-start-12 dark:bg-[#332426] dark:text-[#f0aaa6]">
                                          {errors.username.message}
                                        </p>
                                      )}
                                      <label
                                        htmlFor="username"
                                        className="mb-2 mt-8 text-sm font-semibold leading-6 text-[#34251e] sm:text-base col-start-1 row-start-10 sm:col-span-2 sm:row-start-7 dark:text-[#f6f4ef]"
                                      >
                                        Username
                                      </label>
                                      <input
                                        id="username"
                                        type="text"
                                        placeholder="Username"
                                        className="h-[3.25rem] w-full min-w-0 rounded-xl border border-[#d9c6b0] bg-[#fffdf9] px-4 text-base font-normal text-[#493429] shadow-[0_1px_2px_#49342905] outline-none transition-colors placeholder:text-[#74604e] hover:border-[#a27850] focus:border-[#92683f] focus:ring-4 focus:ring-[#92683f]/15 motion-reduce:transition-none col-start-1 row-start-11 sm:col-span-2 sm:row-start-8 dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
                                        {...register("username", UsernameValidator)}
                                      ></input>
                
                                      {errors.email && (
                                        <p className="mt-2 rounded-lg bg-[#fff1e8] px-3 py-2 text-xs font-medium leading-relaxed text-[#843e2e] sm:col-span-2 sm:row-start-6 col-start-1 row-start-9 dark:bg-[#332426] dark:text-[#f0aaa6]">
                                          {errors.email.message}
                                        </p>
                                      )}
                                      <label
                                        htmlFor="email"
                                        className="mb-2 mt-8 text-sm font-semibold leading-6 text-[#34251e] sm:text-base col-start-1 row-start-7 sm:col-span-2 sm:row-start-4 dark:text-[#f6f4ef]"
                                      >
                                        Email
                                      </label>
                                      <input
                                        id="email"
                                        type="email"
                                        placeholder="Email"
                                        className="h-[3.25rem] w-full min-w-0 rounded-xl border border-[#d9c6b0] bg-[#fffdf9] px-4 text-base font-normal text-[#493429] shadow-[0_1px_2px_#49342905] outline-none transition-colors placeholder:text-[#74604e] hover:border-[#a27850] focus:border-[#92683f] focus:ring-4 focus:ring-[#92683f]/15 motion-reduce:transition-none col-start-1 row-start-8 sm:col-span-2 sm:row-start-5 dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
                                        {...register("email", EmailValidator)}
                                      ></input>
                                      <button
                                        disabled={!isDirty || result.isLoading}
                                        type="submit"
                                        className="col-start-1 row-start-13 mt-9 inline-flex min-h-[3.375rem] w-full cursor-pointer items-center justify-center justify-self-start rounded-xl border border-[#75502f] bg-gradient-to-r from-[#75502f] to-[#8b6140] px-7 py-3 text-sm font-semibold text-[#fffcf8] shadow-[0_4px_12px_#49342914] outline-none transition duration-200 enabled:hover:-translate-y-0.5 enabled:hover:from-[#654a37] enabled:hover:to-[#75502f] enabled:hover:shadow-[0_8px_20px_#49342924] enabled:active:translate-y-0 enabled:active:from-[#493429] enabled:active:to-[#654a37] focus-visible:ring-4 focus-visible:ring-[#92683f]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdf9] disabled:cursor-not-allowed disabled:border-[#ded2c4] disabled:bg-none disabled:bg-[#eee6dc] disabled:text-[#8b7d6e] disabled:shadow-none motion-reduce:transform-none motion-reduce:transition-none sm:col-span-2 sm:row-start-10 sm:w-auto sm:min-w-48 sm:px-8 sm:text-base dark:border-[#c8a477] dark:from-[#c8a477] dark:to-[#b58f64] dark:text-[#1b1712] dark:shadow-[0_4px_14px_#00000026] dark:enabled:hover:from-[#d7b68e] dark:enabled:hover:to-[#c8a477] dark:enabled:hover:shadow-[0_6px_18px_#00000033] dark:enabled:active:from-[#b58f64] dark:enabled:active:to-[#a57d52] dark:focus-visible:ring-[#d6b58c]/25 dark:focus-visible:ring-offset-[#1b1d20] dark:disabled:border-[#34373d] dark:disabled:bg-[#24272b] dark:disabled:text-[#777c84]"
                                      >
                                        Save changes
                                      </button>
                                    </form>
                                  
    </>
}

import { useChangePasswordMutation } from "../../../../store/api/authApi"
import { useForm } from "react-hook-form";
import { PasswordValidator } from "../../../validators/auth/SignUpValidator";
import { type ChangePasswordType } from "../../../types/authType";
import { useGetUsersQuery } from "../../../../store/api/usersApi";

export const ChangePassword = () => {

    const [changePassword, result] = useChangePasswordMutation();
    const { data: profile } = useGetUsersQuery();

    const {register, handleSubmit, formState:{errors}} = useForm<ChangePasswordType>();

    const handleNewPasword = async (data: ChangePasswordType) => {
            await changePassword(data);
    }
    if (profile?.data.hasPassword === false) return <p className="text-sm text-[#493429] dark:text-[#e8e6e1]">
        You sign in with Google. Manage your password in your <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="underline">Google Account</a>.
    </p>;
    return <>

        {result.isSuccess && <div>
                <p role="status" className="mb-6 flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-[#c7d1b5] bg-[#f0f3e8] px-4 py-3.5 text-sm font-medium leading-6 text-[#4d603c] shadow-sm before:grid before:size-7 before:shrink-0 before:place-items-center before:rounded-full before:bg-[#dce6cf] before:text-base before:font-bold before:content-['✓'_/_''] dark:border-[#425c4c] dark:bg-[#23302a] dark:text-[#bad6c2] dark:before:bg-[#344b3d]">Password change successfully</p>            
            </div>}

        {result.isError && <p className="mb-6 flex w-full max-w-2xl items-start gap-3 rounded-2xl border border-[#e4c5ad] bg-[#fff1e8] px-4 py-3.5 text-sm font-medium leading-6 text-[#843e2e] shadow-sm before:mt-0.5 before:grid before:size-6 before:shrink-0 before:place-items-center before:rounded-full before:bg-[#f4dfd0] before:text-sm before:font-bold before:leading-none before:content-['!'_/_''] dark:border-[#704b4e] dark:bg-[#332426] dark:text-[#f0aaa6] dark:before:bg-[#48302d]">“We couldn’t save your changes. Please check your details and try again.”</p>}

        <div className="w-full font-sans text-[#493429] dark:text-[#e8e6e1]">

                <form onSubmit={handleSubmit(handleNewPasword)} className="flex w-full min-w-0 max-w-2xl flex-col items-start font-sans text-[#493429] dark:text-[#e8e6e1]">

                {errors.currentPassword && <p className="mb-2 rounded-xl border border-[#d9b59b] bg-[#fff1e8] px-3 py-2 text-xs font-medium leading-relaxed tracking-normal text-[#843e2e] dark:border-[#704b4e] dark:bg-[#332426] dark:text-[#f0aaa6]">{errors.currentPassword.message}</p>}
                <label htmlFor="currentPassword" className="mb-2 text-sm font-semibold leading-6 text-[#34251e] sm:text-base dark:text-[#f6f4ef]">Current Password</label>
                <input
                id="currentPassword"
                type="password"
                className="h-[3.25rem] w-full min-w-0 rounded-xl border border-[#d9c6b0] bg-[#fffdf9] px-4 text-base font-normal text-[#493429] shadow-[0_1px_2px_#49342905] outline-none transition-colors placeholder:text-[#74604e] hover:border-[#a27850] focus:border-[#92683f] focus:ring-4 focus:ring-[#92683f]/15 motion-reduce:transition-none dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
                placeholder="Current password"
                {...register("currentPassword", PasswordValidator)}
                >
                </input>

                {errors.newPassword && <p className="mb-2 rounded-xl border border-[#d9b59b] bg-[#fff1e8] px-3 py-2 text-xs font-medium leading-relaxed tracking-normal text-[#843e2e] dark:border-[#704b4e] dark:bg-[#332426] dark:text-[#f0aaa6]">{errors.newPassword.message}</p>}
                <label htmlFor="newPassword" className="mb-2 mt-8 text-sm font-semibold leading-6 text-[#34251e] sm:text-base dark:text-[#f6f4ef]">New Password</label>
                <input
                id="newPassword"
                type="password"
                className="h-[3.25rem] w-full min-w-0 rounded-xl border border-[#d9c6b0] bg-[#fffdf9] px-4 text-base font-normal text-[#493429] shadow-[0_1px_2px_#49342905] outline-none transition-colors placeholder:text-[#74604e] hover:border-[#a27850] focus:border-[#92683f] focus:ring-4 focus:ring-[#92683f]/15 motion-reduce:transition-none dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
                placeholder="New Password"
                {...register("newPassword", PasswordValidator)}
                >
                </input>
                <button type="submit" className="mt-9 inline-flex min-h-[3.375rem] w-full cursor-pointer items-center justify-center justify-self-start rounded-xl border border-[#75502f] bg-gradient-to-r from-[#75502f] to-[#8b6140] px-7 py-3 text-sm font-semibold text-[#fffcf8] shadow-[0_2px_4px_#49342910] outline-none transition-colors hover:from-[#654a37] hover:to-[#75502f] focus-visible:ring-4 focus-visible:ring-[#92683f]/25 focus-visible:ring-offset-2 active:from-[#493429] active:to-[#654a37] motion-reduce:transition-none sm:w-auto sm:min-w-48 sm:px-8 sm:text-base dark:focus-visible:ring-[#d6b58c]/25 dark:focus-visible:ring-offset-[#1b1d20] dark:from-[#c8a477] dark:to-[#b58f64] dark:hover:from-[#d7b68e] dark:hover:to-[#c8a477] dark:active:from-[#b58f64] dark:active:to-[#a57d52] dark:text-[#1b1712] dark:border-[#c8a477] dark:shadow-[0_4px_14px_#00000026] dark:hover:shadow-[0_6px_18px_#00000033]">Change Password</button>
                </form>
        </div>

    </>
}

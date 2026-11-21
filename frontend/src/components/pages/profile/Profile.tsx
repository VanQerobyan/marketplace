import { type ChangeEvent } from "react";
import { useGetUsersQuery, useUpdateAvatarMutation } from "../../../../store/api/usersApi";
import { useMyListingsQuery } from "../../../../store/api/listingsApi";
import { NavLink } from "react-router-dom";
import { ListingLoading } from "../listing/ListingLoading";
import { ListingError } from "../listing/ListingError";
import { ProfileLoading } from "./ProfileLoading";
import { ProfileError } from "./ProfileError";
import { useGetFavoritesQuery } from "../../../../store/api/favoritesApi";
import { useGetUserRatingQuery } from "../../../../store/api/ratingApi";
import { UserRating } from "../rating/UserRating";

export const Profile = () => {
  const [updateAvatar] = useUpdateAvatarMutation();
  const { isLoading, error, data} = useGetUsersQuery();
  
  const user = data?.data;
  const {
    isLoading: listingLoading,
    error: listingError,
    data: listingData,
  } = useMyListingsQuery();
  
  const { data: favoritesData } = useGetFavoritesQuery();
  const {currentData: ratingData} = useGetUserRatingQuery(String(user?.id), {
    skip: !user,
    refetchOnMountOrArgChange: true,
  });
  
  if (isLoading) return <ProfileLoading/>
  if (error) return <ProfileError/>
  
  if (listingLoading) return <ListingLoading/>;
  if (listingError) return <ListingError/>;
  
  
  const favoritesCount = favoritesData?.data.length;

  const handleFormData = async (event: ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData();
    const file = event.target.files?.[0];

    if (!file) return;

    formData.append("avatar", file);
    try {
      await updateAvatar(formData).unwrap();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    user && (
      <>
        <div className="relative isolate grid w-full min-w-0 grid-cols-1 overflow-hidden rounded-2xl bg-[#fffdf9] px-4 pb-5 pt-28 font-sans text-[#493429] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-40 before:rounded-2xl before:border before:border-[#e9e0d6] before:bg-[linear-gradient(155deg,transparent_48%,#b58b62_48%,#dfc8ad_70%,transparent_70%),linear-gradient(25deg,#92683f_0%,#dfc8ad_38%,transparent_38%),linear-gradient(120deg,#f4ebdf_0%,#dfc8ad_55%,#b58b62_100%)] sm:px-6 sm:pb-6 sm:pt-36 sm:before:h-48 dark:bg-[#1b1d20] dark:text-[#e8e6e1] dark:before:border-[#34373d] dark:before:bg-[radial-gradient(ellipse_at_top_right,#9f866933,transparent_60%),linear-gradient(135deg,#24272b_0%,#3b3935_45%,#1b2026_100%)]">
          <label className="group relative mb-3 flex size-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-[#fffdf9] bg-[#f4ebdf] shadow-md ring-1 ring-[#e9e0d6] transition-shadow hover:ring-4 hover:ring-[#92683f] focus-within:ring-4 focus-within:ring-[#92683f] after:pointer-events-none after:absolute after:inset-0 after:z-10 after:flex after:items-center after:justify-center after:bg-[#34251e]/65 after:text-xs after:font-semibold after:text-[#fffcf8] after:opacity-0 after:transition-opacity after:content-['＋_Add_photo'] hover:after:opacity-100 focus-within:after:opacity-100 motion-reduce:transition-none motion-reduce:after:transition-none sm:size-32 dark:border-[#1b1d20] dark:bg-[#24272b] dark:ring-[#34373d] dark:hover:ring-[#d6b58c] dark:focus-within:ring-[#d6b58c]">
            <input
              type="file"
              accept="image/*"
              onChange={handleFormData}
              aria-label="Upload profile photo"
              className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
            ></input>
            <img
              src={`http://localhost:5000${user.avatar}`}
              alt="Profile avatar"
              className="size-full rounded-full object-cover"
            ></img>
          </label>
          <p className="text-xl font-bold tracking-tight text-[#34251e] sm:text-2xl dark:text-[#f6f4ef]">
            {user.firstName} {user.lastName}
          </p>
          <p className="mt-1 text-sm font-medium text-[#74604e] dark:text-[#aaa69f]">
            @{user.username}
          </p>
          <div className="order-2 mt-6 text-xs font-semibold tracking-wide text-[#634b38] dark:text-[#c8c4bd]">Bio
          
          <p contentEditable className="mt-2 min-h-12 rounded-xl border border-[#e9e0d6] bg-[#f7f0e7] px-3.5 py-3 text-sm font-normal leading-relaxed tracking-normal text-[#493429] outline-none transition-colors focus:border-[#92683f] focus:ring-4 focus:ring-[#92683f]/20 motion-reduce:transition-none dark:border-[#34373d] dark:bg-[#111315] dark:text-[#e8e6e1] dark:focus:border-[#d6b58c] dark:focus:ring-[#d6b58c]/20">Hello</p>
          </div>

          <div className="hidden">
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 border-b border-[#e9e0d6] pb-6 dark:border-[#34373d]">
            <NavLink to={"/account/listings"} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-sm font-medium text-[#74604e] outline-none transition-colors hover:bg-[#f4ebdf] hover:text-[#493429] focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 aria-[current=page]:bg-[#eddfce] motion-reduce:transition-none dark:text-[#aaa69f] dark:hover:bg-[#24272b] dark:hover:text-[#e8e6e1] dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:aria-[current=page]:bg-[#2d3035]"><span className="text-lg font-bold leading-6 text-[#34251e] dark:text-[#f6f4ef]">{listingData?.pagination.totalItems}</span><span>Listings</span></NavLink>
            <NavLink to={"/account/favorites"} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-sm font-medium text-[#74604e] outline-none transition-colors hover:bg-[#f4ebdf] hover:text-[#493429] focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 aria-[current=page]:bg-[#eddfce] motion-reduce:transition-none dark:text-[#aaa69f] dark:hover:bg-[#24272b] dark:hover:text-[#e8e6e1] dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:aria-[current=page]:bg-[#2d3035]"><span className="text-lg font-bold leading-6 text-[#34251e] dark:text-[#f6f4ef]">{favoritesCount}</span><span>Favorites</span></NavLink>
            <div className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-sm font-medium text-[#74604e] dark:text-[#aaa69f]">
              <span className="text-lg font-bold leading-6 text-[#34251e] dark:text-[#f6f4ef]">{ratingData?.data.averageRating ?? user.averageRating}</span>
              <span>Ratings</span>
            </div>
          </div>
        </div>
        <UserRating key={user.id} userId={user.id} />
      </>
    )
  );
};

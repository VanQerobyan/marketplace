import { useForm } from "react-hook-form";
import type { CreatedListing } from "../../../../types/listingType";
import { useCreateListingMutation } from "../../../../../store/api/listingsApi";
import { CategoryValidator, DescriptionValidator, ImagesValidator, PriceValidator, TitleValidator } from "../../../../validators/listing/ListingValidator";

export const AddListingUtils = () => {

        const {register, handleSubmit, formState:{errors}, reset} = useForm<CreatedListing>();
    
        const [createList] = useCreateListingMutation();
     
        const handleAdd = async (data: CreatedListing) => {
    
            const form = new FormData();
    
            form.append("title", data.title)
            form.append("description", data.description)
            form.append("category", data.category)
            form.append("price", data.price)
    
            for (const image of Array.from(data.images)) {
                form.append("images", image);
            }
            await createList(form);
            reset();
        }
    return <>
    
    <form onSubmit={handleSubmit(handleAdd)} className="flex flex-col before:mb-6 before:h-1.5 before:w-12 before:rounded-full before:bg-gradient-to-r before:from-[#493429] before:to-[#654a37] before:content-['']">
    
            {errors.title && <p id="listing-title-error" role="alert" className="mt-2 text-xs font-medium leading-relaxed text-[#843e2e] dark:text-[#f0aaa6]">{errors.title.message}</p>}
            <label htmlFor="title" className="mb-2 text-xs font-semibold tracking-wide text-[#634b38] dark:text-[#c8c4bd]">Title</label>
            <input
            id="title"
            type="text"
            placeholder="Listing title"
            className="h-12 w-full rounded-xl border border-[#a27850] bg-[#fffcf8] px-4 text-sm text-[#34251e] shadow-sm outline-none transition duration-200 placeholder:text-[#74604e] hover:border-[#92683f] focus:border-[#92683f] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#92683f] motion-reduce:transition-none dark:focus:bg-[#1b1d20] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "listing-title-error" : undefined}
            {...register("title", TitleValidator)}
            >
            </input>
    
            {errors.description && <p id="listing-description-error" role="alert" className="mt-2 text-xs font-medium leading-relaxed text-[#843e2e] dark:text-[#f0aaa6]">{errors.description.message}</p>}
            <label htmlFor="description" className="mb-2 mt-5 text-xs font-semibold tracking-wide text-[#634b38] dark:text-[#c8c4bd]">Description</label>
            <input
            id="description"
            type="text"
            placeholder="Describe your item"
            className="h-12 w-full rounded-xl border border-[#a27850] bg-[#fffcf8] px-4 text-sm text-[#34251e] shadow-sm outline-none transition duration-200 placeholder:text-[#74604e] hover:border-[#92683f] focus:border-[#92683f] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#92683f] motion-reduce:transition-none dark:focus:bg-[#1b1d20] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "listing-description-error" : undefined}
            {...register("description", DescriptionValidator)}
            >
            </input>
    
            {errors.price && <p id="listing-price-error" role="alert" className="mt-2 text-xs font-medium leading-relaxed text-[#843e2e] dark:text-[#f0aaa6]">{errors.price.message}</p>}
            <label htmlFor="price" className="mb-2 mt-5 text-xs font-semibold tracking-wide text-[#634b38] dark:text-[#c8c4bd]">Price</label>
            <input
            id="price"
            type="number"
            step="any"
            placeholder="0.00"
            className="h-12 w-full rounded-xl border border-[#a27850] bg-[#fffcf8] px-4 text-sm text-[#34251e] shadow-sm outline-none transition duration-200 placeholder:text-[#74604e] hover:border-[#92683f] focus:border-[#92683f] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#92683f] motion-reduce:transition-none dark:focus:bg-[#1b1d20] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
            aria-invalid={Boolean(errors.price)}
            aria-describedby={errors.price ? "listing-price-error" : undefined}
            {...register("price", PriceValidator)}
            >
            </input>
    
             {errors.category && <p id="listing-category-error" role="alert" className="mt-2 text-xs font-medium leading-relaxed text-[#843e2e] dark:text-[#f0aaa6]">{errors.category.message}</p>}
             <label htmlFor="category" className="mb-2 mt-5 text-xs font-semibold tracking-wide text-[#634b38] dark:text-[#c8c4bd]">Category</label>
            <input
            id="category"
            type="text"
            placeholder="e.g. Electronics"
            className="h-12 w-full rounded-xl border border-[#a27850] bg-[#fffcf8] px-4 text-sm text-[#34251e] shadow-sm outline-none transition duration-200 placeholder:text-[#74604e] hover:border-[#92683f] focus:border-[#92683f] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#92683f] motion-reduce:transition-none dark:focus:bg-[#1b1d20] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? "listing-category-error" : undefined}
            {...register("category", CategoryValidator)}
            >
            </input>
    
             {errors.images && <p id="listing-images-error" role="alert" className="mt-2 text-xs font-medium leading-relaxed text-[#843e2e] dark:text-[#f0aaa6]">{errors.images.message}</p>}
             <label htmlFor="image" className="mb-2 mt-5 text-xs font-semibold tracking-wide text-[#634b38] dark:text-[#c8c4bd]">Listing photos</label>
            <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            placeholder="Choose listing photos"
            className="w-full cursor-pointer rounded-xl border border-dashed border-[#a27850] bg-[#f4ebdf]/60 p-3 text-xs text-[#634b38] outline-none transition-colors file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#fffdf9] file:px-3 file:py-2.5 file:text-xs file:font-semibold file:text-[#493429] file:shadow-sm hover:border-[#92683f] hover:bg-[#f4ebdf] focus-visible:ring-4 focus-visible:ring-[#92683f] motion-reduce:transition-none dark:file:bg-[#1b1d20] dark:file:text-[#e8e6e1] dark:hover:bg-[#24272b] dark:focus-visible:ring-[#d6b58c] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
            aria-invalid={Boolean(errors.images)}
            aria-describedby={errors.images ? "listing-images-error" : undefined}
            {...register("images", ImagesValidator)}
            >
            </input>
    
            <button type="submit" className="mt-7 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#493429] to-[#654a37] px-6 py-3 text-sm font-bold text-[#fffcf8] shadow-md shadow-[#b58b62]/25 outline-none transition duration-200 hover:from-[#34251e] hover:to-[#493429] hover:shadow-lg hover:shadow-[#b58b62]/30 focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 dark:shadow-[#000000]/25 dark:hover:shadow-[#000000]/30 dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:from-[#c8a477] dark:to-[#b58f64] dark:hover:from-[#d7b68e] dark:hover:to-[#c8a477] dark:active:from-[#b58f64] dark:active:to-[#a57d52] dark:text-[#1b1712] dark:shadow-[0_4px_14px_#00000026] dark:hover:shadow-[0_6px_18px_#00000033]">Create listing</button>
        </form>
    </>
}
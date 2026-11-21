import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form";
import { type UpdatedListing } from "../../../types/listingType";
import { useEditOneListingMutation, useOneListingQuery } from "../../../../store/api/listingsApi";
import { CategoryValidator, DescriptionValidator, ImagesValidator, PriceValidator, StatusValidator, TitleValidator } from "../../../validators/listing/ListingValidator";
import { useEffect } from "react";
import { ListingLoading } from "./ListingLoading";
import { ListingError } from "./ListingError";

export const EditListing = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    
    const [editListing] = useEditOneListingMutation();
    const {register, handleSubmit, formState:{errors}, reset} = useForm<UpdatedListing>();
    const { isLoading, error, data} = useOneListingQuery(String(id));

    
    const listing = data?.data;

    useEffect(() => {
        reset({
            title: listing?.title,
            description: listing?.description,
            price: listing?.price,
            category: listing?.category || "",
            status: listing?.status
        });
    },[data, reset])

  
    const handleEdit = async (data: UpdatedListing) => {
        
        const form = new FormData();

        form.append("title", data.title);
        form.append("category", data.category);
        form.append("description", data.description);
        form.append("price", data.price);
        form.append("status", data.status);

        for (const image of Array.from(data.images)) {
            form.append("images", image);
        }

        await  editListing({id: String(id), editingData: form});
        navigate("/account/listings");
    }

    return <>

        {isLoading && <ListingLoading/> }
        {error && <ListingError/> }

        <form onSubmit={handleSubmit(handleEdit)} className="mx-auto grid w-full min-w-0 max-w-2xl grid-cols-1 font-sans text-[#34251e] dark:text-[#f6f4ef]">

        {errors.title && <p id="edit-listing-title-error" role="alert" className="order-3 mt-2 text-xs font-medium leading-relaxed text-[#843e2e] dark:text-[#f0aaa6]">{errors.title.message}</p>}
        <label htmlFor="title" className="order-1 mb-2 text-xs font-semibold text-[#634b38] sm:text-sm dark:text-[#c8c4bd]">Title</label>
        <input
        id="title"
        type="text"
        placeholder="Listing title"
        className="order-2 h-11 w-full min-w-0 rounded-xl border border-[#a27850] bg-[#fffdf9] px-3.5 text-sm text-[#493429] shadow-[0_1px_3px_#49342904] outline-none transition duration-200 placeholder:text-[#74604e] hover:border-[#92683f] focus:border-[#92683f] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#92683f] motion-reduce:transition-none dark:focus:bg-[#1b1d20] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
        aria-invalid={Boolean(errors.title)}
        aria-describedby={errors.title ? "edit-listing-title-error" : undefined}
        {...register("title", TitleValidator)}
        >
        </input>

         {errors.description && <p id="edit-listing-description-error" role="alert" className="order-12 mt-2 text-xs font-medium leading-relaxed text-[#843e2e] dark:text-[#f0aaa6]">{errors.description.message}</p>}
         <label htmlFor="description" className="order-10 mb-2 mt-5 text-xs font-semibold text-[#634b38] sm:text-sm dark:text-[#c8c4bd]">Description</label>
        <input
        id="description"
        type="text"
        placeholder="Describe your item"
        className="order-11 h-24 w-full min-w-0 rounded-xl border border-[#a27850] bg-[#fffdf9] px-3.5 pb-12 pt-3 text-sm text-[#493429] shadow-[0_1px_3px_#49342904] outline-none transition duration-200 placeholder:text-[#74604e] hover:border-[#92683f] focus:border-[#92683f] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#92683f] motion-reduce:transition-none dark:focus:bg-[#1b1d20] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
        aria-invalid={Boolean(errors.description)}
        aria-describedby={errors.description ? "edit-listing-description-error" : undefined}
        {...register("description", DescriptionValidator)}
        >
        </input>

        {errors.price && <p id="edit-listing-price-error" role="alert" className="order-9 mt-2 text-xs font-medium leading-relaxed text-[#843e2e] dark:text-[#f0aaa6]">{errors.price.message}</p>}
        <label htmlFor="price" className="order-7 mb-2 mt-5 text-xs font-semibold text-[#634b38] sm:text-sm dark:text-[#c8c4bd]">Price</label>
        <input
        id="price"
        type="number"
        step="any"
        placeholder="0.00"
        className="order-8 h-11 w-full min-w-0 rounded-xl border border-[#a27850] bg-[#fffdf9] px-3.5 text-sm text-[#493429] shadow-[0_1px_3px_#49342904] outline-none transition duration-200 placeholder:text-[#74604e] hover:border-[#92683f] focus:border-[#92683f] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#92683f] motion-reduce:transition-none sm:max-w-xs dark:focus:bg-[#1b1d20] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
        aria-invalid={Boolean(errors.price)}
        aria-describedby={errors.price ? "edit-listing-price-error" : undefined}
        {...register("price", PriceValidator)}
        >
        </input>

        {errors.category && <p id="edit-listing-category-error" role="alert" className="order-6 mt-2 text-xs font-medium leading-relaxed text-[#843e2e] dark:text-[#f0aaa6]">{errors.category.message}</p>}
        <label htmlFor="category" className="order-4 mb-2 mt-5 text-xs font-semibold text-[#634b38] sm:text-sm dark:text-[#c8c4bd]">Category</label>
        <input
        id="category"
        type="text"
        placeholder="e.g. Electronics"
        className="order-5 h-11 w-full min-w-0 rounded-xl border border-[#a27850] bg-[#fffdf9] px-3.5 text-sm text-[#493429] shadow-[0_1px_3px_#49342904] outline-none transition duration-200 placeholder:text-[#74604e] hover:border-[#92683f] focus:border-[#92683f] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#92683f] motion-reduce:transition-none dark:focus:bg-[#1b1d20] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
        aria-invalid={Boolean(errors.category)}
        aria-describedby={errors.category ? "edit-listing-category-error" : undefined}
        {...register("category", CategoryValidator)}
        >
        </input>

        {errors.status && <p id="edit-listing-status-error" role="alert" className="order-15 mt-2 text-xs font-medium leading-relaxed text-[#843e2e] dark:text-[#f0aaa6]">{errors.status.message}</p>}        
        <label htmlFor="status" className="order-13 mb-2 mt-5 text-xs font-semibold text-[#634b38] sm:text-sm dark:text-[#c8c4bd]">Status</label>
        <input
        id="status"
        type="text"
        placeholder="active, reserved or sold"
        className="order-14 h-11 w-full min-w-0 rounded-xl border border-[#a27850] bg-[#fffdf9] px-3.5 text-sm text-[#493429] shadow-[0_1px_3px_#49342904] outline-none transition duration-200 placeholder:text-[#74604e] hover:border-[#92683f] focus:border-[#92683f] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#92683f] motion-reduce:transition-none dark:focus:bg-[#1b1d20] dark:bg-[#141619] dark:border-[#3c4046] dark:text-[#e8e6e1] dark:placeholder:text-[#93969d] dark:hover:border-[#62616a] dark:focus:border-[#c8a477] dark:focus:ring-[#c8a477]/20"
        aria-invalid={Boolean(errors.status)}
        aria-describedby={errors.status ? "edit-listing-status-error" : undefined}
        {...register("status", StatusValidator)}
        >
        </input>

        {errors.images && <p id="edit-listing-images-error" role="alert" className="order-18 mt-2 text-xs font-medium leading-relaxed text-[#843e2e] dark:text-[#f0aaa6]">{errors.images.message}</p>}
        <label htmlFor="image" className="order-16 mb-2 mt-5 text-xs font-semibold text-[#493429] sm:text-sm dark:text-[#e8e6e1]">Listing photos</label>
        <input
        id="image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        placeholder="Choose listing photos"
        className="order-17 min-h-24 w-full cursor-pointer rounded-xl border border-dashed border-[#a27850] bg-gradient-to-br from-[#fffdf9] to-[#f7f0e7] p-4 text-xs text-[#634b38] outline-none transition duration-200 file:mr-4 file:cursor-pointer file:rounded-xl file:border file:border-dashed file:border-[#a27850] file:bg-[#fffdf9] file:px-4 file:py-5 file:text-xs file:font-semibold file:text-[#8b6140] hover:border-[#92683f] hover:bg-[#f4ebdf] hover:shadow-[0_4px_16px_#49342906] focus-visible:ring-4 focus-visible:ring-[#92683f] motion-reduce:transition-none dark:border-[#74634f] dark:from-[#1b1d20] dark:to-[#111315] dark:text-[#c8c4bd] dark:file:border-[#74634f] dark:file:bg-[#1b1d20] dark:file:text-[#d6b58c] dark:hover:border-[#d6b58c] dark:hover:bg-[#24272b] dark:focus-visible:ring-[#d6b58c]"
        aria-invalid={Boolean(errors.images)}
        aria-describedby={errors.images ? "edit-listing-images-error" : undefined}
        {...register("images", ImagesValidator)}
        >
        </input>

        <button type="submit" className="order-19 mt-6 inline-flex min-h-11 w-full cursor-pointer items-center justify-center justify-self-end rounded-xl bg-gradient-to-r from-[#493429] to-[#654a37] px-7 py-2.5 text-sm font-bold text-[#fffcf8] shadow-md shadow-[#b58b62]/20 outline-none transition duration-200 hover:from-[#34251e] hover:to-[#493429] hover:shadow-lg hover:shadow-[#b58b62]/30 focus-visible:ring-4 focus-visible:ring-[#92683f] focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 sm:min-w-40 sm:w-auto dark:shadow-[#000000]/20 dark:hover:shadow-[#000000]/30 dark:focus-visible:ring-[#d6b58c] dark:focus-visible:ring-offset-[#1b1d20] dark:from-[#c8a477] dark:to-[#b58f64] dark:hover:from-[#d7b68e] dark:hover:to-[#c8a477] dark:active:from-[#b58f64] dark:active:to-[#a57d52] dark:text-[#1b1712] dark:shadow-[0_4px_14px_#00000026] dark:hover:shadow-[0_6px_18px_#00000033]">Save changes</button>
    </form>

    </>
}
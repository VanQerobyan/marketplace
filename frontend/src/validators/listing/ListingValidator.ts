import validator from "validator";
import isLength from "validator/lib/isLength";

const trimInput = (value: string = "") => value.trim();
const imageTypes: Record<string, readonly string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
};

export const TitleValidator = {
    setValueAs: trimInput,
    required: "Please enter a title",
    validate: (value: string) =>
        isLength(value, { min: 3, max: 150 }) || "Title must be between 3 and 150 characters",
};

export const DescriptionValidator = {
    setValueAs: trimInput,
    required: "Please enter a description",
    validate: (value: string) =>
        isLength(value, { min: 10, max: 5000 }) || "Description must be between 10 and 5000 characters",
};

export const PriceValidator = {
    setValueAs: trimInput,
    required: "Please enter a price",
    validate: (value: string) =>
    validator.isFloat(value, { min: 0 }) ||
    "Price must be a valid number, 0 or greater",
};

export const CategoryValidator = {
    setValueAs: trimInput,
    validate: (value: string) =>
        isLength(value, { max: 100 }) || "Category must be at most 100 characters",
};

export const StatusValidator = {
    setValueAs: trimInput,
    required: "Please enter a status",
    validate: (value: string) =>
        ["active", "reserved", "sold"].includes(value) || "Status must be active, reserved or sold",
};

export const ImagesValidator = {
    validate: {
        count: (files?: FileList) =>
            !files || files.length <= 10 || "You can upload at most 10 images",
        size: (files?: FileList) =>
            !files || Array.from(files).every((file) => file.size <= 5 * 1024 * 1024)
            || "Each image must be at most 5 MB",
        type: (files?: FileList) =>
            !files || Array.from(files).every((file) => {
                const extension = file.name.split(".").pop()?.toLowerCase() || "";
                return imageTypes[file.type]?.includes(extension);
            }) || "Only JPEG, PNG or WebP images with matching file extensions are allowed",
    },
};

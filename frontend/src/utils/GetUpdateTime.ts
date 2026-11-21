export const getUpdateTime = (updatedAt: string) => {
        const updatedDate = new Date(updatedAt).toLocaleDateString();
        return updatedDate;
}
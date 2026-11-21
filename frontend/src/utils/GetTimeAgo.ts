export const getTimeAgo = (createdAtTime: string) => {
        const today = Date.now();
        const createdAt = new Date(createdAtTime).getTime();
        if (Number.isNaN(createdAt)) return "";
        const difference = Math.max(0, today - createdAt);
        const minute = Math.floor(difference/1000/60);
        const hours = Math.floor(difference/1000/60/60);
       if (minute < 60) {
        return minute === 0 ? "Just now" : minute + (minute === 1 ? " minute ago" : " minutes ago");
       } else if (hours < 24) {
        return hours + (hours === 1 ? " hour ago" : " hours ago");
       } else {
        const days = Math.floor(hours / 24);
        return days + (days === 1 ? " day ago" : " days ago");
       }
    }

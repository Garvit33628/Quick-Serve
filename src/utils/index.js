export const getRandomBG = (id) => {
    const colors = [
        "#f6b100",
        "#025cca",
        "#be3e3f",
        "#02ca3a",
    ];

    if (!id) return colors[0];

    if (typeof id === 'string') {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash += id.charCodeAt(i);
        }
        return colors[hash % colors.length];
    }

    const numericId = Number(id) || 0;
    return colors[numericId % colors.length];
};

export const getAvatarName = (name) => {
    if (!name) return "";
    return name.split(" ").map(word => word[0]).join("").toUpperCase();
};

export const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
};

export const formatDateAndTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const dateAndTime = d.toLocaleString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Kathmandu",
    });

    return dateAndTime;
};

export const getLocalDateString = (dateInput) => {
    const d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
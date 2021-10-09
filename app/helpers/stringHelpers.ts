export const nl2br = (str: string): string => {
    if (typeof str === "undefined" || str === null) return "";
    return (str + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, "$1" + "<br />" + "$2");
};

export const randStr = (length: number): String => {
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
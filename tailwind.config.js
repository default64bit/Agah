const colors = require("tailwindcss/colors");

module.exports = {
    purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
    darkMode: "class", // or 'media' or 'class'
    theme: {
        extend: {
            screens: {
                "2xs": "160px",
                xs: "320px",
                "2sm": "480px",
            },
        },
        colors: {
            gold: {
                100: "#fdf6d0",
                200: "#d6d0b0",
                300: "#c7c2a3",
                400: "#bbb699",
                500: "#aea98f",
                600: "#9c9881",
                700: "#888470",
                800: "#797664",
                900: "#636052",
            },
            transparent: "transparent",
            black: colors.black,
            white: colors.white,
            bluegray: colors.blueGray,
            coolgray: colors.coolGray,
            gray: colors.gray,
            truegray: colors.trueGray,
            warmgray: colors.warmGray,
            red: colors.red,
            orange: colors.orange,
            amber: colors.amber,
            yellow: colors.yellow,
            lime: colors.lime,
            green: colors.green,
            emerald: colors.emerald,
            teal: colors.teal,
            cyan: colors.cyan,
            lightblue: colors.sky,
            blue: colors.blue,
            indigo: colors.indigo,
            violet: colors.violet,
            purple: colors.purple,
            fuchsia: colors.fuchsia,
            pink: colors.pink,
            rose: colors.rose,

            primary: {
                100: "#f7f3eb", //"#fdf6d0"
                200: "#e7e2d5", //"#d6d0b0"
                300: "#d7d0bc", //"#c7c2a3"
                400: "#bfb7a3", //"#bbb699"
                500: "#a9a18b", //"#aea98f"
                600: "#99917b", //"#9c9881"
                700: "#877f6a", //"#888470"
                800: "#7e7761", //"#797664"
                900: "#665e47", //"#636052"
            },
            secondary: colors.warmGray,
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};

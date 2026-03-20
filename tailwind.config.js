/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
        "./error.vue",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#ff4d6d",
                secondary: "#ffb3c1",
                accent: "#c9184a",
                neutral: "#1d1d1d",
                "base-100": "#ffffff",
            },
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: [
            {
                cakestore: {
                    "primary": "#ff4d6d",
                    "secondary": "#ffb3c1",
                    "accent": "#c9184a",
                    "neutral": "#1d1d1d",
                    "base-100": "#ffffff",
                },
            },
        ],
    },
}

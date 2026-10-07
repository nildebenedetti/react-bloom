
const CATEGORY_DEFS = [
    { id: 1,  name: "Career",    light: "#10469E", dark: "#478AF5" }, // 217° blue
    { id: 2,  name: "Studies",   light: "#0C4F79", dark: "#0C91E4" }, // 203° azure
    { id: 3,  name: "Bonds",     light: "#0A5361", dark: "#0A99B6" }, // 190° cyan
    { id: 4,  name: "Sports",    light: "#08544F", dark: "#089D94" }, // 176° teal
    { id: 5,  name: "Cooking",   light: "#08563F", dark: "#099F72" }, // 162° green-teal
    { id: 6,  name: "Crafting",  light: "#3916E3", dark: "#8D77F8" }, // 250° indigo
    { id: 7,  name: "Wellness",  light: "#5F14C8", dark: "#A76EF7" }, // 265° violet
    { id: 8,  name: "Travel",    light: "#7511A7", dark: "#C35DF6" }, // 280° purple
    { id: 9,  name: "Finance",   light: "#830E8E", dark: "#E538F5" }, // 295° magenta
    { id: 10, name: "Languages", light: "#890E74", dark: "#F42FD3" }, // 310°
    { id: 11, name: "Culture",   light: "#900E5A", dark: "#F540A9" }, // 325° pink
    { id: 12, name: "Promises",  light: "#950F3B", dark: "#F54983" }, // 340° rose
];

// unknown color
const UNKNOWN_CATEGORY_COLOR = "#334155";
const UNKNOWN_CATEGORY_COLOR_DARK = "#94A3B8";

// colors maps
const CATEGORY_COLORS = CATEGORY_DEFS.map(({ id, name, light }) => ({ id, name, color: light }));
const CATEGORY_COLORS_DARK = CATEGORY_DEFS.map(({ id, name, dark }) => ({ id, name, color: dark }));

const CATEGORY_PALETTE = CATEGORY_COLORS.map((c) => c.color);
const CATEGORY_PALETTE_DARK = CATEGORY_COLORS_DARK.map((c) => c.color);
const ALL_CATEGORIES = CATEGORY_DEFS.map((c) => c.name);

// the set that matches the theme currently painted on <html>
function getCategoryColors(theme) {
    return theme === "dark" ? CATEGORY_COLORS_DARK : CATEGORY_COLORS;
}

function getUnknownCategoryColor(theme) {
    return theme === "dark" ? UNKNOWN_CATEGORY_COLOR_DARK : UNKNOWN_CATEGORY_COLOR;
}

export {
    CATEGORY_COLORS,
    CATEGORY_COLORS_DARK,
    CATEGORY_PALETTE,
    CATEGORY_PALETTE_DARK,
    ALL_CATEGORIES,
    UNKNOWN_CATEGORY_COLOR,
    UNKNOWN_CATEGORY_COLOR_DARK,
    getCategoryColors,
    getUnknownCategoryColor
};

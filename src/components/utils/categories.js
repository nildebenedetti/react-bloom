const CATEGORY_DEFS = [
    { id: 1,  name: "Career",    light: "#10469E", dark: "#0C60E6" }, // 217° blue
    { id: 2,  name: "Studies",   light: "#0C4F79", dark: "#096EAC" }, // 203° azure
    { id: 3,  name: "Bonds",     light: "#0A5361", dark: "#077288" }, // 190° cyan
    { id: 4,  name: "Sports",    light: "#08544F", dark: "#06776F" }, // 176° teal
    { id: 5,  name: "Cooking",   light: "#08563F", dark: "#067755" }, // 162° green-teal
    { id: 6,  name: "Crafting",  light: "#3916E3", dark: "#6649F5" }, // 250° indigo
    { id: 7,  name: "Wellness",  light: "#5F14C8", dark: "#8434F4" }, // 265° violet
    { id: 8,  name: "Travel",    light: "#7511A7", dark: "#A10CEB" }, // 280° purple
    { id: 9,  name: "Finance",   light: "#830E8E", dark: "#B50AC4" }, // 295° magenta
    { id: 10, name: "Languages", light: "#890E74", dark: "#BF0AA1" }, // 310°
    { id: 11, name: "Culture",   light: "#900E5A", dark: "#C90B7A" }, // 325° pink
    { id: 12, name: "Promises",  light: "#950F3B", dark: "#CE0B4C" }, // 340° rose
];

const UNKNOWN_CATEGORY_COLOR = "#475569";

/* light set as the default export surface so any
   caller that does not know about themes keeps working. */
const CATEGORY_COLORS = CATEGORY_DEFS.map(({ id, name, light }) => ({ id, name, color: light }));
const CATEGORY_COLORS_DARK = CATEGORY_DEFS.map(({ id, name, dark }) => ({ id, name, color: dark }));

const CATEGORY_PALETTE = CATEGORY_COLORS.map((c) => c.color);
const CATEGORY_PALETTE_DARK = CATEGORY_COLORS_DARK.map((c) => c.color);
const ALL_CATEGORIES = CATEGORY_DEFS.map((c) => c.name);

// provides tshe set that matches the theme currently painted 
function getCategoryColors(theme) {
    return theme === "dark" ? CATEGORY_COLORS_DARK : CATEGORY_COLORS;
}

export {
    CATEGORY_COLORS,
    CATEGORY_COLORS_DARK,
    CATEGORY_PALETTE,
    CATEGORY_PALETTE_DARK,
    ALL_CATEGORIES,
    UNKNOWN_CATEGORY_COLOR,
    getCategoryColors
};

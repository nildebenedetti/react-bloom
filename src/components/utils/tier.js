import { LeafFill, AwardFill, TrophyFill, Stars } from 'react-bootstrap-icons';


const TIERS = [
    { id: "tier_1", label: 'Small win', Icon: LeafFill, light: "#10469E", dark: "#478AF5" },
    { id: "tier_2", label: 'Solid step', Icon: AwardFill, light: "#0C4F79", dark: "#0C91E4" },
    { id: "tier_3", label: 'Major milestone', Icon: TrophyFill, light: "#0A5361", dark: "#0A99B6" },
    { id: "tier_4", label: 'Epic breakthrough', Icon: Stars, light: "#08544F", dark: "#089D94" },
];

// unknown color
const UNKNOWN_TIER_COLOR = "#334155";
const UNKNOWN_TIER_COLOR_DARK = "#94A3B8";

// colors maps
const TIER_COLORS = TIERS.map( ({ id, label, light}) => ({ id, label, color:light }));
const TIER_COLORS_DARK = TIERS.map( ({ id, label, dark}) => ({ id, label, color:dark }));

// palettes
const TIER_PALETTE = TIER_COLORS.map( (tier) => tier.color);
const TIER_PALETTE_DARK = TIER_COLORS_DARK.map( (tier) => tier.color);

// select set based on theme
function getTierColors(theme) {
    return theme === "dark" ? TIER_COLORS_DARK : TIER_COLORS;
}

// select unknown color
function getUnknownTierColor(theme) {
    return theme === "dark" ?  UNKNOWN_TIER_COLOR_DARK : UNKNOWN_TIER_COLOR;
}

export {
    TIERS,
    UNKNOWN_TIER_COLOR,
    UNKNOWN_TIER_COLOR_DARK,
    TIER_COLORS,
    TIER_COLORS_DARK,
    TIER_PALETTE,
    TIER_PALETTE_DARK,
    getTierColors,
    getUnknownTierColor
};
import { Area, AreaChart, CartesianGrid, createHorizontalChart, Tooltip, XAxis, YAxis, ResponsiveContainer, Legend} from 'recharts';
import { TIER_COLORS, TIER_COLORS_DARK, UNKNOWN_TIER_COLOR, UNKNOWN_TIER_COLOR_DARK, getTierColors, getUnknownTierColor} from "../utils/tier.js";
import useTheme from '../../hooks/useTheme.js';


function VelocityImpactAreaChart({ rawData = [], title = "Velocity vs. Impact"}) {
    const { theme } = useTheme();
    const tierColors = getTierColors(theme);
    const unknownColor = getUnknownTierColor(theme);

    const areaData = rawData.map( (item) => {
        // Rechart required format - iterating each item
        // we assign month as per item
        const formattedItem = { month: item.month};

        // we add all tiers IDs and assign either the count or 0
        tierColors.forEach( (tier) => {
            formattedItem[tier.id] = Number(item[tier.id]) || 0;
        });

        return formattedItem;

    })

    // if empty
    if (areaData.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-muted small mb-0">No data avaiilable for the selected period.</p>
            </div>
        );
    }

    return <div style={{ width: '100%', height: 350 }}>
        {title && <h4 className="text-center">{title}</h4>}
        <ResponsiveContainer>
            <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="month"/>
                <YAxis allowDecimals={false}/>
                <Tooltip />
                <Legend />
                {tierColors.map( (tier) => {
                    return <Area 
                                key={tier.id}
                                type="monotone"
                                dataKey={tier.id}
                                stackId="1"
                                fill={tier.color}
                                name={tier.label}                               
                            />
                })}
            </AreaChart>
        </ResponsiveContainer>
    </div>
}
export default VelocityImpactAreaChart;
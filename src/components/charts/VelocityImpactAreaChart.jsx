import { Area, AreaChart, Tooltip, XAxis, YAxis, ResponsiveContainer, Legend} from 'recharts';
import { TIER_COLORS, TIER_COLORS_DARK, UNKNOWN_TIER_COLOR, UNKNOWN_TIER_COLOR_DARK, getTierColors, getUnknownTierColor} from "../utils/tier.js";
import { generateMonthsRange } from '../utils/functions.js';
import useTheme from '../../hooks/useTheme.js';


function VelocityImpactAreaChart({ rawData = [], title = "Velocity vs. Impact"}) {
    const { theme } = useTheme();
    const tierColors = getTierColors(theme);
    const unknownColor = getUnknownTierColor(theme);

    // if empty
    if (rawData.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-muted small mb-0">No data avaiilable for the selected period.</p>
            </div>
        );
    }

    const sortedData = [...rawData].sort((a,b) => a.month.localeCompare(b.month));
    
    const startMonth = sortedData[0].month;
    const endMonth = sortedData[sortedData.length - 1].month;

    // generate month range
    const fullMonthRange = generateMonthsRange(startMonth, endMonth);

    // all existing months
    const sortedDataByMonth = {};

    sortedData.forEach( (item) => {
        // create a new entry with key === item.month and value item, which is data
        sortedDataByMonth[item.month] = item;
    })

    const areaData = fullMonthRange.map( (monthString) => {
        // create an item for each monthString, adding data if present in sortedDataByMonth
        const item = sortedDataByMonth[monthString] || {};
        // Rechart required format - iterating each item
        // we assign month as per item
        const formattedItem = { month: monthString};

        // we add all tiers IDs and assign either the count or 0
        tierColors.forEach( (tier) => {
            formattedItem[tier.id] = Number(item[tier.id]) || 0;
        });

        return formattedItem;

    })


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
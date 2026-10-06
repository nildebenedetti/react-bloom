import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import { getCategoryColors, getUnknownCategoryColor } from '../utils/categories.js';
import useTheme from '../../hooks/useTheme.js';

function CategoriesPieChart( { rawData = [], title = "Categories Distribution" }) {

    /* The slices are SVG fills, so they cannot read the CSS tokens — this is
     * the reason the palette is exported as JS (PRD §3.1). The set is picked
     * from the live theme so the chart is tuned for this theme's surfaces. */
    const { theme } = useTheme();
    const categoryColors = getCategoryColors(theme);
    const unknownColor = getUnknownCategoryColor(theme);

    const pieData = rawData.map (item => {
        // lookup if I can find the map 
        const foundCat = categoryColors.find( cat => cat.name.toLocaleLowerCase() === item.category?.toLocaleLowerCase()
        );
        // prepare data: if found use those otherwise insert fallback 0 count and neutral color
        return {
            name: item.category,
            value: Number(item.count) || 0,
            fill: foundCat ? foundCat.color : unknownColor
        }

    }).filter( item => item.value > 0); // filter only if count > 0



    // if empty
    if (pieData.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-muted small mb-0">No data avaiilable for the selected period.</p>
            </div>
        );
    }

    return <div style={{ width: '100%', height: 240 }}>
        {title && <h4 className="text-center">{title}</h4>}
        <ResponsiveContainer className="w-100 h-100">
            <PieChart>
                <Pie 
                    data={pieData}
                    dataKey="value" // which key contains the number to be represented
                    nameKey="name" // name label
                    startAngle={180}
                    endAngle={0}
                    cx="50%" //center x
                    cy="80%" // center y
                    outerRadius="110%"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                />
            </PieChart>
        </ResponsiveContainer>
    
    
    </div>
}
export default CategoriesPieChart;
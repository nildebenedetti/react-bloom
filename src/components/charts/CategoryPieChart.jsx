import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import { getCategoryColors, getUnknownCategoryColor } from '../utils/categories.js';
import useTheme from '../../hooks/useTheme.js';

function CategoriesPieChart( { rawData = [], title = "Records by Category" }) {

    /* The slices are SVG fills, so they cannot read the CSS tokens — this is
     * the reason the palette is exported as JS (PRD §3.1). The set is picked
     * from the live theme so the chart is tuned for this theme's surfaces. */
    const { theme } = useTheme();
    const categoryColors = getCategoryColors(theme);
    const unknownColor = getUnknownCategoryColor(theme);

    const pieData = rawData.map (item => {
        // lookup category name in category colors map
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

    // Calculate the sum of all values in the dataset
    const total = pieData.reduce( (sum, item) => sum + item.value, 0);

    // Create a new array with all original properties plus the calculated percentage
    const legendItems = pieData.map( item => ({
        ...item,
        // Avoid division by zero: compute percentage if total > 0, otherwise default to 0
        percent: total > 0 ? (item.value / total) * 100 : 0
    }));

    // auto-height wrapper: title + subtitle stay in flow above the chart instead
    // of being pushed past the box; the chart keeps its own 240px.
    return <div style={{ width: '100%' }}>
        {title && <h4 className="text-center mt-3">{title}</h4>}
        <p className="text-muted small mb-3 text-center">
            How your Records are split across Categories
        </p>
        <ResponsiveContainer className="w-100" height={240}>
            <PieChart margin={{ top: 0, right: 30, bottom: 10, left: 30}}>
                <Pie
                    data={pieData}
                    dataKey="value" // which key contains the number to be represented
                    nameKey="name" // name label
                    cx="50%" //center x
                    cy="50%" // center y
                    outerRadius="70%"
                    labelLine={false} // no leader lines: names live in the legend below
                    label={false}
                />
                <Tooltip
                    formatter={ (value, name) => [
                        `${value} (${ total > 0 ? ((value / total) * 100).toFixed(0) : 0 }%)`,
                        name
                    ]}
                />
            </PieChart>
        </ResponsiveContainer>

        {/* HTML legend: flex-wrap + gap means it can never overlap, whatever
            the number of categories. */}
        <ul className="pie-legend mt-2 mb-0">
            {legendItems.map( item => (
                <li key={item.name} className="pie-legend-item">
                    <span className="pie-legend-dot" style={{ backgroundColor: item.fill }}></span>
                    <span className="pie-legend-name">{item.name}</span>
                    <span className="pie-legend-percent">{item.percent.toFixed(0)}%</span>
                </li>
            ))}
        </ul>
    </div>
}
export default CategoriesPieChart;
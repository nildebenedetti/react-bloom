    import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
    } from "recharts";
    import { EMOTIONS, lightColor, darkColor } from "../utils/emotions.js";
    import useTheme from "../../hooks/useTheme.js";

    function EmotionsRadarChart({ rawData = [], title = "Emotions Distribution" }) {
    const { theme } = useTheme();
    const radarColor = theme === "dark" ? darkColor : lightColor;

    // guard: caller may pass undefined/non-array while loading
    const records = Array.isArray(rawData) ? rawData : [];

    // map emotions with count slot
    const emotionCounts = {};
    records.forEach((record) => {
        // if the record icludes emotion key, we create same key in emotionCounts with value count num
        if (record?.emotion) {
        const key = String(record.emotion).toLowerCase();
        // same emotion can appear more than once: accumulate instead of overwrite
        emotionCounts[key] =
            (emotionCounts[key] || 0) + (Number(record.count) || 0);
        }
    });

    const radarData = EMOTIONS.map((emotion) => {
        const key = emotion.id.toLowerCase();
        // format each emotion row
        return {
        name: emotion.label,
        // the value corresponding to record count or zero if not present in records
        value: emotionCounts[emotion.id.toLowerCase()] || 0,
        };
    });

    console.log(radarData);

  // if empty
    if (radarData.length === 0) {
        return (
        <div className="text-center py-4">
            <p className="text-muted small mb-0">
            No data avaiilable for the selected period.
            </p>
        </div>
        );
    }

    return (
        <div
        style={{
            width: "100%",
            height: "100%",
            maxWidth: "500px",
            maxHeight: "80vh",
            aspectRatio: 1,
        }}
    >
        <ResponsiveContainer className="w-100 h-100">
            { title && <h4 className="text-center">{title}</h4> }
            <RadarChart data={radarData}>
            <PolarGrid />
                <PolarAngleAxis dataKey="name"/>
                <PolarRadiusAxis allowDecimal="false" />
                    <Radar 
                            dataKey="value" 
                            stroke={radarColor}
                            fill={radarColor}
                            fillOpacity={0.5} />
            <Tooltip />
            </RadarChart>
        </ResponsiveContainer>
        </div>
    );
    }
export default EmotionsRadarChart;

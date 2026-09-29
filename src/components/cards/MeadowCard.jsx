import { useMemo } from 'react';
// Nota: l'import del CSS module è commentato perché MeadowCard.module.css è
// vuoto (0 byte) e "styles" non veniva usato → rompeva `npm run lint` con
// no-unused-vars. Riattiva `import styles from './MeadowCard.module.css'`
// quando scriverai le regole della card nel CSS module.
import './MeadowCard.module.css';

// placeholders
const PLACEHOLDER_IMAGES = [
    '/images/placeholders/placeholder-1.png',
    '/images/placeholders/placeholder-2.png',
    '/images/placeholders/placeholder-3.png',
    '/images/placeholders/placeholder-4.png',
];

// picker function
const pickPlaceholder = () =>
    PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];

function MeadowCard({ record }) {

    // Memoizes the image URL or fallback placeholder to ensure visual stability across re-renders.
    // Prevents re-running `pickPlaceholder()` unless `record.attributes.image_path` changes or a new component mounts.
    const imageSrc = useMemo(
        () => record.attributes.image_path || pickPlaceholder(), // attribute this value
        [record.attributes.image_path], //dependencies array: do it everytime this changes (as useEffect)
    );

    return <>
        <div className="container">
            <div className="tier-badge badge">
                {record.attributes.tier.name}
            </div>
            <div className="img-container">
                <img
                    src={imageSrc}
                    alt={record.attributes.image_alt ?? record.attributes.title}
                    className="img-fluid"
                />
            </div>

            <h3>{record.attributes.title}</h3>

            <div className="emotions">
                {record.attributes.emotions.map((emotion) => {
                    return <div key={emotion.id} className="badge rounded-pill" style={{ backgroundColor: emotion.color }}>
                        {emotion.name}
                    </div>;
                })}
            </div>
        </div>
    </>
}
export default MeadowCard;

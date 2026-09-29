import { useMemo } from 'react';
import styles from './MeadowCard.module.css';

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
        <div className={` ${styles.glassCard} card h-100 p-3`}>
            {/* flex-grow-1 on .card-top, absorbing slack */}
            <div className="card-top d-flex flex-column flex-grow-1">

                <div className="d-flex justify-content-between">
                    <h3>{record.attributes.title}</h3>
                    <div className="tier-badge badge">
                        {record.attributes.tier.name}
                    </div>
                </div>
                <div className="img-container mt-auto">
                    <img
                        src={imageSrc}
                        alt={record.attributes.image_alt ?? record.attributes.title}
                        className={`${styles.cardImg} w-100 object-fit-cover`}
                    />
                </div>
            </div>
            <div className="card-body d-flex flex-column">
                <div className="emotions">
                    {record.attributes.emotions.map((emotion) => {
                        return <div key={emotion.id} className="badge rounded-pill" style={{ backgroundColor: emotion.color }}>
                            {emotion.name}
                        </div>;
                    })}
                </div>
                <div className={`${styles.description}`}>
                    {record.attributes.description}
                </div>
                <div className="btn-wrapper">
                    <button type="button" className="btn-lightblue">
                        Open
                    </button>
                </div>
                
            </div>
            
        </div>
    </>
}
export default MeadowCard;

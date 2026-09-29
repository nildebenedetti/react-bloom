import { useMemo } from 'react';
// Nota: l'import del CSS module è commentato perché MeadowCard.module.css è
// vuoto (0 byte) e "styles" non veniva usato → rompeva `npm run lint` con
// no-unused-vars. Riattiva `import styles from './MeadowCard.module.css'`
// quando scriverai le regole della card nel CSS module.
import './MeadowCard.module.css';

// La lista dei placeholder va scritta a mano: i file dentro public/ vengono
// copiati così come sono e non entrano nel module graph di Vite, quindi
// import.meta.glob non li vede. Se aggiungi un file in public/images/placeholders
// ricordati di aggiungerlo anche qui, altrimenti non verrà mai usato.
const PLACEHOLDER_IMAGES = [
    '/images/placeholders/placeholder-1.png',
    '/images/placeholders/placeholder-2.png',
    '/images/placeholders/placeholder-3.png',
    '/images/placeholders/placeholder-4.png',
];

const pickPlaceholder = () =>
    PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];

function MeadowCard({ record }) {

    // image_path è null su 5 record su 6: quando al record manca l'immagine ne
    // sorteggiamo una a caso tra i placeholder.
    //
    // useMemo con record.id è importante: il sorteggio avviene una volta sola per
    // record. Se chiamassi Math.random() direttamente nel render, ogni re-render
    // (qualsiasi setState, anche di un'altra card) cambierebbe l'immagine e la
    // card "lampeggerebbe" passando da un placeholder all'altro.
    const imageSrc = useMemo(
        () => record.attributes.image_path || pickPlaceholder(),
        [record.attributes.image_path],
    );

    return <>
        <div className="container">
            <div className="tier-badge badge">
                {record.attributes.tier.name}
            </div>

            {/* image_path è null su 5 record su 6 e image_alt è null su tutti e 6.
                L'immagine è quindi opzionale: imageSrc ricade sul placeholder
                quando il record non ne ha una, così non renderizziamo mai
                <img src={null}> (immagine rotta). Il fallback ?? copre sia null
                sia undefined e usa il titolo quando manca l'alt. */}
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

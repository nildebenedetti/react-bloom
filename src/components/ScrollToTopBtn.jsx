import { useScrollToTop } from "../hooks/useScrollToTop.js"
import { ArrowUp } from "react-bootstrap-icons";
import styles from './ScrollToTopBtn.module.css';

function ScrollToTopBtn() {

    const { isVisible, scrollToTop } = useScrollToTop(300);

    if (!isVisible) return null;
    
    return <>
        <button type="button"
                className={`${styles.scrollUpBtn}`}
                onClick={scrollToTop}
                aria-label="Torna in alto"
                >
                    <ArrowUp size={18} />
                </button>
    </>
}
export default ScrollToTopBtn;
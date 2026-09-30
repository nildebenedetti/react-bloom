import { useState, useEffect } from "react";

export const useScrollToTop = ( threshold = 300 ) => {
    const [ isVisible, setIsVisible ] = useState(false);

    // scroll up btn is visible only when we scroll down the viewport
    // 
    useEffect (() => {

        const handleScroll = () => {

            setIsVisible(window.scrollY > threshold);

        };

        window.addEventListener('scroll', handleScroll);

        // cleanup function, before re-render!!!
        return () => window.removeEventListener('scroll', handleScroll);

    }, [threshold]);

    const scrollToTop = () => {
        window.scrollTo({
            top:0,
            left:0,
            behavior: 'smooth'
        });
    };

    return { isVisible, scrollToTop };
};
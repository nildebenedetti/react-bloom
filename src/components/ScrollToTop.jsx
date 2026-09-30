// useLayoutEffect: like useEffect, but runs synchronously before 
// browser repaint (for DOM measurements & avoiding flicker)
import { useLayoutEffect } from "react";
// useLocation: React Router hook that returns the current 
// route/URL object (pathname, search, hash, state)
import { useLocation } from "react-router";

// everytime the pathname changes, re-scroll up and left
// to resemble page change <3
// WHEN: BEFORE browser repaint -> avoid thus flickering

function ScrollToTop() {
    const { pathname } = useLocation(); 

    useLayoutEffect( () =>{
        window.scrollTo({
            top:0,
            left:0,
            behavior: "instant"
        });
    }, [pathname]);

    return null;
}
export default ScrollToTop;

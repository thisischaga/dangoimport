import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant" // We want it to be instant, not smooth scroll, so it starts immediately at the top
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;

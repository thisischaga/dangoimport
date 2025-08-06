import { useRef, useState, useEffect } from "react";


const useInView = (options) => {

  const ref = useRef()
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry])=>{
        if (entry.isIntersecting)
            setIsVisible(true);
    }, options);

    if (ref.current)
        observer.observe(ref.current);
  
    return () => {
      observer.disconnect();
    }
  }, [options])
  
  return [ref, isVisible]

   
}
  
export default useInView;
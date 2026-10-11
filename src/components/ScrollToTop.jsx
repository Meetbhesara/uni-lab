import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component:
 * Listens to location changes (pathname, search, hash) and automatically
 * scrolls the window to top (0, 0) or to the target hash/survey element.
 */
const ScrollToTop = () => {
    const { pathname, search, hash } = useLocation();

    useEffect(() => {
        // If there is a hash anchor (e.g. #survey-solutions)
        if (hash) {
            const target = document.getElementById(hash.replace('#', ''));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                return;
            }
        }

        // If there is a survey query param, allow page component or smooth scroll to it
        const params = new URLSearchParams(search);
        const survey = params.get('survey');
        if (survey) {
            setTimeout(() => {
                const surveyElem = document.getElementById(survey) || document.getElementById('survey-solutions');
                if (surveyElem) {
                    surveyElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }
            }, 100);
            return;
        }

        // Default behavior on any route/query change: scroll to the top of the page
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, [pathname, search, hash]);

    return null;
};

export default ScrollToTop;

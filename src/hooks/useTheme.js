import { useEffect, useState } from 'react';

export default function useTheme() {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.add(savedTheme);
        } else {
            localStorage.setItem('theme', 'light');
            document.documentElement.classList.add('light');
        }
    }, []);

    const toggleTheme = (newTheme) => {
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.remove(theme);
        document.documentElement.classList.add(newTheme);
        setTheme(newTheme);
    };

    return { theme, toggleTheme };
}

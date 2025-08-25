"use client"
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton = ({children}: {children: React.ReactNode}) => {

	const scrollToTop = () => {
		window.scrollTo({
		top: 0,
		behavior: 'smooth', // for a smooth scrolling experience
		});
	};

	return (
		<button type="button" onClick={() => scrollToTop()} className="font-medium flex focus:outline-none text-center hover:cursor-pointer hover:text-gray-300 transition">
			{children}
		</button>
  	);
};
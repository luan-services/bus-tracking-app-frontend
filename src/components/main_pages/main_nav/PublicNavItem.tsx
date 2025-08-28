import Link, { LinkProps } from 'next/link'; // 1. Import Link and its props type
import React from 'react';

// 2. Update the interface to extend LinkProps
// I've also renamed it for clarity.
interface PublicNavItemProps extends LinkProps {
  children?: React.ReactNode;
  className?: string;
}

export const PublicNavItem = ({children, className, href, ...props}: PublicNavItemProps) => { 

	const ClassName = `${className} flex px-3 py-2 rounded-md items-center hover:bg-custom-light-green transition duration-200`;

	return (
		// 4. Use the Link component and pass the necessary props
		<Link href={href} className={ClassName} {...props}>
			<span className="text-gray-600 text-center text-sm group-hover:text-custom-dark-green font-medium">
				{children}
			</span>
		</Link>
	);
}
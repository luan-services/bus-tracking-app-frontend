import Link, { LinkProps } from 'next/link';
import React from 'react';

interface FooterNavItemProps extends LinkProps {
  children?: React.ReactNode;
  className?: string;
}

export const FooterNavItem = ({children, className, href, ...props}: FooterNavItemProps) => { 

	const ClassName = `${className} flex px-3 py-2 rounded-md items-center hover:bg-custom-light-green hover:text-green-900 transition duration-200`;

	return (
		// 4. Use the Link component and pass the necessary props
		<Link href={href} className={ClassName} {...props}>
			<span className="text-sm font-medium">
				{children}
			</span>
		</Link>
	);
}
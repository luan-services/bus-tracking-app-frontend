"use client"
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X} from 'lucide-react';

export const PublicNavbar = () => {
    // State to manage whether the mobile menu is open or closed
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="flex w-full bg-white justify-center shadow-md border-b-1 border-gray-300">
            <div className="flex container px-8 md:px-20 items-center justify-between min-h-14"> {/* container p impedir crescimento excessivo */}

                {/* Brand/Logo */}
                <div className="flex">
                    <Link href="/" className="text-2xl font-bold text-green-700">
                        BrandLogo
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex">
                    <div className="ml-10 flex items-baseline space-x-4">
                        <Link href="/" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                            Início
                        </Link>
                        <Link href="/#linhas" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                            Linhas
                        </Link>
                        <Link href="/dashboard" className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                            Acesso Restrito
                        </Link>
                    </div>
                </div>

                {/* Hamburger Button (Mobile) 🍔 */}
                <div className="-mr-2 flex md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        type="button"
                        className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
                        aria-controls="mobile-menu"
                        aria-expanded="false"
                    >
                        <span className="sr-only">Abrir menu principal</span>
                        {/* Icon: Menu (hamburger) when closed, X when open */}
                        {!isOpen ? (
                            <Menu strokeWidth={2.5} size={20}></Menu>
                        ) : (
                            <X strokeWidth={2.5} size={20}></X>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Panel */}
            <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <Link href="/" onClick={() => setIsOpen(false)} className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                        Início
                    </Link>
                    <Link href="/#linhas" onClick={() => setIsOpen(false)} className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                        Linhas
                    </Link>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                        Acesso Restrito
                    </Link>
                </div>
            </div>
        </nav>
    );
};
"use client"
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X} from 'lucide-react';

export const PublicNavbar = () => {
    // State to manage whether the mobile menu is open or closed
    const [isOpen, setIsOpen] = useState(false);

    return (
        // Set position to relative to contain the absolutely positioned menu
        <nav className="relative flex w-full bg-white justify-center shadow-md border-b-1 border-gray-300">

            {/* itens do navbar */}
            <div className="flex container px-8 md:px-32 items-center justify-between min-h-14">

                <div className="flex">
                    <Link href="/" className="text-2xl font-bold text-green-700">
                        BrandLogo
                    </Link>
                </div>

                {/* menu desktop */}
                <div className="hidden md:flex gap-4">
                        <Link href="/" className="text-gray-600 px-3 py-2 rounded-md text-sm transition duration-200 hover:bg-green-1 hover:text-green-900 font-medium ">
                            Início
                        </Link>
                        <Link href="/lines" className="text-gray-600 px-3 py-2 rounded-md text-sm transition duration-200 hover:bg-green-1 hover:text-green-900 font-medium ">
                            Linhas
                        </Link>
                        <Link href="/login" className="text-gray-600 px-3 py-2 rounded-md text-sm transition duration-200 hover:bg-green-1 hover:text-green-900 font-medium ">
                            Acesso Restrito
                        </Link>
                </div>

                {/* botão hamburguer (mobile) */}
                <div className="flex md:hidden">
                    <button className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-lg active:scale-95 transition duration-300 text-gray-500 hover:text-gray-700 hover:bg-gray-200 focus:outline-0 border-1 border-gray-200" 
                        onClick={() => setIsOpen(!isOpen)} type="button">
                            <Menu strokeWidth={2.5} size={20}></Menu>
                    </button>
                </div>

            </div>



            {/* menu backdrop */}
            {isOpen &&
                <div className="fixed inset-0 bg-black opacity-50 z-[2000] md:hidden" onClick={() => setIsOpen(false)}></div>
            }

            {/* menu (mobile) */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-[3000] transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                <div className="flex flex-col px-2 py-3 gap-2">
                    
                    <button className="self-end bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-200 focus:outline-0"
                        onClick={() => setIsOpen(false)} type="button">
                            <X strokeWidth={2.5} size={20}></X>
                    </button>

                    <span className="text-gray-500 border-t border-gray-300"></span>

                    <Link href="/" onClick={() => setIsOpen(false)} className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-sm font-medium">
                        Início
                    </Link>
                    <Link href="/lines" onClick={() => setIsOpen(false)} className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-sm font-medium">
                        Linhas
                    </Link>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-sm font-medium">
                        Acesso Restrito
                    </Link>
                </div>
            </div>
        </nav>
    );
};
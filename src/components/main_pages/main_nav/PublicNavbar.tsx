"use client"
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X} from 'lucide-react';
import buzondLogo from '@/images/buzond_logo.png';
import Image from 'next/image';

export const PublicNavbar = () => {
    // State to manage whether the mobile menu is open or closed
    const [isOpen, setIsOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMobileMenu = () => {
        setIsOpen(false);
    };

    return (
        // Set position to relative to contain the absolutely positioned menu
        <nav className="relative flex w-full bg-white justify-center shadow-md border-b-1 border-gray-300">

            {/* itens do navbar */}
            <div className="flex container px-8 items-center justify-between min-h-14">

                <div className="flex">
                    <Link href="/" className="text-2xl py-2 font-bold text-green-700">
                        <Image src={buzondLogo} width="140" alt="logo.png" placeholder="blur"/>
                    </Link>
                </div>

                {/* menu desktop */}
                <div className="hidden md:flex gap-2">
                    <Link className="flex px-3 py-2 rounded-md items-center hover:bg-custom-light-green transition duration-200" href="/">
                        <span className="text-gray-600 text-center text-sm hover:text-green-900 font-medium">
                            Início
                        </span>
                    </Link>
                    
                    <Link className="flex px-3 py-2 rounded-md items-center hover:bg-custom-light-green transition duration-200"  href="/lines">
                        <span className="text-gray-600 text-center text-sm hover:text-green-900 font-medium">
                            Mapa Iterativo
                        </span>
                    </Link>

                    <Link className="flex px-3 py-2 rounded-md items-center hover:bg-custom-light-green transition duration-200"  href="/contact"> {/* essa pagina vai mostrar a informação de cada linha diretamente nela, sem ir para uma página própria após selecionar a linha */}
                        <span className="text-gray-600 text-center text-sm hover:text-green-900 font-medium">
                            Informações de Linhas
                        </span>
                    </Link>

                    <Link className="flex px-3 py-2 rounded-md items-center hover:bg-custom-light-green transition duration-200"  href="/contact"> {/* essa pagina vai mostrar a informação de cada linha diretamente nela, sem ir para uma página própria após selecionar a linha */}
                        <span className="text-gray-600 text-center text-sm hover:text-green-900 font-medium">
                            Rastreamento de Linhas
                        </span>
                    </Link>

                    <Link className="flex px-3 py-2 rounded-md items-center hover:bg-custom-light-green transition duration-200"  href="/contact"> {/* essa pagina vai mostrar a informação de cada linha diretamente nela, sem ir para uma página própria após selecionar a linha */}
                        <span className="text-gray-600 text-center text-sm over:text-green-900 font-medium">
                            Como Funciona
                        </span>
                    </Link>

                    <Link className="flex px-3 py-2 rounded-md items-center hover:bg-custom-light-green transition duration-200"  href="/contact">
                        <span className="text-gray-600 text-center text-sm hover:text-green-900 font-medium">
                            Contato
                        </span>
                    </Link>
                </div>

                {/* botão hamburguer (mobile) */}
                <div className="flex md:hidden">
                    <button className="bg-gray-200 items-center justify-center p-2 rounded-lg active:scale-80 transition duration-300 text-gray-500 focus:outline-none border-1 border-gray-300" 
                        onClick={() => toggleMobileMenu()} type="button">
                            <Menu strokeWidth={2.5} size={20}></Menu>
                    </button>
                </div>

            </div>



            {/* menu backdrop */}
            {isOpen &&
                <div className="fixed w-full h-full bg-black opacity-50 z-[2000] md:hidden" onClick={() => setIsOpen(false)}/>
            }

            {/* menu (mobile) */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-[3000] transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                <div className="flex flex-col px-2 py-3 gap-2">
                    
                    <div className="flex md:hidden justify-end">
                        <button className="bg-gray-200 items-center justify-center p-1.5 rounded-lg active:scale-80 transition duration-300 text-gray-500 focus:outline-none border-1 border-gray-300" 
                            onClick={() => closeMobileMenu()} type="button">
                                <X strokeWidth={2.5} size={20}></X>
                        </button>
                    </div>

                    <span className="text-gray-500 border-b h-2 border-gray-300"></span>

                    <Link className="px-3 py-2 rounded-md active:bg-custom-light-green transition duration-400" href="/">
                        <span className="text-gray-600 text-sm active:text-green-900 font-medium">
                            Início
                        </span>
                    </Link>
                    
                    <Link className="px-3 py-2 rounded-md active:bg-custom-light-green transition duration-400" href="/lines">
                        <span className="text-gray-600 text-sm active:text-green-900 font-medium">
                            Mapa Iterativo
                        </span>
                    </Link>

                    <Link className="px-3 py-2 rounded-md active:bg-custom-light-green transition duration-400" href="/contato">
                        <span className="text-gray-600 text-sm active:text-green-900 font-medium">
                            Informações de Linhas
                        </span>
                    </Link>

                    <Link className="px-3 py-2 rounded-md active:bg-custom-light-green transition duration-400" href="/contato">
                        <span className="text-gray-600 text-sm active:text-green-900 font-medium">
                            Rastreamento de Linhas
                        </span>
                    </Link>

                    <Link className="px-3 py-2 rounded-md active:bg-custom-light-green transition duration-400" href="/contato">
                        <span className="text-gray-600 text-sm active:text-green-900 font-medium">
                            Como Funciona
                        </span>
                    </Link>

                    <Link className="px-3 py-2 rounded-md active:bg-custom-light-green transition duration-400" href="/contato">
                        <span className="text-gray-600 text-sm active:text-green-900 font-medium">
                            Contato
                        </span>
                    </Link>

                </div>
            </div>
        </nav>
    );
};
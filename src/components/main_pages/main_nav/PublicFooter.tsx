import { SocialIcon } from "./SocialIcon";
import Image from "next/image";
import facebookIcon from "@/images/facebook.svg"
import twitterIcon from "@/images/x.svg"
import instagramIcon from "@/images/instagram.svg"
import buzondLogo from "@/images/buzond_logo.png"
import { ScrollToTopButton } from "./ScrollToTopButton";
import Link from "next/link";
import { FooterNavItem } from "./FooterNavItem";

export const PublicFooter = () => {
    return (
        <footer className="flex flex-col w-full items-center justify-center min-h-80 px-6 py-12 bg-custom-dark-green border-t border-black text-white">




            <div className="flex flex-col gap-4 container lg:px-24">
                
                <div className="w-full border-b-1 border-white"></div>

                <div className="w-full justify-center items-center flex py-6 gap-4">

                
                    <div className="flex w-full justify-evenly items-center flex-wrap gap-2">
                        
                        <div className="flex font-bold text-4xl text-white select-none">BuzOnd</div>

                        <div className="flex flex-col w-full sm:w-auto">
                            <FooterNavItem href="/">
                                Início
                            </FooterNavItem>

                            <FooterNavItem href="/about">
                                Como Funciona
                            </FooterNavItem>
                        
                            <FooterNavItem href="/contact">
                                Contato
                            </FooterNavItem>
                        </div>

                        <div className="flex flex-col w-full sm:w-auto">
                        <FooterNavItem href="/map">
                            Mapa Iterativo
                        </FooterNavItem>
                
                        <FooterNavItem href="/lines">
                            Informações de Linhas
                        </FooterNavItem>
                
                        <FooterNavItem href="/about">
                            Rastreamento de Linhas
                        </FooterNavItem>
                        </div>
                    

                    </div>
                </div>


                <div className="w-full border-b-1 border-white"></div>

                <div className="flex w-full justify-between items-center py-2">

                    <div className="flex flex-wrap">
                        <Link href="/" className="inline hover:cursor-pointer text-white hover:text-gray-300 transition mr-2">Políticas de Privacidade</Link>
                        <Link href="/" className="inline hover:cursor-pointer text-white hover:text-gray-300 transition">Termos de Uso</Link>
                    </div>

                    <div className="flex">
                        <Image src={buzondLogo} width="140" alt="logo.png" placeholder="blur"/>
                    </div>
                </div>

                <div className="flex flex-col gap-4 md:gap-0 md:flex-row w-full justify-between items-center">
                    <div className="flex flex-1 items-center">
                        <span className="text-sm">&copy; {new Date().getFullYear()} Buzond. Todos os direitos reservados.</span>
                    </div>

                    <div className="flex w-5/10 justify-center">
                        <ScrollToTopButton>
                            Voltar ao Topo
                        </ScrollToTopButton>
                    </div>

                    <div className="flex flex-1 justify-end">
                        <div className="flex items-center gap-4">
                            <SocialIcon href="https://facebook.com.br">
                                <Image src={facebookIcon} alt="facebook icon"></Image>
                            </SocialIcon>
                            <SocialIcon href="https://x.com.br">
                                <Image src={twitterIcon} alt="twttier icon"></Image>
                            </SocialIcon>
                            <SocialIcon href="https://instagram.com.br">
                                <Image src={instagramIcon} alt="instagram icon"></Image>
                            </SocialIcon>
                        </div>
                    </div>
                </div>


            </div>

        </footer>
    );
};
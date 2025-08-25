import { SocialIcon } from "./SocialIcon";
import Image from "next/image";
import facebookIcon from "@/images/facebook.svg"
import twitterIcon from "@/images/x.svg"
import instagramIcon from "@/images/instagram.svg"
import { ScrollToTopButton } from "./ScrollToTopButton";

export const PublicFooter = () => {
    return (
        <footer className="flex w-full justify-center min-h-80 px-6 py-16 bg-custom-dark-green border-t border-black text-gray-100">

            <div className="flex container lg:px-40">

                <div className="flex gap-4 md:gap-0 flex-col md:flex-row w-full justify-between items-center">
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
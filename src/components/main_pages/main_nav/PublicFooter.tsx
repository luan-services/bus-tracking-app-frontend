export const PublicFooter = () => {
    return (
        <footer className="flex w-full justify-center min-h-80 px-6 py-16 bg-custom-dark-green border-t border-black text-white">

            <div className="flex container">

                <div className="flex w-full justify-between">
                    <p className="text-sm">
                        &copy; {new Date().getFullYear()} Buzond. Todos os direitos reservados.
                    </p>

                    <div>
                        <button>
                            Voltar ao topo
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};
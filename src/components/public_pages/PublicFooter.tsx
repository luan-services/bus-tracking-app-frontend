export const PublicFooter = () => {
    return (
        <footer className="bg-white border-t mt-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} BusTrack. Todos os direitos reservados.
                </p>
            </div>
        </footer>
    );
};
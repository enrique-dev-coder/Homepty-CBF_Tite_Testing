export default function SiteNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Sitio no encontrado
        </h2>
        <p className="text-gray-600 mb-8">
          El sitio que estás buscando no existe o ha sido desactivado.
        </p>
        <a
          href="https://homepty.com"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Ir a Homepty
        </a>
      </div>
    </div>
  );
}

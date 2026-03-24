export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to MySaaS
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          The easiest way to get things done.
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium">
          Get Started
        </button>
      </div>
    </main>
  );
}

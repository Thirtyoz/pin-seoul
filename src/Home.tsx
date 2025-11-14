function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Home Page
        </h1>
        <p className="text-green-600 text-xl font-semibold mb-4">
          ✓ Logged In
        </p>
        <p className="text-gray-600">
          You have successfully logged in with Google OAuth.
        </p>
      </div>
    </div>
  )
}

export default Home

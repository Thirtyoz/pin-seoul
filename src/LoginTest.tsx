import { supabase } from './supabaseClient'

function LoginTest() {

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:5175/home'
        }
      })

      if (error) {
        console.error('Login error:', error)
      } else {
        console.log('Login initiated:', data)
        // OAuth will redirect automatically
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Login Test Page
        </h1>
        <p className="text-gray-600 mb-8">
          Test Supabase Google OAuth integration
        </p>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 shadow-md"
        >
          Login with Google
        </button>
      </div>
    </div>
  )
}

export default LoginTest

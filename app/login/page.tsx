import { login } from './actions'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <form className="flex flex-col gap-4 w-full max-w-md border p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        
        <label className="flex flex-col gap-2">
          <span>Email</span>
          <input 
            name="email" 
            type="email" 
            required 
            className="border p-2 rounded text-black"
          />
        </label>
        
        <label className="flex flex-col gap-2">
          <span>Password</span>
          <input 
            name="password" 
            type="password" 
            required 
            className="border p-2 rounded text-black"
          />
        </label>
        
        <button formAction={login} className="bg-black text-white p-2 rounded hover:bg-gray-800">
          Sign In
        </button>
      </form>
    </div>
  )
}
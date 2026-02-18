import { login } from './actions'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <form className="flex flex-col gap-4 w-full max-w-md border p-8 rounded-lg shadow-sm">
        <h1 className="type-title text-(--color-text-primary) mb-4">Admin Login</h1>
        
        <label className="flex flex-col gap-2">
          <span className="type-caption">Email</span>
          <input 
            name="email" 
            type="email" 
            required 
            className="border p-2 rounded text-black"
          />
        </label>
        
        <label className="flex flex-col gap-2">
          <span className="type-caption">Password</span>
          <input 
            name="password" 
            type="password" 
            required 
            className="border p-2 rounded text-black"
          />
        </label>
        
        <button formAction={login} className="type-body bg-black text-white p-2 rounded hover:bg-gray-800">
          Sign In
        </button>
      </form>
    </div>
  )
}
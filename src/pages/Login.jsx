export default function Login() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="p-8 bg-white shadow rounded-xl w-96">
        <h2 className="text-2xl font-bold mb-4">Assetpulse Login</h2>

        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder="Email"
        />

        <input
          type="password"
          className="w-full border p-2 mb-4 rounded"
          placeholder="Password"
        />

        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Login
        </button>
      </div>
    </div>
  );
}
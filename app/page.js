"use client";
import { useState, useEffect } from "react";
import { account, ID } from "../app/appwrite";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');

    // Check if the user is already logged in and redirect them to the clipboard
    useEffect(() => {
        const checkSession = async () => {
            try {
                const session = await account.get();
                if (session) {
                    window.location.href = '/clipboard';
                }
            } catch (e) {
                // No session found, which is expected on the login page
            }
        };
        checkSession();
    }, []);


    const login = async (email, password) => {
        setError('');
        try {
            await account.createEmailPasswordSession(email, password);
            window.location.href = '/clipboard';
        } catch (e) {
            setError("Failed to login. Please check your credentials.");
            console.error(e);
        }
    };

    const register = async () => {
        setError('');
        if (!name) {
            setError("Please provide a name for registration.");
            return;
        }
        try {
            // Appwrite's create method automatically logs the user in.
            // No need to call login() again.
            await account.create(ID.unique(), email, password, name);
            // After successful registration, redirect to the clipboard
            window.location.href = '/clipboard';
        } catch (e) {
            setError("Failed to register. The user might already exist.");
            console.error(e);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isRegistering) {
            register();
        } else {
            login(email, password);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center">
                    {isRegistering ? "Create an Account" : "Welcome Back"}
                </h1>
                <p className="text-center text-gray-400">
                    {isRegistering ? "Sign up to start creating your clipboard." : "Sign in to access your clipboard."}
                </p>

                {error && <p className="text-red-500 bg-red-900/50 p-3 rounded-lg text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                         <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                        {isRegistering ? "Register" : "Login"}
                    </button>
                </form>

                <div className="text-center text-gray-400">
                    <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="hover:text-blue-400 underline">
                        {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;


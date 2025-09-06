"use client";

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden relative">
            {/* Background Animation Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                        ANARCHY
                    </h1>
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-white">
                        CLIPBOARD
                    </h2>
                    
                    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                        <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed">
                            Welcome to the <span className="text-red-400 font-bold">ultimate chaos</span> - an infinite canvas where 
                            <span className="text-yellow-400 font-bold"> ANYONE </span> can drop 
                            <span className="text-blue-400 font-bold"> ANYTHING</span>!
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12">
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700 hover:border-red-500 transition-all duration-300 hover:scale-105">
                                <div className="text-2xl sm:text-3xl mb-2">🔥</div>
                                <h3 className="text-sm sm:text-base font-bold text-red-400 mb-2">FREE MEMES</h3>
                                <p className="text-xs sm:text-sm text-gray-400">Drop your dankest memes</p>
                            </div>
                            
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700 hover:border-yellow-500 transition-all duration-300 hover:scale-105">
                                <div className="text-2xl sm:text-3xl mb-2">📢</div>
                                <h3 className="text-sm sm:text-base font-bold text-yellow-400 mb-2">FREE ADS</h3>
                                <p className="text-xs sm:text-sm text-gray-400">Advertise anything</p>
                            </div>
                            
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:scale-105">
                                <div className="text-2xl sm:text-3xl mb-2">🎨</div>
                                <h3 className="text-sm sm:text-base font-bold text-blue-400 mb-2">FREE ART</h3>
                                <p className="text-xs sm:text-sm text-gray-400">Share your creativity</p>
                            </div>
                            
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:scale-105">
                                <div className="text-2xl sm:text-3xl mb-2">🏴‍☠️</div>
                                <h3 className="text-sm sm:text-base font-bold text-purple-400 mb-2">FREE ANARCHY</h3>
                                <p className="text-xs sm:text-sm text-gray-400">No rules, pure chaos</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mb-8 sm:mb-12 text-center max-w-3xl mx-auto">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 text-gray-200">
                        🚀 NO ACCOUNT REQUIRED 🚀
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="text-green-400 text-lg sm:text-xl">✓</span>
                                <span className="text-sm sm:text-base text-gray-300">Instant access - just jump in!</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-green-400 text-lg sm:text-xl">✓</span>
                                <span className="text-sm sm:text-base text-gray-300">Drag & drop anywhere on infinite canvas</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-green-400 text-lg sm:text-xl">✓</span>
                                <span className="text-sm sm:text-base text-gray-300">Real-time collaboration with everyone</span>
                            </div>
                        </div>
                        
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="text-green-400 text-lg sm:text-xl">✓</span>
                                <span className="text-sm sm:text-base text-gray-300">Mobile & desktop friendly</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-green-400 text-lg sm:text-xl">✓</span>
                                <span className="text-sm sm:text-base text-gray-300">Crosshair targeting system</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-green-400 text-lg sm:text-xl">✓</span>
                                <span className="text-sm sm:text-base text-gray-300">D-pad navigation controls</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center space-y-6 sm:space-y-8">
                    <Link 
                        href="/clipboard" 
                        className="inline-block group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-300 animate-pulse"></div>
                        <div className="relative bg-gradient-to-r from-red-600 via-yellow-600 to-blue-600 hover:from-red-500 hover:via-yellow-500 hover:to-blue-500 px-8 sm:px-12 py-4 sm:py-6 rounded-xl font-bold text-lg sm:text-xl lg:text-2xl text-white shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl border-2 border-white/20">
                            ENTER THE CHAOS 🔥
                        </div>
                    </Link>
                    
                    <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                        Join the madness! Drop images, memes, art, ads - whatever you want on our infinite canvas. 
                        <span className="text-red-400 font-bold"> WARNING:</span> Highly addictive digital anarchy ahead!
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-12 sm:mt-16 text-center">
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700 max-w-2xl mx-auto">
                        <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                            <span className="text-yellow-400 font-bold">RULES:</span> There are no rules. 
                            <span className="text-red-400 font-bold"> BE RESPECTFUL.</span> 
                            Max 400KB per image.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <span>🌐 Global Canvas</span>
                            <span>⚡ Real-time Updates</span>
                            <span>🎯 Precision Placement</span>
                            <span>📱 Touch Friendly</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-10 left-10 text-4xl sm:text-6xl opacity-20 animate-bounce hidden sm:block">🎨</div>
            <div className="absolute bottom-20 right-10 text-4xl sm:text-6xl opacity-20 animate-bounce delay-1000 hidden sm:block">🔥</div>
            <div className="absolute top-1/3 right-1/4 text-3xl sm:text-5xl opacity-20 animate-pulse hidden lg:block">📢</div>
            <div className="absolute bottom-1/3 left-1/4 text-3xl sm:text-5xl opacity-20 animate-pulse delay-500 hidden lg:block">🏴‍☠️</div>
        </div>
    );
}

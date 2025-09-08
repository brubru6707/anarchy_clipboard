"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
            {/* Navigation */}
            <nav className="relative z-10 flex justify-between items-center p-4 sm:p-6 lg:p-8">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AC</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Anarchy Clipboard
                    </h1>
                </div>
                <Link href="/clipboard">
                    <button className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                        Launch App
                    </button>
                </Link>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
                <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Infinite Canvas
                    </h2>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-gray-300">
                        Collaborative Image Sharing
                    </h3>
                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Break free from traditional boundaries. Create, share, and explore images on an endless canvas that adapts to your creativity.
                    </p>
                </div>

                {/* Center Image */}
                <div className="flex justify-center mb-8 sm:mb-12 lg:mb-16">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <div className="relative bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700">
                            <Image
                                src="/images/anarchy_image.jpg"
                                alt="Anarchy Clipboard"
                                width={400}
                                height={300}
                                className="rounded-lg shadow-lg object-cover"
                                priority
                            />
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h4 className="text-xl font-bold mb-3 text-blue-400">Infinite Canvas</h4>
                        <p className="text-gray-300 leading-relaxed">
                            Navigate an endless 2D space with smooth panning, zooming, and D-pad controls. No boundaries, no limits.
                        </p>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <h4 className="text-xl font-bold mb-3 text-purple-400">Smart Upload</h4>
                        <p className="text-gray-300 leading-relaxed">
                            Drag & drop or choose images with automatic HEIC conversion and intelligent compression under 400KB.
                        </p>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 hover:border-green-500 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h4 className="text-xl font-bold mb-3 text-green-400">Real-time Collaboration</h4>
                        <p className="text-gray-300 leading-relaxed">
                            Anonymous collaborative workspace with live updates. Share and discover images instantly with others.
                        </p>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 hover:border-yellow-500 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                        </div>
                        <h4 className="text-xl font-bold mb-3 text-yellow-400">Precision Controls</h4>
                        <p className="text-gray-300 leading-relaxed">
                            Mouse wheel zoom (10%-500%), crosshair targeting, coordinate navigation, and velocity-based movement.
                        </p>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 hover:border-red-500 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h4 className="text-xl font-bold mb-3 text-red-400">Mobile Optimized</h4>
                        <p className="text-gray-300 leading-relaxed">
                            Touch-friendly interface with responsive design, mobile controls, and optimized performance across devices.
                        </p>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h4 className="text-xl font-bold mb-3 text-indigo-400">Lightning Fast</h4>
                        <p className="text-gray-300 leading-relaxed">
                            Built with Next.js 13+ and Appwrite for blazing fast performance, SSR optimization, and smooth interactions.
                        </p>
                    </div>
                </div>

                {/* Important Information Section */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8 lg:p-10 mb-12 sm:mb-16">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                            📋 Important Information
                        </h3>
                        <p className="text-gray-400 text-lg">
                            Everything you need to know before diving in
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs font-bold">📊</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-400 mb-1">Image Limit & Auto-Cleanup</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        Maximum of <strong>100 images</strong> total. When the limit is reached, the oldest images are automatically deleted to make room for new ones.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs font-bold">🗜️</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-purple-400 mb-1">Smart Compression</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        Images larger than <strong>400KB</strong> are automatically compressed. Our intelligent system tries its best to maintain quality while reducing file size.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs font-bold">🎮</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-400 mb-1">Navigation Controls</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        Use the <strong>D-pad controls</strong> for precise movement with velocity acceleration, or drag to pan around the canvas smoothly.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs font-bold">🔍</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-yellow-400 mb-1">Zoom Feature</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        <strong>Mouse wheel zoom</strong> from 10% to 500% scale. Perfect for detailed viewing or getting the big picture of your canvas.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs font-bold">⚠️</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-red-400 mb-1">Community Guidelines</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        <strong>Anyone can upload anything</strong>, but content will be moderated. Please be respectful and follow community standards.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs font-bold">🌍</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-indigo-400 mb-1">Infinite Canvas Etiquette</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        The canvas is <strong>truly infinite</strong>, but please try to stay near the center (0,0) to keep the community together and discoverable.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs font-bold">🎉</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-pink-400 mb-1">Creative Freedom</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        Perfect for <strong>memes, promos, advertisements, shoutouts</strong>, art, photography, or whatever creative content you want to share!
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs font-bold">🚀</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-emerald-400 mb-1">Have Fun!</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        This is a <strong>creative playground</strong>. Experiment, explore, collaborate, and most importantly - enjoy the infinite possibilities!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="mt-8 pt-6 border-t border-gray-700">
                        <h4 className="text-lg font-semibold text-center mb-4 text-gray-300">💡 Quick Tips</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                            <div className="bg-gray-700/50 rounded-lg p-3">
                                <span className="text-blue-400 font-semibold text-sm">HEIC Support</span>
                                <p className="text-gray-400 text-xs mt-1">iPhone photos automatically converted</p>
                            </div>
                            <div className="bg-gray-700/50 rounded-lg p-3">
                                <span className="text-purple-400 font-semibold text-sm">Real-time Updates</span>
                                <p className="text-gray-400 text-xs mt-1">See others' uploads instantly</p>
                            </div>
                            <div className="bg-gray-700/50 rounded-lg p-3">
                                <span className="text-green-400 font-semibold text-sm">No Registration</span>
                                <p className="text-gray-400 text-xs mt-1">Anonymous collaboration ready</p>
                            </div>
                            <div className="bg-gray-700/50 rounded-lg p-3">
                                <span className="text-yellow-400 font-semibold text-sm">Mobile Friendly</span>
                                <p className="text-gray-400 text-xs mt-1">Touch controls optimized</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center">
                    <Link href="/clipboard">
                        <button className="px-8 py-4 sm:px-12 sm:py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white text-lg sm:text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25">
                            Start Creating Now
                            <svg className="inline-block ml-2 w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </Link>
                    <p className="mt-4 text-gray-400 text-sm sm:text-base">
                        No registration required • Anonymous collaboration • Free forever
                    </p>
                </div>
            </div>

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-3/4 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-gray-800 mt-16 sm:mt-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                                <span className="text-white font-bold text-xs">AC</span>
                            </div>
                            <span className="text-gray-400">Anarchy Clipboard © 2025</span>
                        </div>
                        <div className="text-gray-500 text-sm">
                            Built with Next.js • Powered by Appwrite
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

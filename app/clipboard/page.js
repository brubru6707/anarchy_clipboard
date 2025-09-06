"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
// Correcting the import path to be an absolute path from the root of the app directory
import { client, account, databases, storage, ID, Query, Permission, Role } from '../appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID || ''; // Your Appwrite Database ID
const IMAGE_COLLECTION_ID = process.env.NEXT_PUBLIC_IMAGE_COLLECTION_ID || ''; // Your collection for images
const IMAGE_BUCKET_ID = process.env.NEXT_PUBLIC_IMAGE_BUCKET_ID || ''; // Your storage bucket for images
const MAX_IMAGES_ALLOWED = 100;

// --- Helper Components ---
// Placing the LoginForm component back inside this file to resolve the import/export error.
const LoginForm = ({ setLoggedInUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');

    const login = async (email, password) => {
        setError('');
        try {
            await account.createEmailPasswordSession(email, password);
            setLoggedInUser(await account.get());
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
            await account.create(ID.unique(), email, password, name);
            await login(email, password);
        } catch (e)
        {
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


// Main Clipboard Component
const ClipboardPage = () => {
    const [images, setImages] = useState([]);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [viewportCenter, setViewportCenter] = useState({ x: 0, y: 0 });
    const [movementState, setMovementState] = useState({
        direction: null,
        velocity: 0,
        isMoving: false
    });
    
    const panStartRef = useRef({ x: 0, y: 0 });
    const clipboardRef = useRef(null);
    const movementIntervalRef = useRef(null);
    const velocityTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    // --- Calculate viewport center coordinates ---
    const updateViewportCenter = useCallback(() => {
        if (clipboardRef.current) {
            const rect = clipboardRef.current.getBoundingClientRect();
            const centerX = (rect.width / 2) - panOffset.x;
            const centerY = (rect.height / 2) - panOffset.y;
            setViewportCenter({ x: Math.round(centerX), y: Math.round(centerY) });
        }
    }, [panOffset]);

    // Update viewport center whenever pan offset changes
    useEffect(() => {
        updateViewportCenter();
    }, [panOffset, updateViewportCenter]);

    // --- Reset pan position to prevent transform limits ---
    const resetPanPosition = () => {
        setPanOffset({ x: 0, y: 0 });
    };

    // --- Navigate to specific coordinates ---
    const navigateToCoordinates = (x, y) => {
        if (clipboardRef.current) {
            const rect = clipboardRef.current.getBoundingClientRect();
            const newPanX = (rect.width / 2) - x;
            const newPanY = (rect.height / 2) - y;
            setPanOffset({ x: newPanX, y: newPanY });
        }
    };

    // --- Directional movement controls with velocity ---
    const baseSpeed = 5; // Base movement speed
    const maxSpeed = 50; // Maximum movement speed
    const acceleration = 1.1; // Velocity multiplier per step
    
    const startMovement = (direction) => {
        if (movementState.isMoving && movementState.direction === direction) return;
        
        // Clear any existing intervals
        if (movementIntervalRef.current) {
            clearInterval(movementIntervalRef.current);
        }
        if (velocityTimeoutRef.current) {
            clearTimeout(velocityTimeoutRef.current);
        }
        
        setMovementState({
            direction,
            velocity: baseSpeed,
            isMoving: true
        });
        
        // Start movement loop
        movementIntervalRef.current = setInterval(() => {
            setMovementState(prev => {
                const newVelocity = Math.min(prev.velocity * acceleration, maxSpeed);
                
                // Apply movement based on direction
                setPanOffset(currentOffset => {
                    const MAX_PAN_VALUE = 50000;
                    let newX = currentOffset.x;
                    let newY = currentOffset.y;
                    
                    switch (direction) {
                        case 'up':
                            newY = Math.min(MAX_PAN_VALUE, currentOffset.y + newVelocity);
                            break;
                        case 'down':
                            newY = Math.max(-MAX_PAN_VALUE, currentOffset.y - newVelocity);
                            break;
                        case 'left':
                            newX = Math.min(MAX_PAN_VALUE, currentOffset.x + newVelocity);
                            break;
                        case 'right':
                            newX = Math.max(-MAX_PAN_VALUE, currentOffset.x - newVelocity);
                            break;
                    }
                    
                    return { x: newX, y: newY };
                });
                
                return { ...prev, velocity: newVelocity };
            });
        }, 16); // ~60fps for smooth movement
    };
    
    const stopMovement = () => {
        if (movementIntervalRef.current) {
            clearInterval(movementIntervalRef.current);
            movementIntervalRef.current = null;
        }
        if (velocityTimeoutRef.current) {
            clearTimeout(velocityTimeoutRef.current);
            velocityTimeoutRef.current = null;
        }
        
        setMovementState({
            direction: null,
            velocity: 0,
            isMoving: false
        });
    };
    
    // Cleanup intervals on unmount
    useEffect(() => {
        return () => {
            if (movementIntervalRef.current) {
                clearInterval(movementIntervalRef.current);
            }
            if (velocityTimeoutRef.current) {
                clearTimeout(velocityTimeoutRef.current);
            }
        };
    }, []);

    // --- File Upload Handler (for manual file selection) ---
    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        // Check file size (400 KB = 400 * 1024 bytes)
        const maxFileSize = 400 * 1024; // 400 KB in bytes
        if (file.size > maxFileSize) {
            alert(`File too large! Please select an image smaller than 400 KB. Current file size: ${Math.round(file.size / 1024)} KB`);
            // Clear the input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        await uploadImage(file);
        
        // Clear the input so the same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // --- Shared upload logic ---
    const uploadImage = async (file) => {
        if (!clipboardRef.current) return;

        // Use the center crosshair position for manual uploads too
        const rect = clipboardRef.current.getBoundingClientRect();
        const centerX = (rect.width / 2);
        const centerY = (rect.height / 2);
        const uploadX = centerX - panOffset.x;
        const uploadY = centerY - panOffset.y;

        try {
            // Check image count and delete the oldest if limit is reached
            if (images.length >= MAX_IMAGES_ALLOWED) {
                // Sort images by creation date (oldest first)
                const sortedImages = [...images].sort((a, b) => new Date(a.$createdAt) - new Date(b.$createdAt));
                
                // Calculate how many images need to be deleted
                const imagesToDelete = images.length - MAX_IMAGES_ALLOWED + 1; // +1 for the new image being added
                
                // Delete the oldest images
                for (let i = 0; i < imagesToDelete; i++) {
                    const oldestImage = sortedImages[i];
                    try {
                        // Delete from Appwrite DB and Storage
                        await databases.deleteDocument(DATABASE_ID, IMAGE_COLLECTION_ID, oldestImage.$id);
                        await storage.deleteFile(IMAGE_BUCKET_ID, oldestImage.fileId);
                    } catch (deleteError) {
                        console.error('Failed to delete old image:', deleteError);
                    }
                }
            }

            // Public permissions for anonymous access
            const permissions = [
                Permission.read(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
            ];

            // Upload the new image file to Appwrite Storage
            const fileResponse = await storage.createFile(
                IMAGE_BUCKET_ID, 
                ID.unique(), 
                file,
                permissions
            );

            await databases.createDocument(
                DATABASE_ID,
                IMAGE_COLLECTION_ID,
                ID.unique(),
                {
                    userId: 'anonymous', // Set a default userId for anonymous users
                    fileId: fileResponse.$id,
                    x: Math.round(uploadX),
                    y: Math.round(uploadY),
                },
                permissions
            );
        } catch (error) {
            console.error("Failed to upload image:", error);
            alert("Failed to upload image. Please try again.");
        }
    };
    
    // --- Data Fetching & Real-time Updates ---
    const fetchImages = useCallback(async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                IMAGE_COLLECTION_ID,
                [Query.limit(100)] // Fetch all images from all users
            );
            for (const doc of response.documents) {
                console.log(storage.getFileView(IMAGE_BUCKET_ID, doc.fileId))
            }
            const mappedImages = response.documents.map(doc => ({
                ...doc,
                src: storage.getFileView(IMAGE_BUCKET_ID, doc.fileId)
            }));
            setImages(mappedImages);
        } catch (error) {
            console.error('Failed to fetch images:', error);
        }
    }, []);

    useEffect(() => {
        // Fetch images immediately when component mounts
        fetchImages();

        const unsubscribe = client.subscribe(
            `databases.${DATABASE_ID}.collections.${IMAGE_COLLECTION_ID}.documents`,
            (response) => {
                fetchImages();
            }
        );

        return () => {
            unsubscribe();
        };
    }, [fetchImages]);


    // --- Canvas Panning Logic ---
    const handlePanMouseDown = (e) => {
        if (e.target !== clipboardRef.current) return; // Only pan on background
        e.preventDefault();
        panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
        setIsPanning(true);
    };

    const handlePanMouseMove = (e) => {
        if (!isPanning) return;
        e.preventDefault();
        const newPanX = e.clientX - panStartRef.current.x;
        const newPanY = e.clientY - panStartRef.current.y;
        
        // Prevent extreme values that could break CSS transforms
        const MAX_PAN_VALUE = 50000;
        const clampedX = Math.max(-MAX_PAN_VALUE, Math.min(MAX_PAN_VALUE, newPanX));
        const clampedY = Math.max(-MAX_PAN_VALUE, Math.min(MAX_PAN_VALUE, newPanY));
        
        setPanOffset({
            x: clampedX,
            y: clampedY
        });
    };

    const handlePanMouseUp = () => {
        setIsPanning(false);
    };

    // --- Drag and Drop Logic ---
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDraggingOver(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        if (!clipboardRef.current) return;

        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        // Check file size (400 KB = 400 * 1024 bytes)
        const maxFileSize = 400 * 1024; // 400 KB in bytes
        if (file.size > maxFileSize) {
            alert(`File too large! Please select an image smaller than 400 KB. Current file size: ${Math.round(file.size / 1024)} KB`);
            return;
        }

        await uploadImage(file);
    };
    
    // --- Render Logic ---
    return (
        <div 
            className="w-screen h-screen overflow-hidden bg-gray-800 text-white select-none relative touch-none"
            onMouseMove={handlePanMouseMove}
            onMouseUp={handlePanMouseUp}
            onMouseLeave={handlePanMouseUp} // Stop panning if mouse leaves window
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onTouchMove={handlePanMouseMove}
            onTouchEnd={handlePanMouseUp}
        >
            {/* --- Clipboard / Canvas Area --- */}
            <div
                ref={clipboardRef}
                className={`w-full h-full absolute top-0 left-0 transition-transform duration-100 ease-linear ${isPanning ? 'cursor-grabbing' : 'cursor-grab'} touch-pan-x touch-pan-y`}
                style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }}
                onMouseDown={handlePanMouseDown}
                onTouchStart={handlePanMouseDown}
            >
                {/* Render Images */}
                {images.map(image => (
                    <div
                        key={image.$id}
                        className="absolute p-1 bg-white rounded-md shadow-lg touch-manipulation"
                        style={{
                            left: `${image.x}px`,
                            top: `${image.y}px`,
                            maxWidth: '120px',
                            maxHeight: '120px',
                        }}
                    >
                         <img
                            src={image.src}
                            alt="user upload"
                            className="pointer-events-none w-full h-full object-contain"
                            style={{ maxWidth: '120px', maxHeight: '120px' }}
                        />
                    </div>
                ))}
            </div>

            {/* --- UI Overlays --- */}
             <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-2 sm:gap-4 bg-gray-900/90 p-2 sm:p-3 rounded-lg shadow-lg">
                <div className="text-right">
                    <p className="font-semibold text-sm sm:text-base">Anonymous User</p>
                    <p className="text-xs sm:text-sm text-gray-400">Images: {images.length} / {MAX_IMAGES_ALLOWED}</p>
                </div>
            </div>

            {/* --- File Upload Button --- */}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-gray-900/90 p-2 sm:p-3 rounded-lg shadow-lg">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                />
                <label
                    htmlFor="file-upload"
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Choose Image</span>
                    <span className="sm:hidden">+</span>
                </label>
                <p className="text-xs text-gray-400 mt-1 text-center">Max 400 KB</p>
            </div>
            
            <div className={`absolute inset-0 bg-blue-500/20 border-4 border-dashed border-blue-400 rounded-2xl transition-opacity pointer-events-none ${isDraggingOver ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center justify-center h-full">
                    <p className="text-2xl font-bold text-white">Drop image to upload</p>
                </div>
            </div>

            {/* --- Center Crosshair/Target --- */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div className="relative">
                    {/* Horizontal line */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 sm:w-8 h-0.5 bg-red-500 opacity-80"></div>
                    {/* Vertical line */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 sm:h-8 bg-red-500 opacity-80"></div>
                    {/* Center dot */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                    {/* Optional: Outer circle for better visibility */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 border border-red-500 rounded-full opacity-60"></div>
                </div>
            </div>
            
            <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-gray-900/90 p-2 sm:p-3 rounded-lg shadow-lg text-gray-300 text-xs sm:text-sm max-w-[calc(100vw-120px)] sm:max-w-none">
                <p className="hidden sm:block">Use D-pad or drag the background to pan.</p>
                <p className="sm:hidden">Drag to pan or use D-pad.</p>
                <p className="hidden sm:block">Drop images or use "Choose Image" button.</p>
                <p className="sm:hidden">Drop/choose images at crosshair.</p>
                <p className="text-yellow-400">Max file size: 400 KB</p>
                <p className="mt-1 sm:mt-2 text-blue-400 font-mono text-xs">
                    Center: ({viewportCenter.x}, {viewportCenter.y})
                </p>
                <div className="flex gap-1 sm:gap-2 mt-1 sm:mt-2">
                    <button 
                        onClick={resetPanPosition}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors min-h-[36px] touch-manipulation"
                    >
                        <span className="hidden sm:inline">Reset to Origin (0,0)</span>
                        <span className="sm:hidden">Reset</span>
                    </button>
                    <button 
                        onClick={() => navigateToCoordinates(0, 0)}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors min-h-[36px] touch-manipulation"
                    >
                        <span className="hidden sm:inline">Go to (0,0)</span>
                        <span className="sm:hidden">Origin</span>
                    </button>
                </div>
            </div>

            {/* --- Directional Movement Controls (D-pad style) --- */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-gray-900/90 p-2 rounded-lg shadow-lg">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                    {/* Up Button */}
                    <button
                        onMouseDown={() => startMovement('up')}
                        onMouseUp={stopMovement}
                        onMouseLeave={stopMovement}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            startMovement('up');
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            stopMovement();
                        }}
                        className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 ${
                            movementState.isMoving && movementState.direction === 'up' 
                                ? 'bg-blue-600' 
                                : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-600'
                        } text-white rounded-md flex items-center justify-center transition-colors select-none touch-manipulation text-sm sm:text-base`}
                        title="Move Up (Hold for acceleration)"
                    >
                        ↑
                    </button>
                    
                    {/* Left Button */}
                    <button
                        onMouseDown={() => startMovement('left')}
                        onMouseUp={stopMovement}
                        onMouseLeave={stopMovement}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            startMovement('left');
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            stopMovement();
                        }}
                        className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 ${
                            movementState.isMoving && movementState.direction === 'left' 
                                ? 'bg-blue-600' 
                                : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-600'
                        } text-white rounded-md flex items-center justify-center transition-colors select-none touch-manipulation text-sm sm:text-base`}
                        title="Move Left (Hold for acceleration)"
                    >
                        ←
                    </button>
                    
                    {/* Center circle with velocity indicator */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 bg-gray-800 rounded-full border-2 border-gray-600 flex items-center justify-center">
                        {movementState.isMoving && (
                            <div 
                                className="bg-blue-500 rounded-full transition-all duration-100"
                                style={{
                                    width: `${Math.min(10, 3 + (movementState.velocity / maxSpeed) * 7)}px`,
                                    height: `${Math.min(10, 3 + (movementState.velocity / maxSpeed) * 7)}px`
                                }}
                            ></div>
                        )}
                    </div>
                    
                    {/* Right Button */}
                    <button
                        onMouseDown={() => startMovement('right')}
                        onMouseUp={stopMovement}
                        onMouseLeave={stopMovement}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            startMovement('right');
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            stopMovement();
                        }}
                        className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 ${
                            movementState.isMoving && movementState.direction === 'right' 
                                ? 'bg-blue-600' 
                                : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-600'
                        } text-white rounded-md flex items-center justify-center transition-colors select-none touch-manipulation text-sm sm:text-base`}
                        title="Move Right (Hold for acceleration)"
                    >
                        →
                    </button>
                    
                    {/* Down Button */}
                    <button
                        onMouseDown={() => startMovement('down')}
                        onMouseUp={stopMovement}
                        onMouseLeave={stopMovement}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            startMovement('down');
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            stopMovement();
                        }}
                        className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 ${
                            movementState.isMoving && movementState.direction === 'down' 
                                ? 'bg-blue-600' 
                                : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-600'
                        } text-white rounded-md flex items-center justify-center transition-colors select-none touch-manipulation text-sm sm:text-base`}
                        title="Move Down (Hold for acceleration)"
                    >
                        ↓
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClipboardPage;

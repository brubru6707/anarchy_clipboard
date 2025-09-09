"use client";

import { useMemo } from 'react';

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
    const [zoomLevel, setZoomLevel] = useState(1); // New zoom state
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

    // --- Calculate viewport center coordinates (throttled) ---
    const updateViewportCenter = useCallback(() => {
        if (clipboardRef.current) {
            const rect = clipboardRef.current.getBoundingClientRect();
            const centerX = (rect.width / 2) - panOffset.x;
            const centerY = (rect.height / 2) - panOffset.y;
            setViewportCenter({ x: Math.round(centerX), y: Math.round(centerY) });
        }
    }, [panOffset.x, panOffset.y]);

    // Throttled viewport center updates (reduce frequency)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            updateViewportCenter();
        }, 100); // Update every 100ms instead of every frame
        
        return () => clearTimeout(timeoutId);
    }, [panOffset.x, panOffset.y, updateViewportCenter]);
    const viewportBounds = useMemo(() => {
        if (!clipboardRef.current) return null;
        
        const rect = clipboardRef.current.getBoundingClientRect();
        
        // Calculate the visible area in world coordinates
        // Add buffer zone to load images slightly outside viewport
        const bufferZone = 500; // pixels
        
        // The key insight: we need to find what world coordinates are currently visible
        // Given our transform: scale(zoomLevel) translate3d(panOffset.x, panOffset.y, 0)
        // A point at world coordinate (wx, wy) appears on screen at:
        // screenX = (wx + panOffset.x) * zoomLevel
        // screenY = (wy + panOffset.y) * zoomLevel
        //
        // So to find what world coordinates are visible in the viewport:
        // wx = (screenX / zoomLevel) - panOffset.x
        // wy = (screenY / zoomLevel) - panOffset.y
        
        const viewportLeft = (0 / zoomLevel) - panOffset.x - bufferZone;
        const viewportTop = (0 / zoomLevel) - panOffset.y - bufferZone;
        const viewportRight = (rect.width / zoomLevel) - panOffset.x + bufferZone;
        const viewportBottom = (rect.height / zoomLevel) - panOffset.y + bufferZone;
        
        return {
            left: viewportLeft,
            top: viewportTop,
            right: viewportRight,
            bottom: viewportBottom
        };
    }, [panOffset.x, panOffset.y, zoomLevel]);

    // --- Check if image is in viewport (optimized) ---
    const visibleImages = useMemo(() => {
        if (!viewportBounds) return images;
        
        return images.filter(image => {
            // Assume max image size for bounds checking (since we don't store dimensions)
            const imageSize = 400; // max size we set in CSS
            
            const imageLeft = image.x;
            const imageTop = image.y;
            const imageRight = image.x + imageSize;
            const imageBottom = image.y + imageSize;
            
            // Check if image intersects with viewport
            return !(imageRight < viewportBounds.left || 
                    imageLeft > viewportBounds.right || 
                    imageBottom < viewportBounds.top || 
                    imageTop > viewportBounds.bottom);
        });
    }, [images, viewportBounds]);

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

    // --- Zoom Controls ---
    const minZoom = 0.1; // 10% zoom
    const maxZoom = 5.0;  // 500% zoom
    const zoomStep = 0.1; // 10% per step

    const zoomIn = () => {
        setZoomLevel(prev => Math.min(maxZoom, prev + zoomStep));
    };

    const zoomOut = () => {
        setZoomLevel(prev => Math.max(minZoom, prev - zoomStep));
    };

    const resetZoom = () => {
        setZoomLevel(1);
    };

    // Mouse wheel zoom functionality
    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
        setZoomLevel(prev => Math.max(minZoom, Math.min(maxZoom, prev + delta)));
    };

    // --- Directional movement controls with velocity (optimized) ---
    const baseSpeed = 5; // Base movement speed
    const maxSpeed = 50; // Maximum movement speed
    const acceleration = 1.1; // Velocity multiplier per step
    
    const startMovement = useCallback((direction) => {
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
        
        // Start movement loop with throttled updates
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
        }, 32); // Reduced from 16ms to 32ms (~30fps instead of 60fps for smoother performance)
    }, [movementState.isMoving, movementState.direction]);
    
    const stopMovement = useCallback(() => {
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
    }, []);
    
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

    // --- HEIC Conversion Utility ---
    const convertHeicToJpeg = async (file) => {
        // Check if we're on the client side (this check is still good practice)
        if (typeof window === 'undefined') {
            return file; // Return original file on server side
        }

        try {
            // Dynamically import the library only when the function is called
            const heic2any = (await import('heic2any')).default;

            const convertedBlob = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.8
            });

            // Create a new File from the converted blob
            return new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now()
            });
        } catch (error) {
            console.error('HEIC conversion failed:', error);
            throw new Error('Failed to convert HEIC image');
        }
    };

    // --- Image Compression Utility ---
    const compressImage = (file, maxSizeKB = 400) => {
        return new Promise((resolve) => {
            if (typeof window === 'undefined') {
                resolve(file); // Return original file on server side
                return;
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const htmlImg = new window.Image();
            
            htmlImg.onload = () => {
                let { width, height } = htmlImg;
                
                const maxDimension = 800;
                if (width > maxDimension || height > maxDimension) {
                    const scale = maxDimension / Math.max(width, height);
                    width *= scale;
                    height *= scale;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const tryCompress = (quality, scale = 1) => {
                    const finalWidth = width * scale;
                    const finalHeight = height * scale;
                    
                    canvas.width = finalWidth;
                    canvas.height = finalHeight;
                    
                    ctx.clearRect(0, 0, finalWidth, finalHeight);
                    ctx.drawImage(htmlImg, 0, 0, finalWidth, finalHeight);
                    
                    canvas.toBlob((blob) => {
                        const sizeKB = blob.size / 1024;
                        
                        if (sizeKB <= maxSizeKB) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else if (quality > 0.1) {
                            tryCompress(quality - 0.1, scale);
                        } else if (scale > 0.3) {
                            tryCompress(0.8, scale - 0.1);
                        } else {
                            canvas.width = 300;
                            canvas.height = 300;
                            ctx.clearRect(0, 0, 300, 300);
                            ctx.drawImage(htmlImg, 0, 0, 300, 300);
                            
                            canvas.toBlob((finalBlob) => {
                                const finalFile = new File([finalBlob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now()
                                });
                                resolve(finalFile);
                            }, 'image/jpeg', 0.1);
                        }
                    }, 'image/jpeg', quality);
                };
                
                tryCompress(0.8);
            };
            
            htmlImg.onerror = () => {
                console.error("Failed to load image into memory for compression.");
                resolve(file);
            };
            
            const reader = new FileReader();
            reader.onload = (e) => {
                htmlImg.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    // --- File Upload Handler (for manual file selection) ---
    const handleFileSelect = async (event) => {
        if (typeof window === 'undefined') return;
        
        const originalFile = event.target.files[0];
        if (!originalFile) {
            alert('Please select a valid file.');
            return;
        }

        const isImage = originalFile.type.startsWith('image/') || 
                          originalFile.name.toLowerCase().endsWith('.heic') ||
                          originalFile.name.toLowerCase().endsWith('.heif');
        
        if (!isImage) {
            alert('Please select a valid image file (including HEIC/HEIF).');
            return;
        }

        try {
            let fileToProcess = originalFile;
            
            if (originalFile.name.toLowerCase().endsWith('.heic') || 
                originalFile.name.toLowerCase().endsWith('.heif') ||
                originalFile.type === 'image/heic' ||
                originalFile.type === 'image/heif') {
                
                console.log('Converting HEIC/HEIF image...');
                fileToProcess = await convertHeicToJpeg(originalFile);
                console.log('HEIC conversion successful');
            }
            
            const originalSizeKB = Math.round(fileToProcess.size / 1024);
            console.log(`Original image size: ${originalSizeKB} KB`);
            
            // Compress the image
            const compressedFile = await compressImage(fileToProcess);
            const compressedSizeKB = Math.round(compressedFile.size / 1024);
            
            console.log(`Compressed image size: ${compressedSizeKB} KB`);
            
            const maxFileSize = 400 * 1024;
            if (compressedFile.size > maxFileSize) {
                alert(`Image still too large after compression: ${compressedSizeKB} KB. Please try a different image.`);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            await uploadImage(compressedFile);
            
        } catch (error) {
            console.error('Processing failed:', error);
            alert('Failed to process image. Please try again.');
        }
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // --- Shared upload logic ---
    const uploadImage = async (file) => {
        if (typeof window === 'undefined') return;
        if (!clipboardRef.current) return;

        const rect = clipboardRef.current.getBoundingClientRect();
        
        // Calculate the world coordinates for the center of the screen
        // The center of the screen in world coordinates is where the crosshair points
        const screenCenterX = rect.width / 2 * 1/zoomLevel;
        const screenCenterY = rect.height / 2 * 1/zoomLevel;

        const worldX = (screenCenterX - panOffset.x) / 1;
        const worldY = (screenCenterY - panOffset.y) / 1;
        console.log("worldX, worldY:", worldX, worldY);
        console.log("screenCenterX, screenCenterY:", screenCenterX, screenCenterY);
        console.log("panOffset.x, panOffset.y:", panOffset.x, panOffset.y);

        const uploadX = worldX;
        const uploadY = worldY;

        try {
            // First, get the current actual count from the database
            const currentResponse = await databases.listDocuments(
                DATABASE_ID,
                IMAGE_COLLECTION_ID,
                [Query.limit(200)] // Get more than max to see the full scope
            );
            
            const currentImages = currentResponse.documents;
            console.log(`Current database count: ${currentImages.length} images`);
            
            // If we're at or over the limit, delete enough to make room for the new image
            if (currentImages.length >= MAX_IMAGES_ALLOWED) {
                const sortedImages = currentImages.sort((a, b) => new Date(a.$createdAt) - new Date(b.$createdAt));
                const imagesToDelete = currentImages.length - MAX_IMAGES_ALLOWED + 1; // +1 for the new image
                
                console.log(`Need to delete ${imagesToDelete} oldest images to make room`);
                
                for (let i = 0; i < imagesToDelete; i++) {
                    const oldestImage = sortedImages[i];
                    try {
                        await databases.deleteDocument(DATABASE_ID, IMAGE_COLLECTION_ID, oldestImage.$id);
                        await storage.deleteFile(IMAGE_BUCKET_ID, oldestImage.fileId);
                        console.log(`Deleted old image ${i + 1}/${imagesToDelete}:`, oldestImage.$id);
                    } catch (deleteError) {
                        console.error('Failed to delete old image:', deleteError);
                    }
                }
            }

            const permissions = [
                Permission.read(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
            ];

            const fileResponse = await storage.createFile(
                IMAGE_BUCKET_ID, 
                ID.unique(), 
                file,
                permissions
            );
            
            const documentData = {
                userId: 'anonymous',
                fileId: fileResponse.$id,
                x: Math.round(uploadX),
                y: Math.round(uploadY),
            };

            await databases.createDocument(
                DATABASE_ID,
                IMAGE_COLLECTION_ID,
                ID.unique(),
                documentData,
                permissions
            );
            
            console.log('Successfully uploaded new image at:', uploadX, uploadY);
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
                [Query.limit(100)]
            );
            
            console.log(`Found ${response.documents.length} images in database`);
            
            const mappedImages = response.documents.map(doc => {
                const imageUrl = storage.getFileView(IMAGE_BUCKET_ID, doc.fileId);
                return {
                    ...doc,
                    src: imageUrl
                };
            });
            
            setImages(mappedImages);
        } catch (error) {
            console.error('Failed to fetch images:', error);
        }
    }, []);

    useEffect(() => {
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
        if (e.target !== clipboardRef.current) return;
        e.preventDefault();
        panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
        setIsPanning(true);
    };

    const handlePanMouseMove = (e) => {
        if (!isPanning) return;
        e.preventDefault();
        const newPanX = e.clientX - panStartRef.current.x;
        const newPanY = e.clientY - panStartRef.current.y;
        
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
        
        if (typeof window === 'undefined') return;
        if (!clipboardRef.current) return;

        const originalFile = e.dataTransfer.files[0];
        if (!originalFile) return;

        const isImage = originalFile.type.startsWith('image/') || 
                          originalFile.name.toLowerCase().endsWith('.heic') ||
                          originalFile.name.toLowerCase().endsWith('.heif');
        
        if (!isImage) return;

        try {
            let fileToProcess = originalFile;
            
            if (originalFile.name.toLowerCase().endsWith('.heic') || 
                originalFile.name.toLowerCase().endsWith('.heif') ||
                originalFile.type === 'image/heic' ||
                originalFile.type === 'image/heif') {
                
                console.log('Converting dropped HEIC/HEIF image...');
                fileToProcess = await convertHeicToJpeg(originalFile);
                console.log('HEIC conversion successful');
            }
            
            const originalSizeKB = Math.round(fileToProcess.size / 1024);
            console.log(`Original dropped image size: ${originalSizeKB} KB`);
            
            // Compress the image
            const compressedFile = await compressImage(fileToProcess);
            const compressedSizeKB = Math.round(compressedFile.size / 1024);
            
            console.log(`Compressed dropped image size: ${compressedSizeKB} KB`);
            
            const maxFileSize = 400 * 1024;
            if (compressedFile.size > maxFileSize) {
                alert(`Image still too large after compression: ${compressedSizeKB} KB. Please try a different image.`);
                return;
            }
            
            await uploadImage(compressedFile);
            
        } catch (error) {
            console.error('Processing failed:', error);
            alert('Failed to process dropped image. Please try again.');
        }
    };
    
    // --- Render Logic ---
    return (
        <div 
            className="w-screen h-screen overflow-hidden bg-gray-800 text-white select-none relative touch-none"
            onMouseMove={handlePanMouseMove}
            onMouseUp={handlePanMouseUp}
            onMouseLeave={handlePanMouseUp}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onTouchMove={handlePanMouseMove}
            onTouchEnd={handlePanMouseUp}
            onWheel={handleWheel}
        >
            {/* --- Clipboard / Canvas Area --- */}
            <div
                ref={clipboardRef}
                className={`w-full h-full absolute top-0 left-0 touch-pan-x touch-pan-y ${
                    isPanning ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                style={{ 
                    transform: `scale(${zoomLevel}) translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
                    transformOrigin: 'center center',
                    willChange: 'transform', // Hint to browser for GPU acceleration
                }}
                onMouseDown={handlePanMouseDown}
                onTouchStart={handlePanMouseDown}
            >
                {/* Render Images - Only show images in viewport (optimized) */}
                {visibleImages.map(image => (
                    <div
                        key={image.$id}
                        className="absolute p-1 bg-white rounded-md shadow-lg touch-manipulation"
                        style={{
                            left: `${image.x}px`,
                            top: `${image.y}px`,
                            transform: 'translateZ(0)', // Force GPU acceleration
                        }}
                    >
                        <img
                            src={image.src}
                            alt="user upload"
                            className="pointer-events-none max-w-none max-h-none"
                            style={{ 
                                display: 'block',
                                maxWidth: '400px',
                                maxHeight: '400px',
                                objectFit: 'contain',
                                transform: 'translateZ(0)', // Force GPU acceleration
                            }}
                            loading="lazy" // Native lazy loading
                            onLoad={(e) => {
                                // Remove console logs in production for better performance
                                // console.log('Image loaded successfully:', image.src);
                            }}
                            onError={(e) => {
                                console.error('Failed to load image:', image.src);
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* --- UI Overlays --- */}
             <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-2 sm:gap-4 bg-gray-900/90 p-2 sm:p-3 rounded-lg shadow-lg">
                <div className="text-right">
                    <p className="font-semibold text-sm sm:text-base">Anonymous User</p>
                    <p className="text-xs sm:text-sm text-gray-400">Images: {images.length} / {MAX_IMAGES_ALLOWED}</p>
                    <p className="text-xs text-green-400">
                        Visible: {visibleImages.length} / {images.length}
                    </p>
                </div>
            </div>

            {/* --- File Upload Button --- */}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-gray-900/90 p-2 sm:p-3 rounded-lg shadow-lg">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                />
                <label
                    htmlFor="file-upload"
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation justify-center"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Choose Image</span>
                </label>
                <p className="text-xs text-gray-400 mt-1 text-center">Supports HEIC + auto-compression</p>
            </div>
            
            <div className={`absolute inset-0 bg-blue-500/20 border-4 border-dashed border-blue-400 rounded-2xl transition-opacity pointer-events-none ${isDraggingOver ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center justify-center h-full">
                    <p className="text-2xl font-bold text-white">Drop image to upload</p>
                </div>
            </div>

            {/* --- Center Crosshair/Target --- */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                <div className="relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 sm:w-8 h-0.5 bg-red-500 opacity-80"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 sm:h-8 bg-red-500 opacity-80"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 border border-red-500 rounded-full opacity-60"></div>
                </div>
            </div>

            <div className="absolute bottom-32 left-2 sm:bottom-4 sm:left-4 bg-gray-900/90 p-2 sm:p-3 rounded-lg shadow-lg text-gray-300 text-xs sm:text-sm max-w-[calc(100vw-120px)] sm:max-w-none">
                <p className="hidden sm:block">Use D-pad or drag the background to pan.</p>
                <p className="sm:hidden">Drag to pan or use D-pad.</p>
                <p className="hidden sm:block">Drop images or use &quot;Choose Image&quot; button.</p>
                <p className="sm:hidden">Drop/choose images at crosshair.</p>
                <p className="text-yellow-400">Images auto-compressed to &lt;400KB</p>
                <p className="text-purple-400">Mouse wheel to zoom • {Math.round(zoomLevel * 100)}%</p>
                <p className="mt-1 sm:mt-2 text-blue-400 font-mono text-xs">
                    Center: ({viewportCenter.x}, {viewportCenter.y})
                </p>
                <div className="flex gap-1 sm:gap-2 mt-1 sm:mt-2">
                    <button 
                        onClick={() => navigateToCoordinates(0, 0)}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors min-h-[36px] touch-manipulation"
                    >
                        <span className="hidden sm:inline">Go to (0,0)</span>
                        <span className="sm:hidden">Origin</span>
                    </button>
                    <button 
                        onClick={resetZoom}
                        className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors min-h-[36px] touch-manipulation"
                    >
                        <span className="hidden sm:inline">Reset Zoom</span>
                        <span className="sm:hidden">100%</span>
                    </button>
                </div>
            </div>

            {/* --- Zoom Controls --- */}
            <div className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-gray-900/90 p-2 rounded-lg shadow-lg flex flex-col gap-2">
                <button
                    onClick={zoomIn}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center transition-colors touch-manipulation text-lg sm:text-xl font-bold"
                    title="Zoom In"
                >
                    +
                </button>
                <div className="text-center text-white text-xs font-mono px-1">
                    {Math.round(zoomLevel * 100)}%
                </div>
                <button
                    onClick={zoomOut}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center transition-colors touch-manipulation text-lg sm:text-xl font-bold"
                    title="Zoom Out"
                >
                    −
                </button>
            </div>

            {/* --- Directional Movement Controls (D-pad style) --- */}
            <div className="absolute bottom-32 right-2 sm:bottom-4 sm:right-4 bg-gray-900/90 p-2 rounded-lg shadow-lg">
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
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useWindowStore } from '../../stores/windowStore';
import type { WindowInstance } from '../../types';

interface WindowProps {
    window: WindowInstance;
    children: React.ReactNode;
}

// Simple Error Boundary component
class WindowErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("Window Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-charcoal-700 mb-2">Something went wrong</h3>
                    <p className="text-sm text-charcoal-500 mb-4">This application encountered an error and couldn't be displayed.</p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="px-4 py-2 bg-charcoal-100 hover:bg-charcoal-200 rounded-lg text-sm text-charcoal-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export const Window: React.FC<WindowProps> = ({ window: win, children }) => {
    // Basic mobile check
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const {
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        focusWindow,
        updateWindowPosition,
        updateWindowSize,
        activeWindowId
    } = useWindowStore();

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const windowRef = useRef<HTMLDivElement>(null);

    const isActive = activeWindowId === win.id;
    const isMaximized = win.state === 'maximized';
    const isMinimized = win.state === 'minimized';

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.window-controls')) return;

        focusWindow(win.id);

        if ((e.target as HTMLElement).closest('.window-titlebar')) {
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - win.position.x,
                y: e.clientY - win.position.y,
            });
        }
    }, [win.id, win.position, focusWindow]);

    const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
    }, []);

    useEffect(() => {
        if (!isDragging && !isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                updateWindowPosition(win.id, {
                    x: Math.max(0, e.clientX - dragOffset.x),
                    y: Math.max(0, e.clientY - dragOffset.y),
                });
            } else if (isResizing) {
                const newWidth = Math.max(300, e.clientX - win.position.x);
                const newHeight = Math.max(200, e.clientY - win.position.y);
                updateWindowSize(win.id, { width: newWidth, height: newHeight });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset, win.id, win.position, updateWindowPosition, updateWindowSize]);

    if (isMinimized) return null;

    const windowStyles: React.CSSProperties = isMaximized
        ? {
            position: 'fixed',
            top: 48, // 3rem (Desktop Top Bar)
            left: 0,
            right: 0,
            bottom: 56, // Dock height
            width: '100%',
            height: 'calc(100% - 48px - 56px)',
            zIndex: win.zIndex,
        }
        : {
            position: 'absolute',
            left: isMobile ? 0 : win.position.x,
            top: isMobile ? 48 : win.position.y,
            width: isMobile ? '100%' : win.size.width,
            height: isMobile ? 'calc(100% - 48px - 80px)' : win.size.height, // Adjust for dock on mobile
            zIndex: win.zIndex,
        };

    return (
        !isMinimized ? (
            <div
                ref={windowRef}
                style={windowStyles}
                className={`
        flex flex-col bg-white rounded-xl overflow-hidden
        shadow-window border border-charcoal-100
        transition-shadow duration-200
        ${isActive ? 'ring-2 ring-sage-300/50' : ''}
        ${isDragging ? 'cursor-grabbing' : ''}
      `}
                onMouseDown={handleMouseDown}
            >
                {/* Title Bar */}
                <div
                    className={`
          window-titlebar flex items-center justify-between px-4 py-3
          border-b border-charcoal-100 select-none
          ${isActive ? 'bg-cream-50' : 'bg-cream-100'}
          ${!isMaximized ? 'cursor-grab' : ''}
        `}
                >
                    <span className="font-medium text-charcoal-700 text-sm truncate">
                        {win.title}
                    </span>

                    {/* Window Controls */}
                    <div className="window-controls flex items-center gap-2">
                        {/* Minimize */}
                        <button
                            onClick={() => minimizeWindow(win.id)}
                            className="w-3 h-3 rounded-full bg-terracotta-300 hover:bg-terracotta-400 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-terracotta-300"
                            title="Minimize"
                        />
                        {/* Maximize */}
                        <button
                            onClick={() => maximizeWindow(win.id)}
                            className="w-3 h-3 rounded-full bg-ocean-300 hover:bg-ocean-400 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ocean-300"
                            title="Maximize"
                        />
                        {/* Close */}
                        <button
                            onClick={() => closeWindow(win.id)}
                            className="w-3 h-3 rounded-full bg-sage-400 hover:bg-sage-500 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sage-300"
                            title="Close"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-white">
                    <WindowErrorBoundary>
                        {children}
                    </WindowErrorBoundary>
                </div>

                {/* Resize Handle */}
                {!isMaximized && (
                    <div
                        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center group"
                        onMouseDown={handleResizeMouseDown}
                    >
                        <svg
                            className="w-3 h-3 text-charcoal-300 group-hover:text-sage-500 transition-colors"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M22 22L12 12" />
                        </svg>
                    </div>
                )}
            </div>
        ) : null
    );
};


import React, { useState, useEffect } from 'react';
import './PWAWrapper.css';
import { MdInstallMobile } from "react-icons/md"; // Google-style install icon

const useInstallPrompt = () => {
    const [isInstallAvailable, setIsInstallAvailable] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            console.log("✅ beforeinstallprompt fired!");

            // Store the event in sessionStorage to persist across navigation
            sessionStorage.setItem("deferredInstallPrompt", true);
            window.deferredInstallPrompt = e;

            setIsInstallAvailable(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Check sessionStorage on mount
        if (sessionStorage.getItem("deferredInstallPrompt")) {
            setIsInstallAvailable(true);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const triggerInstallPrompt = async () => {
        if (window.deferredInstallPrompt) {
            try {
                console.log("📥 Prompting installation...");
                await window.deferredInstallPrompt.prompt();
                const choiceResult = await window.deferredInstallPrompt.userChoice;

                if (choiceResult.outcome === "accepted") {
                    console.log("✅ User installed the app!");
                    sessionStorage.removeItem("deferredInstallPrompt"); // Clear session storage after install
                } else {
                    console.log("❌ User dismissed the install prompt");
                }

                window.deferredInstallPrompt = null;
                setIsInstallAvailable(false);
            } catch (error) {
                console.error("⚠️ Error showing install prompt", error);
            }
        } else {
            console.log("❌ No install prompt available");
        }
    };

    return { isInstallAvailable, triggerInstallPrompt };
};

// PWA Wrapper Component
const PWAWrapper = ({ children, showInstallButton, installButtonPosition }) => {
    const { isInstallAvailable, triggerInstallPrompt } = useInstallPrompt();

    // Handle Responsive Layout
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', checkMobile);
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    useEffect(() => {
        console.log("PWAWrapper Rendered");
    }, []);

    // Button Position Logic
    const getButtonStyle = () => {
        switch (installButtonPosition) {
            case "bottom-center":
                return "bottom-4 left-1/2 transform -translate-x-1/2";
            case "top-right":
                return "top-4 right-4";
            case "bottom-right":
                return "bottom-4 right-4";
            case "top-left":
                return "top-4 left-4";
            default:
                return "bottom-4 right-4";
        }
    };

    return (
        <div className={`app ${isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
            {children}

            {/* Install Button */}
            {isInstallAvailable && showInstallButton && (
                <button
                    title='Install App'
                    onClick={triggerInstallPrompt}
                    className={`install-button ${getButtonStyle()}`}
                > <MdInstallMobile />
                </button>
            )}
        </div>
    );
};

export default PWAWrapper;

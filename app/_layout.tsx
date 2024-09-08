import { Stack } from "expo-router";
import { createContext, useContext, useState } from "react";
import React, { useEffect } from "react";
import { MD3LightTheme as DefaultTheme, PaperProvider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";

const THEME = {
    ...DefaultTheme,
    "colors": {
        "primary": "rgb(156, 65, 67)",
        "onPrimary": "rgb(255, 255, 255)",
        "primaryContainer": "rgb(255, 218, 217)",
        "onPrimaryContainer": "rgb(65, 0, 8)",
        "secondary": "rgb(119, 86, 86)",
        "onSecondary": "rgb(255, 255, 255)",
        "secondaryContainer": "rgb(255, 218, 217)",
        "onSecondaryContainer": "rgb(44, 21, 21)",
        "tertiary": "rgb(116, 90, 47)",
        "onTertiary": "rgb(255, 255, 255)",
        "tertiaryContainer": "rgb(255, 222, 173)",
        "onTertiaryContainer": "rgb(40, 25, 0)",
        "error": "rgb(186, 26, 26)",
        "onError": "rgb(255, 255, 255)",
        "errorContainer": "rgb(255, 218, 214)",
        "onErrorContainer": "rgb(65, 0, 2)",
        "background": "rgb(255, 251, 255)",
        "onBackground": "rgb(32, 26, 26)",
        "surface": "rgb(255, 251, 255)",
        "onSurface": "rgb(32, 26, 26)",
        "surfaceVariant": "rgb(244, 221, 220)",
        "onSurfaceVariant": "rgb(82, 67, 67)",
        "outline": "rgb(133, 115, 114)",
        "outlineVariant": "rgb(215, 193, 192)",
        "shadow": "rgb(0, 0, 0)",
        "scrim": "rgb(0, 0, 0)",
        "inverseSurface": "rgb(54, 47, 46)",
        "inverseOnSurface": "rgb(251, 238, 237)",
        "inversePrimary": "rgb(255, 179, 178)",
        "elevation": {
            "level0": "transparent",
            "level1": "rgb(250, 242, 246)",
            "level2": "rgb(247, 236, 240)",
            "level3": "rgb(244, 231, 234)",
            "level4": "rgb(243, 229, 232)",
            "level5": "rgb(241, 225, 229)"
        },
        "surfaceDisabled": "rgba(32, 26, 26, 0.12)",
        "onSurfaceDisabled": "rgba(32, 26, 26, 0.38)",
        "backdrop": "rgba(59, 45, 45, 0.4)"
    },
} as const;

type AuthContextType = {
    onLogout: () => void;
    onLogin: () => void;
    isLoggedIn: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default function RootLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem("authToken");
            if (token) {
                setIsLoggedIn(true);
            }
            setLoading(false);
        };
        checkToken();
    }, []);

    if (loading) {
        return null;
    }

    async function handleLogout() {
        try {
            const token = await AsyncStorage.getItem("authToken");
            await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/logout`, {
                method: "POST",
                headers: {
                    "Authorization": `Token ${token}`,
                },
            });
        } finally {
            await AsyncStorage.removeItem("authToken");
            setIsLoggedIn(false);
        }
    }

    return (
        <AuthContext.Provider value={{ onLogout: handleLogout, onLogin: () => setIsLoggedIn(true), isLoggedIn }}>
            <SafeAreaProvider>
                <PaperProvider theme={THEME}>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                    </Stack>
                </PaperProvider>
            </SafeAreaProvider>
        </AuthContext.Provider>
    );
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View, Alert } from "react-native";
import { Appbar, Button, Divider, Text, TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "./_layout";

export default function Login() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { onLogin } = useAuth();
    const router = useRouter();

    async function handleLogin() {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phone_number: `${55}${phoneNumber}`, password }),
            });

            if (response.ok) {
                const token = await response.text();
                await AsyncStorage.setItem("authToken", token);
                onLogin();
            } else {
                Alert.alert("Falha no login", "Por favor verifique suas credenciais e tente novamente.");
            }
        } catch (error) {
            Alert.alert("Erro", "Falha ao tentar realizar o login. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Appbar.Header elevated={true}>
                <Appbar.Content title="Login" />
            </Appbar.Header>
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 20,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 40,
                    }}
                >
                    <Text style={{ marginRight: 8, fontSize: 16 }}>+55</Text>
                    <TextInput
                        mode="outlined"
                        label="Número de Telefone"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        style={{ flex: 1 }}
                    />
                </View>

                <TextInput
                    mode="outlined"
                    label="Senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={{ width: "100%", marginTop: 20 }}
                />

                <Button
                    mode="contained-tonal"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={{ marginTop: 20 }}
                >
                    Log In
                </Button>

                <Divider style={{ width: "100%", marginVertical: 20 }} />

                <Text>Ainda não possui conta?</Text>

                <Button
                    mode="contained-tonal"
                    onPress={() => router.navigate("/Signup")}
                    disabled={loading}
                    style={{ marginTop: 10 }}
                >
                    Registrar-se
                </Button>
            </View>
        </>
    );
}

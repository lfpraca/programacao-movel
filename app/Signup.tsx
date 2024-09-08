import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { Appbar, Button, TextInput } from "react-native-paper";
import { useAuth } from "./_layout";
import { useRouter } from "expo-router";

export default function Signup() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const { onLogin } = useAuth();
    const router = useRouter();

    async function handleSignup() {
        if (!password || !name || !address || !phoneNumber) {
            Alert.alert("Falha no cadastro", "Todos os campos devem ser preenchidos.");
            return;
        }

        if (password.length < 8) {
            Alert.alert("Falha no cadastro", "Senha deve conter pelo menos 8 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Falha no cadastro", "Confirmação de senha incorreta.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phone_number: `${55}${phoneNumber}`, password, name, address }),
            });

            if (response.ok) {
                const token = await response.text();
                await AsyncStorage.setItem("authToken", token);
                onLogin();
                router.back();
            } else {
                Alert.alert("Falha no cadastro", "Por favor verifique as informações e tente novamente.");
            }
        } catch (error) {
            Alert.alert("Erro", "Falha ao tentar realizar o cadastro. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Appbar.Header elevated={true}>
                <Appbar.BackAction onPress={router.back} disabled={loading} />
                <Appbar.Content title="Registro" />
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

                <TextInput
                    mode="outlined"
                    label="Senha (Confirmação)"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    style={{ width: "100%", marginTop: 20 }}
                />

                <TextInput
                    mode="outlined"
                    label="Nome"
                    value={name}
                    onChangeText={setName}
                    style={{ width: "100%", marginTop: 20 }}
                />

                <TextInput
                    mode="outlined"
                    label="Endereço"
                    value={address}
                    onChangeText={setAddress}
                    style={{ width: "100%", marginTop: 20 }}
                />

                <Button
                    mode="contained-tonal"
                    onPress={handleSignup}
                    loading={loading}
                    disabled={loading}
                    style={{ marginTop: 20 }}
                >
                    Registrar
                </Button>
            </View>
        </>
    );
}

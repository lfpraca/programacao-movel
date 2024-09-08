import React, { useState } from "react";
import { Alert, View } from "react-native";
import { Appbar, Button, Text, TextInput } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";

export default function NewOrder() {
    const [imageLoading, setImageLoading] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
    const [amount, setAmount] = useState("1");

    const router = useRouter();

    async function pickImage() {
        setImageLoading(true);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                base64: true,
            });

            if (!result.canceled) {
                // Imagem é convertida para png por causa da compressão
                if (result.assets[0].mimeType !== "image/png") {
                    Alert.alert("Erro ao selecionar anexo");
                    return;
                }

                if (result.assets[0].base64) {
                    setImageBase64(result.assets[0].base64);
                }
            }
        } finally {
            setImageLoading(false);
        }
    }

    async function sendOrder() {
        setOrderLoading(true);
        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/order/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
                body: JSON.stringify({ amount: parseInt(amount, 10), attachment_extension: "png", attachment_base64: imageBase64 }),
            });

            if (response.ok) {
                router.back();
            } else {
                const text = await response.text();
                Alert.alert("Falha no pedido", text ?? "Verifique os dados do pedido");
            }
        } catch (error) {
            Alert.alert("Erro", "Falha ao tentar realizar o pedido. Tente novamente mais tarde.");
        } finally {
            setOrderLoading(false);
        }
    }

    return <>
        <Appbar.Header elevated={true}>
            <Appbar.BackAction onPress={router.back} disabled={orderLoading} />
            <Appbar.Content title="Novo Pedido" />
        </Appbar.Header>

        <View
            style={{
                flex: 1,
                paddingHorizontal: 20,
                paddingTop: 20,
            }}
        >
            <TextInput
                mode="outlined"
                label="Quantidade"
                keyboardType="number-pad"
                value={amount}
                onChangeText={setAmount}
                style={{ width: "100%" }}
                disabled={orderLoading}
            />

            <View style={{ flexDirection: "row", gap: 10, paddingTop: 10, alignItems: "center" }}>
                {amount && <Text variant="titleLarge">Valor: R$ {parseInt(process.env.EXPO_PUBLIC_UNIT_PRICE ?? "0", 10) * parseInt(amount, 10)}</Text>}

                {process.env.EXPO_PUBLIC_CHAVE_PIX && <Button
                    icon="content-copy"
                    mode={imageBase64 ? "outlined" : "contained-tonal"}
                    onPress={() => Clipboard.setStringAsync(process.env.EXPO_PUBLIC_CHAVE_PIX!)}
                    disabled={imageLoading || orderLoading}
                >
                    Copiar Chave Pix
                </Button>}
            </View>

            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    paddingTop: 10,
                }}
            >
                <Button
                    icon="paperclip"
                    mode={imageBase64 ? "outlined" : "contained"}
                    onPress={pickImage}
                    loading={imageLoading}
                    disabled={imageLoading || orderLoading}
                >
                    {imageBase64 ? "Comprovante Adicionado" : "Adicionar Comprovante"}
                </Button>

                <Button
                    mode="contained"
                    disabled={imageLoading || !imageBase64 || !amount || orderLoading}
                    loading={orderLoading}
                    onPress={sendOrder}
                    style={{ marginTop: 10 }}
                >
                    Enviar pedido
                </Button>
            </View>
        </View>
    </>;
}

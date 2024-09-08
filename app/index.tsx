import React, { useCallback, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Appbar, BottomNavigation, FAB, Divider, Text, TouchableRipple } from "react-native-paper";
import { useAuth } from "./_layout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Login from "./Login";

const DATE_FORMAT = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
} as const satisfies Intl.DateTimeFormatOptions;

type HomeData = {
    id: string,
    date: string,
    amount: number,
    state: number,
};

function HomeRoute() {
    const [data, setData] = useState<HomeData[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const router = useRouter();

    async function getData() {
        setRefreshing(true);
        try {
            const token = await AsyncStorage.getItem("authToken");
            const result = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/order/list-my`, {
                method: "GET",
                headers: {
                    "Authorization": `Token ${token}`,
                },
            });
            if (result.ok) {
                setData(await result.json());
            }
        } catch (error) {
            Alert.alert("Erro", "Erro ao tentar listar pedidos. Tente novamente mais tarde.");
        } finally {
            setRefreshing(false);
        }
    }

    function renderBadge(status: number) {
        let statusText = undefined;
        let statusColor = undefined;
        switch (status) {
            case 1:
                statusText = "Recebido";
                statusColor = "#f2f2a7";
                break;
            case 2:
                statusText = "Entregue";
                statusColor = "#a7f2a7";
                break;
        }
        if (statusText === undefined) { return undefined; }

        return <View style={{
            backgroundColor: statusColor,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 25,
            alignSelf: "center"
        }}>
            <Text>{statusText}</Text>
        </View>;
    }

    function renderItem({ item }: { item: HomeData }) {
        return <View>
            <View style={{ padding: 15, flexDirection: "row" }}>
                <View style={{ flex: 1 }}>
                    <Text variant="bodyLarge">{item.amount} Caixa{item.amount === 1 ? "" : "s"} de Brigadeiro</Text>
                    <Text variant="bodySmall" style={{ marginTop: 5 }}>Data: {new Date(item.date).toLocaleString("pt-BR", DATE_FORMAT)}</Text>
                </View>
                {renderBadge(item.state)}
            </View>
            <Divider />
        </View>;
    }

    useFocusEffect(
        useCallback(() => {
            getData();
        }, [])
    );

    return <>
        <Appbar.Header elevated={true}>
            <Appbar.Content title="Pedidos Recentes" />
        </Appbar.Header>
        <FlatList
            refreshing={refreshing}
            onRefresh={getData}
            data={data}
            keyExtractor={x => x.id}
            renderItem={renderItem}
        />

        <FAB
            style={{
                position: "absolute",
                right: 16,
                bottom: 16,
            }}
            icon="plus"
            onPress={() => router.navigate("/NewOrder")}
        />
    </>;
}

type UserSessionProps = {
    onLogout: () => void,
};

function UserSessionRoute(props: UserSessionProps) {
    return <>
        <Appbar.Header elevated={true}>
            <Appbar.Content title="Usuário" />
        </Appbar.Header>
        <View style={{ flex: 1 }}>
            <TouchableRipple onPress={props.onLogout}>
                <Text style={{ margin: 15 }} variant="bodyLarge">Log Out</Text>
            </TouchableRipple>
            <Divider />
        </View>
    </>;
}

export default function Index() {
    const [index, setIndex] = useState(0);

    const { onLogout, isLoggedIn } = useAuth();

    const [ROUTES] = useState([
        { key: "home", title: "Início", focusedIcon: "home" },
        { key: "userSession", title: "Usuário", focusedIcon: "account" },
    ]);

    const renderScene = BottomNavigation.SceneMap({
        home: HomeRoute,
        userSession: () => <UserSessionRoute onLogout={onLogout} />,
    });

    return isLoggedIn ? (
        <BottomNavigation
            navigationState={{ index, routes: ROUTES }}
            onIndexChange={setIndex}
            renderScene={renderScene}
        />
    ) : (<Login />);
}

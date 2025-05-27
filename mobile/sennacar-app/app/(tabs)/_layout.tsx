import { Tabs } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

// Ícones SVG
import CalendarWhite from "../../assets/icons/calendar-white.svg";
import CalendarGreen from "../../assets/icons/calendar-navbar-green.svg";
import SearchWhite from "../../assets/icons/search-white.svg";
import SearchGreen from "../../assets/icons/search-green.svg";
import UserWhite from "../../assets/icons/user-white.svg";
import UserGreen from "../../assets/icons/user-green.svg";
import ToolsWhite from "../../assets/icons/tools-white.svg";
import ToolsGreen from "../../assets/icons/tools-green.svg";

export default function TabLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: "#017b36",
          borderTopWidth: 0,
          height: 80,
          position: "absolute",
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
          marginBottom: 10,
        },
        tabBarActiveTintColor: "#005725",
        tabBarInactiveTintColor: "#ffffff",
        tabBarIcon: ({ focused }) => {
          const size = 32;
          switch (route.name) {
            case "agendamentos":
              return focused ? (
                <CalendarGreen
                  width={size}
                  height={size}
                  style={{ marginTop: 6 }}
                />
              ) : (
                <CalendarWhite
                  width={size}
                  height={size}
                  style={{ marginTop: 6 }}
                />
              );
            case "busca":
              return focused ? (
                <SearchGreen
                  width={size}
                  height={size}
                  style={{ marginTop: 6 }}
                />
              ) : (
                <SearchWhite
                  width={size}
                  height={size}
                  style={{ marginTop: 6 }}
                />
              );
            case "perfil":
              return focused ? (
                <UserGreen
                  width={size}
                  height={size}
                  style={{ marginTop: 6 }}
                />
              ) : (
                <UserWhite
                  width={size}
                  height={size}
                  style={{ marginTop: 6 }}
                />
              );
            case "admin":
              return focused ? (
                <ToolsGreen
                  width={size}
                  height={size}
                  style={{ marginTop: 6 }}
                />
              ) : (
                <ToolsWhite
                  width={size}
                  height={size}
                  style={{ marginTop: 6 }}
                />
              );
            default:
              return null;
          }
        },
      })}
    >
      <Tabs.Screen name="agendamentos" options={{ title: "Agendamentos" }} />
      <Tabs.Screen name="busca" options={{ title: "Buscar Clientes" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Administração",
          tabBarItemStyle: { display: user?.isAdmin ? "flex" : "none" },
        }}
      />
    </Tabs>
  );
}

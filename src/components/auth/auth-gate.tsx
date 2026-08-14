import { useState } from "react";
import { useAuthStore } from "../../stores/auth-store";
import { ForgotFlow } from "./forgot-flow";
import { LoginScreen } from "./login-screen";
import { RegisterScreen } from "./register-screen";

type AuthScreen = "login" | "register" | "forgot";

export function AuthGate() {
  const hasAccounts = useAuthStore((state) => state.hasAccounts);
  const [screen, setScreen] = useState<AuthScreen>(hasAccounts ? "login" : "register");

  if (screen === "register") {
    return <RegisterScreen onLogin={() => setScreen("login")} />;
  }
  if (screen === "forgot") {
    return <ForgotFlow onLogin={() => setScreen("login")} />;
  }
  return (
    <LoginScreen onRegister={() => setScreen("register")} onForgot={() => setScreen("forgot")} />
  );
}

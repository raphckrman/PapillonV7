import Constants, { ExecutionEnvironment } from "expo-constants";
import { useAlert } from "@/providers/AlertProvider";

export const isExpoGo = () => {
  return Constants.executionEnvironment !== ExecutionEnvironment.Bare;
};

export const alertExpoGo = async () => {
  const { showAlert } = useAlert();
  showAlert({
    title: "Tu développes à l'aide d'Expo Go",
    message: "Sous Expo Go, les appels aux API natives sont indisponibles. Utilise un build de développement pour accéder à toutes les fonctionnalités.",
  });
};

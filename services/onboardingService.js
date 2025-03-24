import AsyncStorage from "@react-native-async-storage/async-storage";

/*
 * Guardamos en el AsyncStorage ya que está bandera no es ningún dato sensible
 * que requiera ser guardado en el SecureStore
 */

//Constante que almacena la clave del onboarding
export const ONBOARDING_KEY = "hasCompletedOnboarding";

export const hasCompletedOnboarding = async () => {
    const storedStatus = await AsyncStorage.getItem(ONBOARDING_KEY);
    return storedStatus === "true";
};

export const markOnboardingAsCompleted = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
};
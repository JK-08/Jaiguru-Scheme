// utils/useFonts.js
import { useFonts as useExpoFonts } from 'expo-font';

const useFonts = () => {
  const [fontsLoaded] = useExpoFonts({
    'Poppins-Thin': require('../Assets/Fonts/Poppins/Poppins-Thin.ttf'),
    'Poppins-Light': require('../Assets/Fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Regular': require('../Assets/Fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../Assets/Fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../Assets/Fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../Assets/Fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('../Assets/Fonts/Poppins/Poppins-ExtraBold.ttf'),
  });
  return fontsLoaded;
};

export default useFonts;
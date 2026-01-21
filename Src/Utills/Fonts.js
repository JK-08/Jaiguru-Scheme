// utils/useFonts.js
import * as Font from 'expo-font';

const useFonts = async () => {
  await Font.loadAsync({
    // 🖋️ Poppins Family (7 fonts as per your theme)


    'Poppins-Thin': require('../Assets/Fonts/Poppins/Poppins-Thin.ttf'),
    'Poppins-Light': require('../Assets/Fonts/Poppins/Poppins-Light.ttf'),
    'Poppins-Regular': require('../Assets/Fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../Assets/Fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../Assets/Fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../Assets/Fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('../Assets/Fonts/Poppins/Poppins-ExtraBold.ttf'),

  });
};

export default useFonts;
import { registerRootComponent } from 'expo';
import { setupBackgroundHandler } from './Src/Helpers/NotificationHelper';
import App from './App';

// Register Firebase background message handler before React mounts
setupBackgroundHandler();

registerRootComponent(App);

import { Platform } from 'react-native';

const noop = () => {};
const noopAsync = async () => [];

let getHash: () => Promise<string[]>;
let useOtpVerify: (opts?: { numberOfDigits?: number }) => {
  message: string | null;
  timeoutError: boolean;
  startListener: (() => void) | undefined;
  stopListener: (() => void) | undefined;
};
let removeListener: () => void;

if (Platform.OS === 'android') {
  const mod = require('react-native-otp-verify');
  getHash = mod.getHash;
  useOtpVerify = mod.useOtpVerify;
  removeListener = mod.removeListener;
} else {
  getHash = noopAsync;
  useOtpVerify = () => ({ message: null, timeoutError: false, startListener: undefined, stopListener: undefined });
  removeListener = noop;
}

export { getHash, useOtpVerify, removeListener };

import { useNetInfo } from '@react-native-community/netinfo';

/** `true` unless the device is known to be offline (unknown state is treated as online). */
export default function useOnline() {
  const { isConnected, isInternetReachable } = useNetInfo();
  return isConnected !== false && isInternetReachable !== false;
}

import '@testing-library/jest-native/extend-expect';

// Definindo variáveis globais necessárias
global.__reanimatedWorkletInit = jest.fn();
global.Window = undefined;

// Mock para Platform e Constants
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(obj => obj.ios),
  isDisableAnimations: jest.fn(),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Mock para Platform e Constants
  RN.Platform.OS = 'ios';
  RN.Platform.select = jest.fn(obj => obj.ios);
  RN.Platform.isDisableAnimations = jest.fn();

  // Mock para NativeModules
  RN.NativeModules = {
    ...RN.NativeModules,
    StatusBarManager: {
      getHeight: jest.fn(),
      setStyle: jest.fn(),
      setHidden: jest.fn(),
    },
    PlatformConstants: {
      getConstants: () => ({
        forceTouchAvailable: false,
        interfaceIdiom: 'phone',
        isTesting: true,
        reactNativeVersion: { major: 0, minor: 65, patch: 1 },
      }),
    },
  };

  // Mock para Animated
  RN.Animated = {
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => ({
        interpolate: jest.fn(),
      })),
    })),
    View: jest.fn(({ children }) => children),
    Text: jest.fn(({ children }) => children),
    timing: jest.fn(() => ({
      start: jest.fn(cb => cb?.()),
      reset: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(cb => cb?.()),
      reset: jest.fn(),
    })),
    sequence: jest.fn(),
    parallel: jest.fn(),
    loop: jest.fn(),
  };

  return RN;
});

// Mock para react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock para react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    /* Buttons */
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    /* Other */
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Direction: {},
  };
});

// Mock para NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock para AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock para SQLite
jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(),
  })),
}));

// Mock para ImagePicker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ cancelled: false, uri: 'test-uri' })),
}));

// Mock para SafeAreaContext
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock para date-fns locale
jest.mock('date-fns/locale', () => ({
  ptBR: {},
}));

// Mock para DropDownPicker
jest.mock('react-native-dropdown-picker', () => {
  const React = require('react');
  return function MockDropDownPicker(props) {
    return React.createElement('View', props, props.children);
  };
});

// Mock para lucide-react-native
jest.mock('lucide-react-native', () => ({
  Camera: 'Camera',
  Clock: 'Clock',
  Edit2: 'Edit2',
  Save: 'Save',
  X: 'X',
  Search: 'Search',
  User: 'User',
  Mail: 'Mail',
  Phone: 'Phone',
  Plus: 'Plus',
  ClipboardList: 'ClipboardList',
  AlertCircle: 'AlertCircle',
}));

// Mock para react-native-svg
jest.mock('react-native-svg', () => ({
  SvgUri: 'SvgUri',
  Svg: 'Svg',
  Circle: 'Circle',
  Path: 'Path',
  Line: 'Line',
}));

// Suppress warnings
jest.spyOn(global.console, 'warn').mockImplementation(() => {});
jest.spyOn(global.console, 'error').mockImplementation(() => {});

// Setup para @testing-library/jest-native
import '@testing-library/jest-native/extend-expect';
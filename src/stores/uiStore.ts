import { create } from 'zustand';
import { MaterialIcons } from '@expo/vector-icons';

export type AlertDialogType = 'error' | 'success' | 'warning' | 'info' | 'confirmation'; 

export interface AlertDialogButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  isLoading?: boolean; 
}

interface AlertDialogProps {
  isVisible: boolean;
  title: string;
  message: string;
  type: AlertDialogType;
  buttons: AlertDialogButton[];
}

interface UIState {
  alertProps: AlertDialogProps;
  showAlert: (props: Omit<AlertDialogProps, 'isVisible'>) => void;
  hideAlert: () => void;
  isKeyboardVisible: boolean;
  setKeyboardVisible: (visible: boolean) => void;
}

const useUIStore = create<UIState>((set) => ({
  alertProps: {
    isVisible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [],
  },
  showAlert: (props) => set({ alertProps: { ...props, isVisible: true } }),
  hideAlert: () =>
    set((state) => ({
      alertProps: { ...state.alertProps, isVisible: false },
    })),
  isKeyboardVisible: false,
  setKeyboardVisible: (visible) => set({ isKeyboardVisible: visible }),
}));

export default useUIStore;

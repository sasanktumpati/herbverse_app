import { create } from 'zustand';
import firestore from '@react-native-firebase/firestore';
import { Order, OrderStatus } from '../ordersStore'; 
import useAuthStore from '../authStore';

export type VendorOrder = Order;

interface VendorOrdersState {
  vendorOrders: Order[];
  isLoading: boolean;
  error: Error | null;
  fetchVendorOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  listenToVendorOrders: () => (() => void) | undefined;
  clearVendorOrders: () => void;
}

const useVendorOrdersStore = create<VendorOrdersState>((set, get) => ({
  vendorOrders: [],
  isLoading: false,
  error: null,

  fetchVendorOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await firestore().collection('orders').orderBy('createdAt', 'desc').get();
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VendorOrder));
      set({ vendorOrders: orders, isLoading: false });
    } catch (e: any) {
      set({ error: e, isLoading: false });
      console.error("Error fetching orders:", e);
    }
  },
  
  listenToVendorOrders: () => {
    set({ isLoading: true, error: null });
    const unsubscribe = firestore()
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VendorOrder));
          set({ vendorOrders: orders, isLoading: false });
        },
        (e: any) => {
          set({ error: e, isLoading: false });
          console.error("Error listening to orders:", e);
        }
      );
    return unsubscribe;
  },

  updateOrderStatus: async (orderId: string, newStatus: OrderStatus) => {
    set({ isLoading: true });
    try {
      await firestore().collection('orders').doc(orderId).update({
        status: newStatus,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      
      set(state => ({
        vendorOrders: state.vendorOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ),
        isLoading: false,
      }));
    } catch (e: any) {
      set({ error: e, isLoading: false });
      console.error("Error updating order status:", e);
    }
  },
  
  clearVendorOrders: () => {
    set({ vendorOrders: [], isLoading: false, error: null });
  }
}));

let vendorOrdersUnsubscribe: (() => void) | undefined = undefined;

useAuthStore.subscribe((state, prevState) => {
  const { user, isVendor } = state;
  const { listenToVendorOrders, clearVendorOrders } = useVendorOrdersStore.getState();

  if (user && isVendor && (!prevState.user || !prevState.isVendor)) {
    console.log('[VendorOrdersStore] Vendor logged in, starting listener for orders.');
    if (vendorOrdersUnsubscribe) vendorOrdersUnsubscribe(); 
    vendorOrdersUnsubscribe = listenToVendorOrders();
  } else if ((!user || !isVendor) && (prevState.user && prevState.isVendor)) {
    console.log('[VendorOrdersStore] Vendor logged out or role changed, clearing orders and listener.');
    if (vendorOrdersUnsubscribe) vendorOrdersUnsubscribe();
    vendorOrdersUnsubscribe = undefined;
    clearVendorOrders();
  }
});

export default useVendorOrdersStore;
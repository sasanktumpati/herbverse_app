import { create } from 'zustand';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import useAuthStore from './authStore';
import useCartStore, { Cart, CartItem } from './cartStore';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed';

export interface OrderItem extends CartItem { // Essentially a cart item at the time of order
  // Potentially add priceAtOrder if prices can change and you need to lock it
}

export interface Order {
  id: string; // Firestore document ID
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  totalQuantity: number;
  status: OrderStatus;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  orderNumber?: string; // User-friendly order identifier
}

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  error: Error | null;
  currentOrder: Order | null; // For tracking a newly created or viewed order
  createOrderFromCart: () => Promise<string | null>;
  fetchUserOrders: () => Promise<void>;
  listenToUserOrders: () => (() => void) | undefined; // Returns an unsubscribe function
  clearOrders: () => void;
  // Future: updateOrderStatus (admin), cancelOrder (user/admin)
}

const generateOrderNumber = async () => {
  // This is a simple counter. For production, you might want a more robust system.
  const counterRef = firestore().collection('internal').doc('orderCounter');
  return firestore().runTransaction(async transaction => {
    const counterDoc = await transaction.get(counterRef);
    let newCount = 1;
    if (counterDoc.exists) {
      newCount = (counterDoc.data()?.count || 0) + 1;
    }
    transaction.set(counterRef, { count: newCount }, { merge: true });
    return `ORD-${String(newCount).padStart(6, '0')}`;
  });
};

const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,
  currentOrder: null,

  createOrderFromCart: async (): Promise<string | null> => {
    const { user } = useAuthStore.getState();
    const { cart } = useCartStore.getState();

    if (!user) {
      set({ error: new Error("User not authenticated"), isLoading: false });
      return null;
    }
    if (!cart || cart.items.length === 0) {
      set({ error: new Error("Cart is empty"), isLoading: false });
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      const orderNumber = await generateOrderNumber();
      const newOrderRef = firestore().collection('orders').doc(); // Auto-generate ID
      const orderData: Omit<Order, 'id'> = {
        userId: user.uid,
        items: cart.items.map(item => ({ ...item })), // Create a snapshot of cart items
        totalPrice: cart.totalPrice,
        totalQuantity: cart.totalQuantity,
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
        updatedAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
        orderNumber,
      };

      await newOrderRef.set(orderData);
      
      // Clear the Firestore cart after successful order creation
      const cartRef = firestore().collection('carts').doc(user.uid);
      await cartRef.update({
        items: [],
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
      // The cartStore's onSnapshot will update its local state.

      set({ currentOrder: { id: newOrderRef.id, ...orderData }, isLoading: false });
      return newOrderRef.id;
    } catch (e: any) {
      set({ error: e, isLoading: false });
      console.error("Error creating order:", e);
      return null;
    }
  },

  fetchUserOrders: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      // set({ error: new Error("User not authenticated for fetching orders"), isLoading: false });
      // It's better to just clear orders if user is not available
      set({ orders: [], isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const ordersSnapshot = await firestore()
        .collection('orders')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .get();
      
      const userOrders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      set({ orders: userOrders, isLoading: false });
    } catch (e: any) {
      set({ error: e, isLoading: false });
      console.error("Error fetching user orders:", e);
    }
  },

  listenToUserOrders: () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      get().clearOrders();
      return undefined;
    }
    set({ isLoading: true });
    const unsubscribe = firestore()
      .collection('orders')
      .where('userId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const userOrders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Order[];
          set({ orders: userOrders, isLoading: false, error: null });
        },
        (e) => {
          console.error("Error listening to user orders:", e);
          set({ error: e, isLoading: false });
        }
      );
    return unsubscribe; 
  },

  clearOrders: () => {
    set({ orders: [], currentOrder: null, isLoading: false, error: null });
  },
}));

// Initialize orders listener when user logs in and clear on logout
let ordersUnsubscribe: (() => void) | undefined = undefined;

useAuthStore.subscribe((state, prevState) => {
  const { user } = state;
  const { listenToUserOrders, clearOrders } = useOrdersStore.getState();

  if (user && !prevState.user) { // User logged in
    if (ordersUnsubscribe) {
        ordersUnsubscribe(); // Unsubscribe from previous listener if any
    }
    ordersUnsubscribe = listenToUserOrders();
  } else if (!user && prevState.user) { // User logged out
    if (ordersUnsubscribe) {
      ordersUnsubscribe();
      ordersUnsubscribe = undefined;
    }
    clearOrders();
  }
});

export default useOrdersStore; 
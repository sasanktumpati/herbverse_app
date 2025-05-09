import { create } from 'zustand';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import useAuthStore, { UserProfile } from './authStore'; // Assuming UserProfile is exported
import { Item } from './itemsStore'; // Assuming Item is exported

export interface CartItem extends Item { // Extends Item to include all item details
  quantity: number;
  addedAt: FirebaseFirestoreTypes.Timestamp;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalPrice: number;
  totalQuantity: number;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: Error | null;
  isCartSubscribing: boolean;
  unsubscribeCartListener?: () => void;
  loadAndSubscribeCart: (userId: string) => void;
  addItemToCart: (item: Item, quantity: number) => Promise<void>;
  removeItemFromCart: (itemId: string) => Promise<void>;
  updateItemQuantityInCart: (itemId: string, newQuantity: number) => Promise<void>;
  clearLocalCart: () => void; // Clears cart from state, e.g., on logout
  // clearFirestoreCart is handled by specific actions like checkout
}

const calculateCartTotals = (items: CartItem[]) => {
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  return { totalPrice, totalQuantity };
};

const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,
  isCartSubscribing: false,
  unsubscribeCartListener: undefined,

  loadAndSubscribeCart: (userId) => {
    if (get().isCartSubscribing || !userId) return;
    console.log(`[CartStore] Starting cart subscription for userId: ${userId}`);
    set({ isLoading: true, error: null, isCartSubscribing: true });

    const cartRef = firestore().collection('carts').doc(userId);

    const unsubscribe = cartRef.onSnapshot(
      (docSnapshot) => {
        // Properly check existence: use function or property
        const exists = typeof docSnapshot.exists === 'function'
          ? docSnapshot.exists()
          : docSnapshot.exists;
        console.log("[CartStore] Received cart snapshot for userId", userId, "exists:", exists);
        const data = docSnapshot.data();
        if (exists && data) {
          const cartData = data as Cart;
          const { totalPrice, totalQuantity } = calculateCartTotals(cartData.items || []);
          console.log("[CartStore] Cart loaded: items count", cartData.items?.length || 0, "totalPrice", totalPrice, "totalQuantity", totalQuantity);
          set({ cart: { ...cartData, totalPrice, totalQuantity }, isLoading: false });
        } else {
          console.log("[CartStore] No existing cart data (exists=false or data undefined), creating initial cart");
          const newCart: Cart = {
            userId,
            items: [],
            totalPrice: 0,
            totalQuantity: 0,
            updatedAt: firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp,
          };
          console.log("[CartStore] Initial cart data:", newCart);
          set({ cart: newCart, isLoading: false });
          cartRef.set(newCart, { merge: true }).catch(e => console.error("[CartStore] Failed to create initial cart:", e));
        }
      },
      (e) => {
        console.error("[CartStore] Error listening to cart snapshot:", e);
        set({ error: e, isLoading: false, isCartSubscribing: false });
      }
    );
    set({ unsubscribeCartListener: unsubscribe });
  },

  addItemToCart: async (item: Item, quantity: number) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) {
      set({ error: new Error("User not authenticated"), isLoading: false });
      return;
    }
    console.log(`[CartStore] addItemToCart called for userId: ${userId}, itemId: ${item.id}, quantity: ${quantity}`);
    set({ isLoading: true, error: null });
    try {
      const cartRef = firestore().collection('carts').doc(userId);
      const cartDoc = await cartRef.get();
      let currentItems: CartItem[] = [];

      if (cartDoc.exists) {
        currentItems = (cartDoc.data() as Cart).items || [];
      }

      const existingItemIndex = currentItems.findIndex(ci => ci.id === item.id);
      if (existingItemIndex > -1) {
        currentItems[existingItemIndex].quantity += quantity;
      } else {
        currentItems.push({
            ...item,
            quantity,
            addedAt: firestore.Timestamp.now()
        });
      }
      const { totalPrice, totalQuantity } = calculateCartTotals(currentItems);
      await cartRef.set({
        userId,
        items: currentItems,
        updatedAt: firestore.FieldValue.serverTimestamp(),
        // totalPrice and totalQuantity are calculated client-side from items
      }, { merge: true }); // Use set with merge to create if not exists or update
      // Snapshot listener will update the state
      console.log("[CartStore] Item added, waiting for snapshot update");
      set({ isLoading: false });

    } catch (e: any) {
      set({ error: e, isLoading: false });
      console.error("[CartStore] Error adding item to cart:", e);
    }
  },

  removeItemFromCart: async (itemId: string) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) {
      set({ error: new Error("User not authenticated"), isLoading: false });
      return;
    }
    console.log(`[CartStore] removeItemFromCart called for userId: ${userId}, itemId: ${itemId}`);
    set({ isLoading: true, error: null });
    try {
      const cartRef = firestore().collection('carts').doc(userId);
      const cartDoc = await cartRef.get();
      if (!cartDoc.exists) throw new Error("Cart not found");

      let currentItems = (cartDoc.data() as Cart).items || [];
      currentItems = currentItems.filter(item => item.id !== itemId);
      
      await cartRef.update({ 
        items: currentItems,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      // Snapshot listener will update the state
      console.log("[CartStore] Item removed, waiting for snapshot update");
      set({ isLoading: false });
    } catch (e: any) {
      set({ error: e, isLoading: false });
      console.error("[CartStore] Error removing item from cart:", e);
    }
  },

  updateItemQuantityInCart: async (itemId: string, newQuantity: number) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) {
      set({ error: new Error("User not authenticated"), isLoading: false });
      return;
    }
    if (newQuantity <= 0) { // If quantity is 0 or less, remove the item
      console.log(`[CartStore] newQuantity <= 0, removing item ${itemId}`);
      return get().removeItemFromCart(itemId);
    }
    console.log(`[CartStore] updateItemQuantityInCart called for userId: ${userId}, itemId: ${itemId}, newQuantity: ${newQuantity}`);
    set({ isLoading: true, error: null });
    try {
      const cartRef = firestore().collection('carts').doc(userId);
      const cartDoc = await cartRef.get();
      if (!cartDoc.exists) throw new Error("Cart not found");

      let currentItems = (cartDoc.data() as Cart).items || [];
      const itemIndex = currentItems.findIndex(item => item.id === itemId);

      if (itemIndex > -1) {
        currentItems[itemIndex].quantity = newQuantity;
        await cartRef.update({ 
          items: currentItems,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
        // Snapshot listener will update the state
        console.log("[CartStore] Item quantity updated, waiting for snapshot update");
        set({ isLoading: false });
      } else {
        throw new Error("Item not found in cart to update.");
      }
    } catch (e: any) {
      set({ error: e, isLoading: false });
      console.error("[CartStore] Error updating item quantity:", e);
    }
  },
  
  clearLocalCart: () => {
    console.log("[CartStore] clearLocalCart called, unsubscribing and clearing state");
    const { unsubscribeCartListener } = get();
    if (unsubscribeCartListener) {
      unsubscribeCartListener();
    }
    set({ cart: null, isLoading: false, error: null, isCartSubscribing: false, unsubscribeCartListener: undefined });
  },
}));

// Subscribe to auth changes to load/clear cart
useAuthStore.subscribe(
  (state, prevState) => {
    const { user } = state;
    const { loadAndSubscribeCart, clearLocalCart, cart, isCartSubscribing } = useCartStore.getState();
    
    if (user && !prevState.user) { // User logged in
      console.log('User logged in, loading cart for:', user.uid);
      if (!cart || cart.userId !== user.uid || !isCartSubscribing) {
        loadAndSubscribeCart(user.uid);
      }
    } else if (!user && prevState.user) { // User logged out
      console.log('User logged out, clearing cart.');
      clearLocalCart();
    }
  }
);

export default useCartStore;
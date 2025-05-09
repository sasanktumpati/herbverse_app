import { create } from 'zustand';
import firestore from '@react-native-firebase/firestore';
import { Item } from '../itemsStore'; 
import useAuthStore from '../authStore';

export interface VendorItem extends Item {
  vendorId: string;
}

interface VendorItemsState {
  vendorItems: VendorItem[];
  isLoading: boolean;
  error: Error | null;
  fetchVendorItems: () => Promise<void>;
  addItem: (itemData: Omit<VendorItem, 'id' | 'createdAt' | 'vendorId'>) => Promise<string | null>;
  updateItem: (itemId: string, itemData: Partial<Omit<VendorItem, 'id' | 'createdAt' | 'vendorId'>>) => Promise<void>;
  toggleItemActiveStatus: (itemId: string, isActive: boolean) => Promise<void>; 
}

const useVendorItemsStore = create<VendorItemsState>((set, get) => ({
  vendorItems: [],
  isLoading: false,
  error: null,

  fetchVendorItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await firestore()
        .collection('items')
        .orderBy('createdAt', 'desc')
        .get();
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VendorItem));
      set({ vendorItems: items, isLoading: false });
    } catch (e: any) {
      set({ error: e, isLoading: false });
      console.error("Error fetching items:", e);
    }
  },

  addItem: async (itemData: Omit<VendorItem, 'id' | 'createdAt' | 'vendorId'>) => {
    const vendorId = useAuthStore.getState().user?.uid;
    if (!vendorId) {
      set({ error: new Error("Vendor not authenticated") });
      return null;
    }
    set({ isLoading: true });
    try {
      
      const newItem: any = {
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        vendorId,
        isActive: itemData.isActive === undefined ? true : itemData.isActive,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };
      if (itemData.imageUrl) newItem.imageUrl = itemData.imageUrl;
      if (itemData.category) newItem.category = itemData.category;
      const docRef = await firestore().collection('items').add(newItem);
      await get().fetchVendorItems(); 
      set({ isLoading: false });
      return docRef.id;
    } catch (e: any) {
      set({ error: e, isLoading: false });
      console.error("Error adding item:", e);
      return null;
    }
  },

  updateItem: async (itemId: string, itemData: Partial<Omit<VendorItem, 'id' | 'createdAt' | 'vendorId'>>) => {
    const vendorId = useAuthStore.getState().user?.uid;
    if (!vendorId) {
      set({ error: new Error("Vendor not authenticated") });
      return;
    }
    set({ isLoading: true });
    try { 
      const currentItem = get().vendorItems.find(item => item.id === itemId);
      if (currentItem?.vendorId !== vendorId) {
        throw new Error("Item does not belong to this vendor or not found.");
      }
      await firestore().collection('items').doc(itemId).update({
        ...itemData,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      await get().fetchVendorItems(); 
      set({ isLoading: false });
    } catch (e: any) {
      set({ error: e, isLoading: false });
      console.error("Error updating item:", e);
    }
  },

  toggleItemActiveStatus: async (itemId: string, isActive: boolean) => { 
    set(state => ({
      vendorItems: state.vendorItems.map(item => 
        item.id === itemId ? { ...item, isActive } : item
      ),
      isLoading: true,
    }));
    try {
      await firestore().collection('items').doc(itemId).update({ isActive });
      set({ isLoading: false });
    } catch (e: any) {
      
      set(state => ({
        vendorItems: state.vendorItems.map(item => 
          item.id === itemId ? { ...item, isActive: !isActive } : item
        ),
        error: e, 
        isLoading: false 
      }));
      console.error("Error toggling item active status:", e);
    }
  },
}));


useAuthStore.subscribe((state, prevState) => {
  const { user, isVendor } = state;
  const { fetchVendorItems, vendorItems } = useVendorItemsStore.getState();

  if (user && isVendor && (!prevState.user || !prevState.isVendor)) {
    console.log('[VendorItemsStore] Vendor logged in, fetching items.');
    if (vendorItems.length === 0) { 
        fetchVendorItems();
    }
  } else if ((!user || !isVendor) && (prevState.user && prevState.isVendor)) {
    console.log('[VendorItemsStore] Vendor logged out or role changed, clearing items.');
    useVendorItemsStore.setState({ vendorItems: [], isLoading: false, error: null });
  }
});


export default useVendorItemsStore;
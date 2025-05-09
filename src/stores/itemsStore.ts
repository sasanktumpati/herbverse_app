import { create } from 'zustand';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// Define the structure of an Item
export interface Item {
  id: string; // Document ID from Firestore
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  isActive: boolean; // new field indicating active status
  // Add any other relevant fields for an item
}

interface ItemsState {
  items: Item[];
  isLoading: boolean;
  error: Error | null;
  fetchItems: () => Promise<void>;
  getItemById: (id: string) => Item | undefined;
  // Future: addItem, updateItem, deleteItem (admin functionalities)
}

const useItemsStore = create<ItemsState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await firestore().collection('items').orderBy('createdAt', 'desc').get();
      const items = snapshot.docs.map(doc => {
        const data = doc.data() as Partial<Item>;
        return {
          id: doc.id,
          ...data,
          isActive: data.isActive ?? true,
        } as Item;
      }).filter(item => item.isActive);
      set({ items, isLoading: false });
    } catch (e: any) {
      set({ error: e, isLoading: false });
      console.error("Error fetching items:", e);
    }
  },

  getItemById: (id: string) => {
    return get().items.find(item => item.id === id && item.isActive);
  },

  // Placeholder for adding an item (typically an admin function)
  // addItem: async (itemData: Omit<Item, 'id' | 'createdAt'>) => {
  //   set({ isLoading: true });
  //   try {
  //     const docRef = await firestore().collection('items').add({
  //       ...itemData,
  //       createdAt: firestore.FieldValue.serverTimestamp(),
  //     });
  //     // Optionally re-fetch items or add to local state
  //     // For simplicity, you might re-fetch or update locally if needed:
  //     // const newItem = { id: docRef.id, ...itemData, createdAt: new Date() } // Approximate timestamp
  //     // set(state => ({ items: [newItem, ...state.items], isLoading: false }));
  //     await get().fetchItems(); // Re-fetch to ensure consistency
  //     set({ isLoading: false });
  //     return docRef.id;
  //   } catch (e: any) {
  //     set({ error: e, isLoading: false });
  //     console.error("Error adding item:", e);
  //     return null;
  //   }
  // },
}));

export default useItemsStore;
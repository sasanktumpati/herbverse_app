import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FocusAwareStatusBar } from '@/components/common/status-bar';
import useUIStore from '@/stores/uiStore';
import useVendorItemsStore from '@/stores/vendor/vendorItemsStore';


const ImagePickerPlaceholder = ({ currentImageUrl, onImagePicked }) => (
  <Pressable 
    onPress={() => Alert.alert("Image Picker", "Image picker functionality to be implemented.")}
    className="w-full h-40 bg-herb-surface border-2 border-dashed border-herb-divider rounded-xl items-center justify-center mb-4 active:bg-herb-divider/50"
  >
    {currentImageUrl ? (
      <Text className="text-herb-muted font-poppins">Current Image (Tap to change)</Text>
    ) : (
      <>
        <MaterialIcons name="add-photo-alternate" size={40} color="#A0AEC0" />
        <Text className="text-herb-muted font-poppins mt-2">Tap to select image</Text>
      </>
    )}
  </Pressable>
);


export default function EditItemScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const { id: itemId } = useLocalSearchParams<{ id: string }>();
  const showAlert = useUIStore(state => state.showAlert);
  
  const { 
    vendorItems, 
    updateItem, 
    isLoading: storeLoading, 
    error: storeError,
    fetchVendorItems 
  } = useVendorItemsStore();

  const [item, setItem] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false); 

  useEffect(() => {
    const currentItem = vendorItems.find(i => i.id === itemId);
    if (currentItem) {
      setItem(currentItem);
      setName(currentItem.name);
      setDescription(currentItem.description);
      setPrice(currentItem.price.toString());
      setCategory(currentItem.category || '');
      setImageUrl(currentItem.imageUrl || '');
      setIsActive(currentItem.isActive);
    } else {
      
      fetchVendorItems().then(() => {
        const fetchedItem = useVendorItemsStore.getState().vendorItems.find(i => i.id === itemId);
        if (fetchedItem) {
          setItem(fetchedItem);
          
        } else {
          showAlert({title: "Not Found", message: "Item not found.", type: 'error', buttons: [{text: "OK", onPress: () => router.back()}]});
        }
      });
    }
  }, [itemId, vendorItems, fetchVendorItems]);

  const handleUpdateItem = async () => {
    if (!name.trim() || !description.trim() || !price.trim()) {
      showAlert({title: "Missing Fields", message: "Please fill in name, description, and price.", type: 'warning', buttons: [{text: "OK"}]});
      return;
    }
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      showAlert({title: "Invalid Price", message: "Please enter a valid positive price.", type: 'warning', buttons: [{text: "OK"}]});
      return;
    }

    setIsLoading(true);
    const updatedData = {
      name,
      description,
      price: priceValue,
      category: category.trim() || undefined,
      imageUrl: imageUrl || undefined,
      isActive,
    };

    await updateItem(itemId, updatedData);
    setIsLoading(false);

    if (useVendorItemsStore.getState().error) { 
      showAlert({
        title: "Update Failed", 
        message: useVendorItemsStore.getState().error?.message || "Could not update item. Please try again.", 
        type: 'error',
        buttons: [{ text: "OK" }]
      });
    } else {
      showAlert({
        title: "Item Updated", 
        message: `${name} has been successfully updated.`, 
        type: 'success',
        buttons: [{ text: "OK", onPress: () => router.back() }]
      });
    }
  };
  
  const inputClassName = "bg-white border border-herb-divider rounded-xl px-4 py-3.5 text-base font-poppins text-herb-textPrimary focus:border-herb-primary mb-4 h-14";
  const labelClassName = "text-sm font-poppins-medium text-herb-textPrimary mb-1.5 ml-1";

  if (!item && (storeLoading || isLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} className="bg-herb-surface-alt">
        <ActivityIndicator size="large" color="#2B4D3F" />
        <Text className="text-herb-muted font-poppins mt-2">Loading item details...</Text>
      </View>
    );
  }
  
  if (!item) { 
     return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} className="bg-herb-surface-alt">
        <Text className="text-herb-error font-poppins">Item not found.</Text>
      </View>
    );
  }


  return (
    <>
    <FocusAwareStatusBar />
    <View style={{ flex: 1}} className="bg-herb-surface-alt">
      <View className="px-5 pt-5 pb-4 flex-row items-center bg-white shadow-sm">
        <Pressable onPress={() => router.back()} className="p-2 mr-2 -ml-2">
          <MaterialIcons name="arrow-back" size={26} color="#2B4D3F" />
        </Pressable>
        <Text className="text-2xl font-poppins-bold text-herb-primaryDark flex-1" numberOfLines={1}>Edit: {item.name}</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ImagePickerPlaceholder currentImageUrl={imageUrl} onImagePicked={setImageUrl} />

        <Text className={labelClassName}>Item Name*</Text>
        <TextInput
          placeholder="e.g., Organic Ashwagandha Root"
          value={name}
          onChangeText={setName}
          className={inputClassName}
          placeholderTextColor="#A0AEC0"
        />

        <Text className={labelClassName}>Description*</Text>
        <TextInput
          placeholder="Detailed description of the item..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          className={`${inputClassName} h-28 py-3`}
          textAlignVertical="top"
          placeholderTextColor="#A0AEC0"
        />

        <Text className={labelClassName}>Price (USD)*</Text>
        <TextInput
          placeholder="e.g., 12.99"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          className={inputClassName}
          placeholderTextColor="#A0AEC0"
        />
        
        <Text className={labelClassName}>Category</Text>
        <TextInput
          placeholder="e.g., Adaptogens, Immunity (optional)"
          value={category}
          onChangeText={setCategory}
          className={inputClassName}
          placeholderTextColor="#A0AEC0"
        />

        <View className="flex-row justify-between items-center bg-white p-4 rounded-xl border border-herb-divider mb-6">
            <Text className="text-base font-poppins-medium text-herb-textPrimary">Item Active</Text>
            <Switch
                trackColor={{ false: "#D1D5DB", true: "#6EE7B7" }}
                thumbColor={isActive ? "#10B981" : "#F3F4F6"}
                ios_backgroundColor="#D1D5DB"
                onValueChange={setIsActive}
                value={isActive}
            />
        </View>
        
        {(storeError || (isLoading && useVendorItemsStore.getState().error)) && (
          <Text className="text-red-600 font-poppins mb-3 text-center">
            {storeError?.message || useVendorItemsStore.getState().error?.message}
          </Text>
        )}

        <Pressable
          onPress={handleUpdateItem}
          disabled={isLoading || storeLoading}
          className={`bg-herb-primary py-4 rounded-xl items-center justify-center shadow-md ${(isLoading || storeLoading) ? 'opacity-70' : 'active:bg-herb-primaryDark'}`}
        >
          {(isLoading || storeLoading) ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-poppins-semibold text-lg">Save Changes</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
    </>
  );
}

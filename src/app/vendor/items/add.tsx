import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useVendorItemsStore from '../../../stores/vendor/vendorItemsStore';
import { FocusAwareStatusBar } from '@/components/common/status-bar';
import useUIStore from '@/stores/uiStore';


const ImagePickerPlaceholder = ({ onImagePicked }) => (
  <Pressable 
    onPress={() => Alert.alert("Image Picker", "Image picker functionality to be implemented.")}
    className="w-full h-40 bg-herb-surface border-2 border-dashed border-herb-divider rounded-xl items-center justify-center mb-4 active:bg-herb-divider/50"
  >
    <MaterialIcons name="add-photo-alternate" size={40} color="#A0AEC0" />
    <Text className="text-herb-muted font-poppins mt-2">Tap to select image</Text>
  </Pressable>
);


export default function AddItemScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const showAlert = useUIStore(state => state.showAlert);
  const { addItem, isLoading, error } = useVendorItemsStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState(''); 
  const [isActive, setIsActive] = useState(true);

  const handleAddItem = async () => {
    if (!name.trim() || !description.trim() || !price.trim()) {
      showAlert({title: "Missing Fields", message: "Please fill in name, description, and price.", type: 'warning', buttons: [{text: "OK"}]});
      return;
    }
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      showAlert({title: "Invalid Price", message: "Please enter a valid positive price.", type: 'warning', buttons: [{text: "OK"}]});
      return;
    }

    const newItemData = {
      name,
      description,
      price: priceValue,
      category: category.trim() || undefined,
      imageUrl: imageUrl || undefined, 
      isActive,
    };

    const itemId = await addItem(newItemData);
    if (itemId) {
      showAlert({
        title: "Item Added", 
        message: `${name} has been successfully added to your store.`, 
        type: 'success',
        buttons: [{ text: "OK", onPress: () => router.back() }]
      });
    } else {
       showAlert({
        title: "Failed to Add", 
        message: error?.message || "Could not add the item. Please try again.", 
        type: 'error',
        buttons: [{ text: "OK" }]
      });
    }
  };
  
  const inputClassName = "bg-white border border-herb-divider rounded-xl px-4 py-3.5 text-base font-poppins text-herb-textPrimary focus:border-herb-primary mb-4 h-14";
  const labelClassName = "text-sm font-poppins-medium text-herb-textPrimary mb-1.5 ml-1";

  return (
    <>
    <FocusAwareStatusBar />
    <View style={{ flex: 1}} className="bg-herb-surface-alt">
      <View className="px-5 pt-5 pb-4 flex-row items-center bg-white shadow-sm">
        <Pressable onPress={() => router.back()} className="p-2 mr-2 -ml-2">
          <MaterialIcons name="arrow-back" size={26} color="#2B4D3F" />
        </Pressable>
        <Text className="text-2xl font-poppins-bold text-herb-primaryDark">Add New Item</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ImagePickerPlaceholder onImagePicked={setImageUrl} />

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
        
        {error && (
          <Text className="text-red-600 font-poppins mb-3 text-center">{error.message}</Text>
        )}

        <Pressable
          onPress={handleAddItem}
          disabled={isLoading}
          className={`bg-herb-primary py-4 rounded-xl items-center justify-center shadow-md ${isLoading ? 'opacity-70' : 'active:bg-herb-primaryDark'}`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-poppins-semibold text-lg">Add Item to Store</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
    </>
  );
}

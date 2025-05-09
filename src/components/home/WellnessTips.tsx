import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

const WellnessTips: React.FC = () => {
  const router = useRouter();

  return (
    <View className="px-5 mb-8">
      <Text className="text-2xl font-poppins-bold text-herb-primaryDark mb-4">
        Wellness Tips
      </Text>
      <View className="bg-white rounded-3xl shadow-md overflow-hidden">
        <LinearGradient
          colors={['rgba(62, 102, 67, 0.8)', 'rgba(43, 77, 63, 0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-5 pb-6"
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1715798901309-1636b3f7fb83?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            }}
            className="absolute top-0 left-0 right-0 bottom-0 opacity-25"
            resizeMode="cover"
          />
          <View className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
            <Text className="text-white font-poppins-semibold text-lg mb-1.5">
              Perfect Tea Brewing
            </Text>
            <Text className="text-white/90 font-poppins text-base leading-5 mb-3">
              For the best flavor, steep your herbal tea for 5-7 minutes in water that&apos;s just below boiling point.
            </Text>
            <Pressable
              className="flex-row items-center self-end bg-white/30 px-4 py-2 rounded-full active:opacity-80"
              onPress={() => router.push('/explore')}
            >
              <Text className="text-white font-poppins-semibold mr-2">
                Shop Teas
              </Text>
              <Ionicons name="arrow-forward-circle" size={18} color="white" />
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

export default WellnessTips;
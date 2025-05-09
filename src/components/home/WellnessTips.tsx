import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

const WellnessTips: React.FC = () => {
  const router = useRouter();
  
  return (
    <View className="px-5 mb-8">
      <Text className="text-2xl font-poppins-bold text-herb-primaryDark mb-4">Wellness Tips</Text>
      <View className="bg-white rounded-3xl shadow-md overflow-hidden">
        <LinearGradient
          colors={['rgba(62, 102, 67, 0.8)', 'rgba(43, 77, 63, 0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-5 pb-6"
        >
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=500' }}
            className="absolute top-0 left-0 right-0 bottom-0 opacity-25"
            resizeMode="cover"
          />
        
          <View className="flex-row items-center mb-4">
            <View className="bg-white/25 backdrop-blur-sm w-12 h-12 rounded-full items-center justify-center mr-3">
              <Ionicons name="bulb-outline" size={22} color="white" />
            </View>
            <Text className="text-white font-poppins-bold text-xl">Tip of the Day</Text>
          </View>
          
          <View className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
            <Text className="text-white font-poppins-semibold text-lg mb-1.5">Natural Sleep Aid</Text>
            <Text className="text-white/90 font-poppins text-base leading-5 mb-3">
              Chamomile and lavender herbs can promote relaxation and help you achieve better sleep naturally.
            </Text>
            <Pressable 
              className="flex-row items-center self-end bg-white/30 px-4 py-2 rounded-full active:opacity-80"
              onPress={() => router.push('/explore')}
            >
              <Text className="text-white font-poppins-semibold mr-2">Shop Related</Text>
              <Ionicons name="arrow-forward-circle" size={18} color="white" />
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

export default WellnessTips;
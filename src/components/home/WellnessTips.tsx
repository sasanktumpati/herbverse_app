import { MaterialIcons } from '@expo/vector-icons';
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
      <View 
        className="bg-white rounded-2xl overflow-hidden border border-herb-divider/40"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3
        }}
      >
        <LinearGradient
          colors={['rgba(62, 102, 67, 0.9)', 'rgba(43, 77, 63, 0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-5 pb-6"
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1555775005-f605a6e09bec?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            }}
            className="absolute top-0 left-0 right-0 bottom-0 opacity-20"
            resizeMode="cover"
          />
          <View className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="spa" size={24} color="white" />
              <Text className="text-white font-poppins-semibold text-lg ml-2">
                Perfect Tea Brewing
              </Text>
            </View>
            <Text className="text-white/90 font-poppins text-base leading-6 mb-3">
              For the best flavor, steep your herbal tea for 5-7 minutes in water that&apos;s just below boiling point.
            </Text>
            <Pressable
              className="flex-row items-center self-end bg-white/30 px-4 py-2 rounded-full active:opacity-80 border border-white/30"
              onPress={() => router.push('/explore')}
            >
              <Text className="text-white font-poppins-semibold mr-2">
                Shop Teas
              </Text>
              <MaterialIcons name="arrow-forward" size={18} color="white" />
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

export default WellnessTips;
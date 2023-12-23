import {Button, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';

const Result = ({navigation}) => {
  return (
    <View style={styles.bannerContainer}>
      <View>
        <Text>Result</Text>
      </View>
      <View style={styles.banner}>
      <Image
          source={require('../assets/images/home.png')}
          style={styles.banner}
          resizeMode="contain"
          alt="banner"
        />
      </View>
      <View>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text>Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Result;

const styles = StyleSheet.create({
  banner: {
    height: 300,
    width: 300,
  },
  bannerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 12,
    height: '100%',
    paddingHorizontal: 20
  },
});

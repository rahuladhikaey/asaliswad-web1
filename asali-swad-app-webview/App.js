import React, { useRef, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  BackHandler, 
  ActivityIndicator, 
  View, 
  SafeAreaView, 
  Platform, 
  StatusBar,
  Linking,
  Image
} from 'react-native';
import { WebView } from 'react-native-webview';

// LIVE WEBSITE URL
const WEBSITE_URL = 'https://www.asaliswad.shop'; 

// Custom User Agent with App Signature to detect "AsaliSwadAndroid"
const CUSTOM_USER_AGENT = Platform.OS === 'android' 
  ? 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36 AsaliSwadAndroid'
  : 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 AsaliSwadAndroid';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // Handle hardware back button for Android
  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false; 
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#059669" barStyle="light-content" />
      
      <WebView
        ref={webViewRef}
        source={{ uri: WEBSITE_URL }}
        style={styles.webview}
        userAgent={CUSTOM_USER_AGENT}
        
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        
        startInLoadingState={true}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        allowFileAccess={true}
        mixedContentMode="always"
        thirdPartyCookiesEnabled={true}
        allowsBackForwardNavigationGestures={true}
        originWhitelist={['*']}
        
        renderLoading={() => (
          <View style={styles.loaderContainer}>
            <Image 
              source={require('./assets/icon.png')} 
              style={styles.loaderLogo}
              resizeMode="contain"
            />
            <ActivityIndicator size="large" color="#059669" style={{ marginTop: 20 }} />
          </div>
        )}

        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loaderLogo: {
    width: 120,
    height: 120,
  },
});

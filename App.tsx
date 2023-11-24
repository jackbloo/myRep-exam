/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  Dimensions,
  Image,
  PermissionsAndroid,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import CameraIcon from './assets/camera.png';
const Camera_Icon = Image.resolveAssetSource(CameraIcon).uri;

import {Colors} from 'react-native/Libraries/NewAppScreen';
import ViewShot, {captureRef} from 'react-native-view-shot';
import {
  isMockingLocation,
  MockLocationDetectorError,
} from 'react-native-turbo-mock-location-detector';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import Geolocation from 'react-native-geolocation-service';
import {WebView} from 'react-native-webview';
import ReactNativeBlobUtil from 'react-native-blob-util';
import EXIF from 'piexifjs';
import RNFS from 'react-native-fs';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

function App(): JSX.Element {
  const camera = useRef<any>(null);
  const viewShotRef = useRef<any>(null);
  const shouldHandleBackground = useRef(true);
  const [capturePhoto, setCapturePhoto] = useState<null | string>(null);
  const [photoPermission, setPhotoPermission] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [mediaPermission, setMediaPermission] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';
  const device = useCameraDevice('back');
  const [showCamera, setShowCamera] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>({});
  const windowWidth = Dimensions.get('window').width;
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [isSaving, setIsSaving] = useState(false);
  const permissionOptions = [
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION,
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  ];

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const checkPermissions = async () => {
    try {
      const allGranted = permissionOptions.map(async () => {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        return granted;
      });
      const result = await Promise.all(allGranted);
      if (result[1] && result[2]) {
        setLocationPermission(true);
      }
      if (result[3]) {
        setMediaPermission(true);
      }
      if (result[0] && result[4] && result[5]) {
        setPhotoPermission(true);
      }
    } catch (error) {}
  };

  const requestPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_MEDIA_LOCATION,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      if (
        granted['android.permission.ACCESS_COARSE_LOCATION'] === 'granted' &&
        granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
      ) {
        setLocationPermission(true);
      }
      if (granted['android.permission.ACCESS_MEDIA_LOCATION'] === 'granted') {
        setMediaPermission(true);
      }
      if (
        granted['android.permission.CAMERA'] === 'granted' &&
        granted['android.permission.READ_EXTERNAL_STORAGE'] === 'granted' &&
        granted['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
      ) {
        setPhotoPermission(true);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && shouldHandleBackground.current) {
        shouldHandleBackground.current = false;
        if (!mediaPermission || !photoPermission || !locationPermission) {
          checkPermissions();
        }
        handleMockLocation();
        appState.current = nextAppState;
        setAppStateVisible(appState.current);
        shouldHandleBackground.current = true;
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!mediaPermission || !photoPermission || !locationPermission) {
      requestPermissions();
    }
  }, [mediaPermission, photoPermission, locationPermission]);

  const handleMockLocation = useCallback(async () => {
    if (locationPermission) {
      isMockingLocation()
        .then(({isLocationMocked}) => {
          // isLocationMocked: boolean
          // boolean result for Android and iOS >= 15.0
          if (isLocationMocked) {
            Alert.alert('Warning', 'Fake GPS is detected', [
              {text: 'I understand', onPress: () => BackHandler.exitApp()},
            ]);
          }
        })
        .catch((error: MockLocationDetectorError) => {
          // error.message - descriptive message
          Alert.alert('Error', 'Fail to get Location', [
            {text: 'OK', onPress: () => console.log('Fail')},
          ]);
        });
    }
  }, [locationPermission]);

  useEffect(() => {
    handleMockLocation();
  }, [locationPermission, handleMockLocation]);

  const getTime = (timestamp: number) => {
    const t = new Date(timestamp);
    let hours = t.getHours();
    let minutes = t.getMinutes();
    let newformat = t.getHours() >= 12 ? 'PM' : 'AM';

    // Find current hour in AM-PM Format
    hours = hours % 12;

    // To display "0" as "12"
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const formatted =
      t.toString().split(' ')[0] +
      ', ' +
      ('0' + t.getDate()).slice(-2) +
      '/' +
      ('0' + (t.getMonth() + 1)).slice(-2) +
      '/' +
      t.getFullYear() +
      ' - ' +
      ('0' + t.getHours()).slice(-2) +
      ':' +
      ('0' + t.getMinutes()).slice(-2) +
      ' ' +
      newformat;
    return formatted;
  };

  const takePhoto = async () => {
    if (camera.current !== null) {
      try {
        const photo = await camera.current.takePhoto({});
        Geolocation.getCurrentPosition(
          position => {
            const formatted = getTime(position.timestamp);
            setCurrentLocation({
              latitude: position.coords.latitude,
              longitude: position?.coords.longitude,
              time: formatted,
              nonFormattedTime: position.timestamp,
            });
            const newPhoto = 'file://' + photo.path;
            setCapturePhoto(newPhoto);
            setShowCamera(false);
          },
          () => {
            // See error code charts below.
            Alert.alert('Error', 'Fail to open camera, please try again', [
              {text: 'OK', onPress: () => handleRemove()},
            ]);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      } catch (error) {
        Alert.alert('Error', 'Fail to open camera, please try again', [
          {text: 'OK', onPress: () => handleRemove()},
        ]);
      }
    }
  };

  const handleRemove = () => {
    setCapturePhoto(null);
    setShowCamera(false);
    setCurrentLocation({});
  };

  const handleSave = () => {
    setIsSaving(true);
    captureRef(viewShotRef, {
      format: 'jpg',
      quality: 1,
    })
      .then(data => {
        ReactNativeBlobUtil.fs
          .readFile(data, 'base64')
          .then(blobData => {
            let imageData = EXIF.load('data:image/jpeg;base64,' + blobData);
            imageData['GPS'][EXIF.GPSIFD.GPSLongitude] =
              EXIF.GPSHelper.degToDmsRational(currentLocation.latitude);
            imageData['GPS'][EXIF.GPSIFD.GPSLongitude] =
              EXIF.GPSHelper.degToDmsRational(currentLocation.longitude);
            imageData['GPS'][EXIF.GPSIFD.GPSDateStamp] = currentLocation.time;
            imageData['Exif'][EXIF.ExifIFD.DateTimeOriginal] =
              currentLocation.time;
            const exifStr = EXIF.dump(imageData);
            const inserted = EXIF.insert(
              exifStr,
              'data:image/jpeg;base64,' + blobData,
            );
            const base64Code = inserted.split('data:image/jpeg;base64,')[1];
            const newPath =
              RNFS.CachesDirectoryPath +
              currentLocation.nonFormattedTime +
              '.jpg';
            RNFS.writeFile(
              RNFS.CachesDirectoryPath +
                currentLocation.nonFormattedTime +
                '.jpg',
              base64Code,
              'base64',
            )
              .then(() => {
                CameraRoll.save(newPath, {type: 'photo'});
                setIsSaving(false);
                Alert.alert('Info', 'Successfully save photo', [
                  {text: 'OK', onPress: () => handleRemove()},
                ]);
              })
              .catch(() => {
                setIsSaving(false);
                Alert.alert('Error', 'Fail to save photo, please try again', [
                  {text: 'OK', onPress: () => handleRemove()},
                ]);
              });
          })
          .catch(err => {
            setIsSaving(false);
            Alert.alert('Error', 'Fail to save photo, please try again', [
              {text: 'OK', onPress: () => handleRemove()},
            ]);
            return err;
          });
      })
      .catch(err => {
        setIsSaving(false);
        Alert.alert('Error', 'Fail to save photo, please try again', [
          {text: 'OK', onPress: () => handleRemove()},
        ]);
        return err;
      });
  };

  if (showCamera) {
    return (
      <>
        <Camera
          photo={true}
          isActive={true}
          device={device!}
          style={StyleSheet.absoluteFill}
          ref={camera}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.camButton}
            onPress={() => takePhoto()}
          />
        </View>
      </>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>My Republic</Text>
      </View>
      {mediaPermission && locationPermission && photoPermission ? (
        <View style={styles.sectionBody}>
          {!capturePhoto && (
            <TouchableOpacity onPress={() => setShowCamera(true)}>
              <Image source={{uri: Camera_Icon}} height={100} width={100} />
              <Text>Capture Photo</Text>
            </TouchableOpacity>
          )}
          {capturePhoto && (
            <ScrollView>
              <ViewShot ref={viewShotRef}>
                <Image
                  source={{uri: `file://'${capturePhoto}`}}
                  height={500}
                  width={windowWidth}
                />
                <View style={{position: 'absolute', bottom: 10, left: 10}}>
                  <Text style={{color: 'yellow'}}>
                    Location: {currentLocation.longitude}
                    {','}
                    {currentLocation.latitude}{' '}
                  </Text>
                  <Text style={{color: 'yellow'}}>
                    Time: {currentLocation.time}{' '}
                  </Text>
                </View>
              </ViewShot>
              <WebView
                source={{
                  uri:
                    'https://www.openstreetmap.org/#map=19/' +
                    currentLocation.latitude +
                    '/' +
                    currentLocation.longitude,
                }}
                style={{height: 400, width: '100%'}}
              />
              <View
                style={{
                  width: windowWidth,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  marginTop: 20,
                }}>
                <TouchableOpacity
                  style={{borderColor: 'red', borderRadius: 20}}>
                  <Text
                    style={{
                      color: 'red',
                    }}
                    onPress={handleRemove}>
                    Remove photo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{borderColor: 'blue', borderRadius: 20}}
                  onPress={handleSave}>
                  {isSaving ? (
                    <ActivityIndicator size="large" color="black" />
                  ) : (
                    <Text style={{color: 'blue'}}>Save photo</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      ) : (
        <View style={styles.sectionBody}>
          <Text>
            Please turn on the permissions for{' '}
            {`${!mediaPermission ? 'media' : ''} ${
              !photoPermission ? 'photo' : ''
            } ${!locationPermission ? 'location' : ''}`}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
  sectionContainer: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#654C82',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  sectionBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  buttonContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    bottom: 0,
    padding: 20,
  },
  camButton: {
    height: 80,
    width: 80,
    borderRadius: 40,
    //ADD backgroundColor COLOR GREY
    backgroundColor: '#B2BEB5',
    alignSelf: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  mapStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default App;

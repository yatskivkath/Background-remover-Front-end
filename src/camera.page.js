import React from 'react';
import { Text, View} from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions  from 'expo-permissions';
import Toolbar from './toolbar.component';
import Gallery from './gallery.component';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

import styles from './styles';

const axios = require('axios').default;
export default class CameraPage extends React.Component {

    camera = null;

    state = {
        captures: [],
        flashMode: Camera.Constants.FlashMode.off,
        capturing: null,
        cameraType: Camera.Constants.Type.back,
        hasCameraPermission: null,
    };

    setFlashMode = (flashMode) => this.setState({ flashMode });
    setCameraType = (cameraType) => this.setState({ cameraType });

    //Taking picture
    handleShortCapture = async () => {
        const photoData  = await this.camera.takePictureAsync({
            base64: true,
            allowsEditing: true,
            aspect: [4, 3],
        }); 


        let body = new FormData();
        body.append('image', { uri: photoData.uri, name: 'picture.jpg', type: 'image/jpg' });
           

        //Making request
        fetch('http://fbef10d8342a.ngrok.io/post', {
            mode: 'no-cors',
            method: "POST",
            body: body
        })
        .then(function (response) {
            if (response.ok) {

                response.json().then(async (json) => {
                    const url = "http://fbef10d8342a.ngrok.io" + json["file"];
                    let filename = Date.now() + ".png";
                
                    const fileUri  = `${FileSystem.documentDirectory}${filename}`;
                    const downloadedFile = await FileSystem.downloadAsync(url, fileUri);
                    
                    if (downloadedFile.status != 200) {
                      handleError();
                    }


                    MediaLibrary.createAssetAsync(downloadedFile.uri)
                    .then(() => {
                            console.log('Album created!');
                            alert("Downloaded!");
                        })
                        .catch(error => {
                            console.error('err', error);
                        });

                })


            } else if (response.status == 401) {
                alert("Oops! ");
            }
        },
        function (e) {
            alert("Error submitting form! Error: " + e);
        });

    

        this.setState({ capturing: false, captures: [photoData, ...this.state.captures] })
    };



    async componentDidMount() {
        const camera = await Permissions.askAsync(Permissions.CAMERA);
        const audio = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);

        // const medialibrary = camera;
        const hasCameraPermission = (camera.status === 'granted' && audio.status === 'granted');

        this.setState({ hasCameraPermission });
    };


    render() {
        const { hasCameraPermission, flashMode, cameraType, capturing, captures } = this.state;

        if (hasCameraPermission === null) {
            return <View />;
        } else if (hasCameraPermission === false) {
            return <Text>Access to camera has been denied.</Text>;
        }

        return (
            <React.Fragment>
                <View>
                    <Camera
                        type={cameraType}
                        flashMode={flashMode}
                        style={styles.preview}
                        ref={camera => this.camera = camera}
                    />
                </View>

                {captures.length > 0 && <Gallery captures={captures}/>}

                <Toolbar 
                    capturing={capturing}
                    flashMode={flashMode}
                    cameraType={cameraType}
                    setFlashMode={this.setFlashMode}
                    setCameraType={this.setCameraType}
                    onShortCapture={this.handleShortCapture}
                />
            </React.Fragment>
        );
    };
};
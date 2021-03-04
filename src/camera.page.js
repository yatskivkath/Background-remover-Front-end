import React from 'react';
import { View, Text } from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions  from 'expo-permissions';
import Toolbar from './toolbar.component';
import Gallery from './gallery.component';
import * as MediaLibrary from 'expo-media-library';

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
        
        console.log("********************\nPhoto");
        console.log(photoData);

        //Saving image to Galery
        MediaLibrary.createAssetAsync(photoData['uri'])
          .then(() => {
                console.log('Album created!');
            })
            .catch(error => {
                console.log('err', error);
            });

         // Upload the image using the fetch and FormData APIs
        let formData = new FormData();
        // Assume "photo" is the name of the form field the server expects
        formData.append('base64', photoData['base64']);

        fetch("http://861227d38a7c.ngrok.io/post", {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            console.log("******************\nRESULT");
            console.log(result);
            })
        .catch(err => { console.log(err); })
        
        
        const config = {
            method: 'POST',
            headers: {
                'X-Api-Key': 'jtszK5tThjkU9YNuLM3J3Qyc'
            },
            body: {
                image_file_b64 : photoData['base64'],
                image_url : photoData['uri']
            }
        };

        // fetch('https://api.remove.bg/v1.0/removebg', config)
        //     .then(response => {
        //         console.log(response);
        //         response.json();
        //     })
        //     .then(result => {
        //         console.log("******************\nRESULT");
        //         console.log(result);
        //     })
        //     .catch(err => { console.log(err); })
            
           

            // fetch('http://861227d38a7c.ngrok.io')
            // .then(response => {
            //     response.json()}
            //     )
            // .then(result => {
            //     console.log("******************\nRESULT");
            //     console.log(result);
            // })
            // .catch(err => { console.log(err); });

           

        this.setState({ capturing: false, captures: [photoData, ...this.state.captures] })
    };

    async componentDidMount() {
        const camera = await Permissions.askAsync(Permissions.CAMERA);
        const audio = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
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
                    // onCaptureIn={this.handleCaptureIn}
                    // onCaptureOut={this.handleCaptureOut}
                    // onLongCapture={this.handleLongCapture}
                    onShortCapture={this.handleShortCapture}
                />
            </React.Fragment>
        );
    };
};
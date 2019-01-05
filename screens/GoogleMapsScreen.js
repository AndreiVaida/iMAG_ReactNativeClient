import React from 'react';
import {StyleSheet, Text, View, Alert} from 'react-native';
import FetchLocation from '../components/FetchLocation'

export default class HomeScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>Află-ți locația !</Text>
                <FetchLocation onGetLocation={this.getUserLocationHandler()}/>
            </View>
        );
    }

    getUserLocationHandler = () => {
        navigator.geolocation.getCurrentPosition(position => {
            Alert.alert(JSON.stringify(position));
        }, error => {
            Alert.alert(JSON.stringify(error.toString()));
        })
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonView: {
        margin: 10,
    }
});

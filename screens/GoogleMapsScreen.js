import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import FetchLocation from '../components/FetchLocation'

export default class HomeScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
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
            console.log(position);
        }, error => {
            console.log(error);
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

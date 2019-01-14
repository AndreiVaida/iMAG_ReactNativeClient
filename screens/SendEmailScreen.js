import React from 'react'
import { StyleSheet, Button, View } from 'react-native'
import email from 'react-native-email'
import {Text} from "react-native-elements";

export default class SendEmailScreen extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>Nu ezita să ne contactezi prin e-mail !</Text>
                <Button title="Trimite e-mail" onPress={this.handleEmail} />
            </View>
        )
    }

    handleEmail = () => {
        const to = ['andrei_vd2006@yahoo.com']; // string or array of email addresses
        email(to, {
            // Optional additional arguments
            cc: [''], // string or array of email addresses
            bcc: '', // string or array of email addresses
            subject: 'Contact iMAG',
            body: 'Scrie-ne aici părerea ta !'
        }).catch(console.error)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    }
});
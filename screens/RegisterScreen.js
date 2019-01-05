import React from 'react';
import {Button, StyleSheet, Text, TextInput, View} from 'react-native';
import DatePicker from 'react-native-datepicker'
import {ServerUrl} from "../App";

export default class RegisterScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            name: '',
            birthday: '',
            password: '',
            errorMessage: '',
        };
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.stayCenter}>
                    <Text>Creare cont</Text>
                </View>
                <Text>E-mail:</Text>
                <TextInput
                    style={styles.inputStyle}
                    onChangeText={(newEmail) => this.setState({email: newEmail})}
                    placeholder="introdu adresa de e-mail"
                />
                <Text>Nume:</Text>
                <TextInput
                    style={styles.inputStyle}
                    onChangeText={(newName) => this.setState({name: newName})}
                    placeholder="introdu numele tău"
                />
                <Text>Data nașterii:</Text>
                <DatePicker
                    style={{width: 200}}
                    date={this.state.birthday}
                    mode="date"
                    placeholder="select date"
                    format="YYYY-MM-DD"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    onDateChange={(date) => {this.setState({birthday: date})}}
                />
                <Text>Parola:</Text>
                <TextInput
                    style={styles.inputStyle}
                    secureTextEntry={true}
                    onChangeText={(newPassword) => this.setState({password: newPassword})}
                    placeholder="introdu parola"
                />

                <View style={styles.button}>
                    <Button
                        title="Creează contul"
                        color="#841584"
                        accessibilityLabel="Register"
                        onPress={() =>
                            this.register(this.state.email, this.state.name, this.state.birthday, this.state.password)
                        }
                    />
                </View>
                <View style={styles.stayCenter}>
                    <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
                </View>
            </View>
        );
    }

    register(email, name, birthday, password) {
        let thisVar = this;

        const body = {
            'email': email,
            'name': name,
            'birthday': birthday,
            'password': password,
        };

        fetch(ServerUrl + "/user/register", {
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json',
            },
            method: 'POST',
        })
            .then(function (response) {
                if (!response.ok) {
                    throw response;
                }
                // go to login screen
                thisVar.props.navigation.navigate('LoginScreen');
            })
            .catch(err => {
                console.log(err.toString());
                thisVar.setState({errorMessage: err.toString()})
            })
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    stayCenter: {
        alignItems: 'center',
    },
    button: {
        alignItems: 'center',
        margin: 20,
    },
    inputStyle: {
        height: 40,
        marginTop: 5,
        marginBottom: 5,
        padding: 10,
        borderColor: 'gray',
        borderWidth: 1,
        alignItems: 'center',
    },
    errorMessage: {
        color: 'red',
    },
});

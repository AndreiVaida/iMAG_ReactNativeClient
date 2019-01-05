import React from 'react';
import {AsyncStorage, Button, StyleSheet, Text, View} from 'react-native';

export default class HomeScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginButtonText: "Login",
            isLoggedIn: false,
        };
    }

    componentDidMount() { //TODO ?
        let thisVar = this;
        let start = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                const token = await AsyncStorage.getItem('token');

                if (this.isLoggedIn(userId, token)) {
                    thisVar.setState({loginButtonText:  "Logout"});
                    thisVar.setState({isLoggedIn:  true});
                }
                else {
                    thisVar.setState({loginButtonText:  "Login"});
                    thisVar.setState({isLoggedIn:  false});
                }
            } catch (error) {
                thisVar.setState({loginButtonText:  "Login"});
                thisVar.setState({isLoggedIn:  false});
            }
        };
        start();
    }

    isLoggedIn(userId, token) {
        return userId != null && token != null;
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>Welcome to iMAG !</Text>

                <View style={styles.buttonView}>
                    <Button
                        title="Vezi toate produsele"
                        accessibilityLabel="See all products"
                        color="#841584"
                        onPress={() =>
                            this.props.navigation.navigate('ProductsListScreen')
                        }
                    />
                </View>
                <View style={styles.buttonView}>
                    <Button
                        title="Wishlist"
                        accessibilityLabel="See your favorite products"
                        color="#841584"
                        onPress={() =>
                            this.props.navigation.navigate('WishlistScreen')
                        }
                    />
                </View>
                <View style={styles.buttonView}>
                    <Button
                        title={this.state.loginButtonText}
                        color="#841584"
                        accessibilityLabel="Access your account"
                        onPress={() =>
                            this.loginOrLogout()
                        }
                    />
                </View>
                <View style={styles.buttonView}>
                    <Button
                        title="Creare cont"
                        color="#841584"
                        accessibilityLabel="Create e new account"
                        onPress={() =>
                            this.props.navigation.navigate('RegisterScreen')
                        }
                    />
                </View>
            </View>
        );
    }

    loginOrLogout() {
        if (this.state.isLoggedIn) {
            this.logout();
        }
        else {
            this.props.navigation.navigate('LoginScreen')
        }
    }

    logout() {
        let thisVar = this;
        let start = async () => {
            try {
                await AsyncStorage.removeItem('userId');
                await AsyncStorage.removeItem('token');
                thisVar.setState({loginButtonText:  "Login"});
                thisVar.setState({isLoggedIn:  false});
            } catch (error) {
                console.log("Error when removing userId and token from local storage.")
            }
        };
        start();
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

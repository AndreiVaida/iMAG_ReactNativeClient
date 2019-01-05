import React from 'react';
import {AsyncStorage, Button, Image, NetInfo, StyleSheet, Text, View} from 'react-native';
import {ServerUrl} from "../App";


export default class ProductDetailsScreen extends React.Component {
    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.state = {
            'product': navigation.getParam('product', null),
            'wishlistButtonText': "Adaugă în wishlist",
            'wishlistButtonColor': "#841584",
            'isConnected': true,
        };
    }

    render() {
        const product = this.state.product;
        return (
            <View style={styles.container}>
                <View style={styles.title}><Text>Product details</Text></View>
                <View>
                    <Image
                        style={styles.image}
                        source={{uri: 'data:image/png;base64,' + product.image}}
                    />
                    <Text style={styles.titleLeft}>{product.name}</Text>
                    <Text style={styles.itemRight}>{product.price + " lei"}</Text>
                    <View style={styles.details}>
                        <Text>{product.details}</Text>
                    </View>
                </View>
                <View style={styles.wishlistButtonView}>
                    <Button
                        title={this.state.wishlistButtonText}
                        color={this.state.wishlistButtonColor}
                        accessibilityLabel="Add this product to your wishlist"
                        onPress={() =>
                            this.addProductToWishlist()
                        }
                    />
                </View>
            </View>
        );
    }

    addProductToWishlist() {
        let start = async () => {
            let thisVar = this;
            let userId = null;
            let token = null;
            let productId = thisVar.state.product.id;

            try {
                userId = await AsyncStorage.getItem('userId');
                token = await AsyncStorage.getItem('token');

                if (userId == null || token == null) {
                    thisVar.props.navigation.navigate('LoginScreen');
                }
            } catch (error) {
                thisVar.props.navigation.navigate('LoginScreen');
            }

            const weAreOnline = this.state.weAreOnline;
            if (!weAreOnline) {
                thisVar.setState({wishlistButtonText: "Produsul a fost adăugat doar local."});
                thisVar.setState({wishlistButtonColor: "#b2a707"});
                thisVar.addProductToWishlistOffline(productId);
                return;
            }

            fetch(ServerUrl + "/user/wishlist", {
                body: null,
                headers: {
                    'content-type': 'application/json',
                    'token': token,
                    'userId': userId,
                    'productId': productId,
                },
                method: 'POST',
            })
                .then(function (response) {
                    if (!response.ok) {
                        thisVar.setState({wishlistButtonText: "Nu s-a adăugat în wishlist"});
                        thisVar.setState({wishlistButtonColor: "#6d0606"});
                        return;
                    }
                    // show success on the screen
                    thisVar.setState({wishlistButtonText: "Adăugat în wishlist"});
                    thisVar.setState({wishlistButtonColor: "#066d1c"});
                })
                .catch(err => {
                    this.setState({wishlistButtonText: "Produsul a fost adăugat doar local."});
                    this.setState({wishlistButtonColor: "#b2a707"});
                    thisVar.addProductToWishlistOffline(productId);
                })
        };
        start();
    }

    addProductToWishlistOffline(productIdOriginal) {
        let start = async () => {
            try {
                // update the product
                const productId = "P_" + productIdOriginal;
                let productJson = await AsyncStorage.getItem(productId);
                const product = JSON.parse(productJson);
                product["isInWishlist"] = true;
                productJson = JSON.stringify(product);
                await AsyncStorage.setItem(productId, productJson);

                // add task to do when online
                const taskToDoId = "T_" + productId;
                const taskToDo = {
                    id: taskToDoId,
                    productId: productId,
                    isInWishlist: true,
                };
                const taskToDoJson = JSON.stringify(taskToDo);
                await AsyncStorage.setItem(taskToDoId, taskToDoJson);
                console.log("Task saved: " + taskToDoJson);

            } catch (e) {
                console.log("Error at saving products: " + e.toString());
            }
        };
        start();
    }

    componentDidMount() {
        let thisVar = this;
        NetInfo.getConnectionInfo().then((connectionInfo) => {
            const connectionType = connectionInfo.type.toString();
            console.log('Internet connection type: ' + connectionType);
            if (connectionType !== "none") {
                thisVar.setState({isConnected: true});
            }
            else {
                thisVar.setState({isConnected: false});
            }
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginLeft: 20,
        marginRight: 20,
        //alignItems: 'center',
        //justifyContent: 'center',
    },
    title: {
        margin: 20,
        alignItems: 'center',
    },
    image: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: 100,
        height: 120,
    },
    titleLeft: {
        position: 'absolute',
        left: 120,
        top: 0,
        fontWeight: 'bold',
        fontSize: 20,
    },
    itemRight: {
        position: 'absolute',
        right: 0,
        top: 50,
        fontSize: 20,
    },
    details: {
        position: 'absolute',
        left: 0,
        top: 150,
    },
    wishlistButtonView: {
        position: 'absolute',
        right: 0,
        top: 150,
        width: 100,
        height: 50,
    },
});



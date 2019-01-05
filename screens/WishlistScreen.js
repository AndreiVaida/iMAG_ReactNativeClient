import React from 'react';
import {AsyncStorage, NetInfo, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ServerUrl} from '../App'
import {List, ListItem} from "react-native-elements";


export default class WishlistScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'productList': [],
            'message': "Loading...",
            'messageColor': "black",
            'weAreOnline': true,
        };
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.title}>
                    <Text>Wishlist</Text>
                    <Text>Apasă lung pe un produs pentru a-l elimina.</Text>
                    <Text style={{color: this.state.messageColor}}>{this.state.message}</Text>
                </View>

                <ScrollView>
                    <List>
                        {
                            this.state.productList.map((product) => {
                                let details = product.details;
                                if (details != null && details.length > 20) {
                                    details = details.substr(0, 20);
                                }
                                return <ListItem key={product.id} title={product.name} subtitle={details}
                                                 rightTitle={"Preț: " + product.price + " lei"}
                                                 onPress={() =>
                                                     this.props.navigation.navigate('ProductDetailsScreen', {product: product})
                                                 }
                                                 onLongPress={() =>
                                                     this.removeProductFromWishlist(product.id)
                                                 }/>
                            })
                        }
                    </List>
                </ScrollView>
            </View>
        );
    }

    removeProductFromWishlist(productId) {
        let start = async () => {
            let thisVar = this;
            let userId = null;
            let token = null;

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
            console.log(weAreOnline);
            if (!weAreOnline) {
                thisVar.setState({"message": "Produsul a fost șters doar local."});
                thisVar.setState({messageColor: "#b2a707"});
                thisVar.removeProductFromWishlistOffline(productId);
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
                method: 'DELETE',
            })
                .then(function (response) {
                    if (!response.ok) {
                        throw response;
                    }
                    // show success on the screen
                    thisVar.setState({message: "Eliminat din wishlist"});
                    thisVar.setState({messageColor: "#066d1c"});
                    thisVar.loadWishlist();
                })
                .catch(err => {
                    thisVar.removeProductFromWishlistOffline(productId);
                    thisVar.setState({wishlistButtonText: "Produsul va fi eliminat după restabilirea conexiunii."});
                    thisVar.setState({messageColor: "#b2a707"});
                })
        };
        start();
    }

    componentDidMount() {
        let thisVar = this;
        NetInfo.getConnectionInfo().then((connectionInfo) => {
            const connectionType = connectionInfo.type.toString();
            console.log('Internet connection type: ' + connectionType);
            if (connectionType !== "none") {
                thisVar.setState({weAreOnline: true});
                thisVar.loadWishlist();
            }
            else {
                thisVar.setState({weAreOnline: false});
                thisVar.setState({'message': "Se afișează produsele salvate local."});
                thisVar.setState({messageColor: "#b2a707"});
                thisVar.loadWishlistFromLocalStorage();
            }
        });
    }

    loadWishlist() {
        let start = async () => {
            let thisVar = this;
            let userId = null;
            let token = null;

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
                this.setState({"message": "Se afișează wishlist-ul salvat local."});
                this.setState({messageColor: "#b2a707"});
                thisVar.loadWishlistFromLocalStorage();
                return;
            }

            fetch(ServerUrl + "/user/wishlist", {
                body: null,
                headers: {
                    'content-type': 'application/json',
                    'userId': userId,
                    'token': token,
                },
                method: 'GET',
            })
                .then(function (response) {
                    if (!response.ok) {
                        thisVar.props.navigation.navigate('LoginScreen');
                        return Promise.reject("Failed to load wishlist.");
                    }
                    if (thisVar.state.message === "Loading...") {
                        thisVar.setState({message: " "});
                    }
                    return response.json();
                })
                .then(function (jsonProductsPage) {
                    let productsJson = jsonProductsPage["productDtos"];

                    thisVar.saveWishlistInLocalStorage(productsJson);

                    thisVar.setState({
                        'productList': productsJson
                    });
                    // here we synchronize the TaskToDo list with server
                    thisVar.synchronizeWithServer();
                })
                .catch(function () {
                    thisVar.setState({weAreOnline: false});
                    thisVar.setState({'message': "Se afișează produsele salvate local."});
                    thisVar.setState({messageColor: "#b2a707"});
                    thisVar.loadWishlistFromLocalStorage();
                });

        };
        start();
    }

    saveWishlistInLocalStorage(productsJson) {
        let start = async () => {
            try {
                for (let i = 0; i < productsJson.length; i++) {
                    const product = productsJson[i];
                    const productId = "P_" + product["id"].toString();
                    product["isInWishlist"] = true;
                    const productJson = JSON.stringify(product);
                    await AsyncStorage.setItem(productId, productJson);
                }
            } catch (e) {
                console.log("Error at saving products: " + e.toString());
            }
        };
        start();
    }

    loadWishlistFromLocalStorage() {
        let thisVar = this;
        let start = async () => {
            try {
                let products = [];
                const keys = await AsyncStorage.getAllKeys();
                const idPrefix = "P_";
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    if (key.startsWith(idPrefix)) {
                        const productJson = await AsyncStorage.getItem(key);
                        const product = JSON.parse(productJson);
                        if (product["isInWishlist"] === true) {
                            products.push(product);
                        }
                    }
                }
                thisVar.setState({'productList': products});
            } catch (e) {
                console.log("Error at getting products from local storage: " + e.toString());
            }
        };
        start();
    }

    removeProductFromWishlistOffline(productIdOriginal) {
        let thisVar = this;
        let start = async () => {
            try {
                // update the product
                const productId = "P_" + productIdOriginal;
                let productJson = await AsyncStorage.getItem(productId);
                const product = JSON.parse(productJson);
                product["isInWishlist"] = false;
                productJson = JSON.stringify(product);
                await AsyncStorage.setItem(productId, productJson);

                // add task to do when online
                const taskToDoId = "T_" + productId;
                const taskToDo = {
                    id: taskToDoId,
                    productId: productId,
                    isInWishlist: false,
                };
                const taskToDoJson = JSON.stringify(taskToDo);
                await AsyncStorage.setItem(taskToDoId, taskToDoJson);
                console.log("Task saved: " + taskToDoJson);

                thisVar.loadWishlistFromLocalStorage();

            } catch (e) {
                console.log("Error at saving products: " + e.toString());
            }
        };
        start();
    }

    synchronizeWithServer() {
        let thisVar = this;

        let start = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                const token = await AsyncStorage.getItem('token');

                // get all tasks
                let tasksToDo = [];
                const keys = await AsyncStorage.getAllKeys();
                const idPrefix = "T_";
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    if (key.startsWith(idPrefix)) {
                        const taskJson = await AsyncStorage.getItem(key);
                        const task = JSON.parse(taskJson);
                        tasksToDo.push(task);
                        // remove the task from local storage
                        await AsyncStorage.removeItem(key);
                    }
                }

                // request the server
                for (let i = 0; i < tasksToDo.length; i++) {
                    const task = tasksToDo[i];
                    const productId = task["productId"].substr(2);
                    const isInWishlist = task["isInWishlist"];
                    let method = "POST";
                    if (!isInWishlist) {
                        method = "DELETE";
                    }

                    fetch(ServerUrl + "/user/wishlist", {
                        body: null,
                        headers: {
                            'content-type': 'application/json',
                            'token': token,
                            'userId': userId,
                            'productId': productId,
                        },
                        method: method,
                    })
                        .then(function (response) {
                            if (!response.ok) {
                                throw response;
                            }
                            console.log("Task done.");
                        })
                        .catch(err => {
                            console.log("Task failed:");
                            console.log(JSON.stringify(err));
                        })
                }

                // synchronize successful => reload the wishlist
                if (tasksToDo.length > 0) {
                    thisVar.loadWishlist();
                }

            } catch (e) {
                console.log("Error at getting products from local storage: " + e.toString());
            }
        };
        start();
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
});



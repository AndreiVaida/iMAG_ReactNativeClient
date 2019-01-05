import React from 'react';
import {AsyncStorage, ScrollView, StyleSheet, Text, View, NetInfo} from 'react-native';
import {ServerUrl} from '../App'
import {List, ListItem} from "react-native-elements";

let pageNumber;
let itemsPerPage;
let totalPages;

export default class ProductsListScreen extends React.Component {
    constructor(props) {
        super(props);
        pageNumber = 1;
        itemsPerPage = 11;
        totalPages = 1;
        this.state = {
            'productList': [],
            'message': "Loading...",
            "isConnected": true,
        };
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.title}>
                    <Text>All products</Text>
                    <Text style={{color: '#b2a707'}}>{this.state.message}</Text>
                </View>

                <ScrollView
                    onScroll={({nativeEvent}) => {
                        this.loadProductsIfNeeded(nativeEvent);
                    }}>
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
                                                 }/>
                            })
                        }
                    </List>
                </ScrollView>
            </View>
        );
    }

    loadProductsIfNeeded(nativeEvent) {
        if (this.isCloseToBottom(nativeEvent)) {
            if (pageNumber < totalPages) {
                pageNumber++;
                this.loadProducts()
            }
        }
    }

    isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
        const paddingToBottom = 50;
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
    };

    componentDidMount() {
        let thisVar = this;
        NetInfo.getConnectionInfo().then((connectionInfo) => {
            const connectionType = connectionInfo.type.toString();
            console.log('Internet connection type: ' + connectionType);
            if (connectionType !== "none") {
                thisVar.setState({isConnected: true});
                thisVar.loadProducts();
            }
            else {
                thisVar.setState({isConnected: false});
                thisVar.setState({'message': "Se afișează produsele salvate local."});
                thisVar.loadProductsFromLocalStorage();
            }
        });
    }

    loadProducts() {
        let thisVar = this;

        fetch(ServerUrl + "/product?pageNumber=" + pageNumber + "&itemsPerPage=" + itemsPerPage, {
            body: null,
            headers: {
                'content-type': 'application/json',
            },
            method: 'GET',
        })
            .then(function (response) {
                if (!response.ok) {
                    thisVar.setState({'message': "Se afișează produsele salvate local."});
                    thisVar.loadProductsFromLocalStorage();
                    return null;
                }
                thisVar.setState({'message': ""});
                return response.json();
            })
            .then(function (jsonProductsPage) {
                if (jsonProductsPage == null) {
                    return;
                }

                pageNumber = jsonProductsPage["pageNumber"];
                totalPages = jsonProductsPage["totalPages"];
                let productsJson = jsonProductsPage["content"];

                // save the products in local storage
                thisVar.saveProductsInLocalStorage(productsJson);

                // update screen
                let newProductList = thisVar.state.productList.slice();
                for (let i = 0; i < productsJson.length; i++) {
                    newProductList.push(productsJson[i]);
                }
                thisVar.setState({
                    'productList': newProductList
                });
            })
            .catch(function () {
                thisVar.setState({'message': "Se afișează produsele salvate local."});
                thisVar.loadProductsFromLocalStorage();
            });
    }

    saveProductsInLocalStorage(productsJson) {
        let start = async () => {
            try {
                for (let i = 0; i < productsJson.length; i++) {
                    const product = productsJson[i];
                    product["isInWishlist"] = false;
                    const productId = "P_" + product["id"].toString();
                    // check if the product already is stored
                    const existingProductJson = await AsyncStorage.getItem(productId);
                    const existingProduct = JSON.parse(existingProductJson);
                    if (existingProduct != null && existingProduct["isInWishlist"] === true) {
                        product["isInWishlist"] = true;
                    }

                    const productJson = JSON.stringify(product);
                    await AsyncStorage.setItem(productId, productJson);
                }
            } catch (e) {
                console.log("Error at saving products: " + e.toString());
            }
        };
        start();
    }

    loadProductsFromLocalStorage() {
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
                        products.push(product);
                    }
                }
                thisVar.setState({'productList': products});
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



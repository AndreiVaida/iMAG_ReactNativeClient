import {createStackNavigator} from 'react-navigation'
import HomeScreen from '../screens/HomeScreen'
import ProductsListScreen from '../screens/ProductsListScreen'
import ProductDetailsScreen from "../screens/ProductDetailsScreen";
import LoginScreen from "../screens/LoginScreen";
import WishlistScreen from "../screens/WishlistScreen";
import RegisterScreen from "../screens/RegisterScreen";
import GoogleMapsScreen from "../screens/GoogleMapsScreen";
import SendEmailScreen from "../screens/SendEmailScreen";

const AppNavigator = createStackNavigator({
    HomeScreen: {screen: HomeScreen},
    ProductsListScreen: {screen: ProductsListScreen},
    ProductDetailsScreen: {screen: ProductDetailsScreen},
    LoginScreen: {screen: LoginScreen},
    RegisterScreen: {screen: RegisterScreen},
    WishlistScreen: {screen: WishlistScreen},
    GoogleMapsScreen: {screen: GoogleMapsScreen},
    SendEmailScreen: {screen: SendEmailScreen},
});
export default AppNavigator;
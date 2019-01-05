import React from "react";
import AppNavigator from "./configurations/AppNavigator";
import {createAppContainer} from "react-navigation";

const AppContainer = createAppContainer(AppNavigator);
export const ServerUrl = 'http://10.0.2.2:8080';

export default class App extends React.Component {
    render() {
        return (
            <AppContainer
                ref={nav => {
                    this.navigator = nav;
                }}
            />
        );
    }
}
import React from 'react'
import {Button, View, Alert} from 'react-native'

const fetchLocation = props => {
    return (
        <View>
            <Button title="Get Location" onPress={() =>  {
                return props.onGetLocation}}/>
        </View>
    );
};

export default fetchLocation;
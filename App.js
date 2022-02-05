import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, AsyncStorage } from 'react-native';
import { useState, useEffect } from 'react'


import FilesPage from './components/files.js'
import RecordPage from './components/start.js'


import { createStore } from 'redux'

import allReducers from './reducers'
import { Provider } from 'react-redux'
import { persistStore, persistReducer } from 'redux-persist'
import { PersistGate } from 'redux-persist/es/integration/react'


const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['subjects', 'classes', 'classes_content', 'authentification', 'clock']
}

const persistedReducer = persistReducer(persistConfig, allReducers)
const store = createStore(persistedReducer)
const persistedStore = persistStore(store)



export default function App() {

  const [currentPage, setCurrentPage] = useState(0)


  return (
    <Provider store={store}>
      <PersistGate persistor={persistedStore} loading={null}>
        <View style={styles.container}>

          {(!currentPage) ?
            <RecordPage styles={{flex: 1}}/>
            :
            <FilesPage styles={{flex: 1}}/>
          }

          <View style={styles.tabView}>
            <TouchableOpacity onPress={() => setCurrentPage(1)} style={[styles.singleTabView, {backgroundColor: (currentPage) ? '#E5E5E5' : 'white'}]}>
                <Image style={styles.tabImage} source={require('./components/files.png')}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentPage(0)} style={[styles.singleTabView, {backgroundColor: (!currentPage) ? '#E5E5E5' : 'white'}]}>
                <Image style={styles.tabImage} source={require('./components/microphone.png')}/>
            </TouchableOpacity>

          </View>

          <StatusBar style="auto" />
        </View>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabView: {
    flex: 0,
    flexDirection: 'row',
    backgroundColor: 'white'
  },

  singleTabView: {
    flex: 1,
    borderRadius: 8,
    padding: 4,
    margin: 5,
  },
  tabImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    alignSelf: 'center'
  }
});

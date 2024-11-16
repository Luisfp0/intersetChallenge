import React from "react";
import { Provider } from "react-redux";
import { SQLiteProvider } from "expo-sqlite";
import AppNavigator from "./src/navigation/AppNavigator";
import { store } from "./src/store";
import { migrateDbIfNeeded } from "./src/database/database";

const App = () => {
  return (
    <SQLiteProvider databaseName="app.db" onInit={migrateDbIfNeeded}>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </SQLiteProvider>
  );
};

export default App;

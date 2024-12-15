import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Login from '../src/screens/Login';
import HomeScreen from '../src/screens/HomeScreen';
import SlidersScreen from '../src/screens/SlidersScreen';
import ProductScreen from '../src/screens/ProductScreen';
import AddProductScreen from '../src/screens/AddProductScreen';
import AddSliderScreen from '../src/screens/AddSliderScreen';
import CategoryScreen from '../src/screens/CategoryScreen';
import AddCategoryScreen from '../src/screens/AddCategoryScreen';
import DrawerContent from '../src/components/DrawerContent';
import UsersScreen from '../src/screens/UsersScreen';
import EditUserScreen from '../src/screens/EditUserScreen';
import BillsScreen from '../src/screens/BillsScreen';
import BillDetailScreen from '../src/screens/BillDetailScreen';
import StoreScreen from '../src/screens/StoreScreen';
import AddStoreScreen from '../src/screens/AddStoreScreen';
import VoucherScreen from '../src/screens/VoucherScreen';
import AddVoucherScreen from '../src/screens/AddVoucherScreen';
import Register from '../src/screens/Register';
import StaffScreen from '../src/screens/StaffScreen';
import EditStaffScreen from '../src/screens/EditStaffScreen';


const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer Navigator chỉ chứa các màn hình chính
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{ 
        headerShown: false,
        drawerStyle: {
          width: 280,
          padding: 0,
          margin: 0,
          left: 0,
        }
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="CategoryScreen" component={CategoryScreen} />
      <Drawer.Screen name="SlidersScreen" component={SlidersScreen} />
      <Drawer.Screen name="ProductScreen" component={ProductScreen} />
      <Drawer.Screen name="UsersScreen" component={UsersScreen} />
      <Drawer.Screen name="BillsScreen" component={BillsScreen} />
      <Drawer.Screen name="StoreScreen" component={StoreScreen} />
      <Drawer.Screen name="VoucherScreen" component={VoucherScreen} />
      <Drawer.Screen name="StaffScreen" component={StaffScreen} />
      <Drawer.Screen name="EditStaffScreen" component={EditStaffScreen} />
    </Drawer.Navigator>
  );
};

// Stack Navigator chứa tất cả các màn hình, bao gồm cả drawer
const Navigation = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen 
        name="Login" 
        component={Login} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={Register}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MainApp" 
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddProductScreen" 
        component={AddProductScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddSliderScreen" 
        component={AddSliderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddCategoryScreen" 
        component={AddCategoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EditUserScreen" 
        component={EditUserScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="BillDetailScreen" 
        component={BillDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddStoreScreen" 
        component={AddStoreScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddVoucherScreen" 
        component={AddVoucherScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="StaffScreen" 
        component={StaffScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EditStaffScreen" 
        component={EditStaffScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default Navigation;
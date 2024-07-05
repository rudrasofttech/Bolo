import { NavigationContainer } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/Home';
import Profile from './screens/Profile';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Search from './screens/Search';
import Login from './screens/Login';
import Register from './screens/Register';
import { useState } from 'react';
import AuthProvider, { useAuth } from './authprovider';
import { ThemeProvider, createTheme } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './stylesheet';
import ForgotPassword from './screens/ForgotPassword';
import Hashtag from './screens/Hashtag';
import AddPost from './screens/AddPost';
import Conversation from './screens/Conversation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Webpage from './screens/shared/Webpage';
import EditProfilePic from './screens/EditProfilePic';
import ViewPost from './screens/ViewPost';

const theme = createTheme({
  lightColors: {
    primary: '#e7e7e8',
  },
  darkColors: {
    primary: '#000',
  },
  mode: 'light',
});

const Tab = createBottomTabNavigator();
const SearchStack = () => {
  return (
    <Stack.Navigator initialRouteName="Search">
      <Stack.Screen name="Search" component={Search} options={{ title: '', headerBackVisible: false, headerShown: false }} />
      <Stack.Screen name="Hashtag" component={Hashtag} options={({ route }) => ({ title: route.params.hashtag })} />
      <Stack.Screen name="Profile" component={Profile} options={({ route }) => ({ title: route.params.username })} />
      <Stack.Screen name="ProfilePosts" component={ViewPost} options={({ route }) => ({ title: `${route.params.search} Posts` })} />
    </Stack.Navigator>
  )
}
const HomeStack = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} options={{ title: '', headerBackVisible: false, headerShown: false }} />
      <Stack.Screen name="Hashtag" component={Hashtag} options={({ route }) => ({ title: route.params.hashtag })} />
      <Stack.Screen name="Profile" component={Profile} options={({ route }) => ({ title: route.params.username })} />
      <Stack.Screen name="Webpage" component={Webpage} options={({ route }) => ({ url: route.params.url })} />
      <Stack.Screen name="ProfilePosts" component={ViewPost} options={({ route }) => ({ title: `${route.params.search} posts` })} />
    </Stack.Navigator>
  )
}
const ProfileStack = () => {
  return (
    <Stack.Navigator initialRouteName="OwnProfile">
      <Stack.Screen name="OwnProfile" component={Profile} options={{ title: '', headerBackVisible: false, headerShown: false }} />
      <Stack.Screen name="Hashtag" component={Hashtag} options={({ route }) => ({ title: route.params.hashtag })} />
      <Stack.Screen name="Profile" component={Profile} options={({ route }) => ({ title: route.params.username })} />
      <Stack.Screen name="Webpage" component={Webpage} options={({ route }) => ({ title: route.params.link.name, link: route.params.link })} />
      <Stack.Screen name="EditProfilePic" component={EditProfilePic} options={{title : "Profile Picture"}} />
      <Stack.Screen name="ProfilePosts" component={ViewPost} options={({ route }) => ({ title: `${route.params.search} posts` })} />
    </Stack.Navigator>
  )
}

function YocailTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        if (route.name === 'HomeTab') {
          return (
            <MaterialIcons name="home" size={35} color={color} />
          );
        } else if (route.name === 'ProfileTab') {
          return (
            <MaterialIcons name="person" size={35} color={color} />
          );
        } else if (route.name === 'SearchTab') {
          return (
            <MaterialIcons name="search" size={35} color={color} />
          );
        } else if (route.name === 'AddTab') {
          return (
            <MaterialIcons name="add" size={35} color={color} />
          );
        } else if (route.name === 'ConversationTab') {
          return (
            <MaterialIcons name="chat" size={35} color={color} />
          );
        }
      },
      tabBarInactiveTintColor: 'gray',
      tabBarActiveTintColor: styles.textPrimary
    })}>
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ headerBackVisible: false, headerShown: false, tabBarShowLabel: false }} />
      <Tab.Screen name="SearchTab" component={SearchStack} options={{ headerBackVisible: false, headerShown: false, tabBarShowLabel: false }} />
      <Tab.Screen name="AddTab" component={AddPost} options={{ headerBackVisible: false, headerShown: false, tabBarShowLabel: false }} />
      <Tab.Screen name="ConversationTab" component={Conversation} options={{ headerBackVisible: false, headerShown: false, tabBarShowLabel: false }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ headerBackVisible: false, headerShown: false, tabBarShowLabel: false }} />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator();
function YocailStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} options={{ title: 'Login', headerBackVisible: false, headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ headerBackVisible: false, headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ title: 'Forgot Password', headerBackVisible: true, headerShown: true }} />
    </Stack.Navigator>
  );
}
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  

  if (isAuthenticated !== null)
    return (
      <AuthProvider onAuthenticated={() => { setIsAuthenticated(true) }} onLogout={() => { 
        setIsAuthenticated(false);
        }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider theme={theme}>
            <NavigationContainer>
              {isAuthenticated ? <YocailTabs /> : <YocailStack /> }
            </NavigationContainer>
        </ThemeProvider>
      </GestureHandlerRootView>
      </AuthProvider>
    );
  else {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider theme={theme}>
          <AuthProvider onAuthenticated={() => { setIsAuthenticated(true) }} onLogout={() => { setIsAuthenticated(false) }}>
            <View></View>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }
}



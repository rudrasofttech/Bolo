import './App.css';
import { Route, Routes } from 'react-router';

import RegisterForm from './components/RegisterForm';
import Home from './components/Home';
import LoginForm from './components/LoginForm';
import ForgotPassword from './components/ForgotPassword';
import AuthProvider from './components/shared/AuthProvider';
import PrivateRoute from './components/PrivateRoute';
import Profile from './components/Profile';
import Explore from './components/Explore';
import ManageProfile from './components/ManageProfile';

function App() {
    return <>
        <AuthProvider>
            <Routes>
                <Route element={<PrivateRoute />}>
                    <Route exact path='/' element={<Home />} />
                    <Route exact path='/profile/:username?' element={<Profile />} />
                    <Route exact path='/manageprofile' element={<ManageProfile />} />
                    <Route exact path='/explore' element={<Explore />} />
                </Route>
                <Route exact path='/register' element={<RegisterForm />} />
                <Route exact path='/login/:username?' element={<LoginForm />} />
                <Route exact path='/forgotpassword' element={<ForgotPassword />} />
            </Routes>
        </AuthProvider>
    </>;
}

export default App;

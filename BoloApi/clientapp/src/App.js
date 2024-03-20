import './App.css';
import { Route, Routes } from 'react-router';

import RegisterForm from './components/RegisterForm';
import Home from './components/Home';
import LoginForm from './components/LoginForm';
import ForgotPassword from './components/ForgotPassword';

function App() {
    return <>
      <Routes>
            <Route exact path='/' element={<Home />} />
            <Route exact path='/register' element={<RegisterForm />} />
            <Route exact path='/login/:username?' element={<LoginForm />} />
            <Route exact path='/forgotpassword' element={<ForgotPassword />} />
            </Routes>
    </>;
}

export default App;

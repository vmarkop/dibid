import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import './App.css';
import AuthGuard from './AuthGuard';
import Login from './Login';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/login' element={<AuthGuard loginGuard={true}>< Login /></AuthGuard>} />
                {/* <Route path='*' element={<Navigate to="/login" replace />} /> */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
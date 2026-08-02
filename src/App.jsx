import React from "react";
import {BrowserRouter, Routes, Route, useLocation} from "react-router-dom";
import { Auth, Home, Orders, Tables } from "./pages";
import Header from "./components/shared/Header";
import Menu from "./pages/Menu";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader";

function Layout() {
    const location = useLocation();
    const isLoading = useLoadData();
  const hideHeaderRoutes = ["/auth"];
  const { isAuth } = useSelector(state => state.user);

  if (isLoading) return <FullScreenLoader />
  return (
 <>

 { !hideHeaderRoutes.includes(location.pathname) && <Header /> }
  <Routes>
     <Route path = "/" element={
      <ProtectedRoutes>
        <Home />
        </ ProtectedRoutes >
     } />
     <Route path = "/home" element={
      <ProtectedRoutes>
        <Home />
        </ProtectedRoutes>
       } />
     <Route path = "/auth" element={ isAuth ? <Navigate to="/"/> : <Auth />} />
     <Route path = "/orders" element={
      <ProtectedRoutes>
        <Orders />
        </ProtectedRoutes>
      
     } />
     <Route path="/tables" element={
      <ProtectedRoutes>
        <Tables />
      </ProtectedRoutes>
     } />
     <Route path="/menu" element={
      <ProtectedRoutes>
        <Menu />
      </ProtectedRoutes>
     } />
     <Route path="*" element={<div>Not Found</div>} />
  </Routes>

 </>
  )
}

function ProtectedRoutes(children){
  const { isAuth } = useSelector(state => state.user);
  if (!isAuth){
    return <Navigate to="/auth" />

  }

  return children;
}

function App() {
 return(
   <BrowserRouter>
    <Layout />
  </BrowserRouter>
 )
}

export default App


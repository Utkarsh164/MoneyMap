"use client"
import { useEffect } from "react";
const Layout = ({ children }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
      }, []);
    return (
      <div className="flex justify-center min-h-screen items-start">
        {children}
      </div>
    );
  };
  
  export default Layout;
  
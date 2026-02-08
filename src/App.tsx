import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './Layout';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';

// ScrollToTop component to fix React Router scroll issue
function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import HowItWorks from './pages/HowItWorks';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ResetPassword from './pages/ResetPassword';
import MyMemorials from './pages/MyMemorials';
import EditMemorial from './pages/EditMemorial';
import ViewMemorial from './pages/ViewMemorial';
import ProductDetail from './pages/ProductDetail';
import OrderConfirmation from './pages/OrderConfirmation';
import CGV from './pages/CGV';
import Privacy from './pages/Privacy';
import Mentions from './pages/Mentions';
import QRRedirect from './pages/QRRedirect';
import AdminQRCodes from './pages/AdminQRCodes';
import AdminOrders from './pages/AdminOrders';
import SetPassword from './pages/SetPassword';

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <ScrollToTop />
                <Toaster position="top-center" richColors />
                <Routes>
                    <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
                    <Route path="/products" element={<Layout currentPageName="Products"><Products /></Layout>} />
                    <Route path="/how-it-works" element={<Layout currentPageName="HowItWorks"><HowItWorks /></Layout>} />
                    <Route path="/contact" element={<Layout currentPageName="Contact"><Contact /></Layout>} />

                    {/* User authentication routes */}
                    <Route path="/login" element={<Layout currentPageName="Login"><Login /></Layout>} />
                    <Route path="/signup" element={<Layout currentPageName="Signup"><Signup /></Layout>} />
                    <Route path="/forgot-password" element={<Layout currentPageName="ForgotPassword"><ForgotPassword /></Layout>} />
                    <Route path="/reset-password" element={<Layout currentPageName="ResetPassword"><ResetPassword /></Layout>} />
                    <Route path="/set-password" element={<Layout currentPageName="SetPassword"><SetPassword /></Layout>} />

                    {/* Admin routes - protected with role check */}
                    <Route path="/admin/login" element={<Navigate to="/login" replace />} />
                    <Route path="/admin" element={<ProtectedRoute><Layout currentPageName="AdminDashboard"><AdminDashboard /></Layout></ProtectedRoute>} />
                    <Route path="/admin/products" element={<ProtectedRoute><Layout currentPageName="AdminProducts"><AdminProducts /></Layout></ProtectedRoute>} />
                    <Route path="/admin/qrcodes" element={<ProtectedRoute><Layout currentPageName="AdminQRCodes"><AdminQRCodes /></Layout></ProtectedRoute>} />
                    <Route path="/admin/orders" element={<ProtectedRoute><Layout currentPageName="AdminOrders"><AdminOrders /></Layout></ProtectedRoute>} />

                    <Route path="/cart" element={<Layout currentPageName="Cart"><Cart /></Layout>} />
                    <Route path="/checkout" element={<Layout currentPageName="Checkout"><Checkout /></Layout>} />

                    {/* User-protected routes */}
                    <Route path="/my-memorials" element={<UserProtectedRoute><Layout currentPageName="MyMemorials"><MyMemorials /></Layout></UserProtectedRoute>} />
                    <Route path="/edit-memorial/:id" element={<UserProtectedRoute><Layout currentPageName="EditMemorial"><EditMemorial /></Layout></UserProtectedRoute>} />

                    <Route path="/memorial/:id" element={<Layout currentPageName="ViewMemorial"><ViewMemorial /></Layout>} />
                    <Route path="/product/:slug" element={<Layout currentPageName="ProductDetail"><ProductDetail /></Layout>} />
                    <Route path="/order-confirmation" element={<Layout currentPageName="OrderConfirmation"><OrderConfirmation /></Layout>} />
                    <Route path="/cgv" element={<Layout currentPageName="CGV"><CGV /></Layout>} />
                    <Route path="/privacy" element={<Layout currentPageName="Privacy"><Privacy /></Layout>} />
                    <Route path="/mentions" element={<Layout currentPageName="Mentions"><Mentions /></Layout>} />
                    <Route path="/qr/:code" element={<QRRedirect />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

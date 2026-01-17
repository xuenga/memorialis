import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './Layout';
import { Toaster } from 'sonner';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import ProtectedRoute from './components/ProtectedRoute';

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
import AdminLogin from './pages/AdminLogin';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
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

export default function App() {
    return (
        <AdminAuthProvider>
            <Router>
                <ScrollToTop />
                <Toaster position="top-center" richColors />
                <Routes>
                    <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
                    <Route path="/products" element={<Layout currentPageName="Products"><Products /></Layout>} />
                    <Route path="/how-it-works" element={<Layout currentPageName="HowItWorks"><HowItWorks /></Layout>} />
                    <Route path="/contact" element={<Layout currentPageName="Contact"><Contact /></Layout>} />

                    {/* Admin routes - protected */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<ProtectedRoute><Layout currentPageName="AdminDashboard"><AdminDashboard /></Layout></ProtectedRoute>} />
                    <Route path="/admin/products" element={<ProtectedRoute><Layout currentPageName="AdminProducts"><AdminProducts /></Layout></ProtectedRoute>} />
                    <Route path="/admin/qrcodes" element={<ProtectedRoute><Layout currentPageName="AdminQRCodes"><AdminQRCodes /></Layout></ProtectedRoute>} />

                    <Route path="/cart" element={<Layout currentPageName="Cart"><Cart /></Layout>} />
                    <Route path="/checkout" element={<Layout currentPageName="Checkout"><Checkout /></Layout>} />
                    <Route path="/my-memorials" element={<Layout currentPageName="MyMemorials"><MyMemorials /></Layout>} />
                    <Route path="/edit-memorial/:id" element={<Layout currentPageName="EditMemorial"><EditMemorial /></Layout>} />
                    <Route path="/memorial/:id" element={<Layout currentPageName="ViewMemorial"><ViewMemorial /></Layout>} />
                    <Route path="/product/:id" element={<Layout currentPageName="ProductDetail"><ProductDetail /></Layout>} />
                    <Route path="/order-confirmation" element={<Layout currentPageName="OrderConfirmation"><OrderConfirmation /></Layout>} />
                    <Route path="/cgv" element={<Layout currentPageName="CGV"><CGV /></Layout>} />
                    <Route path="/privacy" element={<Layout currentPageName="Privacy"><Privacy /></Layout>} />
                    <Route path="/mentions" element={<Layout currentPageName="Mentions"><Mentions /></Layout>} />
                    <Route path="/qr/:code" element={<QRRedirect />} />
                </Routes>
            </Router>
        </AdminAuthProvider>
    );
}


export const createPageUrl = (pageName: string, params: Record<string, string> = {}) => {
    const routes: Record<string, string> = {
        Home: '/',
        Products: '/products',
        HowItWorks: '/how-it-works',
        Contact: '/contact',
        AdminDashboard: '/admin',
        AdminProducts: '/admin/products',
        AdminQRCodes: '/admin/qrcodes',
        AdminLogin: '/admin/login',
        Cart: '/cart',
        Checkout: '/checkout',
        MyMemorials: '/my-memorials',
        EditMemorial: '/edit-memorial/:id',
        ViewMemorial: '/memorial/:id',
        ProductDetail: '/product/:id',
        OrderConfirmation: '/order-confirmation',
        CGV: '/cgv',
        Privacy: '/privacy',
        Mentions: '/mentions',
        QRRedirect: '/qr/:code'
    };

    let url = routes[pageName] || '/';

    // Replace :id or other params
    Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, value);
    });

    // If there are still :params left and NOT in provided params, 
    // it usually means we were using the old query param style
    // For now, let's keep it flexible
    if (url.includes(':') && !Object.keys(params).length) {
        url = url.split(':')[0].replace(/\/$/, '') || '/';
    }

    return url;
};

export const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
};

import Layout from "./Layout.jsx";

import Home from "./Home";

import Search from "./Search";

import ProductDetail from "./ProductDetail";

import CreateProduct from "./CreateProduct";

import Messages from "./Messages";

import Chat from "./Chat";

import Profile from "./Profile";

import Dashboard from "./Dashboard";

import Settings from "./Settings";

import LabelShop from "./LabelShop";

import Orders from "./Orders";

import OrderDetail from "./OrderDetail";

import ShippingManagement from "./ShippingManagement";

import Checkout from "./Checkout";

import AdminReports from "./AdminReports";

import Wallet from "./Wallet";

import OffersManagement from "./OffersManagement";

import MyOffers from "./MyOffers";

import DiscountCodes from "./DiscountCodes";

import EditProduct from "./EditProduct";

import AdminAuthentication from "./AdminAuthentication";

import PromotionTools from "./PromotionTools";

import Personalization from "./Personalization";

import VacationMode from "./VacationMode";

import Referral from "./Referral";

import Guide from "./Guide";

import HelpCenter from "./HelpCenter";

import Legal from "./Legal";

import About from "./About";

import MyProducts from "./MyProducts";

import MyFavorites from "./MyFavorites";

import Widerruf from "./Widerruf";

import CommunityRichtlinien from "./CommunityRichtlinien";

import DHLSettings from "./DHLSettings";

import PaymentSettings from "./PaymentSettings";

import PaymentSecurity from "./PaymentSecurity";

import AdminLegal from "./AdminLegal";

import AdminDisputes from "./AdminDisputes";

import TaxReport from "./TaxReport";

import KYCVerification from "./KYCVerification";

import Invoice from "./Invoice";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Search: Search,
    
    ProductDetail: ProductDetail,
    
    CreateProduct: CreateProduct,
    
    Messages: Messages,
    
    Chat: Chat,
    
    Profile: Profile,
    
    Dashboard: Dashboard,
    
    Settings: Settings,
    
    LabelShop: LabelShop,
    
    Orders: Orders,
    
    OrderDetail: OrderDetail,
    
    ShippingManagement: ShippingManagement,
    
    Checkout: Checkout,
    
    AdminReports: AdminReports,
    
    Wallet: Wallet,
    
    OffersManagement: OffersManagement,
    
    MyOffers: MyOffers,
    
    DiscountCodes: DiscountCodes,
    
    EditProduct: EditProduct,
    
    AdminAuthentication: AdminAuthentication,
    
    PromotionTools: PromotionTools,
    
    Personalization: Personalization,
    
    VacationMode: VacationMode,
    
    Referral: Referral,
    
    Guide: Guide,
    
    HelpCenter: HelpCenter,
    
    Legal: Legal,
    
    About: About,
    
    MyProducts: MyProducts,
    
    MyFavorites: MyFavorites,
    
    Widerruf: Widerruf,
    
    CommunityRichtlinien: CommunityRichtlinien,
    
    DHLSettings: DHLSettings,
    
    PaymentSettings: PaymentSettings,
    
    PaymentSecurity: PaymentSecurity,
    
    AdminLegal: AdminLegal,
    
    AdminDisputes: AdminDisputes,
    
    TaxReport: TaxReport,
    
    KYCVerification: KYCVerification,
    
    Invoice: Invoice,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Search" element={<Search />} />
                
                <Route path="/ProductDetail" element={<ProductDetail />} />
                
                <Route path="/CreateProduct" element={<CreateProduct />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/Chat" element={<Chat />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/LabelShop" element={<LabelShop />} />
                
                <Route path="/Orders" element={<Orders />} />
                
                <Route path="/OrderDetail" element={<OrderDetail />} />
                
                <Route path="/ShippingManagement" element={<ShippingManagement />} />
                
                <Route path="/Checkout" element={<Checkout />} />
                
                <Route path="/AdminReports" element={<AdminReports />} />
                
                <Route path="/Wallet" element={<Wallet />} />
                
                <Route path="/OffersManagement" element={<OffersManagement />} />
                
                <Route path="/MyOffers" element={<MyOffers />} />
                
                <Route path="/DiscountCodes" element={<DiscountCodes />} />
                
                <Route path="/EditProduct" element={<EditProduct />} />
                
                <Route path="/AdminAuthentication" element={<AdminAuthentication />} />
                
                <Route path="/PromotionTools" element={<PromotionTools />} />
                
                <Route path="/Personalization" element={<Personalization />} />
                
                <Route path="/VacationMode" element={<VacationMode />} />
                
                <Route path="/Referral" element={<Referral />} />
                
                <Route path="/Guide" element={<Guide />} />
                
                <Route path="/HelpCenter" element={<HelpCenter />} />
                
                <Route path="/Legal" element={<Legal />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/MyProducts" element={<MyProducts />} />
                
                <Route path="/MyFavorites" element={<MyFavorites />} />
                
                <Route path="/Widerruf" element={<Widerruf />} />
                
                <Route path="/CommunityRichtlinien" element={<CommunityRichtlinien />} />
                
                <Route path="/DHLSettings" element={<DHLSettings />} />
                
                <Route path="/PaymentSettings" element={<PaymentSettings />} />
                
                <Route path="/PaymentSecurity" element={<PaymentSecurity />} />
                
                <Route path="/AdminLegal" element={<AdminLegal />} />
                
                <Route path="/AdminDisputes" element={<AdminDisputes />} />
                
                <Route path="/TaxReport" element={<TaxReport />} />
                
                <Route path="/KYCVerification" element={<KYCVerification />} />
                
                <Route path="/Invoice" element={<Invoice />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
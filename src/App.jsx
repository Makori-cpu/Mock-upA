import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import DetailPage from "./pages/DetailPage";
import StubPage from "./pages/StubPage";
import PricingPage from "./pages/PricingPage";
import ReportsAnalyticsPage from "./pages/ReportsAnalyticsPage";

import TicketingPage from "./pages/product/TicketingPage";
import ContactCentrePage from "./pages/product/ContactCentrePage";
import TechnicianDashboardPage from "./pages/product/TechnicianDashboardPage";
import WorkforceManagementPage from "./pages/product/WorkforceManagementPage";

import MessagingLiveChatPage from "./pages/services/MessagingLiveChatPage";
import TicketingSolutionsPage from "./pages/services/TicketingSolutionsPage";
import ItServiceManagementPage from "./pages/services/ItServiceManagementPage";
import KnowledgeBasePage from "./pages/services/KnowledgeBasePage";

import CustomerReviewsPage from "./pages/tools/CustomerReviewsPage";
import BlogPage from "./pages/tools/BlogPage";
import HelpCentrePage from "./pages/tools/HelpCentrePage";
import PartnersPage from "./pages/tools/PartnersPage";
import AboutUsPage from "./pages/tools/AboutUsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Sphere */}
          <Route path="/sphere/reports-and-analytics" element={<ReportsAnalyticsPage />} />

          {/* Product */}
          <Route path="/product/ticketing" element={<TicketingPage />} />
          <Route path="/product/contact-centre" element={<ContactCentrePage />} />
          <Route path="/product/technician-dashboard" element={<TechnicianDashboardPage />} />
          <Route path="/product/workforce-management" element={<WorkforceManagementPage />} />

          {/* Services */}
          <Route path="/services/messaging-and-live-chats" element={<MessagingLiveChatPage />} />
          <Route path="/services/ticketing-solutions" element={<TicketingSolutionsPage />} />
          <Route path="/services/it-service-management" element={<ItServiceManagementPage />} />
          <Route path="/services/knowledge-base" element={<KnowledgeBasePage />} />

          {/* Tools */}
          <Route path="/tools/customer-reviews" element={<CustomerReviewsPage />} />
          <Route path="/tools/blog" element={<BlogPage />} />
          <Route path="/tools/help-centre" element={<HelpCentrePage />} />
          <Route path="/tools/partners" element={<PartnersPage />} />
          <Route path="/tools/about-us" element={<AboutUsPage />} />

          {/* Generic fallback for any other dropdown link (e.g. Sphere / Tatua Sasa AI) */}
          <Route path="/:section/:slug" element={<DetailPage />} />

          <Route path="/pricing" element={<PricingPage />} />
          <Route
            path="/demo"
            element={
              <StubPage
                title="View demo"
                blurb="A guided walkthrough of Tatua Sasa — coming soon."
              />
            }
          />
          <Route
            path="/login"
            element={<StubPage title="Log in / Sign up" blurb="Account access is coming soon." />}
          />
          <Route
            path="/get-started"
            element={
              <StubPage
                title="Try Tatua Sasa for free"
                blurb="Sign-up flow coming soon. Thanks for your interest!"
              />
            }
          />
          <Route
            path="*"
            element={<StubPage title="Page not found" blurb="That page doesn't exist yet." />}
          />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

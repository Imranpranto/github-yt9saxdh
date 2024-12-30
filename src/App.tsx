import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SEO from './components/SEO';
import { ServicesProvider } from './contexts/ServicesContext';
import { LeadsProvider } from './contexts/LeadsContext';
import { useAuth } from './hooks/useAuth';
import { toast } from './utils/toast';

// Lazy load components for better performance
const FeatureCards = React.lazy(() => import('./components/FeatureCards'));
const CreditStats = React.lazy(() => import('./components/CreditStats'));
const ServicesGrid = React.lazy(() => import('./components/ServicesGrid'));
const ServiceDetails = React.lazy(() => import('./pages/ServiceDetails'));
const Operations = React.lazy(() => import('./pages/Operations'));
const ProfilePostCommentators = React.lazy(() => import('./pages/ProfilePostCommentators'));
const GetPostReactions = React.lazy(() => import('./pages/GetPostReactions'));
const Integrations = React.lazy(() => import('./pages/Integrations'));
const ProfilePosts = React.lazy(() => import('./pages/ProfilePosts'));
const CompanyPosts = React.lazy(() => import('./pages/CompanyPosts'));
const Leads = React.lazy(() => import('./pages/Leads'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const ProfileDataByUrl = React.lazy(() => import('./pages/ProfileDataByUrl'));
const ArticleComments = React.lazy(() => import('./pages/ArticleComments'));
const ArticleReactions = React.lazy(() => import('./pages/ArticleReactions'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const MySubscription = React.lazy(() => import('./pages/MySubscription'));

// Success page component
function SubscriptionSuccess() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user && location.search.includes('success=true')) {
      toast.success('Subscription updated successfully!');
    }
  }, [location, user]);

  return <Navigate to="/my-subscription" replace />;
}

function App() {
  return (
    <HelmetProvider>
      <ServicesProvider>
        <LeadsProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={
                <>
                  <SEO 
                    title="Sign In or Sign Up" 
                    description="Access your LiEnrich account to start enriching your LinkedIn data and generating valuable leads."
                    canonicalUrl="https://lienrich.com/auth"
                  />
                  <Auth />
                </>
              } />
              <Route path="/subscription/success" element={<SubscriptionSuccess />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50 flex">
                    <Sidebar />
                    <div className="flex-1 flex flex-col ml-16">
                      <Header />
                      <main className="flex-1">
                        <React.Suspense fallback={
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          </div>
                        }>
                          <Routes>
                            <Route path="/" element={
                              <div className="p-8">
                                <SEO 
                                  title="Dashboard" 
                                  description="Access all LiEnrich tools and features from your personalized dashboard. Monitor credits, view recent activity, and start enriching your LinkedIn data."
                                  canonicalUrl="https://lienrich.com"
                                />
                                <div className="max-w-7xl mx-auto">
                                  <div className="mb-8">
                                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
                                    <p className="text-gray-500">A reliable Company to search & enrich LinkedIn things</p>
                                  </div>
                                  <div className="mb-8">
                                    <CreditStats />
                                  </div>
                                  <div className="mb-8">
                                    <FeatureCards />
                                  </div>
                                  <div className="mb-8">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Operations</h2>
                                    <ServicesGrid />
                                  </div>
                                </div>
                              </div>
                            } />
                            <Route path="/service/:serviceId" element={
                              <>
                                <SEO 
                                  title="Service Details" 
                                  description="Explore detailed information about our LinkedIn data enrichment services and how they can benefit your business."
                                  canonicalUrl="https://lienrich.com/service"
                                />
                                <ServiceDetails />
                              </>
                            } />
                            <Route path="/operations" element={
                              <>
                                <SEO 
                                  title="Operations" 
                                  description="Access and manage all available LinkedIn data operations. Extract valuable insights from profiles, posts, and company pages."
                                  canonicalUrl="https://lienrich.com/operations"
                                />
                                <Operations />
                              </>
                            } />
                            <Route path="/get-post-reactions" element={
                              <>
                                <SEO 
                                  title="Post Reactions" 
                                  description="Analyze LinkedIn post reactions to understand engagement patterns and identify potential leads."
                                  canonicalUrl="https://lienrich.com/get-post-reactions"
                                />
                                <GetPostReactions />
                              </>
                            } />
                            <Route path="/profile-post-commentators" element={
                              <>
                                <SEO 
                                  title="Post Commentators" 
                                  description="Identify and analyze LinkedIn users who engage with specific posts through comments."
                                  canonicalUrl="https://lienrich.com/profile-post-commentators"
                                />
                                <ProfilePostCommentators />
                              </>
                            } />
                            <Route path="/profile-posts" element={
                              <>
                                <SEO 
                                  title="Profile Posts" 
                                  description="View and analyze posts from specific LinkedIn profiles to gain insights into content strategy and engagement."
                                  canonicalUrl="https://lienrich.com/profile-posts"
                                />
                                <ProfilePosts />
                              </>
                            } />
                            <Route path="/company-posts" element={
                              <>
                                <SEO 
                                  title="Company Posts" 
                                  description="Track and analyze LinkedIn company page posts to understand corporate communication strategies and engagement."
                                  canonicalUrl="https://lienrich.com/company-posts"
                                />
                                <CompanyPosts />
                              </>
                            } />
                            <Route path="/profile-data-by-url" element={
                              <>
                                <SEO 
                                  title="Profile Data" 
                                  description="Extract comprehensive data from LinkedIn profiles using URLs for detailed professional insights."
                                  canonicalUrl="https://lienrich.com/profile-data-by-url"
                                />
                                <ProfileDataByUrl />
                              </>
                            } />
                            <Route path="/article-comments" element={
                              <>
                                <SEO 
                                  title="Article Comments" 
                                  description="Analyze comments on LinkedIn articles to understand reader engagement and identify potential leads."
                                  canonicalUrl="https://lienrich.com/article-comments"
                                />
                                <ArticleComments />
                              </>
                            } />
                            <Route path="/analytics" element={
                              <>
                                <SEO 
                                  title="Analytics" 
                                  description="Get detailed analytics and insights about your LinkedIn data enrichment activities and lead generation efforts."
                                  canonicalUrl="https://lienrich.com/analytics"
                                />
                                <Analytics />
                              </>
                            } />
                            <Route path="/article-reactions" element={
                              <>
                                <SEO 
                                  title="Article Reactions" 
                                  description="Track and analyze reactions to LinkedIn articles for engagement insights and lead generation."
                                  canonicalUrl="https://lienrich.com/article-reactions"
                                />
                                <ArticleReactions />
                              </>
                            } />
                            <Route path="/pricing" element={
                              <>
                                <SEO 
                                  title="Pricing Plans" 
                                  description="Explore our flexible pricing plans for LinkedIn data enrichment and lead generation services."
                                  canonicalUrl="https://lienrich.com/pricing"
                                />
                                <Pricing />
                              </>
                            } />
                            <Route path="/my-subscription" element={
                              <>
                                <SEO 
                                  title="My Subscription" 
                                  description="Manage your LiEnrich subscription, view usage history, and update billing information."
                                  canonicalUrl="https://lienrich.com/my-subscription"
                                />
                                <MySubscription />
                              </>
                            } />
                            <Route path="/settings" element={
                              <>
                                <SEO 
                                  title="Settings" 
                                  description="Configure your LiEnrich account settings and preferences for optimal data enrichment experience."
                                  canonicalUrl="https://lienrich.com/settings"
                                />
                                <Settings />
                              </>
                            } />
                            <Route path="/leads" element={
                              <>
                                <SEO 
                                  title="Leads" 
                                  description="Access and manage your enriched LinkedIn leads. Sort, filter, and export valuable contact information."
                                  canonicalUrl="https://lienrich.com/leads"
                                />
                                <Leads />
                              </>
                            } />
                            <Route path="/integrations" element={
                              <>
                                <SEO 
                                  title="Integrations" 
                                  description="Connect LiEnrich with your favorite tools and CRM systems for seamless lead management."
                                  canonicalUrl="https://lienrich.com/integrations"
                                />
                                <Integrations />
                              </>
                            } />
                            <Route path="*" element={<Navigate to="/" replace={true} />} />
                          </Routes>
                        </React.Suspense>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </LeadsProvider>
      </ServicesProvider>
    </HelmetProvider>
  );
}

export default App;

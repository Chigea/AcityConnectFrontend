import { HashRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { type ReactNode } from "react";
import { AuthProvider, useAuth } from "./auth";
import "./index.css";
import { BrandedLoader } from "./components/BrandedLoader";
import { Layout } from "./components/Layout";
import { FeedPage } from "./pages/FeedPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ListingCreatePage, ListingEditPage } from "./pages/ListingFormPage";
import { ListingDetailPage } from "./pages/ListingDetailPage";
import { ProfileEditPage, ProfilePage } from "./pages/ProfilePage";
import { MyInterestsPage } from "./pages/MyInterestsPage";
import { IncomingInterestsPage } from "./pages/IncomingInterestsPage";
import { ConversationsPage } from "./pages/ConversationsPage";
import { ConversationPage } from "./pages/ConversationPage";
import { AdminPage } from "./pages/AdminPage";

function RequireUser({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready)
    return <BrandedLoader label="Loading session" size="screen" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready)
    return <BrandedLoader label="Loading session" size="screen" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function ListingEditRouteBridge() {
  const { id } = useParams();
  if (!id) return <Navigate to="/" replace />;
  return <ListingEditPage id={id} />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<FeedPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route path="listings/new" element={<ListingCreatePage />} />
        <Route
          path="listings/:id/edit"
          element={
            <RequireUser>
              <ListingEditRouteBridge />
            </RequireUser>
          }
        />
        <Route path="listings/:id" element={<ListingDetailPage />} />

        <Route path="profile/:id" element={<ProfilePage />} />
        <Route
          path="profile/edit"
          element={
            <RequireUser>
              <ProfileEditPage />
            </RequireUser>
          }
        />

        <Route
          path="interests/mine"
          element={
            <RequireUser>
              <MyInterestsPage />
            </RequireUser>
          }
        />
        <Route
          path="interests/incoming"
          element={
            <RequireUser>
              <IncomingInterestsPage />
            </RequireUser>
          }
        />

        <Route
          path="conversations"
          element={
            <RequireUser>
              <ConversationsPage />
            </RequireUser>
          }
        />
        <Route
          path="conversations/:id"
          element={
            <RequireUser>
              <ConversationPage />
            </RequireUser>
          }
        />

        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}

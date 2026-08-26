import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckCircle2,
  LockKeyhole,
  MessageCircle,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import HomePage from "./components/HomePage";
import InvoicesList from "./components/InvoicesList";
import NewBill from "./components/NewBill";
import Navbar from "./components/Navbar";
import InvoiceView from "./components/InvoiceView";
import Login from "./pages/Login";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { getMe } from "./redux/Slices/authSlice";
import NotFound from "./components/NotFound";

import Dashboard from "./Dashboard/Dashboard";
import Customers from "./Dashboard/Customers";
import Setting from "./Dashboard/Setting";
import Profile from "./Dashboard/Profile";

/* ============================================================================
   TEMPORARY SITE ACCESS CONTROL

   true  = Application unlocked
   false = Renewal / payment required

   Later this can come from your backend/subscription API.
============================================================================ */

const SITE_UNLOCKED = false;

/* ============================================================================
   RENEWAL REQUIRED PAGE
============================================================================ */

const RenewalRequired = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        minHeight: "100dvh",
        boxSizing: "border-box",

        background:
          "radial-gradient(circle at top left, rgba(132,204,22,0.10), transparent 32%), radial-gradient(circle at bottom right, rgba(59,130,246,0.08), transparent 30%), #020617",

        color: "#ffffff",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        padding: "14px 20px",

        position: "relative",

        /*
         * IMPORTANT
         * Page-level scrolling completely disabled.
         */
        overflow: "hidden",

        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* ================================================================
          BACKGROUND GLOW
      ================================================================ */}

      <div
        style={{
          position: "absolute",
          width: "380px",
          height: "380px",
          borderRadius: "999px",
          background: "rgba(132, 204, 22, 0.06)",
          filter: "blur(90px)",
          top: "-180px",
          left: "-140px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "380px",
          height: "380px",
          borderRadius: "999px",
          background: "rgba(59, 130, 246, 0.05)",
          filter: "blur(90px)",
          bottom: "-180px",
          right: "-140px",
          pointerEvents: "none",
        }}
      />

      {/* ================================================================
          MAIN WRAPPER
      ================================================================ */}

      <div
        style={{
          width: "100%",
          maxWidth: "1080px",

          /*
           * Keep the complete component inside viewport.
           */
          height: "calc(100dvh - 28px)",
          maxHeight: "calc(100dvh - 28px)",

          position: "relative",
          zIndex: 2,

          display: "flex",
          flexDirection: "column",

          boxSizing: "border-box",
        }}
      >
        {/* ================================================================
            BRAND
        ================================================================ */}

        {/* <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",

            marginBottom: "10px",

            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "14px",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              background: "rgba(132,204,22,0.10)",
              border: "1px solid rgba(132,204,22,0.24)",

              color: "#a3e635",
            }}
          >
            <Sparkles size={20} />
          </div>

          <div
            style={{
              fontSize: "18px",
              fontWeight: 900,
              letterSpacing: "-0.03em",
            }}
          >
            Amigo
          </div>
        </div> */}

        {/* ================================================================
            MAIN CARD
        ================================================================ */}

        <div
          style={{
            width: "100%",
            flex: 1,

            minHeight: 0,

            borderRadius: "28px",
            border: "1px solid rgba(255,255,255,0.08)",

            background:
              "linear-gradient(145deg, rgba(15,23,42,0.97), rgba(7,15,25,0.99))",

            boxShadow:
              "0 25px 80px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.03)",

            overflow: "hidden",

            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ================================================================
              TOP STATUS
          ================================================================ */}

          <div
            style={{
              height: "58px",
              minHeight: "58px",

              boxSizing: "border-box",

              padding: "10px 20px",

              borderBottom: "1px solid rgba(255,255,255,0.06)",

              background: "rgba(255,255,255,0.015)",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",

                padding: "7px 13px",

                borderRadius: "999px",

                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.18)",

                color: "#fbbf24",

                fontSize: "11px",

                textTransform: "uppercase",
                letterSpacing: "0.11em",
              }}
            >
              <LockKeyhole size={13} />
              Subscription Required
            </div>
          </div>

          {/* ================================================================
              CONTENT AREA
          ================================================================ */}

          <div
            style={{
              flex: 1,
              minHeight: 0,

              padding: "22px 34px 16px",

              boxSizing: "border-box",

              display: "flex",
              flexDirection: "column",

              textAlign: "center",

              overflow: "hidden",
            }}
          >
            {/* ============================================================
                ICON
            ============================================================ */}

            <div
              style={{
                width: "64px",
                height: "64px",

                margin: "0 auto 12px",

                borderRadius: "20px",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                flexShrink: 0,

                background:
                  "linear-gradient(145deg, rgba(132,204,22,0.14), rgba(132,204,22,0.035))",

                border: "1px solid rgba(132,204,22,0.24)",

                boxShadow: "0 0 35px rgba(132,204,22,0.07)",
              }}
            >
              <RefreshCcw size={29} strokeWidth={1.8} color="#a3e635" />
            </div>

            {/* ============================================================
                TITLE
            ============================================================ */}

            <h1
              style={{
                margin: 0,

                fontSize: "clamp(27px, 3.5vw, 42px)",

                lineHeight: 1.04,

                letterSpacing: "4px",

                color: "#ffffff",

                flexShrink: 0,
              }}
            >
              Your Subscription
              <br />
              <span style={{ color: "#a3e635" }}>Needs Renewal</span>
            </h1>

            {/* ============================================================
                DESCRIPTION
            ============================================================ */}

            <p
              style={{
                maxWidth: "650px",

                margin: "11px auto 0",

                fontSize: "14px",

                lineHeight: 1.55,

                color: "#94a3b8",

                flexShrink: 0,
              }}
            >
              Your access to the application is currently locked because the
              subscription renewal is pending.
            </p>

            <p
              style={{
                maxWidth: "600px",

                margin: "4px auto 0",

                fontSize: "12px",

                lineHeight: 1.5,

                color: "#64748b",

                flexShrink: 0,
              }}
            >
              Please complete your renewal to continue using your dashboard,
              customers, invoices and other application features.
            </p>

            {/* ============================================================
                DIVIDER
            ============================================================ */}

            <div
              style={{
                width: "100%",

                height: "1px",

                background: "rgba(255,255,255,0.07)",

                margin: "15px 0",

                flexShrink: 0,
              }}
            />

            {/* ============================================================
                FEATURES
            ============================================================ */}

            <div
              style={{
                display: "grid",

                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",

                gap: "10px",

                textAlign: "left",

                flexShrink: 0,
              }}
            >
              {[
                "Dashboard Access",
                "Customer Management",
                "Invoice Management",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    minWidth: 0,

                    display: "flex",
                    alignItems: "center",

                    gap: "8px",

                    padding: "10px 12px",

                    borderRadius: "12px",

                    border: "1px solid rgba(255,255,255,0.06)",

                    background: "rgba(255,255,255,0.025)",
                  }}
                >
                  <CheckCircle2
                    size={15}
                    color="#a3e635"
                    style={{
                      flexShrink: 0,
                    }}
                  />

                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,

                      color: "#cbd5e1",

                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* ============================================================
                CONTACT BOX
            ============================================================ */}

            <div
              style={{
                marginTop: "14px",

                padding: "15px 18px",

                borderRadius: "17px",

                border: "1px solid rgba(132,204,22,0.18)",

                background:
                  "linear-gradient(145deg, rgba(132,204,22,0.065), rgba(132,204,22,0.02))",

                textAlign: "left",

                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",

                  alignItems: "center",

                  gap: "12px",
                }}
              >
                {/* ICON */}

                <div
                  style={{
                    width: "38px",
                    height: "38px",

                    flexShrink: 0,

                    borderRadius: "11px",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    background: "rgba(132,204,22,0.12)",

                    color: "#a3e635",
                  }}
                >
                  <MessageCircle size={18} />
                </div>

                {/* TEXT */}

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,

                      fontSize: "14px",

                      fontWeight: 800,

                      color: "#ffffff",
                    }}
                  >
                    Need help with your renewal?
                  </h3>

                  <p
                    style={{
                      margin: "4px 0 0",

                      fontSize: "11px",

                      lineHeight: 1.45,

                      color: "#94a3b8",
                    }}
                  >
                    Please contact the Amigo Team for renewal details, payment
                    information and account activation.
                  </p>
                </div>
              </div>

              {/* ========================================================
                  CONTACT DETAILS
              ======================================================== */}

              <div
                style={{
                  display: "grid",

                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",

                  gap: "8px",

                  marginTop: "11px",
                }}
              >
                <div
                  style={{
                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",

                    gap: "7px",

                    padding: "8px 10px",

                    borderRadius: "9px",

                    background: "rgba(255,255,255,0.035)",

                    color: "#cbd5e1",

                    fontSize: "10px",

                    fontWeight: 700,
                  }}
                >
                  <MessageCircle size={13} color="#a3e635" />
                  Contact Amigo Team
                </div>

                <div
                  style={{
                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",

                    gap: "7px",

                    padding: "8px 10px",

                    borderRadius: "9px",

                    background: "rgba(255,255,255,0.035)",

                    color: "#cbd5e1",

                    fontSize: "10px",

                    fontWeight: 700,
                  }}
                >
                  <Phone size={13} color="#a3e635" />
                  Renewal Support
                </div>
              </div>
            </div>

            {/* ============================================================
                SUPPORT NOTE
            ============================================================ */}

            <div
              style={{
                marginTop: "10px",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                gap: "6px",

                color: "#475569",

                fontSize: "9px",

                fontWeight: 600,

                flexShrink: 0,
              }}
            >
              <ShieldCheck size={13} />
              Your account data remains safe and protected.
            </div>
          </div>

          {/* ================================================================
              FOOTER
          ================================================================ */}

          <div
            style={{
              minHeight: "38px",

              padding: "9px 20px",

              boxSizing: "border-box",

              borderTop: "1px solid rgba(255,255,255,0.06)",

              background: "rgba(0,0,0,0.15)",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              textAlign: "center",

              color: "#475569",

              fontSize: "9px",

              fontWeight: 600,

              flexShrink: 0,
            }}
          >
            Please contact the Amigo Team to renew your subscription.
          </div>
        </div>
      </div>

      {/* ================================================================
          RESPONSIVE STYLE
      ================================================================ */}

      <style>
        {`
          * {
            box-sizing: border-box;
          }

          html,
          body,
          #root {
            margin: 0;
            width: 100%;
            min-height: 100%;
          }

          body {
            overflow: hidden;
          }

          @media (max-width: 700px) {
            body {
              overflow: hidden;
            }
          }

          @media (max-width: 600px) {
            .renewal-content {
              padding-left: 18px !important;
              padding-right: 18px !important;
            }
          }

          @media (max-height: 760px) {
            .renewal-content {
              padding-top: 12px !important;
              padding-bottom: 8px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

/* ============================================================================
   APP
============================================================================ */

const App = () => {
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  const location = useLocation();

  console.log(loading);

  const noNavbarRoutes = ["/login", "/register"];

  const validRoutes = ["/", "/invoices", "/new", "/invoice"];

  const is404 = !validRoutes.some((path) => location.pathname.startsWith(path));

  const shouldNavbar = noNavbarRoutes.includes(location.pathname) || is404;

  /* ================================================================
     TEMPORARY PAYMENT LOCK
  ================================================================ */

  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/register";

  if (!SITE_UNLOCKED && !isAuthRoute) {
    return <RenewalRequired />;
  }

  return (
    <>
      {!shouldNavbar && <Navbar />}

      <Routes>
        {/* ============================================================
            HOME
        ============================================================ */}

        <Route
          path="/"
          element={
            <ProtectedRoutes>
              <HomePage />
            </ProtectedRoutes>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="customer" element={<Customers />} />

          <Route path="setting" element={<Setting />} />

          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ============================================================
            INVOICES
        ============================================================ */}

        <Route
          path="/invoices"
          element={
            <ProtectedRoutes>
              <InvoicesList />
            </ProtectedRoutes>
          }
        />

        {/* ============================================================
            NEW BILL
        ============================================================ */}

        <Route
          path="/new"
          element={
            <ProtectedRoutes>
              <NewBill />
            </ProtectedRoutes>
          }
        />

        {/* ============================================================
            INVOICE VIEW
        ============================================================ */}

        <Route path="/invoice/:id" element={<InvoiceView />} />

        {/* ============================================================
            EDIT INVOICE
        ============================================================ */}

        <Route path="/new/:invoiceId" element={<NewBill />} />

        {/* ============================================================
            AUTH
        ============================================================ */}

        <Route path="/" element={<Login />} />

        {/* ============================================================
            404
        ============================================================ */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;

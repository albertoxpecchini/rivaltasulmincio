import { lazy, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router"
import Layout from "@/app/components/Layout"
import NotFound from "@/app/components/NotFound"
import "./styles/index.css"

const Home = lazy(() => import("@/app/home/Home"))
const Storia = lazy(() => import("@/app/storia/Storia"))
const Origini = lazy(() => import("@/app/origini/Origini"))
const Privacy = lazy(() => import("@/app/privacy/Privacy"))
const Cookie = lazy(() => import("@/app/cookie/Cookie"))
const NoteLegali = lazy(() => import("@/app/note-legali/NoteLegali"))
const Login = lazy(() => import("@/app/login/Login"))
const Reset = lazy(() => import("@/app/reset/Reset"))
const Profile = lazy(() => import("@/app/profile/Profile"))
const Write = lazy(() => import("@/app/write/Write"))
const Post = lazy(() => import("@/app/post/Post"))
const Dashboard = lazy(() => import("@/app/dashboard/Dashboard"))
const DbTest = lazy(() => import("@/app/db-test/DbTest"))

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/storia" element={<Storia />} />
            <Route path="/origini" element={<Origini />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookie" element={<Cookie />} />
            <Route path="/note-legali" element={<NoteLegali />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/write" element={<Write />} />
            <Route path="/post" element={<Post />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/db-test" element={<DbTest />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>,
)

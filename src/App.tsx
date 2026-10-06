import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";

function App() {


  return (
      <BrowserRouter>
        <Routes>
          {/* 최초진입 */}
          <Route path="/" element={<Navigate to="/app/dashboard" />} />

          {/* 로그인 후 공통 레이아웃 */}
          <Route path="/app" element={<AppLayout />}>
            {/* app으로 들어왔을 때 */}
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            {/* 아직 페이지 만들어지지 않은 메뉴 */}
            <Route
              path="*"
              element={
                <section>
                  <h2>준비중</h2>
                </section>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App

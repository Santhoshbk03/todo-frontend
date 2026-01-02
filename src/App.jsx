import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/loginpage";

import Dashboard from "./pages/dashboard";
import MainLayout from "./components/MainLayout";
import Group from "./pages/group";
import Tasks from "./pages/Tasks";
import TasksAndGroups from "./pages/taskandgroup";
import ProtectedRoute from "./components/protectrouter";
import SignUpPage from "./pages/signuppage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/login" element={<LoginPage />} />
                <Route index path="/signup" element={<SignUpPage />} />


        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Group />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TasksAndGroups />
              </MainLayout>
            </ProtectedRoute>
          }
        />
       



        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';

import LandingPage    from './pages/LandingPage';
import AssessmentFlow from './assessment/AssessmentFlow';
import TrainingPage   from './pages/TrainingPage';
import TrainingSession from './training/TrainingSession';
import AboutPage      from './pages/AboutPage';

import { Dumbbell, Home, User } from 'lucide-react';

function isTaskRoute(pathname: string) {
  return ['/assessment', '/training/flanker', '/training/gonogo', '/training/nback', '/training/pvt']
    .some((p) => pathname.startsWith(p) && pathname !== '/training');
}

function NavBar() {
  const location = useLocation();
  // Hide nav during active tasks
  if (isTaskRoute(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 sm:top-0 sm:bottom-auto sm:border-t-0 sm:border-b">
      <div className="max-w-2xl mx-auto flex items-center justify-around sm:justify-start sm:gap-1 sm:px-4 h-14">
        <NavItem to="/"         icon={<Home size={18} />}    label="Home"     />
        <NavItem to="/training" icon={<Dumbbell size={18} />} label="Training" />
        <NavItem to="/about"    icon={<User size={18} />}     label="About"    />
      </div>
    </nav>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
          isActive
            ? 'text-brand-600 sm:bg-brand-50'
            : 'text-gray-500 hover:text-gray-900'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

function AppLayout() {
  const location = useLocation();
  const hasNav = !isTaskRoute(location.pathname);

  return (
    <>
      <NavBar />
      <div className={hasNav ? 'pb-14 sm:pb-0 sm:pt-14' : ''}>
        <Routes>
          <Route path="/"                  element={<LandingPage />} />
          <Route path="/assessment"         element={<AssessmentFlow />} />
          <Route path="/training"           element={<TrainingPage />} />
          <Route path="/training/:taskType"  element={<TrainingSession />} />
          <Route path="/about"              element={<AboutPage />} />
          <Route path="*"                   element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Overview } from './pages/Overview';
import { Tracks } from './pages/Tracks';
import { Artists } from './pages/Artists';
import { Listening } from './pages/Listening';
import { Yearly } from './pages/Yearly';
import { Lifetime } from './pages/Lifetime';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="tracks" element={<Tracks />} />
            <Route path="artists" element={<Artists />} />
            <Route path="listening" element={<Listening />} />
            <Route path="yearly" element={<Yearly />} />
            <Route path="lifetime" element={<Lifetime />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;

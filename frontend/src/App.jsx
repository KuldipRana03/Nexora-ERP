import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="p-4 bg-blue-100 text-blue-900 font-bold">Welcome to Mini ERP + CRM</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

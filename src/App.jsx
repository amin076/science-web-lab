import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Experiments from "@/pages/Experiments";
import ExperimentDetail from "@/pages/ExperimentDetail"; // 👈 جدید
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Layout from "@/components/layout/Layout";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/experiments" element={<Experiments />} />
          {/* مسیر جدید برای جزئیات آزمایش */}
          <Route path="/experiments/:id" element={<ExperimentDetail />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

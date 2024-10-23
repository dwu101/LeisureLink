import { BrowserRouter as Router, Routes } from 'react-router-dom';
import routes from './Routes';  // Import routes
import './App.css';

function App() {
  return (
    <div >
      <Router>
          <Routes>
              {routes}  
          </Routes>
    </Router>
    </div>
  );
}

export default App;

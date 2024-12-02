import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import routes from './Routes';  
import './App.css';
import Layout from './components/Layout';

function App() {
  return (
    <div >
      <Router>
          <Routes>
              <Route element = {<Layout/>}>
                {routes}  
              </Route>
          </Routes>
    </Router>
    </div>
  );
}

export default App;

import ProductList from './components/ProductList';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <div className="container">
      {/* <h1 className="text-center mt-5">Welcome to React with Bootstrap</h1>
      <button className="btn btn-primary">Click Me</button> */}
      <ProductList />
    </div>
  );
}

export default App;

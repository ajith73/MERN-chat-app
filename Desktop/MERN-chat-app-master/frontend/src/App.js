import "./App.css";
import Homepage from "./Pages/Homepage";
import {Routes, Route } from "react-router-dom";
import Chatpage from "./Pages/Chatpage";

function App() {
  return (
    <div className="App">
      
    <Routes>
    
      <Route exact path="/" element={<Homepage/>}  />
      <Route path="/chats" elementt={<Chatpage/>} />
    
    </Routes>
   
    </div>
  );
}

export default App;
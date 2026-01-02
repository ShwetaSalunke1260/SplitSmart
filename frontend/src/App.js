import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateGroup from "./pages/CreateGroup";
import GroupList from "./pages/GroupList";
import AddExpense from "./pages/AddExpense";
import SettleUp from "./pages/SettleUp";
import "./styles/main.css";
import GroupDetails from "./pages/GroupDetails";
import Reports from "./pages/Reports";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups" element={<GroupList />} />
        <Route path="/groups/create" element={<CreateGroup />} />
        <Route path="/expenses/add" element={<AddExpense/>}/>
        <Route path="/settle" element={<SettleUp/>}/>
        <Route path="/groups/:groupid" element={<GroupDetails />} />
        <Route path="/reports" element={<Reports />} />


      </Routes>
      {/* <GroupDetails></GroupDetails> */}
      {/* <Reports></Reports> */}
    </BrowserRouter>
  );
}

export default App;

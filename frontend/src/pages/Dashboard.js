import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import Header from "../components/Header";
import BalanceCard from "../components/BalanceCard";
import GroupCard from "../components/GroupCard";
import ExpenseList from "../components/ExpenseList";

const Dashboard = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);

  // 🔐 Protect dashboard
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  // 📡 Fetch groups from backend
  useEffect(() => {
    api.get("groups/")
      .then((res) => {
        console.log("Groups API working:", res.data);
        setGroups(res.data);   // ✅ IMPORTANT
      })
      .catch((err) => {
        console.error("API error:", err);
      });
  }, []);
const[currentUserId, setCurrentUserId] = useState(null);
useEffect(()=>{
  api.get("auth/me/")
  .then((res)=>{
    setCurrentUserId(res.data.id);
  })
  .catch((err)=> console.error(err));
},[]);

const [youGet, setYouGet] = useState(0);
const [youOwe, setYouOwe] = useState(0);

  useEffect(() => {
  if (!currentUserId) return;

  let totalGet = 0;
  let totalOwe = 0;

  const fetchBalances = async () => {
    for (let group of groups) {
      const res = await api.get(`groups/${group.id}/balances/`);

      const me = res.data.find(
        (u) => u.user_id === currentUserId
      );

      if (me) {
        if (me.net_balance > 0) {
          totalGet += me.net_balance;
        } else if (me.net_balance < 0) {
          totalOwe += Math.abs(me.net_balance);
        }
      }
    }

    setYouGet(totalGet);
    setYouOwe(totalOwe);
  };

  fetchBalances();
}, [groups, currentUserId]);

const [groupBalances, setGroupBalances] = useState({});
useEffect(() => {
  if (!currentUserId || groups.length === 0) return;

  const fetchGroupBalances = async () => {
    const balancesMap = {};

    for (let group of groups) {
      const res = await api.get(`groups/${group.id}/balances/`);

      const me = res.data.find(
        (u) => u.user_id === currentUserId
      );

      balancesMap[group.id] = me ? me.net_balance : 0;
    }

    setGroupBalances(balancesMap);
  };

  fetchGroupBalances();
}, [groups, currentUserId]);




  return (
    <div className="dashboard">
      <Header />

      <BalanceCard youGet={youGet} youOwe={youOwe} />

      <h3 className="section-title">Recent Groups</h3>

      <div className="group-row">
        {groups.length === 0 ? (
          <p>No groups found</p>
        ) : (
          groups.map((group) => (
            <GroupCard
              key={group.id}
              id={group.id} 
              name={group.name}
              amount={groupBalances[group.id] || 0}   // balance comes in STEP 4
            />
            
          ))
        )}
        
      </div>
<br></br>
<div className="create-group-wrapper">
<button
  className="create-group-btn" 
  onClick={() => navigate("/groups/create")}
>
  + Create Group
</button>
</div>
       <h3 className="section-title">Recent Expenses</h3>
       <div className="create-group-wrapper">
       <button className="create-group-btn" onClick={() => navigate("/reports")}>Reports</button>
       </div>


      <ExpenseList />
    </div>
  );
};

export default Dashboard;

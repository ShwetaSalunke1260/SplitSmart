import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AddExpense = () => {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [members, setMembers] = useState([]);
  const [paidBy, setPaidBy] = useState("");
  const [splits, setSplits] = useState([]);

  // 🔐 Protect page
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) navigate("/");
  }, [navigate]);

  // 📡 Fetch groups
  useEffect(() => {
    api.get("groups/")
      .then((res) => setGroups(res.data))
      .catch((err) => console.error(err));
  }, []);

  // 👥 Fetch group members
  useEffect(() => {
    if (groupId) {
      api.get(`groups/${groupId}/`)
        .then((res) => {
          setMembers(res.data.members);
          const equalSplit = res.data.members.map((m) => ({
            user_id: m.id,
            amount: 0,
          }));
          setSplits(equalSplit);
        })
        .catch((err) => console.error(err));
    }
  }, [groupId]);

  // ➗ Handle split change
  const handleSplitChange = (index, value) => {
    const updated = [...splits];
    updated[index].amount = Number(value);
    setSplits(updated);
  };

  // 💾 Submit expense
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("expenses/", {
        group: groupId,
        description,
        amount: Number(amount),
        paid_by_id: paidBy,
        splits,
      });

      alert("Expense added successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to add expense");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card settle-card">
      <h2 className="app-title">Add Expense</h2>

      <form onSubmit={handleSubmit}>
        <select value={groupId} onChange={(e) => setGroupId(e.target.value)} required>
          <option value="">Select Group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <br></br>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Total Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} required>
          <option value="">Paid By</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.username}</option>
          ))}
        </select>

        <h4>Split Amount</h4>
        {splits.map((s, index) => (
          <div key={index}>
            {members[index]?.username} :
            <input
              type="number"
              value={s.amount}
              onChange={(e) => handleSplitChange(index, e.target.value)}
              required
            />
          </div>
        ))}

        <button type="submit">Add Expense</button>
      </form>
    </div>
    </div>
  );
};

export default AddExpense;

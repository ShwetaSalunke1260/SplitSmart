import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const SettleUp = () => {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);

  const [groupId, setGroupId] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [paidTo, setPaidTo] = useState("");
  const [amount, setAmount] = useState("");

  // Fetch groups
  useEffect(() => {
    api.get("groups/")
      .then(res => setGroups(res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch members when group changes
  useEffect(() => {
    if (!groupId) return;

    api.get(`groups/${groupId}/`)
      .then(res => setMembers(res.data.members))
      .catch(err => console.error(err));
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("settlements/", {
        group: groupId,
        paid_by_id: paidBy,
        paid_to_id: paidTo,
        amount,
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Settlement error", err);
      alert("Failed to settle amount");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card settle-card">
      <h2 className="app-title">SETTLE UP</h2>

      <form className="card" onSubmit={handleSubmit}>
        {/* Group */}
        <label>Group</label>
        <select
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          required
        >
          <option value="">Select Group</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        {/* Paid By */}
        <label>Paid By</label>
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          required
        >
          <option value="">Who paid?</option>
          {members.map(member => (
            <option key={member.id} value={member.id}>
              {member.username}
            </option>
          ))}
        </select>

        {/* Paid To */}
        <label>Paid To</label>
        <select
          value={paidTo}
          onChange={(e) => setPaidTo(e.target.value)}
          required
        >
          <option value="">Paid to?</option>
          {members.map(member => (
            <option key={member.id} value={member.id}>
              {member.username}
            </option>
          ))}
        </select>

        {/* Amount */}
        <label>Amount</label>
        <input
          type="number"
          placeholder="100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <button className="settle-btn" type="submit">Settle</button>
      </form>
    </div>
    </div>
  );
};

export default SettleUp;

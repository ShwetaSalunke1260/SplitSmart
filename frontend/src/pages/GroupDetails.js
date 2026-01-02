import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/main.css";

const GroupDetails = () => {
  const { groupid } = useParams();
  const navigate = useNavigate();

  /* ===================== STATE ===================== */
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ===================== EFFECTS ===================== */

  // 🔐 Get current user
  useEffect(() => {
    api.get("auth/me/")
      .then((res) => setCurrentUserId(res.data.id))
      .catch(() => navigate("/"));
  }, [navigate]);

  // 📡 Fetch group & expenses
  useEffect(() => {
    if (!groupid) return;

    const fetchData = async () => {
      try {
        const groupRes = await api.get(`groups/${groupid}/`);
        setGroup(groupRes.data);
        setMembers(groupRes.data.members || []);

        const expenseRes = await api.get(`expenses/?group=${groupid}`);
        setExpenses(expenseRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupid]);

  // 👥 Fetch users
  useEffect(() => {
    api.get("users/")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, []);

  /* ===================== HANDLERS ===================== */

  const isAdmin = group && currentUserId === group.created_by.id;

  const handleAddMember = async () => {
    if (!selectedUser) return alert("Select a user");

    try {
      await api.post(`groups/${groupid}/add_member/`, {
        user_id: selectedUser,
      });

      const newUser = users.find(
        (u) => u.id === Number(selectedUser)
      );
      setMembers([...members, newUser]);
      setSelectedUser("");
      setShowAddMember(false);
    } catch {
      alert("Only admin can add members");
    }
  };

  const removeMember = async (userId) => {
    if (!window.confirm("Remove this member?")) return;

    try {
      await api.post(`groups/${groupid}/remove_member/`, {
        user_id: userId,
      });
      setMembers(members.filter((m) => m.id !== userId));
    } catch {
      alert("Only admin can remove members");
    }
  };

  /* ===================== UI ===================== */

  if (loading) return <p>Loading...</p>;
  if (!group) return <p>Group not found</p>;

  return (
  <div className="min-h-screen bg-gray-100 flex justify-center p-6">
    <div className="w-full max-w-4xl space-y-6">

      {/* ===== GROUP HEADER ===== */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold">🏠 {group.name}</h1>
        <p className="text-gray-500 text-sm">
          {members.length} members • Shared expenses
        </p>
      </div>

      {/* ===== MEMBERS ===== */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Members</h2>

        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between py-3 border-b last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <div className="avatar">
                {m.username[0].toUpperCase()}
              </div>

              <span className="font-medium">
                {m.username}
                {m.id === group.created_by.id && (
                  <span className="admin-badge"> (Admin)</span>
                )}
              </span>
            </div>

            {isAdmin && m.id !== currentUserId && (
              <button
                className="remove-btn"
                onClick={() => removeMember(m.id)}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {isAdmin && (
          <>
            <button
              className="add-member-btn"
              onClick={() => setShowAddMember(!showAddMember)}
            >
              + Add Member
            </button>

            {showAddMember && (
              <div className="add-member-box">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Select User</option>
                  {users
                    .filter(
                      (u) => !members.some((m) => m.id === u.id)
                    )
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username}
                      </option>
                    ))}
                </select>

                <button onClick={handleAddMember}>Add</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== EXPENSES ===== */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Expenses</h2>

        {expenses.length === 0 ? (
          <p className="text-gray-500">No expenses yet</p>
        ) : (
          expenses.map((e) => (
            <div key={e.id} className="expense-row">
              <div>
                <p className="font-medium">{e.description}</p>
                <p className="expense-sub">
                  Paid by {e.paid_by.username}
                </p>
              </div>

              <span className="expense-amount">
                ₹{e.amount}
              </span>
            </div>
          ))
        )}

        {!isAdmin && (
          <p className="note mt-3">
            Only admin can manage members
          </p>
        )}

        <div className="actions">
          <button className="create-group-btn" onClick={() => navigate(`/expenses/add?group=${groupid}`)}>
            + Add Expense
          </button>
          <br></br>
          <button className="create-group-btn" onClick={() => navigate(`/settle?group=${groupid}`)}>
            Settle Up
          </button>
        </div>
      </div>

    </div>
  </div>
);

};

export default GroupDetails;

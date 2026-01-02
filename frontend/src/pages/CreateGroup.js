import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateGroup = () => {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const navigate = useNavigate();

  // Load users
  useEffect(() => {
    api.get("users/")
      .then((res) => {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        // remove logged-in user from selectable list
        setUsers(res.data.filter(u => u.id !== currentUser?.id));
      })
      .catch((err) => console.error(err));
  }, []);
  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await api.post("groups/", {
        name,
        member_ids: selectedMembers,
      });

      navigate("/dashboard");
    } catch (err) {
      alert("Error creating group");
    }
  };

  return (
    <div className="auth-wrapper" >
      <div className="auth-card">
      <h2 className="app-title">CREATE GROUP</h2>
      <br></br>

      <form onSubmit={handleCreate} className="form-card">
        <input
          type="text"
          placeholder="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="members-box">
        <h4 className="members-title">Select Members</h4>
        <div className="members-list">

        {users.map((user) => (
          <label key={user.id} className="checkbox-row">
            <input
              type="checkbox"
              checked={selectedMembers.includes(user.id)}
              onChange={() => toggleMember(user.id)}
            />
           <span className="member-name">{user.username}</span> 
          </label>
        ))}
        </div>
        </div>
        <button type="submit">Create Group</button>
      </form>
    </div>
    </div>
    
  );
};

export default CreateGroup;

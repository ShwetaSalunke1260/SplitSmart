import { useEffect, useState } from "react";
import API from "../api/axios";
import GroupCard from "../components/GroupCard"; // adjust path if needed

function GroupList() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    API.get("groups/")
      .then((res) => setGroups(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="page-container">
      <h2>My Groups</h2>

      {groups.length === 0 ? (
        <p>No groups yet</p>
      ) : (
        <div className="group-row">
          {groups.map((g) => (
            <GroupCard
              key={g.id}
              id={g.id}            // ✅ VERY IMPORTANT
              name={g.name}
              amount={g.net_balance || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default GroupList;

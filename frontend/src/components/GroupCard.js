import { useNavigate } from "react-router-dom";

const GroupCard = ({ id, name, amount }) => {
  const navigate = useNavigate();

  return (
    <div
      className="group-card"
      onClick={() => navigate(`/groups/${id}`)}   // ✅ FIX HERE
    >
      <h4>{name}</h4>
      <p className={amount >= 0 ? "positive" : "negative"}>
        {amount >= 0 ? `+₹${amount}` : `-₹${Math.abs(amount)}`}
      </p>
    </div>
  );
};

export default GroupCard;

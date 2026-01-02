const BalanceCard = ({ youGet, youOwe }) => {
  return (
    <div className="balance-container">
      <div className="balance-card get">
        <p>You Get</p>
        <h2>₹{youGet}</h2>
      </div>

      <div className="balance-card owe">
        <p>You Owe</p>
        <h2>₹{youOwe}</h2>
      </div>
    </div>
  );
};

export default BalanceCard;

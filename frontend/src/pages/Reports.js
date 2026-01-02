import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/main.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// import RobotoFont from "../utils/RobotoFont";

const Reports = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  const [report, setReport] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);

  /* ================= LOAD GROUPS ================= */
  useEffect(() => {
    api.get("groups/")
      .then((res) => setGroups(res.data))
      .catch(console.error);
  }, []);

  /* ================= LOAD REPORT (GROUP WISE) ================= */
  useEffect(() => {
    let url = "groups/report/";
    if (selectedGroup) {
      url += `?group=${selectedGroup}`;
    }

    api.get(url)
      .then((res) => setReport(res.data))
      .catch(console.error);
  }, [selectedGroup]);

  /* ================= LOAD EXPENSES + SETTLEMENTS ================= */
  useEffect(() => {
    let expenseUrl = "expenses/";
    let settlementUrl = "settlements/";

    if (selectedGroup) {
      expenseUrl += `?group=${selectedGroup}`;
      settlementUrl += `?group=${selectedGroup}`;
    }

    api.get(expenseUrl).then((res) => setExpenses(res.data));
    api.get(settlementUrl).then((res) => setSettlements(res.data));
  }, [selectedGroup]);

  /* ================= DOWNLOAD PDF ================= */
  const downloadPDF = () => {

    const groupName =
  selectedGroup
    ? groups.find(g => g.id == selectedGroup)?.name
    : "All_Groups";

    const doc = new jsPDF();

    // doc.addFileToVFS("Roboto-Regular.ttf", RobotoFont);
    // doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    // doc.setFont("Roboto");


    doc.setFontSize(18);
    doc.text("SplitSmart - Reports & History", 14, 20);

    doc.setFontSize(12);
    doc.text(`Total Paid: INR ${report?.total_paid || 0}`, 14, 35);
    doc.text(`Total Received: INR ${report?.total_received || 0}`, 14, 45);
    doc.text(`Total Given: INR ${report?.total_given || 0}`, 14, 55);
    doc.text(`Net Balance: INR ${report?.net_balance || 0}`, 14, 65);

    /* ===== Expenses Table ===== */
    autoTable(doc, {
      startY: 90,
      head: [["Description", "Amount"]],
      body: expenses.map((e) => [
        e.description,
        `INR ${e.amount}`,
      ]),
    });

    /* ===== Settlements Table ===== */
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["From", "To", "Amount"]],
      body: settlements.map((s) => [
        s.paid_by.username,
        s.paid_to.username,
        `INR ${s.amount}`,
      ]),
    });

    doc.save(`SplitSmart_${groupName}_Report.pdf`);

  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card settle-card">

        {/* ===== TITLE ===== */}
        <h2 className="report-title">Reports & History</h2>

        {/* ===== GROUP FILTER ===== */}
        <div className="filter-box">
          <label>Filter by Group</label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">All Groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* ===== SUMMARY ===== */}
        {report && (
          <div className="summary-card">
            <div className="summary-row">
              <span>Total Paid</span>
              <span>INR {report.total_paid}</span>
            </div>

            <div className="summary-row">
              <span>Total Received</span>
              <span>INR {report.total_received}</span>
            </div>

            <div className="summary-row">
              <span>Total Given</span>
              <span>INR {report.total_given}</span>
            </div>

            <div className="summary-row net">
              <span>Net Balance</span>
              <span>INR {report.net_balance}</span>
            </div>
          </div>
        )}

        {/* ===== EXPENSE HISTORY ===== */}
        <div className="history-card">
          <h3>Expense History</h3>

          {expenses.length === 0 ? (
            <p className="muted">No expenses found</p>
          ) : (
            expenses.map((exp) => (
              <div key={exp.id} className="history-row">
                <span>{exp.description}</span>
                <span>INR {exp.amount}</span>
              </div>
            ))
          )}
        </div>

        {/* ===== SETTLEMENT HISTORY ===== */}
        <div className="history-card">
          <h3>Settlement History</h3>

          {settlements.length === 0 ? (
            <p className="muted">No settlements yet</p>
          ) : (
            settlements.map((s) => (
              <div key={s.id} className="history-row">
                <span>
                  {s.paid_by.username} → {s.paid_to.username}
                </span>
                <span>INR {s.amount}</span>
              </div>
            ))
          )}
        </div>

        <br />

        <button className="download-btn" onClick={downloadPDF}>
          Download PDF
        </button>

      </div>
    </div>
  );
};

export default Reports;

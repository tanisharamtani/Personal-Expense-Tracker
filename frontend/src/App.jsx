import { useEffect, useState } from "react";

const expenses = [
  { id: 1, title: "Bar", account: "Wallet", amount: -2, date: "04/07/2026", color: "#ff8f2a" },
  { id: 2, title: "Entertainment", account: "Wallet", amount: -8, date: "03/07/2026", color: "#20b8cf" },
  { id: 3, title: "Eating out", account: "Credit card", amount: -16, date: "03/07/2026", color: "#c92912" },
  { id: 4, title: "Shopping, Food - Pets", account: "Credit card", amount: -50, date: "02/07/2026", color: "#183f4a" },
  { id: 5, title: "Fuel", account: "Wallet", amount: -30, date: "01/07/2026", color: "#f2c10f" }
];
const budgets = [
  { name: "Entertainment", start: "29/06/2026", end: "05/07/2026", percent: 27, spent: 8, total: 30, color: "#20b8cf" },
  { name: "Eating out", start: "01/07/2026", end: "31/07/2026", percent: 16, spent: 16, total: 100, color: "#c92912" },
  { name: "Fuel", start: "01/07/2026", end: "31/07/2026", percent: 25, spent: 30, total: 120, color: "#f2c10f" }
];
const accounts = [
  ["Wallet", "$90.24", "USD - $"],
  ["Bank account", "$13,537.47", "USD - $"]
];
const nav = [
  ["/dashboard", "Overview", "grid"], ["/transactions", "Transactions", "list"], ["/scheduled", "Scheduled transactions", "clock"],
  ["/accounts", "Accounts", "bank"], ["/cards", "Credit cards", "card"], ["/budget", "Budgets", "pie"], ["/debts", "Debts", "timer"],
  ["/analytics", "Charts", "chart"], ["/calendar", "Calendar", "calendar"], ["/import", "Import/Export", "download"],
  ["/preferences", "Preferences", "tag"], ["/profile", "Settings", "gear"], ["/guide", "Help", "help"]
];

function route() {
  const pathName = window.location.pathname;
  return pathName === "/" || pathName === "/login" ? "/dashboard" : pathName;
}
function amount(value) { return `${value < 0 ? "-" : ""}$${Math.abs(value).toFixed(2)}`; }
function goTo(path, setPath) { window.history.pushState(null, "", path); setPath(path); }

function Icon({ name }) {
  const paths = {
    grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    clock: "M21 12a9 9 0 1 1-3-6.7M12 7v5l3 2",
    bank: "M3 10h18L12 4zM5 10v8M9 10v8M15 10v8M19 10v8M4 18h16",
    card: "M3 6h18v12H3zM3 10h18",
    pie: "M12 3v9h9A9 9 0 1 1 12 3z",
    timer: "M12 7v5l3 2M9 2h6M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z",
    chart: "M4 19V5M4 19h16M8 16l3-5 3 2 4-7",
    calendar: "M4 5h16v15H4zM8 3v4M16 3v4M4 9h16",
    download: "M12 3v12M8 11l4 4 4-4M4 20h16",
    tag: "M4 4h7l9 9-7 7-9-9zM8 8h.01",
    gear: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 12h2M18 12h2M12 4v2M12 18v2M6.4 6.4l1.4 1.4M16.2 16.2l1.4 1.4M17.6 6.4l-1.4 1.4M7.8 16.2l-1.4 1.4",
    help: "M9.1 9a3 3 0 1 1 5.8 1c-.5 1.4-2.9 1.8-2.9 4M12 18h.01",
    menu: "M4 6h16M4 12h16M4 18h16"
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name] || paths.grid}/></svg>;
}

function Sidebar({ active, go }) {
  return <aside className="fb-sidebar">
    <button className="fb-brand" onClick={() => go("/dashboard")}><span className="brand-coin">P</span><b>PocketPilot</b></button>
    <nav className="fb-nav">
      {nav.map(([path, label, icon], index) => <button key={label} className={`${active === path || (active === "/dashboard" && label === "Overview") ? "active" : ""} ${index === 9 || index === 11 ? "nav-divider" : ""}`} onClick={() => go(path)}><Icon name={icon}/><span>{label}</span></button>)}
    </nav>
    <label className="dark-toggle"><input type="checkbox"/><span/>Dark mode</label>
  </aside>;
}
function TopBar({ title = "Overview" }) { return <header className="fb-topbar"><button><Icon name="menu"/></button><h1>{title}</h1><button className="dots">...</button></header>; }
function Card({ children, className = "" }) { return <section className={`fb-card ${className}`}>{children}</section>; }
function CardMenu() { return <button className="card-menu">...</button>; }
function MiniDonut({ green = 0, red = 100 }) { return <div className="mini-donut" style={{ "--green": `${green}%`, "--red": `${red}%` }}><span>{red}%</span></div>; }
function BalanceChart() { return <div className="balance-chart"><svg viewBox="0 0 500 210" preserveAspectRatio="none"><polygon points="0,166 65,166 130,166 195,166 250,178 300,68 360,72 420,72 460,88 500,20 500,210 0,210"/><polyline points="0,166 65,166 130,166 195,166 250,178 300,68 360,72 420,72 460,88 500,20"/></svg><div><span>May 2</span><span>May 16</span><span>May 30</span><span>Jun 13</span><span>Jun 27</span><span>Jul 4</span></div></div>; }
function WeekChart() { return <div className="week-chart">{[0, 120, 50, 13, 74, 30, 50, 24, 2].map((height, i) => <span key={i} className={i === 2 ? "green" : "red"} style={{ height: `${Math.max(height, 3)}px` }}/>) }<div><small>28 Sun</small><small>29 Mon</small><small>30 Tue</small><small>1 Wed</small><small>2 Thu</small><small>3 Fri</small><small>4 Sat</small></div></div>; }

function Dashboard() {
  return <div className="fb-dashboard page-enter">
    <div className="summary-row">
      <Card><h2>Summary</h2><div className="summary-line"><span>Balance:</span><b className="positive">$13,627.71</b></div><div className="summary-line"><span>Credit cards:</span><b className="negative">-$249.00</b></div><div className="summary-total">$13,378.71</div></Card>
      <Card className="month-card"><h2>This month</h2><MiniDonut red={100}/><div className="month-values"><p><b className="positive">$0.00</b></p><p><b className="negative">-$106.00</b></p><p><b className="negative">-$106.00</b></p></div></Card>
      <Card className="month-card"><h2>Last month</h2><MiniDonut green={72} red={28}/><div className="month-values"><p><b className="positive">$1,452.00</b></p><p><b className="negative">-$571.29</b></p><p><b className="positive">$880.71</b></p></div></Card>
    </div>
    <div className="main-grid">
      <div className="left-stack">
        <Card><CardMenu/><h2>Accounts</h2>{accounts.map(([name, value, sub]) => <div className="account-line" key={name}><span>{name}</span><b>{value}<small>{sub}</small></b></div>)}</Card>
        <Card><CardMenu/><h2>Credit cards</h2><div className="credit-line"><span>Credit card</span><b className="negative">-$66.00</b></div><div className="credit-progress"><i/></div><small className="right-small">7%</small></Card>
        <Card><CardMenu/><h2>Last 7 days</h2><WeekChart/></Card>
        <Card><CardMenu/><h2>Transactions</h2><div className="transaction-list">{expenses.map((item) => <article className="tx" key={item.id}><span style={{ background: item.color }}>{item.title[0]}</span><div><b>{item.title}</b><small>{item.account}</small></div><strong className="negative">{amount(item.amount)}<small>{item.date}</small></strong></article>)}</div></Card>
      </div>
      <div className="right-stack">
        <Card><h2>Balance</h2><BalanceChart/></Card>
        <Card><CardMenu/><h2>Budgets</h2><div className="budget-list">{budgets.map((budget) => <article className="budget-row" key={budget.name}><span className="budget-icon" style={{ background: budget.color }}>{budget.name[0]}</span><div><h3>{budget.name}</h3><p><small>{budget.start}</small><b>{budget.percent}%</b><small>{budget.end}</small></p><div className="budget-track"><i style={{ width: `${budget.percent}%` }}/></div><p><small>$0.00</small><small>${budget.spent.toFixed(2)}</small><small>${budget.total.toFixed(2)}</small></p></div></article>)}</div></Card>
        <Card><h2>Cash flow (Transactions)</h2><table className="cash-table"><thead><tr><th>July 2026</th><th>Income</th><th>Expenses</th></tr></thead><tbody><tr><td>Total</td><td>$0.00</td><td className="negative">-$106.00</td></tr><tr><td>Transactions</td><td>0</td><td>5</td></tr><tr><td>Average (Day)</td><td>$0.00</td><td className="negative">-$3.42</td></tr><tr><td>Average (Transactions)</td><td>$0.00</td><td className="negative">-$21.20</td></tr></tbody></table><p className="cash-total">Total: <b className="negative">-$106.00</b></p></Card>
      </div>
    </div>
    <div className="float-actions"><button>+</button><button>-</button></div>
  </div>;
}

function Placeholder({ title }) { return <div className="fb-dashboard page-enter"><Card><h2>{title}</h2><p>This PET screen is ready for API integration. Use the sidebar to return to Overview.</p></Card></div>; }
function AuthScreen({ onEnter }) { return <main className="auth page-enter"><Card className="auth-card"><button className="fb-brand auth-brand"><span className="brand-coin">P</span><b>PocketPilot</b></button><h1>Welcome back</h1><p>Login to open your PET budgeting dashboard.</p><form className="form"><label>Email<input type="email" placeholder="you@example.com"/></label><label>Password<input type="password" placeholder="Enter password"/></label><button type="button" className="exit login-btn" onClick={onEnter}>LOGIN</button><button type="button" className="link">Forgot Password?</button></form></Card><section className="auth-visual"><div className="app-preview"><TopBar/><Dashboard/></div></section></main>; }

export default function App() {
  const [path, setPath] = useState(route());
  const [logged, setLogged] = useState(false);
  useEffect(() => { const h = () => setPath(route()); window.addEventListener("popstate", h); return () => window.removeEventListener("popstate", h); }, []);
  const go = (nextPath) => goTo(nextPath, setPath);
  if (!logged) return <AuthScreen onEnter={() => { setLogged(true); go("/dashboard"); }} />;
  const titles = { "/dashboard": "Overview", "/transactions": "Transactions", "/scheduled": "Scheduled transactions", "/accounts": "Accounts", "/cards": "Credit cards", "/budget": "Budgets", "/debts": "Debts", "/analytics": "Charts", "/calendar": "Calendar", "/import": "Import/Export", "/preferences": "Preferences", "/profile": "Settings", "/guide": "Help", "/add-expense": "New Transaction" };
  const isDashboard = path === "/dashboard" || path === "/";
  return <div className="fb-shell"><Sidebar active={path} go={go}/><main><TopBar title={titles[path] || "Overview"}/>{isDashboard ? <Dashboard/> : <Placeholder title={titles[path] || "Overview"}/>}</main></div>;
}
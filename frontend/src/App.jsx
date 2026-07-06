import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EXPENSE_CATEGORIES } from "./constants/categories";

const today = new Date().toISOString().slice(0, 10);
const initialProfile = {
  fullName: "PET User",
  email: "student@example.com",
  monthlyIncome: 45000,
  monthlyBudget: 22000,
  currency: "INR",
};
const initialExpenses = [
  { id: 1, title: "Lunch", amount: 220, category: "Food", date: "2026-07-01", notes: "College canteen" },
  { id: 2, title: "Bus pass", amount: 850, category: "Transport", date: "2026-07-02", notes: "Monthly pass" },
  { id: 3, title: "Medicines", amount: 420, category: "Health", date: "2026-07-03", notes: "" },
  { id: 4, title: "Movie", amount: 500, category: "Entertainment", date: "2026-07-04", notes: "Weekend" },
  { id: 5, title: "Books", amount: 1200, category: "Education", date: "2026-07-05", notes: "Semester material" },
];
const initialBudgets = EXPENSE_CATEGORIES.map((category, index) => ({
  category,
  limit: [6000, 2500, 3500, 2000, 1800, 5000, 2500, 1500][index],
}));
const initialGoals = [
  { id: 1, title: "Emergency fund", targetAmount: 30000, savedAmount: 12000, targetDate: "2026-12-31" },
  { id: 2, title: "New laptop", targetAmount: 65000, savedAmount: 18000, targetDate: "2027-03-30" },
];
const initialScheduled = [
  { id: 1, title: "Electricity bill", amount: 1800, category: "Bills", nextDate: "2026-07-15", frequency: "Monthly" },
  { id: 2, title: "Internet recharge", amount: 799, category: "Bills", nextDate: "2026-07-20", frequency: "Monthly" },
];
const nav = [
  ["/dashboard", "Overview", "grid"],
  ["/transactions", "Transactions", "list"],
  ["/scheduled", "Scheduled", "clock"],
  ["/add-expense", "Add Expense", "plus"],
  ["/budget", "Budgets", "pie"],
  ["/goals", "Goals", "target"],
  ["/projection", "Projection", "chart"],
  ["/analytics", "Analytics", "chart"],
  ["/calendar", "Calendar", "calendar"],
  ["/accounts", "Accounts", "bank"],
  ["/profile", "Profile", "gear"],
  ["/guide", "Guide", "help"],
];
const chartColors = ["#1769e0", "#188957", "#d59618", "#c9362c", "#7c3aed", "#0891b2", "#db2777", "#475569"];

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function route() {
  const pathName = window.location.pathname;
  return pathName === "/" || pathName === "/login" ? "/dashboard" : pathName;
}

function money(value, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function monthKey(date) {
  return new Date(date).toISOString().slice(0, 7);
}

function currentMonthExpenses(expenses) {
  const current = today.slice(0, 7);
  return expenses.filter((expense) => monthKey(expense.date) === current);
}

function categoryTotals(expenses) {
  return EXPENSE_CATEGORIES.map((category) => ({
    category,
    amount: expenses.filter((expense) => expense.category === category).reduce((sum, item) => sum + Number(item.amount), 0),
  }));
}

function lastSevenDays(expenses) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const amount = expenses
      .filter((expense) => expense.date === key)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);

    return {
      day: date.toLocaleDateString("en-IN", { weekday: "short" }),
      amount,
    };
  });
}

function monthlyTrend(expenses) {
  const grouped = expenses.reduce((result, expense) => {
    const key = monthKey(expense.date);
    result[key] = (result[key] || 0) + Number(expense.amount);
    return result;
  }, {});

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));
}

function savingsProjection(monthlySaving, currency) {
  return Array.from({ length: 6 }, (_, index) => ({
    month: `Month ${index + 1}`,
    savings: monthlySaving * (index + 1),
    label: money(monthlySaving * (index + 1), currency),
  }));
}

function statusFor(spent, limit) {
  if (!limit || spent < limit * 0.75) return "within";
  if (spent <= limit) return "near";
  return "exceeded";
}

function nextId(items) {
  return Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;
}

function goTo(path, setPath) {
  window.history.pushState(null, "", path);
  setPath(path);
}

function Icon({ name }) {
  const paths = {
    grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    clock: "M21 12a9 9 0 1 1-3-6.7M12 7v5l3 2",
    bank: "M3 10h18L12 4zM5 10v8M9 10v8M15 10v8M19 10v8M4 18h16",
    pie: "M12 3v9h9A9 9 0 1 1 12 3z",
    chart: "M4 19V5M4 19h16M8 16l3-5 3 2 4-7",
    calendar: "M4 5h16v15H4zM8 3v4M16 3v4M4 9h16",
    gear: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 12h2M18 12h2M12 4v2M12 18v2M6.4 6.4l1.4 1.4M16.2 16.2l1.4 1.4M17.6 6.4l-1.4 1.4M7.8 16.2l-1.4 1.4",
    help: "M9.1 9a3 3 0 1 1 5.8 1c-.5 1.4-2.9 1.8-2.9 4M12 18h.01",
    plus: "M12 5v14M5 12h14",
    target: "M12 2v4M12 18v4M2 12h4M18 12h4M7 7l2.5 2.5M17 7l-2.5 2.5M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    menu: "M4 6h16M4 12h16M4 18h16",
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name] || paths.grid} /></svg>;
}

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Sidebar({ active, go, profile, logout }) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => go("/dashboard")}>
        <span>P</span>
        <b>PET</b>
      </button>
      <div className="user-chip">
        <strong>{profile.fullName}</strong>
        <small>{profile.email}</small>
      </div>
      <nav>
        {nav.map(([path, label, icon]) => (
          <button key={path} className={active === path ? "active" : ""} onClick={() => go(path)}>
            <Icon name={icon} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <button className="logout" onClick={logout}>Logout</button>
    </aside>
  );
}

function TopBar({ title }) {
  return (
    <header className="topbar">
      <button aria-label="Menu"><Icon name="menu" /></button>
      <h1>{title}</h1>
    </header>
  );
}

function Stat({ label, value, tone = "" }) {
  return (
    <Card className="stat">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </Card>
  );
}

function Progress({ value, status = "within" }) {
  return <div className={`progress ${status}`}><span style={{ width: `${Math.min(value, 100)}%` }} /></div>;
}

function BarChart({ data, labelKey = "category", valueKey = "amount", currency }) {
  const max = Math.max(1, ...data.map((item) => Number(item[valueKey]) || 0));
  return (
    <div className="bar-chart">
      {data.map((item) => (
        <div className="bar-row" key={item[labelKey]}>
          <span>{item[labelKey]}</span>
          <div><i style={{ width: `${((Number(item[valueKey]) || 0) / max) * 100}%` }} /></div>
          <b>{money(item[valueKey], currency)}</b>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <Card className="chart-card">
      <h2>{title}</h2>
      <div className="chart-box">{children}</div>
    </Card>
  );
}

function SpendingPieChart({ data, currency }) {
  const visible = data.filter((item) => item.amount > 0);
  if (!visible.length) return <p className="empty">Add expenses to see this chart.</p>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={visible} dataKey="amount" nameKey="category" innerRadius={58} outerRadius={92} paddingAngle={2}>
          {visible.map((entry, index) => <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />)}
        </Pie>
        <Tooltip formatter={(value) => money(value, currency)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function LastSevenDaysChart({ data, currency }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" />
        <YAxis tickFormatter={(value) => money(value, currency)} width={76} />
        <Tooltip formatter={(value) => money(value, currency)} />
        <Bar dataKey="amount" name="Spent" fill="#1769e0" radius={[6, 6, 0, 0]} />
      </ReBarChart>
    </ResponsiveContainer>
  );
}

function MonthlyTrendChart({ data, currency }) {
  if (!data.length) return <p className="empty">Add expenses to see monthly trends.</p>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => money(value, currency)} width={76} />
        <Tooltip formatter={(value) => money(value, currency)} />
        <Line type="monotone" dataKey="amount" name="Monthly spending" stroke="#188957" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SavingsProjectionChart({ data, currency }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => money(value, currency)} width={76} />
        <Tooltip formatter={(value) => money(value, currency)} />
        <Line type="monotone" dataKey="savings" name="Projected savings" stroke="#1769e0" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function Dashboard({ data, go }) {
  const monthly = currentMonthExpenses(data.expenses);
  const spent = monthly.reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = data.profile.monthlyIncome - spent;
  const budgetUsed = data.profile.monthlyBudget ? Math.round((spent / data.profile.monthlyBudget) * 100) : 0;
  const topCategory = categoryTotals(monthly).sort((a, b) => b.amount - a.amount)[0];
  const projectedSaving = Math.max(data.profile.monthlyIncome - spent, 0);
  const categoryData = categoryTotals(monthly);

  return (
    <div className="page">
      <div className="stats-grid">
        <Stat label="Total balance" value={money(balance, data.profile.currency)} tone={balance >= 0 ? "good" : "bad"} />
        <Stat label="This month spent" value={money(spent, data.profile.currency)} tone="bad" />
        <Stat label="Monthly budget" value={money(data.profile.monthlyBudget, data.profile.currency)} />
        <Stat label="Projected saving" value={money(projectedSaving, data.profile.currency)} tone="good" />
      </div>
      <div className="grid two">
        <Card>
          <div className="section-title">
            <h2>Budget usage</h2>
            <b>{budgetUsed}%</b>
          </div>
          <Progress value={budgetUsed} status={statusFor(spent, data.profile.monthlyBudget)} />
          <p className="muted">Top category: {topCategory?.category || "None"} ({money(topCategory?.amount || 0, data.profile.currency)})</p>
        </Card>
        <Card>
          <div className="section-title">
            <h2>Savings goals</h2>
            <button onClick={() => go("/goals")}>Manage</button>
          </div>
          {data.goals.slice(0, 2).map((goal) => {
            const percent = goal.targetAmount ? Math.round((goal.savedAmount / goal.targetAmount) * 100) : 0;
            return <div className="goal-line" key={goal.id}><span>{goal.title}</span><Progress value={percent} /><b>{percent}%</b></div>;
          })}
        </Card>
      </div>
      <div className="grid two">
        <ChartCard title="Category spending graph">
          <SpendingPieChart data={categoryData} currency={data.profile.currency} />
        </ChartCard>
        <ChartCard title="Last 7 days spending graph">
          <LastSevenDaysChart data={lastSevenDays(data.expenses)} currency={data.profile.currency} />
        </ChartCard>
      </div>
      <div className="grid two">
        <Card>
          <div className="section-title">
            <h2>Recent expenses</h2>
            <button onClick={() => go("/add-expense")}>Add</button>
          </div>
          <TransactionList expenses={data.expenses.slice(0, 6)} currency={data.profile.currency} compact />
        </Card>
      </div>
    </div>
  );
}

function ExpenseForm({ onSave, initial, currency }) {
  const [form, setForm] = useState(initial || { title: "", amount: "", category: "Food", date: today, notes: "" });
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.title || !form.amount) return;
    onSave({ ...form, amount: Number(form.amount) });
    setForm({ title: "", amount: "", category: "Food", date: today, notes: "" });
  };

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>Title<input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Food, rent, books" /></label>
      <label>Amount ({currency})<input type="number" value={form.amount} onChange={(event) => update("amount", event.target.value)} placeholder="500" /></label>
      <label>Category<select value={form.category} onChange={(event) => update("category", event.target.value)}>{EXPENSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
      <label>Date<input type="date" value={form.date} onChange={(event) => update("date", event.target.value)} /></label>
      <label className="full">Notes<textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Optional description" /></label>
      <button className="primary">Save expense</button>
    </form>
  );
}

function TransactionList({ expenses, currency, onEdit, onDelete, compact = false }) {
  if (!expenses.length) return <p className="empty">No transactions yet.</p>;
  return (
    <div className="table-list">
      {expenses.map((expense) => (
        <article className="table-row" key={expense.id}>
          <span className="avatar">{expense.category[0]}</span>
          <div>
            <strong>{expense.title}</strong>
            <small>{expense.category} | {expense.date}</small>
            {!compact && expense.notes ? <small>{expense.notes}</small> : null}
          </div>
          <b className="bad">{money(expense.amount, currency)}</b>
          {!compact && (
            <div className="actions">
              <button onClick={() => onEdit(expense)}>Edit</button>
              <button className="danger" onClick={() => onDelete(expense.id)}>Delete</button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function Transactions({ data, setExpenses }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [editItem, setEditItem] = useState(null);
  const filtered = data.expenses.filter((expense) => {
    const matchesSearch = expense.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || expense.category === category;
    return matchesSearch && matchesCategory;
  });
  const saveEdit = (expense) => {
    setExpenses((items) => items.map((item) => item.id === editItem.id ? { ...expense, id: editItem.id } : item));
    setEditItem(null);
  };

  return (
    <div className="page">
      <Card>
        <div className="toolbar">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions" />
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {EXPENSE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </Card>
      {editItem && <Card><h2>Edit transaction</h2><ExpenseForm initial={editItem} currency={data.profile.currency} onSave={saveEdit} /></Card>}
      <Card>
        <TransactionList
          expenses={filtered}
          currency={data.profile.currency}
          onEdit={setEditItem}
          onDelete={(id) => window.confirm("Delete this expense?") && setExpenses((items) => items.filter((item) => item.id !== id))}
        />
      </Card>
    </div>
  );
}

function AddExpense({ data, setExpenses, go }) {
  return (
    <div className="page narrow">
      <Card>
        <h2>Add new expense</h2>
        <ExpenseForm
          currency={data.profile.currency}
          onSave={(expense) => {
            setExpenses((items) => [{ ...expense, id: nextId(items) }, ...items]);
            go("/transactions");
          }}
        />
      </Card>
    </div>
  );
}

function Budgets({ data, setBudgets, setProfile }) {
  const monthly = currentMonthExpenses(data.expenses);
  const updateBudget = (category, limit) => {
    setBudgets((items) => items.map((item) => item.category === category ? { ...item, limit: Number(limit) } : item));
  };

  return (
    <div className="page">
      <Card>
        <h2>Overall monthly budget</h2>
        <div className="inline-form">
          <input type="number" value={data.profile.monthlyBudget} onChange={(event) => setProfile((profile) => ({ ...profile, monthlyBudget: Number(event.target.value) }))} />
          <span>{money(data.profile.monthlyBudget, data.profile.currency)}</span>
        </div>
      </Card>
      <Card>
        <h2>Category-wise budgets</h2>
        <div className="budget-editor">
          {data.budgets.map((budget) => {
            const spent = monthly.filter((expense) => expense.category === budget.category).reduce((sum, item) => sum + Number(item.amount), 0);
            const percent = budget.limit ? Math.round((spent / budget.limit) * 100) : 0;
            return (
              <article key={budget.category}>
                <div className="section-title">
                  <h3>{budget.category}</h3>
                  <b className={statusFor(spent, budget.limit)}>{money(spent, data.profile.currency)} / {money(budget.limit, data.profile.currency)}</b>
                </div>
                <Progress value={percent} status={statusFor(spent, budget.limit)} />
                <input type="number" value={budget.limit} onChange={(event) => updateBudget(budget.category, event.target.value)} />
              </article>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Goals({ data, setGoals }) {
  const [form, setForm] = useState({ title: "", targetAmount: "", savedAmount: "", targetDate: today });
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const save = (event) => {
    event.preventDefault();
    if (!form.title || !form.targetAmount) return;
    setGoals((items) => [{ ...form, id: nextId(items), targetAmount: Number(form.targetAmount), savedAmount: Number(form.savedAmount) || 0 }, ...items]);
    setForm({ title: "", targetAmount: "", savedAmount: "", targetDate: today });
  };

  return (
    <div className="page">
      <Card>
        <h2>Create savings goal</h2>
        <form className="form-grid" onSubmit={save}>
          <label>Goal name<input value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
          <label>Target amount<input type="number" value={form.targetAmount} onChange={(event) => update("targetAmount", event.target.value)} /></label>
          <label>Saved amount<input type="number" value={form.savedAmount} onChange={(event) => update("savedAmount", event.target.value)} /></label>
          <label>Target date<input type="date" value={form.targetDate} onChange={(event) => update("targetDate", event.target.value)} /></label>
          <button className="primary">Add goal</button>
        </form>
      </Card>
      <div className="grid two">
        {data.goals.map((goal) => {
          const percent = goal.targetAmount ? Math.round((goal.savedAmount / goal.targetAmount) * 100) : 0;
          return (
            <Card key={goal.id}>
              <div className="section-title"><h2>{goal.title}</h2><button className="danger" onClick={() => setGoals((items) => items.filter((item) => item.id !== goal.id))}>Delete</button></div>
              <Progress value={percent} />
              <p>{money(goal.savedAmount, data.profile.currency)} saved of {money(goal.targetAmount, data.profile.currency)}</p>
              <p className="muted">Remaining: {money(Math.max(goal.targetAmount - goal.savedAmount, 0), data.profile.currency)} | Target: {goal.targetDate}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Scheduled({ data, setScheduled }) {
  const [form, setForm] = useState({ title: "", amount: "", category: "Bills", nextDate: today, frequency: "Monthly" });
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const save = (event) => {
    event.preventDefault();
    if (!form.title || !form.amount) return;
    setScheduled((items) => [{ ...form, id: nextId(items), amount: Number(form.amount) }, ...items]);
    setForm({ title: "", amount: "", category: "Bills", nextDate: today, frequency: "Monthly" });
  };

  return (
    <div className="page">
      <Card>
        <h2>Scheduled transactions</h2>
        <form className="form-grid" onSubmit={save}>
          <label>Title<input value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
          <label>Amount<input type="number" value={form.amount} onChange={(event) => update("amount", event.target.value)} /></label>
          <label>Category<select value={form.category} onChange={(event) => update("category", event.target.value)}>{EXPENSE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Next date<input type="date" value={form.nextDate} onChange={(event) => update("nextDate", event.target.value)} /></label>
          <label>Frequency<select value={form.frequency} onChange={(event) => update("frequency", event.target.value)}><option>Weekly</option><option>Monthly</option><option>Yearly</option></select></label>
          <button className="primary">Schedule</button>
        </form>
      </Card>
      <Card>
        <div className="table-list">
          {data.scheduled.map((item) => (
            <article className="table-row" key={item.id}>
              <span className="avatar">{item.category[0]}</span>
              <div><strong>{item.title}</strong><small>{item.frequency} | Next: {item.nextDate}</small></div>
              <b>{money(item.amount, data.profile.currency)}</b>
              <button className="danger" onClick={() => setScheduled((items) => items.filter((entry) => entry.id !== item.id))}>Delete</button>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Analytics({ data }) {
  const monthly = currentMonthExpenses(data.expenses);
  const totals = categoryTotals(monthly);
  const top = totals.sort((a, b) => b.amount - a.amount)[0];
  const total = monthly.reduce((sum, item) => sum + item.amount, 0);
  const average = data.expenses.length ? Math.round(data.expenses.reduce((sum, item) => sum + item.amount, 0) / data.expenses.length) : 0;

  return (
    <div className="page">
      <div className="stats-grid">
        <Stat label="Monthly spending" value={money(total, data.profile.currency)} />
        <Stat label="Average transaction" value={money(average, data.profile.currency)} />
        <Stat label="Top category" value={top?.category || "None"} />
        <Stat label="Transactions" value={monthly.length} />
      </div>
      <div className="grid two">
        <ChartCard title="Category-wise spending distribution">
          <SpendingPieChart data={totals} currency={data.profile.currency} />
        </ChartCard>
        <ChartCard title="Weekly spending analysis">
          <LastSevenDaysChart data={lastSevenDays(data.expenses)} currency={data.profile.currency} />
        </ChartCard>
      </div>
      <ChartCard title="Monthly spending trend">
        <MonthlyTrendChart data={monthlyTrend(data.expenses)} currency={data.profile.currency} />
      </ChartCard>
      <Card>
        <h2>Detailed category values</h2>
        <BarChart data={totals} currency={data.profile.currency} />
      </Card>
    </div>
  );
}

function Projection({ data }) {
  const monthly = currentMonthExpenses(data.expenses);
  const spent = monthly.reduce((sum, item) => sum + item.amount, 0);
  const saving = Math.max(data.profile.monthlyIncome - spent, 0);
  const projectionData = savingsProjection(saving, data.profile.currency);

  return (
    <div className="page">
      <Card>
        <h2>Future savings projection</h2>
        <p>If you save <b>{money(saving, data.profile.currency)}</b> every month, your savings can grow to <b>{money(saving * 12, data.profile.currency)}</b> in 12 months.</p>
      </Card>
      <ChartCard title="Savings growth visualization">
        <SavingsProjectionChart data={projectionData} currency={data.profile.currency} />
      </ChartCard>
      <div className="grid two">
        {data.goals.map((goal) => {
          const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
          const months = saving ? Math.ceil(remaining / saving) : null;
          return (
            <Card key={goal.id}>
              <h2>{goal.title}</h2>
              <p>Remaining: {money(remaining, data.profile.currency)}</p>
              <p className="muted">{months ? `Estimated completion in ${months} month(s)` : "Increase savings to estimate completion."}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Calendar({ data }) {
  const items = [...data.expenses.map((item) => ({ ...item, label: item.date })), ...data.scheduled.map((item) => ({ ...item, label: item.nextDate }))].sort((a, b) => a.label.localeCompare(b.label));
  return <div className="page"><Card><h2>Calendar</h2><TransactionList expenses={items.map((item) => ({ ...item, date: item.label }))} currency={data.profile.currency} compact /></Card></div>;
}

function Accounts({ data }) {
  const spent = currentMonthExpenses(data.expenses).reduce((sum, item) => sum + item.amount, 0);
  return (
    <div className="page">
      <div className="stats-grid">
        <Stat label="Income account" value={money(data.profile.monthlyIncome, data.profile.currency)} tone="good" />
        <Stat label="Expense account" value={money(spent, data.profile.currency)} tone="bad" />
        <Stat label="Available balance" value={money(data.profile.monthlyIncome - spent, data.profile.currency)} />
      </div>
    </div>
  );
}

function Profile({ profile, setProfile, logout }) {
  const update = (field, value) => setProfile((current) => ({ ...current, [field]: value }));
  return (
    <div className="page narrow">
      <Card>
        <h2>Profile settings</h2>
        <div className="form-grid">
          <label>Name<input value={profile.fullName} onChange={(event) => update("fullName", event.target.value)} /></label>
          <label>Email<input value={profile.email} onChange={(event) => update("email", event.target.value)} /></label>
          <label>Monthly income<input type="number" value={profile.monthlyIncome} onChange={(event) => update("monthlyIncome", Number(event.target.value))} /></label>
          <label>Currency<select value={profile.currency} onChange={(event) => update("currency", event.target.value)}><option>INR</option><option>USD</option><option>EUR</option><option>GBP</option></select></label>
          <button className="primary" onClick={logout}>Logout</button>
        </div>
      </Card>
    </div>
  );
}

function Guide() {
  const steps = ["Set your income and monthly budget from Profile.", "Add every expense using Add Expense.", "Review Transactions for search, edit, and delete.", "Set category budgets and watch warning colors.", "Create savings goals and use Projection to estimate completion."];
  return <div className="page narrow"><Card><h2>User guide</h2>{steps.map((step, index) => <p className="guide-step" key={step}><b>{index + 1}</b>{step}</p>)}</Card></div>;
}

function AuthScreen({ onEnter }) {
  return (
    <main className="auth">
      <Card className="auth-card">
        <div className="brand static"><span>P</span><b>PET</b></div>
        <h1>Personal Expense Tracker</h1>
        <p>Track expenses, budgets, savings goals, and future projections from one dashboard.</p>
        <div className="form-grid">
          <label>Email<input type="email" placeholder="student@example.com" /></label>
          <label>Password<input type="password" placeholder="Enter password" /></label>
          <button className="primary" onClick={onEnter}>Login</button>
        </div>
      </Card>
      <Card className="auth-info">
        <h2>Key features</h2>
        <p>Expense management, category budgets, savings goals, analytics, scheduled transactions, and user guidance are included.</p>
      </Card>
    </main>
  );
}

export default function App() {
  const [path, setPath] = useState(route());
  const [logged, setLogged] = useState(() => readStorage("pet_logged", false));
  const [profile, setProfile] = useState(() => readStorage("pet_profile", initialProfile));
  const [expenses, setExpenses] = useState(() => readStorage("pet_expenses", initialExpenses));
  const [budgets, setBudgets] = useState(() => readStorage("pet_budgets", initialBudgets));
  const [goals, setGoals] = useState(() => readStorage("pet_goals", initialGoals));
  const [scheduled, setScheduled] = useState(() => readStorage("pet_scheduled", initialScheduled));

  useEffect(() => {
    const handler = () => setPath(route());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);
  useEffect(() => localStorage.setItem("pet_logged", JSON.stringify(logged)), [logged]);
  useEffect(() => localStorage.setItem("pet_profile", JSON.stringify(profile)), [profile]);
  useEffect(() => localStorage.setItem("pet_expenses", JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem("pet_budgets", JSON.stringify(budgets)), [budgets]);
  useEffect(() => localStorage.setItem("pet_goals", JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem("pet_scheduled", JSON.stringify(scheduled)), [scheduled]);

  const data = useMemo(() => ({ profile, expenses, budgets, goals, scheduled }), [profile, expenses, budgets, goals, scheduled]);
  const go = (nextPath) => goTo(nextPath, setPath);
  const logout = () => {
    setLogged(false);
    go("/login");
  };
  const login = () => {
    setLogged(true);
    go("/dashboard");
  };
  const titles = {
    "/dashboard": "Overview",
    "/transactions": "Transactions",
    "/scheduled": "Scheduled transactions",
    "/add-expense": "Add expense",
    "/budget": "Budget manager",
    "/goals": "Savings goals",
    "/projection": "Future projection",
    "/analytics": "Analytics",
    "/calendar": "Calendar",
    "/accounts": "Accounts",
    "/profile": "Profile",
    "/guide": "User guide",
  };

  if (!logged) return <AuthScreen onEnter={login} />;

  const screens = {
    "/dashboard": <Dashboard data={data} go={go} />,
    "/transactions": <Transactions data={data} setExpenses={setExpenses} />,
    "/scheduled": <Scheduled data={data} setScheduled={setScheduled} />,
    "/add-expense": <AddExpense data={data} setExpenses={setExpenses} go={go} />,
    "/budget": <Budgets data={data} setBudgets={setBudgets} setProfile={setProfile} />,
    "/goals": <Goals data={data} setGoals={setGoals} />,
    "/projection": <Projection data={data} />,
    "/analytics": <Analytics data={data} />,
    "/calendar": <Calendar data={data} />,
    "/accounts": <Accounts data={data} />,
    "/profile": <Profile profile={profile} setProfile={setProfile} logout={logout} />,
    "/guide": <Guide />,
  };

  return (
    <div className="shell">
      <Sidebar active={path} go={go} profile={profile} logout={logout} />
      <main>
        <TopBar title={titles[path] || "Overview"} />
        {screens[path] || screens["/dashboard"]}
      </main>
    </div>
  );
}

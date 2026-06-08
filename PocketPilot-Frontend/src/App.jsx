
import {Routes,Route,Link} from 'react-router-dom';
const Page=({t})=><div style={{padding:30}}><h1>{t}</h1></div>;
export default function App(){
return <>
<nav style={{padding:10,display:'flex',gap:10}}>
<Link to="/">Dashboard</Link>
<Link to="/expenses">Expenses</Link>
<Link to="/goals">Goals</Link>
<Link to="/analytics">Analytics</Link>
</nav>
<Routes>
<Route path="/" element={<Page t="Dashboard"/>}/>
<Route path="/expenses" element={<Page t="Add Expense"/>}/>
<Route path="/goals" element={<Page t="Savings Goals"/>}/>
<Route path="/analytics" element={<Page t="Analytics"/>}/>
</Routes>
</>;
}

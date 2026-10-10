import Link from "next/link";
import {
  Users,
  BookOpen,
  FileText,
  Wallet,
  UserPlus,
  Award,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";

// Sample data: replace with real data from your backend
const STATS = [
  { label: "Total students", value: "248", note: "+12 this month", icon: Users, tone: "blue" },
  { label: "Active programs", value: "9", note: "3 starting soon", icon: BookOpen, tone: "violet" },
  { label: "New enrollments", value: "36", note: "This month", icon: FileText, tone: "green" },
  { label: "Revenue", value: "KSh 482,500", note: "This month", icon: Wallet, tone: "amber" },
];

const RECENT = [
  { student: "Amina Wanjiru", program: "Web Development", date: "8 Oct 2026", amount: "KSh 12,000", status: "Paid" },
  { student: "Brian Otieno", program: "Python Basics", date: "7 Oct 2026", amount: "KSh 9,500", status: "Paid" },
  { student: "Cynthia Mwende", program: "React", date: "6 Oct 2026", amount: "KSh 15,000", status: "Pending" },
  { student: "David Kiprop", program: "JavaScript", date: "5 Oct 2026", amount: "KSh 11,000", status: "Paid" },
  { student: "Esther Njeri", program: "Scratch Juniors", date: "4 Oct 2026", amount: "KSh 6,000", status: "Pending" },
];

const QUICK_ACTIONS = [
  { label: "Add a student", href: "/dashboard/students", icon: UserPlus },
  { label: "Create a program", href: "/dashboard/programs", icon: BookOpen },
  { label: "Record a payment", href: "/dashboard/payments", icon: CreditCard },
  { label: "Issue a certificate", href: "/dashboard/certificates", icon: Award },
];

export default function DashboardPage() {
  return (
    <div className="dash-page">
      <section className="dash-grid dash-stats" aria-label="Key numbers">
        {STATS.map(({ label, value, note, icon: Icon, tone }) => (
          <article key={label} className="dash-card dash-stat">
            <span className={`dash-tone dash-tone--${tone}`}>
              <Icon size={24} aria-hidden="true" />
            </span>
            <div>
              <p className="dash-stat__label">{label}</p>
              <p className="dash-stat__value">{value}</p>
              <p className="dash-stat__note">{note}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="dash-overview">
        <section className="dash-card">
          <div className="dash-card__head">
            <h2>Recent enrollments</h2>
            <Link href="/dashboard/enrollments" className="dash-link">
              View all
            </Link>
          </div>

          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Program</th>
                  <th scope="col">Date</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT.map((row) => (
                  <tr key={row.student}>
                    <td>
                      <strong>{row.student}</strong>
                    </td>
                    <td>{row.program}</td>
                    <td>{row.date}</td>
                    <td>{row.amount}</td>
                    <td>
                      <span className={`dash-pill dash-pill--${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="dash-card">
          <div className="dash-card__head">
            <h2>Quick actions</h2>
          </div>
          <ul className="dash-actions">
            {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <Link href={href} className="dash-action">
                  <Icon size={20} aria-hidden="true" />
                  <span>{label}</span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
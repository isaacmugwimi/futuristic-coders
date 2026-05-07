import "./Stats.css";

import {
  FaUsers,
  FaLaptopCode,
  FaStar,
  FaCalendarAlt,
} from "react-icons/fa";

const STATS = [
  {
    number: "20+",
    label: "Students Trained",
    icon: <FaUsers />,
  },

  {
    number: "3",
    label: "Structured Programs",
    icon: <FaLaptopCode />,
  },

  {
    number: "98%",
    label: "Parent Satisfaction",
    icon: <FaStar />,
  },

  {
    number: "Now",
    label: "Enrolling Students",
    icon: <FaCalendarAlt />,
  },
];

export default function Stats() {

  return (
    <section className="stats">

      <div className="container">

        <div className="stats-grid">

          {STATS.map((stat) => (

            <div key={stat.label} className="stats-item">

              <div className="stats-icon">
                {stat.icon}
              </div>

              <div className="stats-number">
                {stat.number}
              </div>

              <div className="stats-label">
                {stat.label}
              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}
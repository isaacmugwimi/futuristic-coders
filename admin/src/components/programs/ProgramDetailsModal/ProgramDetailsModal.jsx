"use client";

import "./ProgramDetailsModal.css";
import {
  User,
  Users,
  Layers,
  MapPin,
  Clock,
  CalendarDays,
  Wallet,
  Star,
  GraduationCap,
  Globe,
  FileText,
  Pencil,
  CloudUpload,
  CloudOff,
  Link2,
  Trash2,
} from "lucide-react";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import Badge from "../Badge/Badge";
import { LEVEL_TONES, PUBLIC_SITE_URL } from "@/src/data/programs";
import { formatDate, formatKSh } from "@/src/utils/format";

function Fact({ icon: Icon, label, children }) {
  return (
    <div className="fc-pdetails__fact">
      <dt>
        <Icon size={14} aria-hidden="true" />
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function ProgramDetailsModal({
  program: p,
  onClose,
  onEdit,
  onTogglePublish,
  onToggleFeatured,
  onCopyLink,
  onDelete,
}) {
  const published = p.status === "published";
  const seatsLeft = Math.max(0, p.capacity - p.enrolled);
  const fill = p.capacity
    ? Math.min(100, Math.round((p.enrolled / p.capacity) * 100))
    : 0;
  const publicUrl = `${PUBLIC_SITE_URL}/programs/${p.slug}`;

  return (
    <Modal
      size="lg"
      title={p.title}
      subtitle={`${p.code} · ${p.category}`}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost-danger"
            icon={Trash2}
            onClick={onDelete}
            className="fc-pdetails__delete"
          >
            Delete
          </Button>
          <Button variant="secondary" icon={Star} onClick={onToggleFeatured}>
            {p.featured ? "Unfeature" : "Feature"}
          </Button>
          <Button
            variant="secondary"
            icon={published ? CloudOff : CloudUpload}
            onClick={onTogglePublish}
          >
            {published ? "Pull from website" : "Publish"}
          </Button>
          <Button icon={Pencil} onClick={onEdit}>
            Edit program
          </Button>
        </>
      }
    >
      <div className="fc-pdetails">
        <div className="fc-pdetails__badges">
          <Badge
            tone={published ? "success" : "neutral"}
            icon={published ? Globe : FileText}
          >
            {published ? "Published" : "Draft"}
          </Badge>
          {p.featured && (
            <Badge tone="gold" icon={Star}>
              Featured
            </Badge>
          )}
          <Badge tone={LEVEL_TONES[p.level]}>{p.level}</Badge>
          <Badge>{p.mode}</Badge>
        </div>

        <p className="fc-pdetails__summary">{p.summary}</p>
        {p.description ? (
          <p className="fc-pdetails__text">{p.description}</p>
        ) : (
          <p className="fc-pdetails__text fc-pdetails__text--empty">
            No full description yet. Add one before publishing.
          </p>
        )}

        <dl className="fc-pdetails__facts">
          <Fact icon={User} label="Instructor">
            {p.instructor}
          </Fact>
          <Fact icon={Users} label="Age group">
            {p.ageGroup}
          </Fact>
          <Fact icon={Layers} label="Level">
            {p.level}
          </Fact>
          <Fact icon={MapPin} label="Mode">
            {p.mode}
          </Fact>
          <Fact icon={Clock} label="Duration">
            {p.durationWeeks} weeks · {p.sessionsPerWeek}{" "}
            {p.sessionsPerWeek === 1 ? "session" : "sessions"}/week
          </Fact>
          <Fact icon={CalendarDays} label="Starts">
            {formatDate(p.startDate)}
          </Fact>
          <Fact icon={CalendarDays} label="Schedule">
            {p.schedule || "—"}
          </Fact>
          <Fact icon={Wallet} label="Price">
            {formatKSh(p.price)}
          </Fact>
          <Fact icon={Star} label="Rating">
            {p.rating ? `${p.rating.toFixed(1)} / 5` : "Not rated yet"}
          </Fact>
          <Fact icon={GraduationCap} label="Completion rate">
            {p.completionRate != null ? `${p.completionRate}%` : "—"}
          </Fact>
        </dl>

        <section className="fc-pdetails__section">
          <h3>Enrollment</h3>
          <div className="fc-pdetails__enroll">
            <div
              className="fc-pdetails__bar"
              role="img"
              aria-label={`${fill}% of seats taken`}
            >
              <span style={{ width: `${fill}%` }} data-full={fill >= 100} />
            </div>
            <p>
              <strong>
                {p.enrolled} / {p.capacity}
              </strong>{" "}
              learners · {seatsLeft === 0 ? "Full" : `${seatsLeft} seats left`}
            </p>
          </div>
        </section>

        {p.outcomes.length > 0 && (
          <section className="fc-pdetails__section">
            <h3>What learners will achieve</h3>
            <ul className="fc-pdetails__list">
              {p.outcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {p.prerequisites.length > 0 && (
          <section className="fc-pdetails__section">
            <h3>Prerequisites</h3>
            <ul className="fc-pdetails__list">
              {p.prerequisites.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {p.tools.length > 0 && (
          <section className="fc-pdetails__section">
            <h3>Tools &amp; technologies</h3>
            <ul className="fc-pdetails__chips">
              {p.tools.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </section>
        )}

        <section className={`fc-pdetails__web${published ? " is-live" : ""}`}>
          <span className="fc-pdetails__web-icon">
            {published ? <Globe size={20} /> : <FileText size={20} />}
          </span>
          <div className="fc-pdetails__web-text">
            <strong>
              {published
                ? "Live on the public website"
                : "Not on the public website"}
            </strong>
            {published ? (
              <>
                <span>
                  Published {formatDate(p.publishedAt)} · Last updated{" "}
                  {formatDate(p.updatedAt)}
                </span>
                <code>{publicUrl}</code>
              </>
            ) : (
              <span>
                Saved as a draft · Last updated {formatDate(p.updatedAt)}
              </span>
            )}
          </div>
          {published && (
            <Button
              variant="secondary"
              size="sm"
              icon={Link2}
              onClick={onCopyLink}
            >
              Copy link
            </Button>
          )}
        </section>
      </div>
    </Modal>
  );
}

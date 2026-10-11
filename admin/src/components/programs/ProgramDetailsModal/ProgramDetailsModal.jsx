"use client";

import "./ProgramDetailsModal.css";
import { useEffect, useRef, useState } from "react";
import {
  User,
  Users,
  Layers,
  MapPin,
  Clock,
  CalendarDays,
  CalendarClock,
  Wallet,
  Star,
  GraduationCap,
  Globe,
  FileText,
  FolderOpen,
  ListOrdered,
  ImageOff,
  ImagePlus,
  Upload,
  X,
  TriangleAlert,
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

const THUMB_TYPES = ["image/png", "image/jpeg", "image/webp"];
const THUMB_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

const isHttpUrl = (text) => {
  try {
    const u = new URL(text);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Inline editor for the thumbnail: upload a file or paste an image link.
 * Calls onSubmit with the same shape ProgramFormModal sends:
 *   { thumbnailFile, thumbnail, thumbnailSource, removeThumbnail }
 */
function ThumbnailEditor({ current, onSubmit, onCancel }) {
  const [mode, setMode] = useState("upload");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [link, setLink] = useState("");
  const [broken, setBroken] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const linkValue = link.trim();
  const linkValid = isHttpUrl(linkValue);
  const preview = filePreview || (linkValid ? linkValue : null);
  const canSave = Boolean(file || (linkValid && !broken)) && !busy;

  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pickFile(f) {
    if (!f) return;
    if (!THUMB_TYPES.includes(f.type)) {
      setError("Use a PNG, JPG or WebP image.");
      return;
    }
    if (f.size > THUMB_MAX_BYTES) {
      setError("That image is over 2 MB. Choose a smaller file.");
      return;
    }
    setError("");
    setLink("");
    setBroken(false);
    setFile(f);
  }

  function onLinkChange(value) {
    setLink(value);
    setBroken(false);
    setError("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit(payload) {
    setBusy(true);
    setError("");
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err?.message || "Couldn't save the thumbnail. Try again.");
      setBusy(false);
    }
  }

  function save() {
    if (file) {
      return submit({
        thumbnailFile: file,
        thumbnail: null,
        thumbnailSource: "upload",
        removeThumbnail: false,
      });
    }
    if (!linkValid) {
      setError("Enter a full link starting with https://");
      return;
    }
    return submit({
      thumbnailFile: null,
      thumbnail: linkValue,
      thumbnailSource: "link",
      removeThumbnail: false,
    });
  }

  function remove() {
    return submit({
      thumbnailFile: null,
      thumbnail: null,
      thumbnailSource: null,
      removeThumbnail: true,
    });
  }

  return (
    <div className="fc-pdetails__thumbedit">
      <div className="fc-pdetails__thumbedit-head">
        <strong>{current ? "Change thumbnail" : "Add a thumbnail"}</strong>
        <button
          type="button"
          className="fc-pdetails__iconbtn"
          onClick={onCancel}
          aria-label="Cancel thumbnail change"
          disabled={busy}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <input
        ref={fileRef}
        className="fc-pdetails__file"
        type="file"
        accept={THUMB_TYPES.join(",")}
        tabIndex={-1}
        onChange={(e) => pickFile(e.target.files?.[0])}
      />

      {preview && (
        <div className="fc-pdetails__thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="New thumbnail preview"
            onError={() => linkValid && !filePreview && setBroken(true)}
            onLoad={() => setBroken(false)}
          />
        </div>
      )}

      <div
        className="fc-pdetails__seg"
        role="group"
        aria-label="Thumbnail source"
      >
        <button
          type="button"
          aria-pressed={mode === "upload"}
          onClick={() => setMode("upload")}
        >
          <Upload size={15} aria-hidden="true" /> Upload a file
        </button>
        <button
          type="button"
          aria-pressed={mode === "link"}
          onClick={() => setMode("link")}
        >
          <Link2 size={15} aria-hidden="true" /> Use an image link
        </button>
      </div>

      {mode === "upload" ? (
        <button
          type="button"
          className={`fc-pdetails__drop${dragging ? " is-dragging" : ""}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pickFile(e.dataTransfer.files?.[0]);
          }}
        >
          <ImagePlus size={22} aria-hidden="true" />
          <strong>{file ? file.name : "Choose an image"}</strong>
          <small>
            Drag it here or click to browse. PNG, JPG or WebP, up to 2 MB.
          </small>
        </button>
      ) : (
        <input
          className="fc-pdetails__input"
          type="url"
          inputMode="url"
          value={link}
          onChange={(e) => onLinkChange(e.target.value)}
          placeholder="https://example.com/images/course.jpg"
          aria-label="Image link"
          aria-invalid={error || broken ? "true" : undefined}
        />
      )}

      {error ? (
        <p className="fc-pdetails__thumbedit-error" role="alert">
          {error}
        </p>
      ) : broken && mode === "link" ? (
        <p className="fc-pdetails__thumbedit-error" role="alert">
          That link didn&apost load as an image. Use a direct image link, or
          upload the file instead.
        </p>
      ) : mode === "link" ? (
        <p className="fc-pdetails__thumbedit-hint">
          Paste a direct link to the image (usually ending in .jpg, .png or
          .webp). Some sites block other websites from showing their images.
        </p>
      ) : null}

      <div className="fc-pdetails__thumbedit-actions">
        {current && (
          <Button
            variant="ghost-danger"
            size="sm"
            icon={Trash2}
            onClick={remove}
            disabled={busy}
            className="fc-pdetails__thumbedit-remove"
          >
            Remove image
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button size="sm" onClick={save} disabled={!canSave}>
          {busy ? "Saving…" : "Save thumbnail"}
        </Button>
      </div>
    </div>
  );
}

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

function ListSection({ title, items }) {
  if (!items?.length) return null;
  return (
    <section className="fc-pdetails__section">
      <h3>{title}</h3>
      <ul className="fc-pdetails__list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
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
  onChangeThumbnail,
}) {
  const [editingThumb, setEditingThumb] = useState(false);
  const published = p.status === "published";
  const seatsLeft = Math.max(0, p.capacity - p.enrolled);
  const fill = p.capacity
    ? Math.min(100, Math.round((p.enrolled / p.capacity) * 100))
    : 0;
  const publicUrl = `${PUBLIC_SITE_URL}/programs/${p.slug}`;

  const outcomes = p.outcomes ?? [];
  const prerequisites = p.prerequisites ?? [];
  const requirements = p.requirements ?? [];
  const tools = p.tools ?? [];

  // Same wording the public "Schedule" tile uses.
  const sessionText =
    p.sessionsPerWeek && p.sessionMinutes
      ? `${p.sessionsPerWeek} ${
          p.sessionsPerWeek === 1 ? "session" : "sessions"
        } per week, ${p.sessionMinutes} minutes each`
      : `${p.sessionsPerWeek} ${
          p.sessionsPerWeek === 1 ? "session" : "sessions"
        } per week`;

  // What would make the public modal feel thin.
  const missing = [
    !p.thumbnail && "a thumbnail",
    !p.description && "a full description",
    outcomes.length === 0 && "what learners will learn",
    prerequisites.length === 0 && "prerequisites",
    requirements.length === 0 && "what learners need",
  ].filter(Boolean);

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
        {/* ---------- Thumbnail ---------- */}
        {editingThumb ? (
          <ThumbnailEditor
            current={p.thumbnail}
            onCancel={() => setEditingThumb(false)}
            onSubmit={async (payload) => {
              await onChangeThumbnail(payload);
              setEditingThumb(false);
            }}
          />
        ) : (
          <div className="fc-pdetails__thumbwrap">
            {p.thumbnail ? (
              <div className="fc-pdetails__thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnail} alt={`${p.title} thumbnail`} />
              </div>
            ) : (
              <div className="fc-pdetails__thumb fc-pdetails__thumb--empty">
                <ImageOff size={24} aria-hidden="true" />
                <span>No thumbnail yet</span>
              </div>
            )}
            {onChangeThumbnail && (
              <button
                type="button"
                className="fc-pdetails__thumbbtn"
                onClick={() => setEditingThumb(true)}
              >
                <ImagePlus size={15} aria-hidden="true" />
                {p.thumbnail ? "Change image" : "Add image"}
              </button>
            )}
          </div>
        )}

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
          <Badge icon={FolderOpen}>{p.category}</Badge>
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

        {/* ---------- Website readiness ---------- */}
        {missing.length > 0 && (
          <div className="fc-pdetails__missing" role="note">
            <TriangleAlert size={18} aria-hidden="true" />
            <p>
              <strong>The website details window will look thin.</strong> Add{" "}
              {missing.join(", ")} to make this program richer.
            </p>
          </div>
        )}

        {/* ---------- Key facts (mirrors the public tiles) ---------- */}
        <dl className="fc-pdetails__facts">
          <Fact icon={Clock} label="Duration">
            {p.durationWeeks} weeks
          </Fact>
          <Fact icon={Users} label="Ages">
            {p.ageGroup}
          </Fact>
          <Fact icon={CalendarClock} label="Schedule">
            {sessionText}
          </Fact>
          <Fact icon={MapPin} label="Format">
            {p.mode}
          </Fact>
          <Fact icon={FolderOpen} label="Category">
            {p.category}
          </Fact>
          <Fact icon={ListOrdered} label="Order in category">
            {p.displayOrder ?? "Last"}
          </Fact>
          <Fact icon={Layers} label="Level">
            {p.level}
          </Fact>
          <Fact icon={User} label="Instructor">
            {p.instructor}
          </Fact>
          <Fact icon={Wallet} label="Price">
            {formatKSh(p.price)}
          </Fact>
          <Fact icon={CalendarDays} label="Starts">
            {formatDate(p.startDate)}
          </Fact>
          <Fact icon={CalendarDays} label="Class days & time">
            {p.schedule || "—"}
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

        <ListSection title="What you'll learn" items={outcomes} />
        <ListSection title="Prerequisites" items={prerequisites} />
        <ListSection title="What you'll need" items={requirements} />

        {tools.length > 0 && (
          <section className="fc-pdetails__section">
            <h3>Tools &amp; topics</h3>
            <ul className="fc-pdetails__chips">
              {tools.map((tool) => (
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

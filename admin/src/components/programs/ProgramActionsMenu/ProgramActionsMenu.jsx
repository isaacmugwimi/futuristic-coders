"use client";

import "./ProgramActionsMenu.css";
import { useEffect, useId, useRef, useState } from "react";
import {
  EllipsisVertical,
  Eye,
  Pencil,
  CloudUpload,
  CloudOff,
  Star,
  Copy,
  Link2,
  Trash2,
} from "lucide-react";

const MENU_WIDTH = 236;
const MENU_HEIGHT = 340; // rough height, used to decide whether to open upwards

export default function ProgramActionsMenu({
  program,
  onView,
  onEdit,
  onTogglePublish,
  onToggleFeatured,
  onDuplicate,
  onCopyLink,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  const published = program.status === "published";

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    const opensUp = rect.bottom + 6 + MENU_HEIGHT > window.innerHeight && rect.top > MENU_HEIGHT;
    const top = opensUp ? rect.top - 6 - MENU_HEIGHT : rect.bottom + 6;
    const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
    setPosition({ top: Math.max(8, top), left });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    const items = () =>
      Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]:not(:disabled)') ?? []);
    items()[0]?.focus();

    function onPointerDown(event) {
      if (menuRef.current?.contains(event.target) || triggerRef.current?.contains(event.target)) return;
      setOpen(false);
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const list = items();
        if (!list.length) return;
        const index = list.indexOf(document.activeElement);
        const next =
          event.key === "ArrowDown" ? (index + 1) % list.length : (index - 1 + list.length) % list.length;
        list[next].focus();
      } else if (event.key === "Tab") {
        setOpen(false);
      }
    }

    const close = () => setOpen(false);

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function run(handler) {
    return () => {
      setOpen(false);
      handler(program);
    };
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="fc-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`More actions for ${program.title}`}
        title="More actions"
        onClick={toggle}
      >
        <EllipsisVertical size={18} aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          className="fc-menu"
          style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
        >
          <button type="button" role="menuitem" className="fc-menu__item" onClick={run(onView)}>
            <Eye size={17} aria-hidden="true" /> View details
          </button>
          <button type="button" role="menuitem" className="fc-menu__item" onClick={run(onEdit)}>
            <Pencil size={17} aria-hidden="true" /> Edit program
          </button>

          <div className="fc-menu__divider" role="separator" />

          <button type="button" role="menuitem" className="fc-menu__item" onClick={run(onTogglePublish)}>
            {published ? (
              <>
                <CloudOff size={17} aria-hidden="true" /> Pull from website
              </>
            ) : (
              <>
                <CloudUpload size={17} aria-hidden="true" /> Publish to website
              </>
            )}
          </button>
          <button type="button" role="menuitem" className="fc-menu__item" onClick={run(onToggleFeatured)}>
            <Star size={17} fill={program.featured ? "currentColor" : "none"} aria-hidden="true" />
            {program.featured ? "Remove from featured" : "Mark as featured"}
          </button>
          <button type="button" role="menuitem" className="fc-menu__item" onClick={run(onDuplicate)}>
            <Copy size={17} aria-hidden="true" /> Duplicate as draft
          </button>
          <button
            type="button"
            role="menuitem"
            className="fc-menu__item"
            onClick={run(onCopyLink)}
            disabled={!published}
            title={published ? undefined : "Publish this program to get a public link"}
          >
            <Link2 size={17} aria-hidden="true" /> Copy public link
          </button>

          <div className="fc-menu__divider" role="separator" />

          <button
            type="button"
            role="menuitem"
            className="fc-menu__item fc-menu__item--danger"
            onClick={run(onDelete)}
          >
            <Trash2 size={17} aria-hidden="true" /> Delete program
          </button>
        </div>
      )}
    </>
  );
}

"use client";

import "./ProgramsPage.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Globe,
  FileText,
  Star,
  Users,
  Plus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
  CloudUpload,
  CloudOff,
  Trash2,
  SearchX,
} from "lucide-react";
import Button from "../Button/Button";
import Badge from "../Badge/Badge";
import Toast from "../Toast/Toast";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import ProgramActionsMenu from "../ProgramActionsMenu/ProgramActionsMenu";
import ProgramDetailsModal from "../ProgramDetailsModal/ProgramDetailsModal";
import ProgramFormModal from "../ProgramFormModal/ProgramFormModal";
import {
  CATEGORY_TONES,
  LEVELS,
  LEVEL_TONES,
  PUBLIC_SITE_URL,
  normalizeProgram,
} from "@/src/data/programs";
import { formatKSh, initials } from "@/src/utils/format";

import {
  useProgramCategories,
  usePrograms,
} from "@/src/hooks/programs/useProgramQueries";
import {
  useCreateProgram,
  useCreateProgramCategory,
  useDeleteProgram,
  usePublishProgram,
  useUpdateProgram,
} from "@/src/hooks/programs/useProgramMutations";
import QueryState, { isBlocked } from "../../QueryState/QueryState";
import { uploadImage } from "@/src/services/programs/program.service";

const PAGE_SIZES = [5, 8, 15, 25];

const SORT_OPTIONS = [
  { value: "recent", label: "Recently updated" },
  { value: "website", label: "Website order" },
  { value: "title", label: "Title (A–Z)" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "enrolled", label: "Most enrolled" },
  { value: "start", label: "Start date" },
];

const SORTERS = {
  recent: (a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
  title: (a, b) => (a.title ?? "").localeCompare(b.title ?? ""),
  "price-desc": (a, b) => (b.price ?? 0) - (a.price ?? 0),
  "price-asc": (a, b) => (a.price ?? 0) - (b.price ?? 0),
  enrolled: (a, b) => (b.enrolled ?? 0) - (a.enrolled ?? 0),
  start: (a, b) => (a.startDate || "9999").localeCompare(b.startDate || "9999"),
};

// Same order the public site uses: by category, then "Order in category".
const websiteSorter = (categoryOrder) => (a, b) => {
  const byCategory =
    (categoryOrder.get(a.category) ?? 999) -
    (categoryOrder.get(b.category) ?? 999);
  if (byCategory) return byCategory;
  return (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999);
};

// Colour for the initials fallback. Categories created in the form have no
// entry in CATEGORY_TONES, so pick a stable tone from the name.
const FALLBACK_TONES = ["blue", "violet", "green", "amber", "magenta", "cyan"];
function toneFor(category) {
  if (CATEGORY_TONES[category]) return CATEGORY_TONES[category];
  let hash = 0;
  for (const ch of category ?? "") hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return FALLBACK_TONES[hash % FALLBACK_TONES.length];
}

// Everything the form sends that is not a plain program field.
const CONTROL_KEYS = [
  "publish",
  "featured",
  "thumbnailFile",
  "thumbnail",
  "thumbnailSource",
  "removeThumbnail",
  "isNewCategory",
  "categoryDescription",
];

// Fields the backend owns. Never sent when duplicating a program.
const SERVER_KEYS = [
  "id",
  "code",
  "slug",
  "createdAt",
  "updatedAt",
  "publishedAt",
  "enrolled",
  "rating",
  "completionRate",
  "displayOrder",
];

/**
 * TODO: replace with a real upload (your storage, Cloudinary, S3, or a
 * FormData POST to an API route) and return the final public URL.
 * The object URL below only lives until the page reloads.
 */

async function uploadThumbnail(file) {
  const result = await uploadImage(file, "programs");
  return result.url;
}

/** Works out the final thumbnail URL from the form / details-modal payload. */
async function resolveThumbnail(payload) {
  if (payload.thumbnailSource === "upload" && payload.thumbnailFile)
    return uploadThumbnail(payload.thumbnailFile);
  if (payload.removeThumbnail) return null;
  return payload.thumbnail ?? null;
}

function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out = [];
  wanted.forEach((n, i) => {
    if (i > 0 && n - wanted[i - 1] > 1) out.push(`gap-${n}`);
    out.push(n);
  });
  return out;
}

function buildConfirm(action, targets) {
  const count = targets.length;
  const many = count > 1;
  const name = many ? `${count} programs` : `“${targets[0].title}”`;

  if (action === "delete") {
    const live = targets.some((p) => p.status === "published");
    return {
      title: many ? `Delete ${count} programs?` : "Delete this program?",
      message: `${name} will be permanently deleted${live ? " and removed from the public website" : ""}. This can't be undone.`,
      confirmLabel: many ? `Delete ${count} programs` : "Delete program",
      tone: "danger",
    };
  }
  if (action === "publish") {
    return {
      title: many ? `Publish ${count} programs?` : "Publish to the website?",
      message: `${name} will become visible on the public website straight away.`,
      confirmLabel: "Publish",
      tone: "primary",
    };
  }
  return {
    title: many ? `Pull ${count} programs?` : "Pull from the website?",
    message: `${name} will be removed from the public website and kept here as ${many ? "drafts" : "a draft"}. Enrolled learners are not affected.`,
    confirmLabel: "Pull from website",
    tone: "primary",
  };
}

/** Small picture in the table. Falls back to initials if there is no image or it fails to load. */
function ProgramThumb({ program }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(program.thumbnail) && !failed;

  return (
    <span
      className={`fc-prog__thumb fc-prog__thumb--${toneFor(program.category)}${
        showImage ? " has-image" : ""
      }`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={program.thumbnail}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        initials(program.title)
      )}
    </span>
  );
}

export default function ProgramsPage() {
  const programsQuery = usePrograms();
  const categoriesQuery = useProgramCategories();

  const createProgram = useCreateProgram();
  const updateProgramMutation = useUpdateProgram();
  const publishMutation = usePublishProgram();
  const deleteMutation = useDeleteProgram();
  const createCategory = useCreateProgramCategory();

  const programsResponse = programsQuery.data;
  const categoriesResponse = categoriesQuery.data;

  const programs = useMemo(
    () => (programsResponse?.data ?? []).map(normalizeProgram),
    [programsResponse],
  );

  // Categories retrieved from the backend
  const categories = useMemo(() => {
    const response = categoriesResponse;

    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.categories)) {
      return response.data.categories;
    }
    if (Array.isArray(response)) return response;

    return [];
  }, [categoriesResponse]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [selected, setSelected] = useState(() => new Set());
  const [modal, setModal] = useState(null); // { type: "details" | "form" | "confirm", id?, ids?, action? }
  const [toast, setToast] = useState(null);

  const selectAllRef = useRef(null);

  const showToast = useCallback((message, tone = "success") => {
    setToast({ id: Date.now(), message, tone });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);
  const closeModal = useCallback(() => setModal(null), []);

  /* ---------------- derived data ---------------- */
  // Saved categories first, then any category a program uses that isn't saved yet.
  const categoryNames = useMemo(() => {
    const names = categories.map((category) => category.name).filter(Boolean);

    programs.forEach((program) => {
      if (program.category && !names.includes(program.category)) {
        names.push(program.category);
      }
    });

    return names;
  }, [categories, programs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const comparator =
      sort === "website"
        ? websiteSorter(new Map(categoryNames.map((n, i) => [n, i])))
        : SORTERS[sort];

    return programs
      .filter((p) => {
        if (statusFilter !== "all" && p.status !== statusFilter) return false;
        if (categoryFilter !== "all" && p.category !== categoryFilter)
          return false;
        if (levelFilter !== "all" && p.level !== levelFilter) return false;
        if (featuredOnly && !p.featured) return false;
        if (!q) return true;
        return [
          p.title,
          p.code,
          p.category,
          p.instructor,
          p.ageGroup,
          p.mode,
        ].some((v) => (v ?? "").toLowerCase().includes(q));
      })
      .sort(comparator);
  }, [
    programs,
    categoryNames,
    query,
    statusFilter,
    categoryFilter,
    levelFilter,
    featuredOnly,
    sort,
  ]);

  const stats = useMemo(
    () => ({
      total: programs.length,
      published: programs.filter((p) => p.status === "published").length,
      drafts: programs.filter((p) => p.status === "draft").length,
      featured: programs.filter((p) => p.featured).length,
      learners: programs.reduce((sum, p) => sum + (p.enrolled ?? 0), 0),
    }),
    [programs],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(startIndex, startIndex + pageSize);

  const selectedPrograms = useMemo(
    () => programs.filter((p) => selected.has(p.id)),
    [programs, selected],
  );
  const allOnPageSelected =
    pageRows.length > 0 && pageRows.every((p) => selected.has(p.id));
  const someOnPageSelected = pageRows.some((p) => selected.has(p.id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        someOnPageSelected && !allOnPageSelected;
    }
  }, [someOnPageSelected, allOnPageSelected]);

  const hasActiveFilters =
    query !== "" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    levelFilter !== "all" ||
    featuredOnly;

  /* ---------------- filters ---------------- */
  function changeFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
      setSelected(new Set());
    };
  }

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setLevelFilter("all");
    setFeaturedOnly(false);
    setPage(1);
    setSelected(new Set());
  }

  /* ---------------- selection ---------------- */
  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageRows.forEach((p) => next.delete(p.id));
      else pageRows.forEach((p) => next.add(p.id));
      return next;
    });
  }

  /* ---------------- data actions (all API-backed) ---------------- */
  async function publishPrograms(ids) {
    await Promise.all(ids.map((id) => publishMutation.mutateAsync(id)));
  }

  async function pullPrograms(ids) {
    await Promise.all(
      ids.map((id) =>
        updateProgramMutation.mutateAsync({ id, data: { status: "draft" } }),
      ),
    );
  }

  async function deletePrograms(ids) {
    await Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)));
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  async function setFeatured(ids, value) {
    await Promise.all(
      ids.map((id) =>
        updateProgramMutation.mutateAsync({ id, data: { featured: value } }),
      ),
    );
  }

  async function toggleFeatured(p) {
    const next = !p.featured;
    try {
      await setFeatured([p.id], next);
    } catch (err) {
      showToast(err?.message || "Couldn't update featured status.", "danger");
      return;
    }
    if (!next) showToast("Removed from featured courses", "info");
    else if (p.status === "published") showToast("Added to featured courses");
    else
      showToast(
        "Marked as featured. It will show on the website once published.",
        "info",
      );
  }

  async function bulkFeature() {
    const ids = selectedPrograms.map((p) => p.id);
    const value = !selectedPrograms.every((p) => p.featured);
    try {
      await setFeatured(ids, value);
    } catch (err) {
      showToast(err?.message || "Couldn't update featured status.", "danger");
      return;
    }
    showToast(
      value
        ? `${ids.length} programs marked as featured`
        : `${ids.length} programs unfeatured`,
      value ? "success" : "info",
    );
  }

  async function duplicateProgram(p) {
    if (createProgram.isPending) return;

    // Strip server-generated fields; the backend makes a new id, code and slug.
    const rest = Object.fromEntries(
      Object.entries(p).filter(([key]) => !SERVER_KEYS.includes(key)),
    );

    try {
      await createProgram.mutateAsync({
        ...rest,
        title: `${p.title} (Copy)`,
        status: "draft",
        featured: false,
      });
      showToast("Duplicated as a draft");
    } catch (err) {
      showToast(err?.message || "Couldn't duplicate the program.", "danger");
    }
  }

  async function copyLink(p) {
    try {
      await navigator.clipboard.writeText(
        `${PUBLIC_SITE_URL}/programs/${p.slug}`,
      );
      showToast("Public link copied");
    } catch {
      showToast("Couldn't copy the link", "danger");
    }
  }

  async function saveProgram(data, existing) {
    const { publish, featured } = data;

    // Remove form-only fields before sending data to the backend.
    const fields = Object.fromEntries(
      Object.entries(data).filter(([key]) => !CONTROL_KEYS.includes(key)),
    );

    const status = publish ? "published" : "draft";

    // Upload the selected image first and obtain its permanent URL.
    let thumbnail;

    try {
      thumbnail = await resolveThumbnail(data);
    } catch (err) {
      showToast(
        err?.message || "Couldn't upload the thumbnail. Try again.",
        "danger",
      );
      return;
    }

    // Create the category through the backend first if necessary.
    if (data.isNewCategory) {
      if (createCategory.isPending) return;

      try {
        await createCategory.mutateAsync({
          name: data.category,
          description: data.categoryDescription ?? "",
        });
      } catch (err) {
        showToast(
          err?.message || "Couldn't create the category. Try again.",
          "danger",
        );
        return;
      }
    }

    // Update an existing program.
    if (existing) {
      if (updateProgramMutation.isPending) return;

      try {
        await updateProgramMutation.mutateAsync({
          id: existing.id,
          data: {
            ...fields,
            thumbnail,
            status,
            featured,
          },
        });

        showToast("Changes saved successfully");
      } catch (err) {
        showToast(
          err?.message || "Couldn't update the program. Try again.",
          "danger",
        );
        return;
      }
    } else {
      // Create a new program.
      if (createProgram.isPending) return;

      try {
        await createProgram.mutateAsync({
          ...fields,
          thumbnail,
          status,
          featured,
        });
      } catch (err) {
        showToast(
          err?.message || "Couldn't create the program. Try again.",
          "danger",
        );
        return;
      }

      setSort("recent");
      setPage(1);

      showToast(
        publish
          ? "Program created and published"
          : "Program created as a draft",
      );
    }

    closeModal();
  }

  // Used by the "Change image" editor in the details modal.
  // Errors are left to throw so the editor can show them.

  async function changeThumbnail(p, payload) {
    try {
      const thumbnail = await resolveThumbnail(payload);

      await updateProgramMutation.mutateAsync({
        id: p.id,
        data: { thumbnail },
      });

      showToast(
        thumbnail ? "Thumbnail updated successfully" : "Thumbnail removed",
        thumbnail ? "success" : "info",
      );
    } catch (err) {
      showToast(
        err?.message || "Couldn't update the thumbnail. Try again.",
        "danger",
      );
      throw err;
    }
  }

  /* ---------------- confirmations ---------------- */
  function requestAction(action, ids) {
    setModal({ type: "confirm", action, ids });
  }

  async function runConfirmed() {
    const { action, ids } = modal;
    const many = ids.length > 1;

    try {
      if (action === "delete") {
        await deletePrograms(ids);
        showToast(
          many ? `${ids.length} programs deleted` : "Program deleted",
          "danger",
        );
      } else if (action === "publish") {
        await publishPrograms(ids);
        showToast(
          many
            ? `${ids.length} programs published to the website`
            : "Published to the public website",
        );
      } else if (action === "pull") {
        await pullPrograms(ids);
        showToast(
          many
            ? `${ids.length} programs pulled from the website`
            : "Pulled from the website and saved as a draft",
          "info",
        );
      }
      closeModal();
    } catch (err) {
      showToast(err?.message || "Something went wrong. Try again.", "danger");
    }
  }

  function onRowClick(event, p) {
    if (event.target.closest("button, a, input, label, select, textarea"))
      return;
    setModal({ type: "details", id: p.id });
  }

  /* ---------------- modal helpers ---------------- */
  const modalProgram = modal?.id
    ? programs.find((p) => p.id === modal.id)
    : null;
  const confirmTargets =
    modal?.type === "confirm"
      ? programs.filter((p) => modal.ids.includes(p.id))
      : [];
  const confirmConfig = confirmTargets.length
    ? buildConfirm(modal.action, confirmTargets)
    : null;
  const allSelectedFeatured =
    selectedPrograms.length > 0 && selectedPrograms.every((p) => p.featured);

  // Every hook above runs before this early return.
  if (isBlocked(programsQuery)) {
    return (
      <QueryState query={programsQuery} resource="programs" variant="table" />
    );
  }

  return (
    <div className="fc-prog">
      {/* ---------- Summary ---------- */}
      <section className="fc-prog__stats" aria-label="Programs summary">
        <article className="fc-prog__stat">
          <span className="fc-prog__stat-icon fc-prog__stat-icon--blue">
            <BookOpen size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="fc-prog__stat-value">{stats.total}</p>
            <p className="fc-prog__stat-label">Total programs</p>
          </div>
        </article>
        <article className="fc-prog__stat">
          <span className="fc-prog__stat-icon fc-prog__stat-icon--green">
            <Globe size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="fc-prog__stat-value">{stats.published}</p>
            <p className="fc-prog__stat-label">On the website</p>
          </div>
        </article>
        <article className="fc-prog__stat">
          <span className="fc-prog__stat-icon fc-prog__stat-icon--slate">
            <FileText size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="fc-prog__stat-value">{stats.drafts}</p>
            <p className="fc-prog__stat-label">Drafts</p>
          </div>
        </article>
        <article className="fc-prog__stat">
          <span className="fc-prog__stat-icon fc-prog__stat-icon--amber">
            <Star size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="fc-prog__stat-value">{stats.featured}</p>
            <p className="fc-prog__stat-label">Featured</p>
          </div>
        </article>
        <article className="fc-prog__stat">
          <span className="fc-prog__stat-icon fc-prog__stat-icon--violet">
            <Users size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="fc-prog__stat-value">{stats.learners}</p>
            <p className="fc-prog__stat-label">Learners enrolled</p>
          </div>
        </article>
      </section>

      {/* ---------- Table card ---------- */}
      <section className="fc-prog__card">
        <div className="fc-prog__toolbar">
          <label className="fc-prog__search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => changeFilter(setQuery)(e.target.value)}
              placeholder="Search title, code, instructor…"
              aria-label="Search programs"
            />
            {query && (
              <button
                type="button"
                className="fc-prog__search-clear"
                onClick={() => changeFilter(setQuery)("")}
                aria-label="Clear search"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </label>

          <select
            className="fc-prog__select"
            value={statusFilter}
            onChange={(e) => changeFilter(setStatusFilter)(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            className="fc-prog__select"
            value={categoryFilter}
            onChange={(e) => changeFilter(setCategoryFilter)(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categoryNames.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="fc-prog__select"
            value={levelFilter}
            onChange={(e) => changeFilter(setLevelFilter)(e.target.value)}
            aria-label="Filter by level"
          >
            <option value="all">All levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={`fc-prog__chip${featuredOnly ? " is-on" : ""}`}
            aria-pressed={featuredOnly}
            onClick={() => changeFilter(setFeaturedOnly)(!featuredOnly)}
          >
            <Star
              size={15}
              fill={featuredOnly ? "currentColor" : "none"}
              aria-hidden="true"
            />
            Featured
          </button>

          <select
            className="fc-prog__select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort programs"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" icon={X} onClick={clearFilters}>
              Clear
            </Button>
          )}

          <Button
            className="fc-prog__new"
            icon={Plus}
            onClick={() => setModal({ type: "form", id: null })}
          >
            New program
          </Button>
        </div>

        {/* ---------- Bulk actions ---------- */}
        {selected.size > 0 && (
          <div
            className="fc-prog__bulk"
            role="region"
            aria-label="Bulk actions"
          >
            <strong>{selected.size} selected</strong>
            {selected.size < filtered.length && (
              <button
                type="button"
                className="fc-prog__link"
                onClick={() => setSelected(new Set(filtered.map((p) => p.id)))}
              >
                Select all {filtered.length}
              </button>
            )}
            <span className="fc-prog__bulk-spacer" />
            <Button
              variant="secondary"
              size="sm"
              icon={CloudUpload}
              onClick={() =>
                requestAction(
                  "publish",
                  selectedPrograms.map((p) => p.id),
                )
              }
            >
              Publish
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={CloudOff}
              onClick={() =>
                requestAction(
                  "pull",
                  selectedPrograms.map((p) => p.id),
                )
              }
            >
              Pull from website
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Star}
              onClick={bulkFeature}
            >
              {allSelectedFeatured ? "Unfeature" : "Feature"}
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() =>
                requestAction(
                  "delete",
                  selectedPrograms.map((p) => p.id),
                )
              }
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
            >
              Clear selection
            </Button>
          </div>
        )}

        {/* ---------- Table ---------- */}
        <div className="fc-prog__table-wrap">
          <table className="fc-prog__table">
            <caption className="fc-prog__sr">
              Programs offered by Futuristic Coders
            </caption>
            <thead>
              <tr>
                <th scope="col" className="fc-prog__col-check">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleAllOnPage}
                    aria-label="Select all programs on this page"
                  />
                </th>
                <th scope="col">Program</th>
                <th scope="col">Category</th>
                <th scope="col">Level</th>
                <th scope="col">Duration</th>
                <th scope="col">Price</th>
                <th scope="col">Enrolled</th>
                <th scope="col">Status</th>
                <th scope="col" className="fc-prog__col-actions">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((p) => {
                const isSelected = selected.has(p.id);
                const published = p.status === "published";
                const fill = p.capacity
                  ? Math.min(
                      100,
                      Math.round(((p.enrolled ?? 0) / p.capacity) * 100),
                    )
                  : 0;

                return (
                  <tr
                    key={p.id}
                    className={`fc-prog__row${isSelected ? " is-selected" : ""}`}
                    onClick={(e) => onRowClick(e, p)}
                  >
                    <td className="fc-prog__col-check">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(p.id)}
                        aria-label={`Select ${p.title}`}
                      />
                    </td>

                    <td>
                      <div className="fc-prog__program">
                        {/* key resets the "failed to load" state when the image changes */}
                        <ProgramThumb key={p.thumbnail ?? "none"} program={p} />
                        <div className="fc-prog__program-text">
                          <button
                            type="button"
                            className="fc-prog__title"
                            onClick={() =>
                              setModal({ type: "details", id: p.id })
                            }
                          >
                            {p.title}
                            {p.featured && (
                              <Star
                                size={14}
                                fill="currentColor"
                                className="fc-prog__title-star"
                                aria-label="Featured"
                              />
                            )}
                          </button>
                          <span className="fc-prog__sub">
                            {p.code} · {p.mode} · {p.instructor}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>{p.category}</td>
                    <td>
                      <Badge tone={LEVEL_TONES[p.level]}>{p.level}</Badge>
                    </td>
                    <td>
                      {p.durationWeeks} wks
                      <span className="fc-prog__sub fc-prog__sub--block">
                        {p.sessionsPerWeek}×/week
                        {p.sessionMinutes ? ` · ${p.sessionMinutes} min` : ""}
                      </span>
                    </td>
                    <td className="fc-prog__price">{formatKSh(p.price)}</td>
                    <td>
                      <div className="fc-prog__enroll">
                        <span>
                          {p.enrolled ?? 0}/{p.capacity}
                        </span>
                        <span className="fc-prog__meter" aria-hidden="true">
                          <span
                            style={{ width: `${fill}%` }}
                            data-full={fill >= 100}
                          />
                        </span>
                      </div>
                    </td>
                    <td>
                      <Badge
                        tone={published ? "success" : "neutral"}
                        icon={published ? Globe : FileText}
                      >
                        {published ? "Published" : "Draft"}
                      </Badge>
                    </td>

                    <td className="fc-prog__col-actions">
                      <div className="fc-prog__actions">
                        <button
                          type="button"
                          className={`fc-prog__iconbtn fc-prog__iconbtn--star${p.featured ? " is-on" : ""}`}
                          onClick={() => toggleFeatured(p)}
                          aria-pressed={p.featured}
                          aria-label={
                            p.featured
                              ? `Remove ${p.title} from featured`
                              : `Feature ${p.title}`
                          }
                          title={
                            p.featured
                              ? "Remove from featured"
                              : "Mark as featured"
                          }
                        >
                          <Star
                            size={17}
                            fill={p.featured ? "currentColor" : "none"}
                            aria-hidden="true"
                          />
                        </button>
                        <button
                          type="button"
                          className="fc-prog__iconbtn"
                          onClick={() => setModal({ type: "form", id: p.id })}
                          aria-label={`Edit ${p.title}`}
                          title="Edit"
                        >
                          <Pencil size={17} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className={`fc-prog__iconbtn ${published ? "fc-prog__iconbtn--pull" : "fc-prog__iconbtn--publish"}`}
                          onClick={() =>
                            requestAction(published ? "pull" : "publish", [
                              p.id,
                            ])
                          }
                          aria-label={
                            published
                              ? `Pull ${p.title} from website`
                              : `Publish ${p.title} to website`
                          }
                          title={
                            published
                              ? "Pull from website"
                              : "Publish to website"
                          }
                        >
                          {published ? (
                            <CloudOff size={17} aria-hidden="true" />
                          ) : (
                            <CloudUpload size={17} aria-hidden="true" />
                          )}
                        </button>
                        <ProgramActionsMenu
                          program={p}
                          onView={() => setModal({ type: "details", id: p.id })}
                          onEdit={() => setModal({ type: "form", id: p.id })}
                          onTogglePublish={() =>
                            requestAction(published ? "pull" : "publish", [
                              p.id,
                            ])
                          }
                          onToggleFeatured={toggleFeatured}
                          onDuplicate={duplicateProgram}
                          onCopyLink={copyLink}
                          onDelete={() => requestAction("delete", [p.id])}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pageRows.length === 0 && (
                <tr className="fc-prog__empty-row">
                  <td colSpan={9}>
                    <div className="fc-prog__empty">
                      <span className="fc-prog__empty-icon">
                        <SearchX size={26} aria-hidden="true" />
                      </span>
                      <h3>No programs found</h3>
                      <p>Try a different search or clear your filters.</p>
                      {hasActiveFilters && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={clearFilters}
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ---------- Pagination ---------- */}
        <div className="fc-prog__footer">
          <p className="fc-prog__count">
            {filtered.length === 0
              ? "No programs"
              : `Showing ${startIndex + 1}–${Math.min(startIndex + pageSize, filtered.length)} of ${filtered.length} programs`}
          </p>

          <label className="fc-prog__per-page">
            Rows
            <select
              className="fc-prog__select fc-prog__select--sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              aria-label="Rows per page"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <nav className="fc-prog__pager" aria-label="Pagination">
            <button
              type="button"
              className="fc-prog__page"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            {pageWindow(currentPage, totalPages).map((n) =>
              typeof n === "string" ? (
                <span key={n} className="fc-prog__gap" aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  className={`fc-prog__page${n === currentPage ? " is-current" : ""}`}
                  onClick={() => setPage(n)}
                  aria-current={n === currentPage ? "page" : undefined}
                  aria-label={`Page ${n}`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              type="button"
              className="fc-prog__page"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </nav>
        </div>
      </section>

      {/* ---------- Modals ---------- */}
      {modal?.type === "details" && modalProgram && (
        <ProgramDetailsModal
          program={modalProgram}
          onClose={closeModal}
          onEdit={() => setModal({ type: "form", id: modalProgram.id })}
          onTogglePublish={() =>
            requestAction(
              modalProgram.status === "published" ? "pull" : "publish",
              [modalProgram.id],
            )
          }
          onToggleFeatured={() => toggleFeatured(modalProgram)}
          onCopyLink={() => copyLink(modalProgram)}
          onDelete={() => requestAction("delete", [modalProgram.id])}
          onChangeThumbnail={(payload) =>
            changeThumbnail(modalProgram, payload)
          }
        />
      )}

      {modal?.type === "form" && (
        <ProgramFormModal
          key={modal.id ?? "new"}
          program={modalProgram}
          categories={categoryNames}
          onSave={(data) => saveProgram(data, modalProgram)}
          onClose={closeModal}
        />
      )}

      {confirmConfig && (
        <ConfirmDialog
          title={confirmConfig.title}
          message={confirmConfig.message}
          items={confirmTargets.map((p) => p.title)}
          confirmLabel={confirmConfig.confirmLabel}
          tone={confirmConfig.tone}
          onConfirm={runConfirmed}
          onCancel={closeModal}
        />
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}

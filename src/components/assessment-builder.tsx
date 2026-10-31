"use client";

import { useState } from "react";
import { Plus, Save, Trash2, Wand2 } from "lucide-react";
import { createAssessmentAction } from "@/app/admin/actions";

type Option = { label: string; value: number };
type Category = { label: string; max: number; summary: string; color: string };

const DEFAULT_OPTIONS: Option[] = [
  { label: "Tidak pernah", value: 0 },
  { label: "Jarang", value: 1 },
  { label: "Kadang-kadang", value: 2 },
  { label: "Sering", value: 3 },
  { label: "Hampir selalu", value: 4 },
];

const DEFAULT_CATEGORIES: Category[] = [
  {
    label: "Rendah",
    max: 10,
    summary: "Kondisi Anda relatif terkelola dengan baik.",
    color: "#0ea5e9",
  },
  {
    label: "Sedang",
    max: 25,
    summary: "Ada tekanan yang mulai terasa dan perlu perhatian.",
    color: "#b7791f",
  },
  {
    label: "Tinggi",
    max: 40,
    summary: "Kami menyarankan Anda berkonsultasi dengan psikolog.",
    color: "#9b2c2c",
  },
];

export function AssessmentBuilder() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(5);
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<string[]>([""]);
  const [options, setOptions] = useState<Option[]>(DEFAULT_OPTIONS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const maxOption = Math.max(...options.map((option) => Number(option.value) || 0), 0);
  const maxScore = questions.length * maxOption;

  function updateQuestion(index: number, value: string) {
    setQuestions((current) =>
      current.map((question, i) => (i === index ? value : question))
    );
  }

  function updateOption(index: number, patch: Partial<Option>) {
    setOptions((current) =>
      current.map((option, i) => (i === index ? { ...option, ...patch } : option))
    );
  }

  function updateCategory(index: number, patch: Partial<Category>) {
    setCategories((current) =>
      current.map((category, i) => (i === index ? { ...category, ...patch } : category))
    );
  }

  function autoCategories() {
    const total = Math.max(maxScore, categories.length);
    setCategories((current) =>
      current.map((category, index) => ({
        ...category,
        max: Math.max(1, Math.round((total / current.length) * (index + 1))),
      }))
    );
  }

  const payload = {
    title,
    description,
    duration,
    isActive,
    questions: questions
      .map((text, index) => ({
        id: `q${index + 1}`,
        text: text.trim(),
        options: options.map((option) => ({
          label: option.label.trim(),
          value: Number(option.value) || 0,
        })),
      }))
      .filter((question) => question.text.length > 0),
    categories: categories.map((category) => ({
      ...category,
      max: Number(category.max) || 1,
    })),
  };

  return (
    <form action={createAssessmentAction} className="space-y-4">
      <input type="hidden" name="payload" value={JSON.stringify(payload)} />

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-line bg-white p-5">
            <h2 className="font-serif text-lg font-semibold text-brand-deep">
              Informasi asesmen
            </h2>
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="assessment-title" className="label">
                  Judul asesmen
                </label>
                <input
                  id="assessment-title"
                  required
                  minLength={4}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Cek Tingkat Stres Anda"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="assessment-description" className="label">
                  Deskripsi singkat
                </label>
                <textarea
                  id="assessment-description"
                  required
                  minLength={10}
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Jelaskan tujuan asesmen dan catatan bahwa ini bukan diagnosis klinis."
                  className="field resize-none"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="assessment-duration" className="label">
                    Estimasi durasi (menit)
                  </label>
                  <input
                    id="assessment-duration"
                    type="number"
                    min={1}
                    max={120}
                    value={duration}
                    onChange={(event) => setDuration(Number(event.target.value))}
                    className="field"
                  />
                </div>
                <label className="mt-6 flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-surface/50 p-3">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-line accent-[#0369a1]"
                  />
                  <span>
                    <span className="block text-[11px] font-medium text-ink">
                      Langsung aktif
                    </span>
                    <span className="block text-[9px] text-muted">
                      Tampil di halaman psikotes publik.
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-semibold text-brand-deep">
                  Soal psikotes
                </h2>
                <p className="text-[10px] text-muted">
                  {questions.length} soal · skor maksimum {maxScore}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuestions((current) => [...current, ""])}
                className="btn-outline btn-sm"
              >
                <Plus className="h-3.5 w-3.5" /> Tambah soal
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {questions.map((question, index) => (
                <div key={index} className="rounded-2xl border border-line p-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-mint text-[10px] font-bold text-brand-dark">
                      {index + 1}
                    </span>
                    <textarea
                      value={question}
                      onChange={(event) => updateQuestion(index, event.target.value)}
                      rows={2}
                      placeholder="Tulis pertanyaan asesmen..."
                      className="field resize-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setQuestions((current) =>
                          current.length > 1
                            ? current.filter((_, i) => i !== index)
                            : current
                        )
                      }
                      disabled={questions.length <= 1}
                      aria-label={`Hapus soal ${index + 1}`}
                      className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-semibold text-brand-deep">
                  Pilihan jawaban
                </h2>
                <p className="text-[10px] text-muted">Dipakai untuk semua soal.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setOptions((current) =>
                    current.length < 6
                      ? [...current, { label: "", value: current.length }]
                      : current
                  )
                }
                disabled={options.length >= 6}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-mint text-brand-dark transition hover:bg-brand hover:text-white disabled:opacity-40"
                aria-label="Tambah opsi jawaban"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={option.label}
                    onChange={(event) => updateOption(index, { label: event.target.value })}
                    placeholder={`Opsi ${index + 1}`}
                    className="field py-2 text-[11px]"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={option.value}
                    onChange={(event) =>
                      updateOption(index, { value: Number(event.target.value) })
                    }
                    className="field w-16 py-2 text-center text-[11px]"
                    aria-label={`Skor opsi ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setOptions((current) =>
                        current.length > 2
                          ? current.filter((_, i) => i !== index)
                          : current
                      )
                    }
                    disabled={options.length <= 2}
                    aria-label={`Hapus opsi ${index + 1}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-semibold text-brand-deep">
                  Kategori hasil
                </h2>
                <p className="text-[10px] text-muted">Berdasarkan total skor.</p>
              </div>
              <button
                type="button"
                onClick={autoCategories}
                className="flex items-center gap-1 rounded-lg bg-brand-mint px-2 py-1.5 text-[9.5px] font-semibold text-brand-dark transition hover:bg-brand hover:text-white"
              >
                <Wand2 className="h-3 w-3" /> Bagi rata
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {categories.map((category, index) => (
                <div key={index} className="rounded-2xl border border-line p-3">
                  <div className="flex items-center gap-2">
                    <input
                      value={category.label}
                      onChange={(event) =>
                        updateCategory(index, { label: event.target.value })
                      }
                      placeholder="Label kategori"
                      className="field py-2 text-[11px]"
                    />
                    <input
                      type="number"
                      min={1}
                      value={category.max}
                      onChange={(event) =>
                        updateCategory(index, { max: Number(event.target.value) })
                      }
                      className="field w-20 py-2 text-center text-[11px]"
                      aria-label={`Skor maksimum kategori ${index + 1}`}
                    />
                    <input
                      type="color"
                      value={category.color}
                      onChange={(event) =>
                        updateCategory(index, { color: event.target.value })
                      }
                      className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border border-line bg-white p-1"
                      aria-label={`Warna kategori ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setCategories((current) =>
                          current.length > 1
                            ? current.filter((_, i) => i !== index)
                            : current
                        )
                      }
                      disabled={categories.length <= 1}
                      aria-label={`Hapus kategori ${index + 1}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={category.summary}
                    onChange={(event) =>
                      updateCategory(index, { summary: event.target.value })
                    }
                    rows={2}
                    placeholder="Ringkasan yang tampil ke peserta..."
                    className="field mt-2 resize-none text-[10.5px]"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setCategories((current) => [
                  ...current,
                  {
                    label: "",
                    max: maxScore,
                    summary: "",
                    color: "#0369a1",
                  },
                ])
              }
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-2 text-[10px] font-medium text-muted transition hover:border-brand/30 hover:text-brand"
            >
              <Plus className="h-3 w-3" /> Tambah kategori
            </button>
          </div>

          <button type="submit" className="btn-primary btn-sm w-full">
            <Save className="h-3.5 w-3.5" /> Simpan asesmen
          </button>
        </div>
      </div>
    </form>
  );
}

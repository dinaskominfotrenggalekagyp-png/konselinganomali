"use client";

import { Trash2 } from "lucide-react";
import { deleteMessageAction } from "@/app/admin/actions";

export function DeleteMessageButton({
  id,
  disabled = false,
}: {
  id: string;
  disabled?: boolean;
}) {
  return (
    <form
      action={deleteMessageAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Hapus pesan ini? Pesan yang dihapus tidak dapat dikembalikan."
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={disabled}
        title={
          disabled
            ? "Tandai pesan sebagai dibalas sebelum menghapus"
            : "Hapus pesan"
        }
        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-[9.5px] font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-line disabled:text-muted/50 disabled:hover:bg-transparent"
      >
        <Trash2 className="h-3 w-3" /> Hapus
      </button>
    </form>
  );
}

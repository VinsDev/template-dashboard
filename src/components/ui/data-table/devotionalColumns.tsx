"use client"

import { Badge } from "@/components/Badge"
import { Checkbox } from "@/components/Checkbox"
import { Devotional } from "@/data/devotionalSchema"
import { createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./DataTableColumnHeader"
import { DataTableRowActions } from "./DataTableRowActions"

const columnHelper = createColumnHelper<Devotional>()

export const devotionalColumns = [
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomeRowsSelected()
              ? "indeterminate"
              : false
        }
        onCheckedChange={() => table.toggleAllPageRowsSelected()}
        className="translate-y-0.5"
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={() => row.toggleSelected()}
        className="translate-y-0.5"
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      displayName: "Select",
    },
  }),
  columnHelper.accessor("title", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Title",
    },
  }),
  columnHelper.accessor("date", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Date",
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return <span>{date.toLocaleDateString()}</span>;
    },
  }),
  columnHelper.accessor("further_study", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Further Study" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Further Study",
    },
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Status",
    },
    cell: ({ row }) => {
      const status = row.getValue("status");
      let variant = "neutral";

      if (status === "approved") variant = "success";
      if (status === "pending") variant = "warning";
      if (status === "rejected") variant = "destructive";

      return (
        <Badge variant={variant}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  }),
  columnHelper.accessor("createdAt", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Created At",
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <span>{date.toLocaleDateString()}</span>;
    },
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    meta: {
      className: "text-right",
    },
  }),
];
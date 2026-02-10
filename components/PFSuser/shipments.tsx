"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { ArrowUpDown, ChevronDown, Search } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { readSession } from "@/lib/session"
import { getShipmentsForSession } from "@/lib/shipmentsStore"
import type { Shipment as StoredShipment } from "@/types/shipment"

type RowShipment = {
  blNumber: string
  route: string
  carrier: string
  status: StoredShipment["status"]
  createdAt: string
}

function buildRoute(s: StoredShipment) {
  const pol = [s.polCity, s.polCountry].filter(Boolean).join(", ").trim()
  const pod = [s.podCity, s.podCountry].filter(Boolean).join(", ").trim()
  return `${pol || "-"} → ${pod || "-"}`
}

// ✅ map Stored Shipment -> table row (keep UI same)
function toRow(s: StoredShipment): RowShipment {
  return {
    blNumber: s.blNumber,
    route: buildRoute(s),
    carrier: s.carrier || "-",
    status: s.status,
    createdAt: s.createdAt,
  }
}

function loadForCurrentUser(): RowShipment[] {
  const session = readSession()
  const visible = getShipmentsForSession(session)
  return visible.map(toRow)
}

export default function AllShipmentsTable() {
  const [data, setData] = React.useState<RowShipment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pageSize, setPageSize] = React.useState(10)

  React.useEffect(() => {
    // initial load
    setData(loadForCurrentUser())
    setLoading(false)

    // live updates when new shipment saved
    const onChanged = () => setData(loadForCurrentUser())
    window.addEventListener("shipments-changed", onChanged)
    window.addEventListener("session-changed", onChanged)

    return () => {
      window.removeEventListener("shipments-changed", onChanged)
      window.removeEventListener("session-changed", onChanged)
    }
  }, [])

  const columns: ColumnDef<RowShipment>[] = [
    {
      accessorKey: "blNumber",
      header: "B/L Number",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 text-[15px]">
          {row.getValue("blNumber")}
        </div>
      ),
    },
    {
      accessorKey: "route",
      header: "Route",
      cell: ({ row }) => (
        <span className="text-gray-700">{row.getValue("route") as string}</span>
      ),
    },
    {
      accessorKey: "carrier",
      header: "Carrier",
      cell: ({ row }) => <span className="text-gray-700">{row.getValue("carrier") as string}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as RowShipment["status"]
        const styles: Record<RowShipment["status"], string> = {
          "In Transit": "border-purple-600 bg-purple-100 text-purple-700",
          Pending: "border-amber-500 bg-amber-100 text-amber-700",
          Delivered: "border-emerald-500 bg-emerald-100 text-emerald-700",
          Exceptions: "border-red-500 bg-red-50 text-red-700",
        }

        return (
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
          >
            <span className="h-2 w-2 rounded-full bg-current opacity-70" />
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-gray-700">
          {new Date(row.getValue("createdAt") as string).toLocaleDateString()}
        </span>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  })

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Loading shipments...
      </div>
    )
  }

  const rows = table.getRowModel().rows.slice(0, pageSize)

  return (
    <div className="w-full px-8 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-semibold tracking-tight">All Shipments</h2>

        <div className="flex items-center gap-3 rounded-xl border bg-gray-50 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search B/L Number..."
              value={(table.getColumn("blNumber")?.getFilterValue() as string) ?? ""}
              onChange={(e) =>
                table.getColumn("blNumber")?.setFilterValue(e.target.value)
              }
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => table.getColumn("blNumber")?.toggleSorting(false)}
              >
                B/L Number (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => table.getColumn("blNumber")?.toggleSorting(true)}
              >
                B/L Number (Z-A)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => table.getColumn("createdAt")?.toggleSorting(false)}
              >
                Created (Earliest)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => table.getColumn("createdAt")?.toggleSorting(true)}
              >
                Created (Latest)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => table.getColumn("status")?.toggleSorting(false)}
              >
                Status (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => table.getColumn("status")?.toggleSorting(true)}
              >
                Status (Z-A)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <select
            className="rounded-md border bg-white px-3 py-2 text-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n} rows
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-normal text-gray-600">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No shipments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm text-gray-600">
        <span>
          Showing {rows.length} of {data.length} shipments
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pageSize <= 5}
            onClick={() => setPageSize((p) => Math.max(5, p - 5))}
          >
            Show Less
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pageSize >= data.length}
            onClick={() => setPageSize((p) => Math.min(data.length, p + 5))}
          >
            Show More
          </Button>
        </div>
      </div>
    </div>
  )
}

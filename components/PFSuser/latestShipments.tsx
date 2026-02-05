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

import { Badge } from "@/components/ui/badge"
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

import { ArrowUpDown, ChevronDown, Search ,Plane, Ship} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Shipment {
  blNumber: string
  origin: string
  destination: string
  carrier: string
  type: "FCL" | "Air"
  status: "In Transit" | "Pending" | "Delivered" | "Exceptions"
  eta: string
}

const mockShipments: Shipment[] = [
  {
    blNumber: "BL-202401",
    origin: "Shanghai",
    destination: "Los Angeles",
    carrier: "Maersk",
    type: "FCL",
    status: "In Transit",
    eta: "2026-02-18",
  },
  {
    blNumber: "BL-202402",
    origin: "Hamburg",
    destination: "Alexandria",
    carrier: "MSC",
    type: "FCL",
    status: "Pending",
    eta: "2026-02-25",
  },
  {
    blNumber: "AWB-774411",
    origin: "Dubai",
    destination: "Cairo",
    carrier: "Emirates SkyCargo",
    type: "Air",
    status: "Delivered",
    eta: "2026-02-05",
  },
  {
    blNumber: "BL-202403",
    origin: "Rotterdam",
    destination: "New York",
    carrier: "CMA CGM",
    type: "FCL",
    status: "Exceptions",
    eta: "2026-03-02",
  },
  {
    blNumber: "BL-202404",
    origin: "Singapore",
    destination: "Tokyo",
    carrier: "ONE",
    type: "FCL",
    status: "In Transit",
    eta: "2026-02-15",
  },
  {
    blNumber: "AWB-774412",
    origin: "London",
    destination: "New York",
    carrier: "British Airways",
    type: "Air",
    status: "Pending",
    eta: "2026-02-10",
  },
]

export default function ShipmentsTable() {
  const [data, setData] = React.useState<Shipment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pageSize, setPageSize] = React.useState(10)

  React.useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await fetch("https://api.example.com/shipments", { cache: "no-store" })
        if (!res.ok) throw new Error("API failed")
        const apiData: Shipment[] = await res.json()
        setData(apiData)
      } catch {
        setData(mockShipments)
      } finally {
        setLoading(false)
      }
    }
    fetchShipments()
  }, [])

  const columns: ColumnDef<Shipment>[] = [
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
      id: "route",
      header: "Route",
      cell: ({ row }) => (
        <span className="text-gray-700">
          {row.original.origin} → {row.original.destination}
        </span>
      ),
    },
    {
      accessorKey: "carrier",
      header: "Carrier",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as Shipment["type"];
        const Icon = type === "FCL" ? Ship : Plane;

        return (
          <Badge variant="outline" className="font-medium flex items-center gap-1">
            <Icon className="h-4 w-4" />
            {type}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Shipment["status"]

        const styles: Record<string, string> = {
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
      accessorKey: "eta",
      header: "ETA",
      cell: ({ row }) => (
        <span className="text-gray-700">
          {new Date(row.getValue("eta")).toLocaleDateString()}
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
        <h2 className="text-3xl font-semibold tracking-tight">
          Active Shipments
        </h2>

        <div className="flex items-center gap-3 rounded-xl border bg-gray-50 p-3">
          {/* Search */}
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

          {/* Sort */}
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
              <DropdownMenuItem onClick={() => table.getColumn("blNumber")?.toggleSorting(false)}>
                B/L Number (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => table.getColumn("blNumber")?.toggleSorting(true)}>
                B/L Number (Z-A)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => table.getColumn("eta")?.toggleSorting(false)}>
                ETA (Earliest)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => table.getColumn("eta")?.toggleSorting(true)}>
                ETA (Latest)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => table.getColumn("status")?.toggleSorting(false)}>
                Status (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => table.getColumn("status")?.toggleSorting(true)}>
                Status (Z-A)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => table.getColumn("type")?.toggleSorting(false)}>
                Type (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => table.getColumn("type")?.toggleSorting(true)}>
                Type (Z-A)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Page Size */}
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
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
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

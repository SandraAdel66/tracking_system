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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

interface Shipment {
  blNumber: string
  origin: string
  destination: string
  carrier: string
  type: "FCL" | "Air"
  status: "In Transit" | "Pending" | "Delivered" | "Exceptions"
  eta: string
}

// Mock fallback data
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
]

export default function ShipmentsTable() {
  const [data, setData] = React.useState<Shipment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pageSize, setPageSize] = React.useState(5)

  // Fetch API with fallback
  React.useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await fetch("https://api.example.com/shipments", { cache: "no-store" })
        if (!res.ok) throw new Error("API failed")
        const apiData: Shipment[] = await res.json()
        setData(apiData)
      } catch (error) {
        console.warn("Using mock shipment data", error)
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
      header: ({ column }) => (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-gray-400 font-normal"
        >
        <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("blNumber")}</div>,
    },
    {
      id: "route",
      header: "Route",
      cell: ({ row }) => <span>{row.original.origin} → {row.original.destination}</span>,
    },
    {
      accessorKey: "carrier",
      header: "Carrier",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <Badge variant="outline">{row.getValue("type")}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Shipment["status"]
        let color: "default" | "secondary" | "destructive" | "success" | "warning" = "default"

        switch (status) {
          case "In Transit":
            color = "secondary" // blue
            break
          case "Pending":
            color = "warning" // orange
            break
          case "Delivered":
            color = "success" // green
            break
          case "Exceptions":
            color = "destructive" // red
            break
        }

        return <Badge variant="outline" className={`capitalize`} >{status}</Badge>
      },
    },
    {
      accessorKey: "eta",
      header: "ETA",
      cell: ({ row }) => <span>{new Date(row.getValue("eta")).toLocaleDateString()}</span>,
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
    return <div className="flex justify-center items-center h-64">Loading shipments...</div>
  }

  // Paginate manually
  const paginatedRows = table.getRowModel().rows.slice(0, pageSize)

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Active Shipments</h2>

      <div className="flex items-center justify-between mb-4">
        <Input
          className="max-w-sm"
          placeholder="Search B/L Number..."
          value={(table.getColumn("blNumber")?.getFilterValue() as string) ?? ""}
          onChange={e => table.getColumn("blNumber")?.setFilterValue(e.target.value)}
        />

        {/* Row number selector */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Rows per page:</span>
          <select
            className="border rounded px-2 py-1"
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
          >
            {[5, 10, 15, 20].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="bg-gray-100 text-gray-500 font-semibold"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map(row => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={columns.length}>
                  No shipments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

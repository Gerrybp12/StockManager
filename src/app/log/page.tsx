"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLog } from "@/hooks/useLog";
import { formatDate } from "@/utils/productUtils";
import { Calendar, RefreshCcw, AlertCircle } from "lucide-react";

export default function LogPage() {
  const { loading, logs, error, refreshLogs } = useLog();

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>History Log</CardTitle>
            <CardDescription>Loading logs...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading logs: {error}</AlertDescription>
        </Alert>
        <Button onClick={refreshLogs} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Activity Logs
          </h1>
          <p className="text-gray-600 mt-1">
            Lihat history pengeluaran dan pemasukan barang
          </p>
        </div>
        <Button
          onClick={refreshLogs}
          disabled={loading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History Log</CardTitle>
          <CardDescription>{logs.length} aktivitas tercatat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="h-8 w-8 text-gray-400" />
                        <span>Belum ada aktivitas</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.action}
                        </TableCell>
                        <TableCell>{log.description}</TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(log.timestamp)}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Shortcut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Add New Task</TableCell>
                <TableCell>
                  <kbd className="px-2 py-1 bg-muted rounded">N</kbd>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Search Tasks</TableCell>
                <TableCell>
                  <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd> +{" "}
                  <kbd className="px-2 py-1 bg-muted rounded">F</kbd>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Toggle Dark Mode</TableCell>
                <TableCell>
                  <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd> +{" "}
                  <kbd className="px-2 py-1 bg-muted rounded">D</kbd>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Undo</TableCell>
                <TableCell>
                  <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd> +{" "}
                  <kbd className="px-2 py-1 bg-muted rounded">Z</kbd>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Redo</TableCell>
                <TableCell>
                  <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd> +{" "}
                  <kbd className="px-2 py-1 bg-muted rounded">Y</kbd>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Switch to List View</TableCell>
                <TableCell>
                  <kbd className="px-2 py-1 bg-muted rounded">Alt</kbd> +{" "}
                  <kbd className="px-2 py-1 bg-muted rounded">1</kbd>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Switch to Graph View</TableCell>
                <TableCell>
                  <kbd className="px-2 py-1 bg-muted rounded">Alt</kbd> +{" "}
                  <kbd className="px-2 py-1 bg-muted rounded">2</kbd>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Save Changes</TableCell>
                <TableCell>
                  <kbd className="px-2 py-1 bg-muted rounded">Ctrl</kbd> +{" "}
                  <kbd className="px-2 py-1 bg-muted rounded">S</kbd>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Delete Selected Task</TableCell>
                <TableCell>
                  <kbd className="px-2 py-1 bg-muted rounded">Delete</kbd>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Calendar, User } from "lucide-react";

import type { Employee } from "@/types/employee";
import { useConfirmDialog } from "@/components/dialogs/use-confirm-dialog";

type EmployeeNotesProps = {
  employee: Employee;
};

export const EmployeeNotes = ({ employee }: EmployeeNotesProps) => {
  const confirm = useConfirmDialog();
  const [notes, setNotes] = useState(employee.notes || []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "GENERAL":
        return "bg-blue-100 text-blue-800";
      case "PERFORMANCE":
        return "bg-green-100 text-green-800";
      case "DISCIPLINARY":
        return "bg-red-100 text-red-800";
      case "ACHIEVEMENT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteNote = useCallback((noteId: string, noteTitle: string) => {
    confirm({
      title: "Удалить заметку?",
      description: `Вы уверены, что хотите удалить заметку "${noteTitle}"? Это действие нельзя отменить.`,
      variant: "destructive",
      confirmText: "Удалить",
      onConfirm: () => {
        setNotes((prevNotes) => prevNotes.filter(note => note.id !== noteId));
      },
    });
  }, [confirm]);

  const publicNotes = notes.filter(note => !note.isPrivate);
  const privateNotes = notes.filter(note => note.isPrivate);

  return (
    <div className="space-y-6">
      {/* Add Note Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Employee Notes</h3>
          <p className="text-sm text-muted-foreground">
            Add and manage notes about this employee
          </p>
        </div>
        {/* TODO: Implement Add Note dialog using useDialog pattern when note management API is ready */}
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>

      {/* Notes Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Notes</p>
                <p className="text-2xl font-bold">{notes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Public Notes</p>
                <p className="text-2xl font-bold">{publicNotes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <EyeOff className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Private Notes</p>
                <p className="text-2xl font-bold">{privateNotes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold">
                  {notes.filter(note => {
                    const noteDate = new Date(note.date);
                    const now = new Date();
                    return noteDate.getMonth() === now.getMonth() && 
                           noteDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Notes */}
      <Card>
        <CardHeader>
          <CardTitle>All Notes</CardTitle>
          <CardDescription>
            Complete history of notes for this employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notes.length > 0 ? (
            <div className="space-y-4">
              {notes
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((note) => (
                  <div key={note.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium">{note.title}</h3>
                          <Badge variant="outline" className={getTypeColor(note.type)}>
                            {note.type}
                          </Badge>
                          {note.isPrivate && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">
                              <EyeOff className="mr-1 h-3 w-3" />
                              Private
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            {note.author}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(note.date).toLocaleDateString()} at{" "}
                            {new Date(note.date).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" disabled>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id, note.title)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {note.content}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Notes</h3>
              <p className="text-sm text-gray-500">
                No notes have been added for this employee yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import { Employee } from "@/types/employee";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Calendar, User } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmployeeNotesProps {
  employee: Employee;
}

export function EmployeeNotes({ employee }: EmployeeNotesProps) {
  const [notes, setNotes] = useState(employee.notes || []);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    type: "GENERAL" as const,
    isPrivate: false,
  });

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

  const handleAddNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const note = {
        id: Date.now().toString(),
        ...newNote,
        author: "Current User", // In real app, get from auth context
        date: new Date().toISOString(),
      };
      
      setNotes([note, ...notes]);
      setNewNote({
        title: "",
        content: "",
        type: "GENERAL",
        isPrivate: false,
      });
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

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
        <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
              <DialogDescription>
                Add a note about {employee.name}. Choose the appropriate type and privacy setting.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Note title..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newNote.type}
                  onValueChange={(value: any) => setNewNote({ ...newNote, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="PERFORMANCE">Performance</SelectItem>
                    <SelectItem value="DISCIPLINARY">Disciplinary</SelectItem>
                    <SelectItem value="ACHIEVEMENT">Achievement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Write your note here..."
                  rows={4}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={newNote.isPrivate}
                  onChange={(e) => setNewNote({ ...newNote, isPrivate: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="private" className="text-sm">
                  Private note (only visible to authorized personnel)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote}>Add Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
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
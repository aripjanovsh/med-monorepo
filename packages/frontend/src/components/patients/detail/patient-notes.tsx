"use client";

import { useState } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  User,
  Lock,
  Edit,
  Trash2,
  MessageSquare
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Patient, PatientNote } from "@/types/patient";

interface PatientNotesProps {
  patient: Patient;
}

export function PatientNotes({ patient }: PatientNotesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showPrivate, setShowPrivate] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({
    content: "",
    type: "CLINICAL" as PatientNote["type"],
    isPrivate: false,
  });

  const filteredNotes = patient.notes
    ?.filter((note) => {
      const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === "all" || note.type === filterType;
      const matchesPrivacy = showPrivate || !note.isPrivate;
      return matchesSearch && matchesFilter && matchesPrivacy;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTypeColor = (type: PatientNote["type"]) => {
    switch (type) {
      case "CLINICAL":
        return "bg-blue-100 text-blue-800";
      case "ADMINISTRATIVE":
        return "bg-green-100 text-green-800";
      case "PERSONAL":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: PatientNote["type"]) => {
    switch (type) {
      case "CLINICAL":
        return <FileText className="h-4 w-4" />;
      case "ADMINISTRATIVE":
        return <User className="h-4 w-4" />;
      case "PERSONAL":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleAddNote = () => {
    // Here you would typically make an API call to save the note
    console.log("Adding note:", newNote);
    setIsAddingNote(false);
    setNewNote({ content: "", type: "CLINICAL", isPrivate: false });
  };

  const notesByType = patient.notes?.reduce((acc, note) => {
    acc[note.type] = (acc[note.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Patient Notes</h2>
          <p className="text-muted-foreground">
            Clinical notes, administrative records, and personal observations
          </p>
        </div>
        <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="note-type">Note Type</Label>
                <Select 
                  value={newNote.type} 
                  onValueChange={(value) => setNewNote(prev => ({ ...prev, type: value as PatientNote["type"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLINICAL">Clinical</SelectItem>
                    <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="note-content">Content</Label>
                <Textarea
                  id="note-content"
                  placeholder="Enter note content..."
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="private-note"
                  checked={newNote.isPrivate}
                  onCheckedChange={(checked) => setNewNote(prev => ({ ...prev, isPrivate: checked }))}
                />
                <Label htmlFor="private-note" className="flex items-center">
                  <Lock className="h-4 w-4 mr-1" />
                  Private note (only visible to authorized staff)
                </Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNote} disabled={!newNote.content.trim()}>
                  Add Note
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Note Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Notes</p>
                <p className="text-2xl font-bold">{patient.notes?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Clinical</p>
                <p className="text-2xl font-bold">{notesByType.CLINICAL || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Administrative</p>
                <p className="text-2xl font-bold">{notesByType.ADMINISTRATIVE || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Personal</p>
                <p className="text-2xl font-bold">{notesByType.PERSONAL || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="CLINICAL">Clinical</SelectItem>
                <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                <SelectItem value="PERSONAL">Personal</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-private"
                checked={showPrivate}
                onCheckedChange={setShowPrivate}
              />
              <Label htmlFor="show-private" className="text-sm">Show private notes</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      {filteredNotes && filteredNotes.length > 0 ? (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(note.type)}>
                      <span className="flex items-center space-x-1">
                        {getTypeIcon(note.type)}
                        <span>{note.type}</span>
                      </span>
                    </Badge>
                    {note.isPrivate && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Note
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Note
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed">{note.content}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {note.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(note.date).toLocaleDateString()} at {new Date(note.date).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterType !== "all" 
                ? "Try adjusting your search or filters"
                : "Start by adding the first note for this patient."
              }
            </p>
            {!searchTerm && filterType === "all" && (
              <div className="mt-6">
                <Button size="sm" onClick={() => setIsAddingNote(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Note Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Note Templates</CardTitle>
          <CardDescription>Common note templates for faster documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left"
              onClick={() => {
                setNewNote({
                  content: "Patient presents for routine follow-up visit. ",
                  type: "CLINICAL",
                  isPrivate: false,
                });
                setIsAddingNote(true);
              }}
            >
              <div>
                <p className="font-medium">Routine Follow-up</p>
                <p className="text-sm text-muted-foreground">Standard follow-up visit template</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left"
              onClick={() => {
                setNewNote({
                  content: "Patient called regarding symptoms. ",
                  type: "CLINICAL",
                  isPrivate: false,
                });
                setIsAddingNote(true);
              }}
            >
              <div>
                <p className="font-medium">Phone Consultation</p>
                <p className="text-sm text-muted-foreground">Telephone consultation template</p>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left"
              onClick={() => {
                setNewNote({
                  content: "Insurance verification completed. ",
                  type: "ADMINISTRATIVE",
                  isPrivate: true,
                });
                setIsAddingNote(true);
              }}
            >
              <div>
                <p className="font-medium">Administrative</p>
                <p className="text-sm text-muted-foreground">Administrative note template</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
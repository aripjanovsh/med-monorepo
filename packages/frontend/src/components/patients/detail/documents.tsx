"use client";

import { useState } from "react";
import { 
  FileText, 
  Image, 
  Download, 
  Eye, 
  Upload, 
  Trash2, 
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  File
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Patient, MedicalDocument } from "@/types/patient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentUploadForm } from "../forms/document-upload-form";

interface DocumentsProps {
  patient: Patient;
}

export function Documents({ patient }: DocumentsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<MedicalDocument | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const filteredDocuments = patient.documents
    ?.filter((document) => {
      const matchesSearch = document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           document.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === "all" || document.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

  const getTypeColor = (type: MedicalDocument["type"]) => {
    switch (type) {
      case "REPORT":
        return "bg-blue-100 text-blue-800";
      case "IMAGE":
        return "bg-green-100 text-green-800";
      case "PRESCRIPTION":
        return "bg-purple-100 text-purple-800";
      case "REFERRAL":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: MedicalDocument["type"]) => {
    switch (type) {
      case "REPORT":
        return <FileText className="h-5 w-5" />;
      case "IMAGE":
        return <Image className="h-5 w-5" />;
      case "PRESCRIPTION":
        return <FileText className="h-5 w-5" />;
      case "REFERRAL":
        return <File className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const documentsByType = patient.documents?.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const handleUploadDocument = () => {
    setEditingDocument(undefined);
    setIsFormOpen(true);
  };

  const handleEditDocument = (document: MedicalDocument) => {
    setEditingDocument(document);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Longer for file upload simulation
      
      if (editingDocument) {
        console.log("Updating document:", { id: editingDocument.id, ...data });
      } else {
        console.log("Uploading document:", { patientId: patient.id, ...data });
      }
      
      setIsFormOpen(false);
      setEditingDocument(undefined);
      // In real app, you would refetch the patient data here
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingDocument(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medical Documents</h2>
          <p className="text-muted-foreground">
            Reports, images, prescriptions, and other medical files
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleUploadDocument}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
          <Button onClick={handleUploadDocument}>
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
        </div>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Documents</p>
                <p className="text-2xl font-bold">{patient.documents?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Reports</p>
                <p className="text-2xl font-bold">{documentsByType.REPORT || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Image className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Images</p>
                <p className="text-2xl font-bold">{documentsByType.IMAGE || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Prescriptions</p>
                <p className="text-2xl font-bold">{documentsByType.PRESCRIPTION || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <File className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Referrals</p>
                <p className="text-2xl font-bold">{documentsByType.REFERRAL || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
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
                <SelectItem value="REPORT">Reports</SelectItem>
                <SelectItem value="IMAGE">Images</SelectItem>
                <SelectItem value="PRESCRIPTION">Prescriptions</SelectItem>
                <SelectItem value="REFERRAL">Referrals</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Display */}
      {filteredDocuments && filteredDocuments.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(document.type)}
                      <Badge className={getTypeColor(document.type)}>
                        {document.type}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <h3 className="font-semibold mb-2 line-clamp-2">{document.name}</h3>
                  
                  {document.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {document.description}
                    </p>
                  )}
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(document.uploadDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {document.uploadedBy}
                    </div>
                    <div className="flex items-center">
                      <File className="h-3 w-3 mr-1" />
                      {formatFileSize(document.fileSize)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredDocuments.map((document) => (
                  <div key={document.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getTypeIcon(document.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold truncate">{document.name}</h3>
                            <Badge className={getTypeColor(document.type)}>
                              {document.type}
                            </Badge>
                          </div>
                          {document.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {document.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                            <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                            <span>{document.uploadedBy}</span>
                            <span>{formatFileSize(document.fileSize)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem>Share</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterType !== "all" 
                ? "Try adjusting your search or filters"
                : "Start by uploading the first document for this patient."
              }
            </p>
            {!searchTerm && filterType === "all" && (
              <div className="mt-6 flex justify-center space-x-2">
                <Button size="sm" variant="outline" onClick={handleUploadDocument}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
                <Button size="sm" onClick={handleUploadDocument}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Zone */}
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="p-8">
          <div className="text-center">
            <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">Upload new document</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag and drop files here, or click to browse
            </p>
            <div className="mt-4">
              <Button onClick={handleUploadDocument}>
                <Upload className="mr-2 h-4 w-4" />
                Choose Files
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Supports PDF, DOC, DOCX, JPG, PNG files up to 10MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Documents */}
      {patient.documents && patient.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Latest uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patient.documents
                .slice(0, 5)
                .map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(document.type)}
                      <div>
                        <p className="font-medium">{document.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{document.uploadedBy}</span>
                          <span>•</span>
                          <span>{formatFileSize(document.fileSize)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getTypeColor(document.type)}>
                        {document.type}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Upload Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? "Edit Document" : "Upload Document"}
            </DialogTitle>
          </DialogHeader>
          <DocumentUploadForm
            document={editingDocument}
            patientId={patient.id}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
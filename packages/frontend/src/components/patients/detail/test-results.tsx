"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  FileText, 
  Calendar,
  Download,
  Eye,
  Plus,
  Filter
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
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Patient, TestResult, TestResultValue } from "@/types/patient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TestOrderForm } from "../forms/test-order-form";

interface TestResultsProps {
  patient: Patient;
}

export function TestResults({ patient }: TestResultsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestResult | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const filteredTests = patient.testResults
    ?.filter((test) => {
      const matchesSearch = test.testName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterCategory === "all" || test.category === filterCategory;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (status: TestResultValue["status"]) => {
    switch (status) {
      case "NORMAL":
        return "text-green-600";
      case "HIGH":
        return "text-orange-600";
      case "LOW":
        return "text-blue-600";
      case "CRITICAL":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: TestResultValue["status"]) => {
    switch (status) {
      case "HIGH":
        return <TrendingUp className="h-4 w-4" />;
      case "LOW":
        return <TrendingDown className="h-4 w-4" />;
      case "CRITICAL":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: TestResult["category"]) => {
    switch (category) {
      case "BLOOD":
        return "bg-red-100 text-red-800";
      case "URINE":
        return "bg-yellow-100 text-yellow-800";
      case "IMAGING":
        return "bg-blue-100 text-blue-800";
      case "BIOPSY":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleOrderTest = () => {
    setEditingTest(undefined);
    setIsFormOpen(true);
  };

  const handleEditTest = (test: TestResult) => {
    setEditingTest(test);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingTest) {
        console.log("Updating test order:", { id: editingTest.id, ...data });
      } else {
        console.log("Ordering test:", { patientId: patient.id, ...data });
      }
      
      setIsFormOpen(false);
      setEditingTest(undefined);
      // In real app, you would refetch the patient data here
    } catch (error) {
      console.error("Error saving test order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingTest(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Test Results</h2>
          <p className="text-muted-foreground">
            Laboratory tests, imaging, and diagnostic results
          </p>
        </div>
        <Button onClick={handleOrderTest}>
          <Plus className="h-4 w-4 mr-2" />
          Order Test
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search test results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="BLOOD">Blood Tests</SelectItem>
                <SelectItem value="URINE">Urine Tests</SelectItem>
                <SelectItem value="IMAGING">Imaging</SelectItem>
                <SelectItem value="BIOPSY">Biopsy</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Test Results Grid */}
      {filteredTests && filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test List */}
          <div className="space-y-4">
            {filteredTests.map((test) => (
              <Card 
                key={test.id} 
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedTest?.id === test.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedTest(test)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{test.testName}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getCategoryColor(test.category)}>
                          {test.category}
                        </Badge>
                        <Badge
                          variant={test.status === "COMPLETED" ? "default" : "secondary"}
                          className={
                            test.status === "COMPLETED" 
                              ? "bg-green-100 text-green-800" 
                              : test.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {test.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(test.date).toLocaleDateString()}
                      </div>
                      <p className="mt-1">Dr. {test.orderedBy}</p>
                    </div>
                  </div>
                  
                  {/* Quick results preview */}
                  {test.status === "COMPLETED" && test.results && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-4">
                        {test.results.slice(0, 3).map((result, idx) => (
                          <div key={idx} className="flex items-center space-x-1">
                            <span className={`text-sm ${getStatusColor(result.status)}`}>
                              {getStatusIcon(result.status)}
                            </span>
                            <span className="text-sm">{result.parameter}</span>
                          </div>
                        ))}
                        {test.results.length > 3 && (
                          <span className="text-sm text-muted-foreground">
                            +{test.results.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Test Details */}
          <div className="sticky top-6">
            {selectedTest ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedTest.testName}</CardTitle>
                      <CardDescription>
                        {new Date(selectedTest.date).toLocaleDateString()} • Ordered by Dr. {selectedTest.orderedBy}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedTest.status === "COMPLETED" && selectedTest.results ? (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Parameter</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Reference Range</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedTest.results.map((result, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{result.parameter}</TableCell>
                              <TableCell>
                                {result.value} {result.unit}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {result.referenceRange}
                              </TableCell>
                              <TableCell>
                                <div className={`flex items-center space-x-1 ${getStatusColor(result.status)}`}>
                                  {getStatusIcon(result.status)}
                                  <span className="text-sm font-medium">{result.status}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      {selectedTest.notes && (
                        <div>
                          <Separator />
                          <div className="mt-4">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                            <p className="text-sm">{selectedTest.notes}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedTest.attachments && selectedTest.attachments.length > 0 && (
                        <div>
                          <Separator />
                          <div className="mt-4">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Attachments</p>
                            <div className="space-y-2">
                              {selectedTest.attachments.map((attachment, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                                  <span className="text-sm">{attachment}</span>
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {selectedTest.status === "PENDING" 
                          ? "Test results are pending"
                          : "Test was cancelled"
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Select a test</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Click on a test result to view detailed information.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No test results found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterCategory !== "all" 
                ? "Try adjusting your search or filters"
                : "Start by ordering the first test for this patient."
              }
            </p>
            {!searchTerm && filterCategory === "all" && (
              <div className="mt-6">
                <Button size="sm" onClick={handleOrderTest}>
                  <Plus className="mr-2 h-4 w-4" />
                  Order Test
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Order Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTest ? "Edit Test Order" : "Order Test"}
            </DialogTitle>
          </DialogHeader>
          <TestOrderForm
            test={editingTest}
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
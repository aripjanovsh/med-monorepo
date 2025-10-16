"use client";

import { Employee } from "@/types/employee";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Award, Calendar, ExternalLink } from "lucide-react";

interface EmployeeEducationProps {
  employee: Employee;
}

export function EmployeeEducation({ employee }: EmployeeEducationProps) {
  const education = employee.education || [];
  const certifications = employee.certifications || [];

  return (
    <div className="space-y-6">
      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5" />
            Education
          </CardTitle>
          <CardDescription>
            Academic qualifications and degrees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {education.length > 0 ? (
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{edu.degree}</h3>
                      <p className="text-muted-foreground">{edu.field}</p>
                      <p className="text-sm font-medium text-blue-600">{edu.institution}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(edu.startDate).toLocaleDateString()} - {new Date(edu.endDate).toLocaleDateString()}
                        </div>
                        {edu.gpa && (
                          <Badge variant="outline">
                            GPA: {edu.gpa}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-500">No education information available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Certifications & Licenses
          </CardTitle>
          <CardDescription>
            Professional certifications and licenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {certifications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.issuedBy}</p>
                    </div>
                    <Badge 
                      variant={
                        cert.expiryDate && new Date(cert.expiryDate) < new Date() 
                          ? "destructive" 
                          : cert.expiryDate && new Date(cert.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          ? "secondary"
                          : "default"
                      }
                    >
                      {cert.expiryDate && new Date(cert.expiryDate) < new Date() 
                        ? "Expired" 
                        : cert.expiryDate && new Date(cert.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        ? "Expiring Soon"
                        : "Active"
                      }
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      Issued: {new Date(cert.issueDate).toLocaleDateString()}
                    </div>
                    
                    {cert.expiryDate && (
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                      </div>
                    )}
                    
                    {cert.credentialId && (
                      <div className="flex items-center text-muted-foreground">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        ID: {cert.credentialId}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-500">No certifications available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Summary */}
      {(employee.experience || employee.skills) && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {employee.experience && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Experience</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {employee.experience} years
                </p>
                <p className="text-sm text-muted-foreground">
                  Professional experience in {employee.specialization}
                </p>
              </div>
            )}
            
            {employee.skills && employee.skills.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Key Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
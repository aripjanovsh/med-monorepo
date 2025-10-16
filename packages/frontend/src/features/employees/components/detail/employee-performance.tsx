"use client";

import { Employee } from "@/types/employee";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Star, Target, Award, Calendar } from "lucide-react";

interface EmployeePerformanceProps {
  employee: Employee;
}

export function EmployeePerformance({ employee }: EmployeePerformanceProps) {
  const performanceRatings = employee.performanceRatings || [];
  const latestRating = performanceRatings[0];

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    if (rating >= 3.0) return "text-orange-600";
    return "text-red-600";
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4.0) return "Very Good";
    if (rating >= 3.5) return "Good";
    if (rating >= 3.0) return "Satisfactory";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      {latestRating && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Rating</p>
                  <div className="flex items-center space-x-2">
                    <p className={`text-2xl font-bold ${getRatingColor(latestRating.rating)}`}>
                      {latestRating.rating.toFixed(1)}
                    </p>
                    <Badge variant="outline" className={getRatingColor(latestRating.rating)}>
                      {getRatingLabel(latestRating.rating)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Review Period</p>
                  <p className="text-2xl font-bold">{latestRating.period}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Review</p>
                  <p className="text-2xl font-bold">
                    {new Date(latestRating.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Latest Performance Review */}
      {latestRating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Latest Performance Review
            </CardTitle>
            <CardDescription>
              Review period: {latestRating.period} • Reviewed by: {latestRating.reviewer}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Rating */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Performance</span>
                <span className={`text-sm font-bold ${getRatingColor(latestRating.rating)}`}>
                  {latestRating.rating.toFixed(1)}/5.0
                </span>
              </div>
              <Progress value={(latestRating.rating / 5) * 100} className="h-2" />
            </div>

            {/* Comments */}
            {latestRating.comments && (
              <div>
                <h4 className="text-sm font-medium mb-2">Reviewer Comments</h4>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                  {latestRating.comments}
                </p>
              </div>
            )}

            {/* Goals */}
            {latestRating.goals && latestRating.goals.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <Target className="mr-2 h-4 w-4" />
                  Goals for Next Period
                </h4>
                <ul className="space-y-2">
                  {latestRating.goals.map((goal, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Achievements */}
            {latestRating.achievements && latestRating.achievements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <Award className="mr-2 h-4 w-4" />
                  Key Achievements
                </h4>
                <ul className="space-y-2">
                  {latestRating.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {latestRating.areasForImprovement && latestRating.areasForImprovement.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {latestRating.areasForImprovement.map((area, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance History */}
      {performanceRatings.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance History</CardTitle>
            <CardDescription>
              Historical performance ratings over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceRatings.slice(1).map((rating) => (
                <div key={rating.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{rating.period}</span>
                      <Badge variant="outline" className={getRatingColor(rating.rating)}>
                        {rating.rating.toFixed(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Reviewed by {rating.reviewer} • {new Date(rating.date).toLocaleDateString()}
                    </p>
                    {rating.comments && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {rating.comments}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getRatingColor(rating.rating)}`}>
                      {rating.rating.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getRatingLabel(rating.rating)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Performance Data */}
      {performanceRatings.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Reviews</h3>
            <p className="text-sm text-gray-500">
              No performance reviews have been conducted for this employee yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}